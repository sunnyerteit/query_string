var express = require('express');
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
    if (original.compress == 1 && parseFloat(incoming.compress) == 0 ) {

        // Add compress cycle
        original.cycles += 1;

        // Add new timestamp
        var timestamp = new Date();
        original.timestamp = timestamp;
    }
}

// Create server
var app = express();

/*
app.get('/get/', function (req, res) {
    let json = JSON.stringify(m, null, 4);
    res.send({compress: m.bin1.compress});
});
*/

app.get('/send/', function (req, res) {
    let json = JSON.stringify(m, null, 4);
    res.send({ compress: m.bin1.compress });
    // Check if compress is changed from active to inactive
    compress_cycle(m.bin1, req.query);
    // Update data based on query string
    update_bin(m.bin1, req.query);

    // Write beautified json
    fs.writeFile('bins.json', json, 'utf8');
});

app.get('/data/', function (req, res) {
    // Export beautified json
    let json = JSON.stringify(m, null, 4);
    res.set({ 'Content-Type': 'application/json; charset=utf-8' }).send(json);
});

app.listen(3000);
