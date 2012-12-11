/*
* HL7 Parser
* Copyright (c) 2012 Eric Kryski
* MIT Licensed
*/

// NOTE: This is just proof of concept...i don't want to reinvent the wheel
// KNOWN ISSUES: 1) i pull the delimiters from MSH but don't use them
//               2) repetitions aren't enabled (another loop needed within the k loop)
//               3) I hacked the MSH segment to actually work like a real segment

exports.toXml = function(hl7) {
  hl7 = hl7.trim();
  var composite = hl7.substring(4,5);
  var sub_composite = hl7.substring(5,6);
  var repetitions = hl7.substring(6,7);
  var escape_char = hl7.substring(7,8);
  
  hl7 = hl7.substring(0,4) + "|" + hl7.substring(8,hl7.length);//hack msh to get it to act like a normal segment

  var xml_representation = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n<HL7Message>\n";

  var segments = hl7.split(/\r|\n/); 
  for (var i=0; i< segments.length; i++) {
      if(segments[i] && !segments[i].match(/^(\s*|.)$/)) {
        var seg_info = segments[i].split("|");
        xml_representation += "  <"+seg_info[0]+">\n";
        for(var j=1; j<seg_info.length; j++) {
          xml_representation += "    <"+seg_info[0]+"."+j+">\n";
          var individual_pieces = seg_info[j].split("^");
          //xml_representation += "      "+individual_pieces[0]+"\n";
          for(var k=1; k<=individual_pieces.length; k++) {
            if(individual_pieces[k-1]) {// && !individual_pieces[k].match(/^\s*$/)) {
              xml_representation += "        <"+seg_info[0]+"."+j+"."+k+">";
              xml_representation += individual_pieces[k-1];
              xml_representation += "</"+seg_info[0]+"."+j+"."+k+">\n";
            } else {
              xml_representation += "        <"+seg_info[0]+"."+j+"."+k+"/>\n";
            }
          }
          xml_representation += "    </"+seg_info[0]+"."+j+">\n";
        }
        xml_representation += "  </"+seg_info[0]+">\n";
      }
  }

  return xml_representation + "</HL7Message>";
};
