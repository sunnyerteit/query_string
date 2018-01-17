var express = require('express');
fs = require('fs');


let m = JSON.parse(fs.readFileSync('bins.json').toString());

//querystring bin_id=5421&battery=36.2&saturation=40.2

/*
// Dummy value
const x = {
    bin1: {
        battery: 15.2,
        saturation: 40.2
    }
}
*/


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
        else if (!!parseFloat(incoming[key])) {
            original[key] = parseFloat(incoming[key]);
        }
    });
}


// Create server
var app = express();

app.get('/get/', function (req, res) {
    update_bin(m.bin1, req.query);
    // Export beautified json
    let json = JSON.stringify(m, null, 4);
    fs.writeFile('bins.json', json, 'utf8');
    res.send(m);
});

app.listen(3000);
