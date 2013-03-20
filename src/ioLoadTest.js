'use strict';
/**
 * Load test client for websockets.
 * (C) 2013 Alex Fernández.
 */

var io = require('socket.io-client');

var server = 'localhost:1771';
var concurrency = 1;
var requestsPerSecond = 1;
var secondsMeasured = 5;

var latency = new function()
{
	var self = this;
	var requests = {};
	var start = Date.now();
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
			var elapsed = Date.now() - start;
			var rps = Math.round(1000 * index / elapsed);
			console.log('Requests/second: %s, mean latency: %s ms', rps, mean);
			index = 0;
			start = Date.now();
		}
	}
}

/**
 * One client that connects to the echo server.
 */
var echoClient = function(id)
{
	var self = this;
	var counter = 0;

	self.start = function(id)
	{
		var url = 'ws://' + server + '/echo';
		var socket = io.connect(url);
		socket.on('connect', connect);
		console.log('WebSocket client connected to ' + url);
	}

	function connect()
	{
		socket.on('error', function(error)
		{
			console.error("Connection error: " + error.toString());
		});
		socket.on('disconnect', function()
		{
			console.log('Connection closed');
		});
		socket.on('message', function(message)
		{
			console.log('Received: %s', message.utf8Data);
			latency.end(message.utf8Data);
		});
		setInterval(send, Math.round(1000 / requestsPerSecond));
	}

	function send()
	{
		var requestId = id + '-' + counter;
		latency.start(requestId);
		socket.send(requestid);
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

