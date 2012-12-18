/*
* NodeJS HL7 Server
* Copyright (c) 2012 Eric Kryski
* MIT Licensed
*/

var net = require('net'),
util = require('util'),
EventEmitter = require('events').EventEmitter,
hl7 = require('./parser.js'),
xml2js = require('xml2js'),
fs = require('fs');

 /*
 * Supported HL7 protocol version
 */

exports.protocol = '2.6';


 /**
  * Creates a HL7 Server
  *
  * @param String host to listen for HL7 data
  * @param Integer port to listen to HL7 data - default is 59895
  * @param {Object} options
  * @api public
  */

function Server(host, port, options) {
  var self = this;

  // Needed to convert this constructor into EventEmitter
  EventEmitter.call(this);

  options = options || {};
  this.host = host || '127.0.0.1';
  this.port = port || 59895;
  this.debug = options.debug || false;
  this.json = options.json || true;

  var parser = new xml2js.Parser();

  // TODO: Build up proper ACKS
  var applicationAcceptACK = 'MSH|^~\\&|||||20121217154325.194-0700||ACK^RO1|101|T|2.6\nMSA|AA|17';
  var applicationErrorACK = 'MSH|^~\\&|NES|NINTENDO|TESTSYSTEM|TESTFACILITY|20121217158325.194-0700||ACK^RO1|101|T|2.6\nMSA|AE|17';

  // Bind to TCP socket for HL7
  var hl7TcpSocket = net.createServer({ allowHalfOpen: false}, function(socket){

    socket.setEncoding("utf8");

    function handleError(error){
      socket.write(applicationErrorACK);

      self.emit('error', error);
      console.log("HL7 TCP Server ERROR: ", error);
    }

    function handleXML(xml){
      parser.parseString(xml, function(error, result){
        if (error) return handleError(error);

        if (self.debug) {
          console.log("Message: ", util.inspect(result, false, 7, true));
          console.log('Sending ACK');
        }
        self.emit('hl7', result);

        socket.write(applicationAcceptACK);
        socket.end();
      });
    }

    socket.on('connect', function() {
     if (self.debug) {
       var now = new Date();
       console.log(now + " - HL7 TCP Client Connected");
     }
    });

    socket.on('data', function(packet) {
      if (self.debug) {
        console.log(packet);
      }

      if (!packet) return handleError(new Error('Packet is empty'));

      // It is XML format
      if (packet.indexOf('<?xml') !== -1) {
        handleXML(packet.trim());
      }
      // It is EL7 format
      else {
        hl7.toXml(packet, function(error, xml){
          if (error) return handleError(error);

          handleXML(xml);
        });
      }
    });

    socket.on('error', function(error){
      handleError(error);
    });

    socket.on('close', function(){
      if (self.debug) {
        var now = new Date();
        console.log(now + " - HL7 TCP Server Disconnected");
      }
    });

    socket.on('end', function() {
      if (self.debug) {
        var now = new Date();
        console.log(now + " - HL7 TCP Client Disconnected");
      }
    });
  });

  hl7TcpSocket.listen( this.port, function(){
    var address = hl7TcpSocket.address();
    console.log("HL7 TCP Server listening on: " + address.address + ":" + address.port);
  });
}

// Needed to convert this constructor into EventEmitter
util.inherits(Server, EventEmitter);

 /**
 * Expose HL7 Server constructor
 */
exports = module.exports = Server;