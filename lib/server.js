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
  var responseMessageNumber = 0;

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

    function createEL7AckForMessageNumber(messageNumber) {
      var ack = 'MSH|^~\\&|||||' + generateTimeStamp() + '||ACK^RO1|'+ getUniqueMessageNumber() +'|T|2.6\rMSA|AA|' + messageNumber;
      return ack;
    }

    function zeroFill( number, width ) {
      width -= number.toString().length;
      if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
      }
      return number + ""; // always return a string
    }

    function generateTimeStamp() {
      var now = new Date();

      var month = zeroFill(now.getUTCMonth() + 1, 2);
      var date = zeroFill(now.getUTCDate(), 2);
      var hours = zeroFill(now.getUTCHours(), 2);
      var minutes = zeroFill(now.getUTCMinutes(), 2);
      var seconds = zeroFill(now.getUTCSeconds(), 2);

      var timestamp = now.getUTCFullYear().toString()
        + month 
        + date
        + hours 
        + minutes 
        + seconds
        + '.'
        + now.getUTCMilliseconds().toString()
        + '+0000' 
        return timestamp;
    }

    function getUniqueMessageNumber() {
      responseMessageNumber = responseMessageNumber + 1;
      return responseMessageNumber;
    }

    function createXMLAckForMessageNumber(messageNumber) {
      var ack = String.fromCharCode(0x0b) + '<?xml version="1.0" encoding="UTF-8"?>' +
        '\n<ACK xmlns="urn:hl7-org:v2xml">'+
        '\n<MSH>' +
            '\n<MSH.1>|</MSH.1>' +
            '\n<MSH.2>^~\&amp;</MSH.2>' +
            '\n<MSH.7>' + generateTimeStamp() + '</MSH.7>' +
            '\n<MSH.9>' +
                '\n<MSG.1>ACK</MSG.1>' +
                '\n<MSG.2>R01</MSG.2>' +
            '\n</MSH.9>' +
            '\n<MSH.10>' + getUniqueMessageNumber() + '</MSH.10>' +
            '\n<MSH.11>' +
                '\n<PT.1>T</PT.1>' +
            '\n</MSH.11>' +
            '\n<MSH.12>' +
                '\n<VID.1>2.6</VID.1>' +
            '\n</MSH.12>' +
        '\n</MSH>' +
        '\n<MSA>' +
            '\n<MSA.1>AA</MSA.1>' +
            '\n<MSA.2>' + messageNumber +'</MSA.2>' +
        '\n</MSA>' +
      '\n</ACK>\n' + String.fromCharCode(0x1c) + '\r';
      console.log("Generated ACK: " + ack);
      return ack;
    }

    function handleXML(xml, sendEL7Ack){
      parser.parseString(xml, function(error, result){
        if (error) return handleError(error);

        if (self.debug) {
          console.log("Message: ", util.inspect(result, false, 7, true));
          console.log('Sending ACK');
        }
        self.emit('hl7', result);

        console.log(result);

        var messageNumber = 0;

        for (var key in result) {
          if (result.hasOwnProperty(key)) {
            if (result[key].MSH) {
              var msg = result[key].MSH[0]["MSH.10"][0];
              messageNumber = msg;
            }
          }
        }

        console.log("Sending ACK for messageNumber "+messageNumber);

        if (sendEL7Ack) {
          var ack = createEL7AckForMessageNumber(messageNumber);
          socket.write(ack);
        }
        else {
          var ack = createXMLAckForMessageNumber(messageNumber);
          socket.write(new Buffer(ack, encoding = "utf8"));
        }
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
        handleXML(packet.trim(), false);
      }
      // It is EL7 format
      else {
        hl7.toXml(packet, function(error, xml){
          if (error) return handleError(error);

          handleXML(xml, true);
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