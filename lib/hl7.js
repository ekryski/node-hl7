var server = require('./server'),
    parser = require('./parser');

/*
 * NodeJS HL7 version
 */

exports.version = '0.1.0';

exports.Server = server;
exports.Parser = parser;