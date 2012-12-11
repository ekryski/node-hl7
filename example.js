/*
* HL7 example server (ie. one you might make)
*
* Copyright (c) 2012 Eric Kryski
* MIT Licensed
*/

var socketio = require('socket.io'),
    hl7Server = require("./lib/hl7-server.js");

var server = new hl7Server();

var port = 5000;

function onSocketConnect(socket) {
    console.log("Socket.io Client Connected");

    server.on('hl7', function(msg){
      socket.emit('hl7', msg);
    });

    socket.on("disconnect", function(){
      console.log("Socket.io Client Disconnected");
    });
}

// Setup Socket.io connection
var io = socketio.listen( port );
io.enable("browser client minification");
io.enable("browser client etag");
io.enable("browser client gzip");
io.set("log level", 1);
io.set("transports", [
    "websocket",
    "flashsocket",
    "htmlfile",
    "xhr-polling",
    "jsonp-polling"
]);
io.sockets.on("connection", onSocketConnect);

server.on('hl7', function(msg){
  console.log(msg);
});