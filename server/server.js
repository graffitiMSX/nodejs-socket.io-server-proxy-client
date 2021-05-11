'use strict'
require('dotenv').config();

// imports
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');

// vars
const app = express();
const PORT = process.env.SERVER_PORT || 3500;

// configure express
app.use(cors());
app.use(helmet());
app.use(express.json());

var io;

var clientsConnected = [];
var messages = [];

// routes
const routes = express.Router();

// Message Endpoint
routes.post(`/message`, (req, res) => {
    let { message, device } = req.body;
    console.log(`[FROM API] Message Received: [${device}] - "${message}"`);
    sendMessage(device, message);
    res.status(200).send();
});

app.use(routes);

const server = http.createServer({}, app);

server.listen(PORT, () => {
    console.info(`[SERVER] iniciado na porta ${PORT}`);
});


//socket initializing
io = require('socket.io')(server);

//socket methods
io.on('connection', function (socket) {
    const { device, t } = socket.handshake.query;
    const { id } = socket;
    console.info(`[FROM PROXY] Connected: ${id} - ${device} - ${t}`);

    if (clientsConnected.indexOf(device) === -1) {
        clientsConnected = [...clientsConnected, device];
        showClients();
    }

    if (messages.length > 0) {
        let messagesToSend = messages.filter(item => item.device === device);
        messagesToSend.forEach(item => {
            io.emit(`${device}`, item.message);
        });
        messages = messages.filter(item => item.device != device);
        showMessages();
    }

    socket.on('disconnect', () => {
        console.info(`[FROM PROXY] Disconnected: ${id} - ${device}`);
        clientsConnected.splice(clientsConnected.indexOf(device), 1);
        showClients();
    });
})

const showClients = () => {
    console.log(`Clients connected: ${clientsConnected.length}`, clientsConnected);
}

const showMessages = () => {
    console.log(`Messages connected: ${messages.length}`, messages);
}

const sendMessage = (device, message) => {
    if (io) {
        if (clientsConnected.indexOf(device) != -1) {
            io.emit(`${device}`, message);
        } else {
            messages.push({ device, message });
        }
    }
    if (message.length > 0) showMessages();
}


process.on('SIGINT', function () {
    if (io) {
        console.warn('Shutdown sockets...');
        if (io.sockets) io.sockets = null;
        io = null;
    }

    server.close(() => {
        console.info('Shutdown ok!');
        process.exit(0);
    });

    setTimeout(() => {
        console.warn('Forced shutdown!');
        process.exit(1);
    }, 5000);
});
