/*
* NodeJS HL7 Server
* Copyright (c) 2012 Eric Kryski
* MIT Licensed
*/

 var net = require('net'),
     util = require('util'),
     EventEmitter = require('events').EventEmitter,
     hl7 = require('./hl7.js'),
     xml = require('xml2js'),
     fs = require('fs');

 /*
 * Server version
 */

 exports.version = '0.1.0';

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

 function hl7Server(host, port, options) {
   var self = this;

   // Needed to convert this constructor into EventEmitter
   EventEmitter.call(this);

   options = options || {};
   this.host = host || '127.0.0.1';
   this.port = port || 59895;
   this.debug = options.debug || false;
   this.json = options.json || true;

   // Bind to TCP socket for HL7
   var hl7TcpSocket = net.createServer(function(socket){
    socket.setEncoding("utf8");

     socket.on('connect', function() {
       if (self.debug) {
         var now = new Date();
         console.log(now + " - HL7 TCP Client Connected");
       }
     });

     socket.on('data', function(packet) {
      if(packet && !packet.match(/^\s*$/)) {
        
        //TODO: send a accept ack back
        
        var from_xml = hl7.toXml(packet);
        var parser = new xml.Parser();

        parser.on('end', function(result) {
          //result is now an object formed from xml2js
          //on 'end' called from successful parser.parseString()
          console.log("MRN From message: ", util.inspect(result, false, 7, true));
          self.emit('hl7', result);
          // sys.puts("MRN From message: " + result["PID"]["PID.3"]["PID.3.1"]);
        });

        parser.parseString(from_xml);
      }
     });

     socket.on('error', function(error){
       self.emit('error', error);
       console.log("HL7 TCP Server ERROR: ", error);
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
 util.inherits(hl7Server, EventEmitter);

 /**
 * Expose Caress Server constructor
 */
 exports = module.exports = hl7Server;