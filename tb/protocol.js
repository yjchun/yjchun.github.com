


var pdecoder = {
	self : this,

	// Decode LEN:BSON_DATA packet  and call handleFunc() with the deserialized json object
	// 
	decode : function(data, handleFunc){
		var index = 0;
		while(index < data.byteLength)
		{
			// read packet length
			var dv = new Int32Array(data, 0, 1);
			var length = swap32(dv[0]);
			index+=4;

			if(index+length > data.byteLength)
			{
				alert('TODO: More data required');
				return;
			}
			// deserialize
			var barray = new Uint8Array(data, index);
			var jobj = BSON.deserialize(barray);
			if(!jobj)
			{
				alert('error parsing BSON! ');
				return;
			}
			handleFunc(jobj);

			index += dv;
		}
	},
	init: function() {

	}
}

function pencode(cmd, arg)
{
	var args = {};
	if(arg)
		args = arg;
	var msg = {'cmd': cmd, 'args':args};
	var buffer = null;
	// Calculate the size of the object
	var size = BSON.calculateObjectSize(msg);
	buffer = new ArrayBuffer(size+4);

	// Set size
	var dv = new Int32Array(buffer, 0, 1);
	dv[0] = swap32(size);
  
	// If asBuffer is false use typed arrays
	var barray = new Uint8Array(buffer, 4);
	BSON.serializeWithBufferAndIndex(msg, false, barray, 0, null);

	return buffer;
}

var handler = new function(){
	var self = this;
	var connectionId;

	this.init = function() {
		socket.sendMsg('protocol-init', 
			{'protocolName':'TCMP', 'version':1000}
			)
	};
	this.handleMessage= function(obj){
		console.log(JSON.stringify(obj));
		onMessage(obj.cmd, obj.args);
	};
	function onMessage(cmd, args) {
		if(cmd == 'protocol-init'){
		}
		else if(cmd == 'ping-request')  {
			socket.sendMsg('ping-response');
		}
		else if(cmd == 'connection-init') {
			self.connectionId = args.connectionId;
			socket.sendMsg('student-list-request');
		}
		else if(cmd=='student-list') {
			if(args.studentList.length > 0)
			{
				socket.sendMsg('student-login', {'studentCode': args.studentList[0].studentCode});
			}
		}
		else if(cmd=='request-thumbnail-image') {

		}
		else if(cmd=='whiteboard-stroke-add') {
			drawStroke(args.stroke);
		}
		else if(cmd=='whiteboard-snapshot') {
			
		}
		else if(cmd=='whiteboard-set-attr') {
			args.strokes.map(drawStroke);
		}
		else if(cmd=='whiteboard-create') {
			canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
		}
		else if(cmd=='whiteboard-destroy') {
			canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
		}
		else
		{
			console.log('unknown command: '+cmd);
		}
	}
	function drawStroke(stroke)
	{
		if(stroke.points.length == 0)
			return;
		canvas.context.beginPath();
		var pPoint = stroke.points[0];
		var point = pPoint;
		canvas.context.moveTo(stroke.points[0].x, stroke.points[0].y);
		for(var i=1;i<stroke.points.length;i++)
		{
			var point = stroke.points[i];
			var midPoint={};
			midPoint.x = (point.x+pPoint.x)/2.0;
			midPoint.y = (point.y+pPoint.y)/2.0;
			canvas.context.quadraticCurveTo(pPoint.x, pPoint.y, point.x, point.y);
			pPoint = point;
		}
		canvas.context.moveTo(point.x, point.y);
		canvas.context.stroke();
	}
}