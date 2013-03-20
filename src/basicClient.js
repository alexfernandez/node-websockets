'use strict';
/**
 * Basic client for websockets.
 * (C) 2013 Alex Fernández.
 */

var WebSocketClient = require('websocket').client;

var server = 'localhost:1771';

start();

function start()
{
	var client = new WebSocketClient();
	client.on('connectFailed', function(error)
	{
		console.error('Connect Error: ' + error.toString());
	});
	client.on('connect', connect);
	var url = 'ws://' + server + '/hi/world';
	client.connect(url, []);
	console.log('WebSocket client connected to ' + url);
}

function connect(connection)
{
	connection.on('error', function(error)
	{
		console.error("Connection error: " + error.toString());
	});
	connection.on('close', function()
	{
		console.log('Connection closed');
	});
}

