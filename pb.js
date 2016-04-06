/**
 * Created by paulo.simao on 24/03/2016.
 */
module.exports = function (title, msg) {
	var https                                = require('https');
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

	var options = {
		headers           : {
			'Access-Token': 'PLAT',
			'Content-Type': 'Application/json'
		},
		hostname          : 'api.pushbullet.com',
		port              : 443,
		path              : '/v2/pushes',
		method            : 'POST',
		rejectUnauthorized: false
	};


	var req = https.request(options, (res)=> {
		console.log('Message sent - RESPONSE:')
		res.pipe(process.stdout);
	});
	req.write(JSON.stringify({body: msg, title: title, type: 'link', url: 'ssh://' + msg}));
	req.end();
}