var fs = require('fs');
var expect = require('chai').expect;
var parser = require('../lib/parser.js');
var xml2js = require('xml2js');
var util = require('util');

var sampleEL7 = 'MSH|^~\\&|NES|NINTENDO|TESTSYSTEM|TESTFACILITY|20010101000000||ADT^A04|Q123456789T123456789X123456|P|2.3\r' +
                'EVN|A04|20010101000000|||^KOOPA^BOWSER\r' +
                'PID|1||123456789|0123456789^AA^^JP|BROS^MARIO||19850101000000|M|||123 FAKE STREET^MARIO \T\ LUIGI BROS PLACE^TOADSTOOL KINGDOM^NES^A1B2C3^JP^HOME^^1234|1234|(555)555-0123^HOME^JP:1234567|||S|MSH|12345678|||||||0|||||N\r' +
                'NK1|1|PEACH^PRINCESS|SO|ANOTHER CASTLE^^TOADSTOOL KINGDOM^NES^^JP|(123)555-1234|(123)555-2345|NOK\r' +
                'NK1|2|TOADSTOOL^PRINCESS|SO|YET ANOTHER CASTLE^^TOADSTOOL KINGDOM^NES^^JP|(123)555-3456|(123)555-4567|EMC\r' +
                'PV1|1|O|ABCD^EFGH||||123456^DINO^YOSHI^^^^^^MSRM^CURRENT^^^NEIGHBOURHOOD DR NBR|^DOG^DUCKHUNT^^^^^^^CURRENT||CRD|||||||123456^DINO^YOSHI^^^^^^MSRM^CURRENT^^^NEIGHBOURHOOD DR NBR|AO|0123456789|1|||||||||||||||||||MSH||A|||20010101000000\r' +
                'IN1|1|PAR^PARENT||||LUIGI\r' +
                'IN1|2|FRI^FRIEND||||PRINCESS'.replace(/\\/, '\\');

var sampleXML = fs.readFileSync(__dirname + '/fixtures/sample.xml');
var xmlParser = new xml2js.Parser();

describe("HL7 Parser Tests", function() {
  describe("toXml", function() {
    it("Should return the correct XML", function(done) {
      parser.toXml(sampleEL7, function(error, xml){
        xmlParser.parseString(sampleXML, function(error, sampleResult){
          // console.log(xml, sampleResult);
          xmlParser.parseString(xml, function(error, result){
            // console.log(util.inspect(result, false, 9, true));
            // console.log('**************************************');
            // console.log(util.inspect(result, false, 9, true));

            // expect(error).to.be.null;
            expect(result).to.eql(sampleResult);
            done();
          });
        });
      });
    });
  });
});