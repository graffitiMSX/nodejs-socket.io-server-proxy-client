'use strict'
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');

var { io } = require("socket.io-client");

const SERVER_URL = `http://localhost:${process.env.SERVER_PORT}`;
const PROXY_PORT = process.env.PROXY_PORT || 3400;
const MACHINE_ID = process.env.MACHINE_ID || 'PI000';

var serverConnected = false;
var clientConnected = false;
var messages = [];

var serverSocket;

serverSocket = io(SERVER_URL, {
    query: {
        "device": `${MACHINE_ID}`
    },
    // autoConnect: false
});

serverSocket.on(`${MACHINE_ID}`, function (data) {
    console.log("[FROM SERVER] Message:", data);
    if (clientConnected){
        proxySocket.emit('message', data);
    } else {
        messages = [...messages, data];
        console.log(`MessageStack: ${messages.length}`, messages);
    }
});

serverSocket.on("connect", function () {
    serverConnected = true;
    console.log(`[FROM SERVER] Connected: ${serverSocket.id}`);
    sendStatus();
});

serverSocket.on("disconnect", function () {
    serverConnected = false;
    console.log("[FROM SERVER] Disconnected");
    sendStatus();
});

const sendStatus = () => {
    if (proxySocket)
        proxySocket.emit('serverStatus', serverConnected);
}

var app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const server = http.createServer({}, app);
server.listen(PROXY_PORT, () => {
    console.log(`[PROXY] iniciado na porta ${PROXY_PORT}`);
});


var proxySocket;

proxySocket = require('socket.io')(server);
proxySocket.on('connection', (socket) => {
    const { device, t } = socket.handshake.query;
    console.info(`[FROM CLIENT] connected: ${device} - ${t}`);
    clientConnected = true;
    proxySocket.emit('serverStatus', serverConnected);
    messages.forEach(message => proxySocket.emit('message', message));
    messages = [];
    socket.on('disconnect', () => {
        clientConnected = false;
        console.warn(`[FROM CLIENT] disconnected: ${device} - ${t}`);
    });
});


