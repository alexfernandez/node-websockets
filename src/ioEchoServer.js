'use strict';

/**
 * Echo server for websockets, socket.io version.
 * (C) 2013 Alex Fernández.
 */

var io = require('socket.io');
var http = require('http');

var port = 1771;

var server = io.listen(port);

server.sockets.on('connection', function (socket)
{
	console.log('Accepted connection for %s from %s', socket.handshake.url, socket.handshake.address.address);
	socket.on('message', function(message)
	{
		console.log('Received: %s', JSON.stringify(message));
		server.sockets.emit(message);
	});
	socket.on('error', function(error)
	{
		console.error('Error: %s', error);
	});
	socket.on('disconnect', function()
	{
		console.log('Connection closed');
	});
});

