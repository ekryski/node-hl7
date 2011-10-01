/**
 *  How about we don't rip this off? I was bored and thought this
 *  would be nifty. It's very basic and I have a lot of changes to make
 *
 *  @Author: Marcus Young (10/1/2011)
 *  @Email: 3vilpenguin@gmail.com
 *  @Page: www.marcyoung.us
 **/

var hl7 = require('./lib/hl7_to_xml.js');
var xml = require('./lib/xml2js.js');

var fs = require('fs'),
    eyes = require('./lib/eyes');

var sys = require("sys"),
    net = require("net");


var server = net.createServer(function(stream) {
  stream.setEncoding("utf8");
  stream.addListener("connect", function() {
    sys.puts("Client connected");
  });
  stream.addListener("data", function(data) {
    if(data && !data.match(/^\s*$/)) {
      //send a fake accept ack to my perl llp sender over the socket
      stream.write("...AA");
      var from_xml = hl7.to_xml(data);
      var parser = new xml.Parser();

      parser.on('end', function(result) {
        //result is now an object formed from xml2js
        //on 'end' called from successful parser.parseString()
        sys.puts("MRN From message: "+result["PID"]["PID.3"]["PID.3.1"]);
      });

      parser.parseString(from_xml);
    }
  });
  stream.addListener("end", function() {
    sys.puts("Client disconnected");
    stream.end();
  });
});
server.listen(1337,"127.0.0.1");

