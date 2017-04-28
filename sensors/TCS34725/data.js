var PubNub = require('pubnub');
var rgbLib = require('./TCS34725');

// init pubnub
var pubnub = new PubNub({
    publishKey   : "pub-c-561a7378-fa06-4c50-a331-5c0056d0163c",
    subscribeKey : "sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe"
});

// init RGB class
var rgb = rgbLib.use({ 
  "bus"     : "/dev/i2c-1", 
  //"led_pin" : "P8_14", 
  //"irq_pin" : "P8_26",
  "module_id" : 0x44
});

rgb.on('ready', function() {
  
  // get raw RGBC (red, green, blue, clear) values 
  setInterval(function() {

  	// initialize data to send to pubnub
  	data 	= {
  		'red': 		0,
  		'green': 	0,
  		'blue': 	0,
  		'clear': 	0,
  		//'temp': 	0,
  		//'lux': 		0
  	};

  	// get raw RGB data
    rgb.getRawData(function(err, colors) {
      
      if (err) throw err;

      console.log('RED:', colors.red);
      console.log('GREEN:', colors.green);
      console.log('BLUE:', colors.blue);
      console.log('CLEAR:', colors.clear);

      // set result
      data.red 		= colors.red;
      data.green 	= colors.green;
      data.blue 	= colors.blue;
      data.clear 	= colors.clear;

      send_to_pubnub(data);
      console.log(data);

    });

    /*
    // get color temperature values in degrees Kelvin
    rgb.calculateColorTemperature(function(err, temp) {
      if (err) throw err;

      console.log('TEMP:', temp);
      
      // set result
      data.temp 	= temp;
      send_to_pubnub(data);

    });

    // calculate lux
    rgb.calculateLux(function(err, lux) {
      if (err) throw err;

      console.log('LUX:', lux);
      console.log('');

      // set result
      data.lux 		= lux;
      send_to_pubnub(data);

    });
    */
    
  }, 1000);

});


function send_to_pubnub(data){
    // push the data to pubnub
    //var message = { eon: eon };
    pubnub.publish({
        channel   : 'eon-sensor-tcs34725',
        message   : { eon: data },
    });
}
