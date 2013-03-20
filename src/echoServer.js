'use strict';
/**
 * Echo server for websockets.
 * (C) 2013 Alex Fernández.
 */

var webSocketServer = require('websocket').server;
var http = require('http');

var port = 1771;
var server = http.createServer(serve).listen(port, function()
{
	console.log('Server running at http://127.0.0.1:' + port + '/');
});

/**
 * Serve contents.
 */
function serve(request, response)
{
	// will serve websocket
	return;
}

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
	// WebSocket server is tied to a HTTP server
	httpServer: server
});

/**
 * This callback function is called every time someone
 * tries to connect to the WebSocket server
 */
wsServer.on('request', function(request)
{
	var connection = request.accept(null, request.origin);
	if (request.resource != '/echo')
	{
		console.error('Wrong URL: %s', request.resource);
		return;
	}
	console.log('Accepted connection for %s from %s', request.resource, connection.remoteAddress);
	connection.on('error', function(error)
	{
		console.error('Error: %s', error);
	});
	connection.on('close', function()
	{
		console.log('Connection closed');
	});
	connection.on('message', function(message)
	{
		// console.log('Received: %s', JSON.stringify(message));
		connection.sendUTF(message.utf8Data);
	});
});



