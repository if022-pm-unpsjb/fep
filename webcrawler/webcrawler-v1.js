const request = require('request');

request('https://www.google.com.ar', (err, res, body) => {
	        if (err) { return console.log(err); }
	        console.log(body);
});

