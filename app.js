var express = require('express');
var socket = require('socket.io');
fs = require('fs');


let m = JSON.parse(fs.readFileSync('bins.json').toString());

// Updates original object
function update_json(original, incoming) {
    Object.keys(incoming).forEach(function (key_1) {
        Object.keys(original[key_1]).forEach(function (key_2) {
            if (key_2 in incoming[key_1]) {
                original[key_1][key_2] = incoming[key_1][key_2];
            }
        })
    });
}

function update_bin(original, incoming) {
    Object.keys(incoming).forEach(function (key) {
        // Update if previous value is string
        if (typeof original[key] === 'string' || original[key] instanceof String) {
            original[key] = incoming[key];
        }
        // Update if previous value is num
        else if (!isNaN(incoming[key])) {
            original[key] = parseFloat(incoming[key]);
        }
    });
}

// Check if bin is compressing
function compress_cycle(original, incoming) {
    if (original.compress == 1 && parseFloat(incoming.compress) == 0) {
        original.start_compress = 0;
        // Add compress cycle
        original.cycles += 1;


        // Resert start_compress

        // Add new timestamp
        var timestamp = new Date();
        original.timestamp = timestamp;
    }
}

// Create back-end server
var app = express();

app.get('/send/', function (req, res) {
    // Read json
    let m = JSON.parse(fs.readFileSync('bins.json').toString());

    // Check if compress is changed from active to inactive
    compress_cycle(m.bin1, req.query);
    // Update data based on query string
    update_bin(m.bin1, req.query);

    // Send updated start_compress
    res.send({ start_compress: m.bin1.start_compress });
    let json = JSON.stringify(m, null, 4);
    // Write beautified json
    fs.writeFile('bins.json', json, 'utf8');
});

app.get('/data/', function (req, res) {
    let m = JSON.parse(fs.readFileSync('bins.json').toString());
    // Export beautified json
    let json = JSON.stringify(m, null, 4);
    res.set({ 'Content-Type': 'application/json; charset=utf-8' }).send(json);
});

app.listen(3000);


//////////////////////

// Create front-end server
var view = express();

// Listening
var server = view.listen(4000, function () {
    console.log('listenting to port 4000');
});

// Add static folder
view.use(express.static('public'));

// Socket
var io = socket(server);

io.on('connection', function (socket) {
    socket.on('loaded', function () {
        console.log('has loaded');
    });
    socket.on('send', function () {

        let m = JSON.parse(fs.readFileSync('bins.json').toString());
        m.bin1.start_compress = 1;

        let json = JSON.stringify(m, null, 4);
        fs.writeFile('bins.json', json, 'utf8');
    });

});