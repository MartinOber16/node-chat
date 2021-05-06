const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { port } = require('./config/vars');

const app = express();
const server = http.createServer(app);

// MIDDLEWARES
app.use( require('./middlewares/index') );
app.use( express.static( path.resolve( __dirname, 'public') ));

// SOCKETS
module.exports.io = socketIO(server);
require('./sockets/socket');

// SERVER
server.listen(port, (error) => { 

    if(error) throw new Error(error);

    console.log('Servidor de chat corriendo en puerto: ' + port);
});