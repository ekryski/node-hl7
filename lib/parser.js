/*
* HL7 Parser
* Copyright (c) 2012 Eric Kryski
* MIT Licensed
*/

// NOTE: This is just proof of concept...i don't want to reinvent the wheel
// KNOWN ISSUES: 1) i pull the delimiters from MSH but don't use them
//               2) repetitions aren't enabled (another loop needed within the k loop)
//               3) I hacked the MSH segment to actually work like a real segment

var builder = require('xmlbuilder');

exports.toXml = function(msg) {
  msg = msg.trim();
  var composite = msg.substring(4,5);
  var subComposite = msg.substring(5,6);
  var repetitions = msg.substring(6,7);
  var escapeChar = msg.substring(7,8);

  msg = msg.substring(0,4) + "|" + msg.substring(8,msg.length); //hack msh to get it to act like a normal segment

  var xml = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n<HL7Message>\n";

  // var xml = builder.create('HL7Message', {'version': '1.0', 'encoding': 'UTF-8'});

  var segments = msg.split(/\r|\n/);
  for (var i in segments.length) {
      if(segments[i] && !segments[i].match(/^(\s*|.)$/)) {

        var seg_info = segments[i].split("|");
        xml += "  <" + seg_info[0] + ">\n";

        for (var j=1; j < seg_info.length; j++) {
          xml += "    <" + seg_info[0] + "." + j + ">\n";
          var individual_pieces = seg_info[j].split("^");

          for (var k=1; k <= individual_pieces.length; k++) {
            if (individual_pieces[k-1]) {
              xml += "        <" + seg_info[0] + "." + j + "." + k + ">";
              xml += individual_pieces[k-1];
              xml += "</" + seg_info[0] + "." + j + "." + k + ">\n";
            }
            else {
              xml += "        <" + seg_info[0] + "." + j + "." + k + "/>\n";
            }
          }
          xml += "    </" + seg_info[0] + "." + j + ">\n";
        }
        xml += "  </" + seg_info[0] + ">\n";
      }
  }

  return xml + "</HL7Message>";
};
