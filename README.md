# Node HL7 Event Emitter
Node HL7 is a basic HL7 parser that listens for HL7 messages and then parses them to XML or JSON (Defaults to JSON).

## Usage

```
  var hl7 = require('hl7');
  var hl7Server = new hl7.Server();

  hl7Server.on('hl7', function(msg){
    // Do whatever you wanna do.
  });
```
