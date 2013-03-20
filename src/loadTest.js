'use strict';
/**
 * Load test client for websockets.
 * (C) 2013 Alex Fernández.
 */

var WebSocketClient = require('websocket').client;

var server = 'localhost:1771';
var concurrency = 3000;
var requestsPerSecond = 1;
var secondsMeasured = 5;

var latency = new function()
{
	var self = this;
	var requests = {};
	var index = 0;
	var measurements = [];
	var total = 0;
	var max = concurrency * requestsPerSecond * secondsMeasured;

	self.start = function(requestId)
	{
		requests[requestId] = Date.now();
	}

	self.end = function(requestId)
	{
		if (!(requestId in requests))
		{
			console.error('Invalid request id %s', requestId);
			return;
		}
		add(Date.now() - requests[requestId]);
	}

	function add(value)
	{
		measurements.push(value);
		total += value;
		if (measurements.length > max)
		{
			var removed = measurements.shift();
			total -= removed;
		}
		index++;
		if (index > max)
		{
			var mean = total / measurements.length;
			console.log('Mean latency: %s ms', mean);
			index = 0;
		}
	}
}

/**
 * One client that connects to the echo server.
 */
var echoClient = function(id)
{
	var self = this;
	var connection;
	var counter = 0;

	self.start = function(id)
	{
		var client = new WebSocketClient();
		client.on('connectFailed', function(error)
		{
			console.error('Connect Error: ' + error.toString());
		});
		client.on('connect', connect);
		var url = 'ws://' + server + '/echo';
		client.connect(url, []);
		console.log('WebSocket client connected to ' + url);
	}

	function connect(serverConnection)
	{
		connection = serverConnection;
		connection.on('error', function(error)
		{
			console.error("Connection error: " + error.toString());
		});
		connection.on('close', function()
		{
			console.log('Connection closed');
		});
		connection.on('message', function(message)
		{
			// console.log('Received: %s', message.utf8Data);
			latency.end(message.utf8Data);
		});
		setInterval(send, Math.round(1000 / requestsPerSecond));
	}

	function send()
	{
		var requestId = id + '-' + counter;
		latency.start(requestId);
		connection.sendUTF(requestId);
		counter++;
	}
}

/**
 * Start clients.
 */
for (var index = 0; index < concurrency; index++)
{
	var client = new echoClient(index);
	// start each client 100 ms after the last
	setTimeout(client.start, (index * 100) % 1000);
}

