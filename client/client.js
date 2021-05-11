'use strict'
require('dotenv').config();

var { io } = require("socket.io-client");

var isConnected = false;
const PROXY_URL= `http://localhost:${process.env.PROXY_PORT}`;
const MACHINE_ID = process.env.MACHINE_ID || 'PI000';

var isConnected = false;
var socket = io(PROXY_URL, { query: `device=${MACHINE_ID}` });

socket.on("connect", () => {
    isConnected = true;
    console.info("[FROM PROXY] Connected", socket.id);
    // user_id = data.user_id;
});

socket.on("message", (data) => {
    console.info("[FROM PROXY] Message:", data);
});

socket.on("serverStatus", (data) => {
    console.info("[FROM PROXY] ServerStatus:", data);
});

socket.on("disconnect", () => {
    isConnected = true;
    console.warn("[FROM PROXY] Disconnected");
});
