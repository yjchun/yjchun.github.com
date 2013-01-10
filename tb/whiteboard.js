
var SERVER_PORT=12085;

//TODO: 
// https://github.com/imaya/CanvasTool.PngEncoder/blob/master/src/CanvasTool/pngencoder.js
// https://github.com/blueimp/JavaScript-Canvas-to-Blob
//http://stackoverflow.com/questions/4554252/typed-arrays-in-gecko-2-float32array-concatenation-and-expansion
//https://github.com/schteppe/js-bson 
// also https://github.com/muhmi/javascript-bson
function ClientSocket(serverURL)
{
	var self = this;
	self.socket = null;
	self.url = serverURL;

	self.init = function() {

		return self;
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
			//TODO: clear canvas
			$('#connect-button').hide();

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
			var code = event.code;
			var reason = event.reason;
			var wasClean = event.wasClean;
			// handle close event
			$('#connect-button').show();
			$('#connect-button').button('reset');
			bootbox.alert("<strong>Connection is closed.</strong>", function() {
			});
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
		$('#connect-button').button('reset');
		bootbox.alert("<strong>Error</strong> Failed to connect to server.", function() {
		});
	}
	self.init();
}


function Canvas(drawingCanvas) {
	var self = this;
	this.canvas = drawingCanvas;
	var context = null;

	this.init = function(){
		context = this.canvas.getContext('2d'),
		// Attach the mousedown, mousemove and mouseup event listeners.
		this.canvas.addEventListener('mousedown', ev_canvas, false);
		this.canvas.addEventListener('mousemove', ev_canvas, false);
		this.canvas.addEventListener('mouseup',   ev_canvas, false);
		return this;
	}
	function toolPencel() {
		var tool = this;
		this.started = false;
		// This is called when you start holding down the mouse button.
		// This starts the pencil drawing.
		this.mousedown = function (ev) {
			context.beginPath();
			context.moveTo(ev._x, ev._y);
			tool.started = true;
		};

		this.mousemove = function (ev) {
			if (tool.started) {
				context.lineTo(ev._x, ev._y);
				context.stroke();
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
	this.tool = toolPencel;
	function ev_canvas (ev) {
		if (ev.layerX || ev.layerX == 0) { // Firefox
				ev._x = ev.layerX;
				ev._y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
				ev._x = ev.offsetX;
				ev._y = ev.offsetY;
		}
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
		bootbox.prompt('Server address', function(result) {
			  if (result === null) {
			  } else {
			  	if(result.length == 0)
			  		result = 'localhost';
				socket = new ClientSocket('ws://'+result+':'+SERVER_PORT);
				socket.connectToServer();
				$('#connect-button').button('loading');
			  }
		})
	});

	$('#test-button').click(function(){
    		test1();
    	});

});

function test1()
{

}
