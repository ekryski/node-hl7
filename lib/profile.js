var message = exports.message = {
    'ACK': {
        'MSH': segments.MSH,
        'SFT': segments.SFT,
        'MSA': segments.MSA,
        'ERR': segments.ERR
    },
    'ADT^A04': {
        'MSH': segments.MSH,
        'EVN': segments.EVN,
        'PID': segments.PID,
        'NK1': segments.NK1,
        'PR1': segments.PR1,
        'PV1': segments.PV1,
        'IN1': segments.IN1
    }
};

var segments = exports.segments = {
    'MSH': [],
    'EVN': ['', 'TS', 'TS', 'IS', 'CN', 'TS', 'HD'],
    'OBX': [],
    'PID': ['', '', 'CX', 'CX', 'XPN', '', 'TS', '', 'XAD', '', 'XTN', '', '', '', 'CX'],
    'NK1': ['', 'XPN', 'CE', 'XAD', 'XTN', 'XTN', 'CE'],
    'PR1': [],
    'PV1': ['', '', 'PL', '', '', '', 'XCN', 'XCN', '', '', 'XCN', '', 'CX', 'FC', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'TS'],
    'IN1': ['', 'CE', '', '', '', 'XPN', 'CE'],
    'MSA': [],
    'SFT': [],
    'ERR': []
};

var fields = exports.fields = {
    
};