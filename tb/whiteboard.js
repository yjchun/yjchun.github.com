
var SERVER_PORT=12085;

//TODO: 
// https://github.com/imaya/CanvasTool.PngEncoder/blob/master/src/CanvasTool/pngencoder.js
// https://github.com/blueimp/JavaScript-Canvas-to-Blob
function ClientSocket(serverURL)
{
	var self = this;
	self.socket = null;
	self.url = serverURL;
	self.connected = false;

	self.init = function() {

		return self;
	}
	self.disconnect = function() {
		self.socket.close();
	}
	self.sendMsg = function(cmd, args) {
		console.log('Send: '+JSON.stringify({'cmd': cmd, 'args':args}));

		var encodedMsg = pencode(cmd, args);
		if(encodedMsg)
		{
			self.socket.send(encodedMsg);
		}
	}

	self.connectToServer = function() {
		console.log('Connecting to '+self.url+'...');
		self.socket = new WebSocket(self.url);
		
		self.socket.binaryType = "arraybuffer";
		
		self.socket.onopen = function(event) {
			console.log("connected!");
			self.connected = true;
			//TODO: clear canvas
			$('#connect-button').button('reset');
			$('#connect-button').html('Logout');

			self.socket.send('TCMP');

			// send...
			pdecoder.init();
			handler.init();
		};
		
		self.socket.onmessage = function(event) {
			var data = event.data;
			if(typeof data !== "string")
			{
				pdecoder.decode(data, handler.handleMessage);
			}
			else
			{
				console.log('Received string!');
			}
		};
		
		self.socket.onclose = function(event) {
			console.log('Connection closed');
			// handle close event
			$('#connect-button').button('reset');
			if(self.connected)
			{
				self.connected = false;
				bootbox.alert("<strong>Connection is closed.</strong>", function() {
				});
			}
		};
		
		self.socket.onerror = function(event) {
			console.log('WebSocket Error ' + event);
			failedToConnect();
		};
		if(self.socket.readyState == 3)
		{
			console.log("WebSocket couldn't connect to server.");
			failedToConnect();
		}
	}
	function failedToConnect()
	{
		self.connected = false;
		$('#connect-button').button('reset');
		bootbox.alert("<strong>Error</strong> Failed to connect to server.", function() {
		});
	}
	self.init();
}


function Canvas(drawingCanvas) {
	var self = this;
	this.canvas = drawingCanvas;
	this.context = null;

	this.init = function(){
		this.context = this.canvas.getContext('2d'),
		// Attach the mousedown, mousemove and mouseup event listeners.
		this.canvas.addEventListener('mousedown', ev_canvas, false);
		this.canvas.addEventListener('mousemove', ev_canvas, false);
		this.canvas.addEventListener('mouseup',   ev_canvas, false);
		return this;
	}
	this.toolPencil = new function() {
		var tool = this;
		this.started = false;
		// This is called when you start holding down the mouse button.
		// This starts the pencil drawing.
		this.mousedown = function (ev) {
			self.context.beginPath();
			self.context.moveTo(ev._x, ev._y);
			tool.started = true;
		};

		this.mousemove = function (ev) {
			if (tool.started) {
				self.context.lineTo(ev._x, ev._y);
				self.context.stroke();
			}
		}

		// This is called when you release the mouse button.
		this.mouseup = function (ev) {
			if (tool.started) {
				tool.mousemove(ev);
				tool.started = false;
			}
		}
	}
	this.tool = this.toolPencil;
	function ev_canvas (ev) {
		ev._x = ev.pageX-self.canvas.offsetLeft;
		ev._y = ev.pageY-self.canvas.offsetTop;
		var func = self.tool[ev.type];
		if (func) {
				func(ev);
		}
	}
}

var canvas = {}
var socket = {}

$(function(){
	canvas = new Canvas($("#drawingCanvas")[0]).init();

	$(document).on("click", "#connect-button", function(e) {
		if(socket.connected)
	  	{
	  		socket.disconnect();
	  	}
	  	else
	  	{
			var serverAddr = localStorage.serverAddress || '';
			bootbox.prompt('Server address', 'Cancel', 'OK', function(result) {
				if (result === null) {
				} else {
					localStorage.serverAddress = result;
					if(result.length == 0)
						result = 'localhost';
					socket = new ClientSocket('ws://'+result+':'+SERVER_PORT);
					socket.connectToServer();
					$('#connect-button').button('loading');
				}
			}, serverAddr);
	  	}
	});

	$('#test-button').click(function(){
    		test1();
    	});

});

function test1()
{

}
