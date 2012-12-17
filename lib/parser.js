/*
* HL7 Parser
* Copyright (c) 2012 Eric Kryski
* MIT Licensed
*/

// KNOWN ISSUES: 1) I pull the delimiters from MSH but don't use them
//               2) repetitions aren't enabled (another loop needed within the k loop)
//               3) I hacked the MSH segment to actually work like a real segment

var builder = require('xmlbuilder');

var delimiters = {
  composite: '', // |
  subComposite: '', // ^
  repetitions: '', // ~
  escapeChar: '', // \
  subSubComposite: '' // &
};

function buildSegment(xml, composites){
  // console.log('COMPOSITES', composites);

  var compositeParent = xml.ele(composites[0]);

  for (var j=1; j < composites.length; j++) {
    var subCompositeParent = compositeParent.ele(composites[0] + '.' + j);

    var textNodes = composites[j].split(delimiters.subComposite);

    // console.log('TEXT NODES', textNodes);

    for (var k=1; k <= textNodes.length; k++) {
      var node = subCompositeParent.ele(composites[0] + '.' + j + '.' + k);

      if (textNodes[k-1]) {
        node.txt(textNodes[k-1]);
      }
    }
  }

  return xml;
}

exports.toXml = function(msg, callback) {
  msg = msg.trim();

  delimiters.composite = msg.substring(3,4); // |
  delimiters.subComposite = msg.substring(4,5); // ^
  delimiters.repetitions = msg.substring(5,6); // ~
  delimiters.escapeChar = msg.substring(6,7); // \
  delimiters.subSubComposite = msg.substring(7,8); // &

  var segments = msg.split(/\r/);

  var headerComposites = segments[0].split(delimiters.composite);
  var head = headerComposites.shift();
  headerComposites.unshift(head, '|');

  var xml = builder.create(headerComposites[9].replace('^', '_'), {'version': '1.0', 'encoding': 'UTF-8'}).att('xmlns','urn:hl7-org:v2xml');

  xml = buildSegment(xml, headerComposites);

  for (var i=1; i < segments.length; i++) {
    if(segments[i] && !segments[i].match(/^(\s*|.)$/)) {
      var composites = segments[i].split(delimiters.composite);
      
      xml = buildSegment(xml, composites);
    }
  }

  var xmlString = xml.end({ 'pretty': true, 'indent': '    ', 'newline': '\n' });

  // console.log(xmlString);
  callback(null, xmlString);
};
