var dgram                     = require('dgram');
var server                    = dgram.createSocket("udp4");
var os                        = require('os');
var https                     = require('https');
var nodemailer                = require('nodemailer');
var moment                    = require('moment-timezone');
var redis                     = require('redis');
var speedTest                 = require('speedtest-net');
var PAULOSIMAO_HIA_EXTERNALIP = 'paulosimao:hia:externalip';
var PAULOSIMAO_HIA_SPEEDTEST  = 'paulosimao:hia:speedtest';
var config                    = require('./config.json');

function doSpeedTest() {


	test = speedTest({maxTime: 5000});

	test.on('data', function (data) {
		rediscli.set(PAULOSIMAO_HIA_SPEEDTEST + ':' + new Date().toString(), JSON.stringify(data));
	});

	test.on('error', function (err) {
		console.error(err);
	});
}

var rediscli = redis.createClient();


var transporter = nodemailer.createTransport(config.smtp);

var lastip = '';

server.bind(function () {
	server.setBroadcast(true);
	server.setMulticastTTL(128);
	broadcastNew();
	setInterval(broadcastNew, 60000);
	if (config.dospeedtest) {
		doSpeedTest();
		setInterval(doSpeedTest, 60 * 60 * 1000);
	}
});


function broadcastNew() {

	getExtIP((ip)=> {

		rediscli.get(PAULOSIMAO_HIA_EXTERNALIP, (err, lastip)=> {

			if (err) {
				return console.erro(err);
			}


			var nwifaces = JSON.stringify({when: new Date(), ifaces: os.getNetworkInterfaces(), externalip: ip});
			var message  = new Buffer(nwifaces);
			server.send(message, 0, message.length, 5007, "224.1.1.1");

			if (ip && ip != lastip) {
				rediscli.set(PAULOSIMAO_HIA_EXTERNALIP, ip);

				// setup e-mail data with unicode symbols
				var mailOptions = {
					from: '"HOME IP" <homeip@nodomain.com>', // sender address
					to: config.dstmail, // list of receivers
					subject: '[HOMEIP] HOME IP HAS CHANGED ' + moment.tz(new Date(), 'America/Sao_Paulo').format('DD/MM/YYYY - hh:mm'), // Subject line
					html: `NEW IP<b>: ${ip}</b>`,
					attachments: []
				};

				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						return console.log(error);
					}
					console.log('Message sent: ' + info.response);

				});
			}

		});
	});

}

function getExtIP(cb) {
	try {
		https.get('https://api.ipify.org?format=json', (res)=> {
			var buffers = [];
			res.on('data', (buf)=> {
				buffers.push(buf);
			});

			res.on('end', ()=> {
					var o = JSON.parse(Buffer.concat(buffers).toString());
					// res.pipe(process.stdout);
					cb(o.ip);
				}
			);
			res.on('error', (err)=> {
				console.error(err);
				cb(null);
			});
		});
	} catch (err) {
		console.error(err);
		cb(null);
	}
}