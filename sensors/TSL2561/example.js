/*
 * This file is part of sensorTSL2561 for node.
 *
 * Copyright (C) Thomas Schneider, imwebgefunden@gmail.com
 *
 * sensorTSL2561 for node is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * sensorTSL2561 for node is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with sensorTSL2561 for node.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

/* jslint node: true */
"use strict";

var PubNub  = require('pubnub');
var TSL2561 = require('./TSL2561');
var async = require('async');

// init pubnub
var pubnub = new PubNub({
    publishKey   : "pub-c-561a7378-fa06-4c50-a331-5c0056d0163c",
    subscribeKey : "sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe"
});

var nrOfSec = 60;
var sens = new TSL2561();

sens.on('newSensorValues', function(allData) {
    console.log('received event "newSensorValues" - calculating ...');
    var ir = allData.sensValues.rawData.addr_0x0F << 8 | allData.sensValues.rawData.addr_0x0E;
    var full = allData.sensValues.rawData.addr_0x0D << 8 | allData.sensValues.rawData.addr_0x0C;
    console.log('IR      : ' + ir);
    console.log('FULL    : ' + full);
    console.log('VISIBLE : ' + (full - ir));
    console.log('LUX     : ' + allData.sensValues.devData.light.value);
    console.log('');

    var data    = {
       // 'ir':       ir,
       // 'full':     full,
       // 'visible':  (full-ir),
        'lux':      allData.sensValues.devData.light.value
    };

    // send data to pubnub
    send_to_pubnub(data);
});

function sensRead() {
    async.timesSeries(nrOfSec, function(n, next) {
        setTimeout(function() {
            sens.getAllValues(next);
        }, 1000);
    }, function(err, res) {
        // finished
    });
}

console.log('sensor init ...');
sens.init(function(err, val) {
    if (err) {
        console.log('error on sensor init: ' + err);
    } else {
        console.log('sensor init completed');
        sensRead();
    }
});



function send_to_pubnub(data){
    // push the data to pubnub
    //var message = { eon: eon };
    pubnub.publish({
        channel   : 'eon-sensor-tsl2561',
        message   : { eon: data },
    });
}

