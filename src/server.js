'use strict';
/**
 * Server for websockets.
 * (C) 2013 Alex Fernández.
 */

var webSocketServer = require('websocket').server;
var http = require('http');

var port = 1771;
var server = http.createServer(serve).listen(port, function()
{
	console.log('Server running at http://127.0.0.1:' + port + '/');
});
