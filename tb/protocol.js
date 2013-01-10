


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

var handler = {

	init: function() {
		socket.sendMsg('protocol-init', 
			{'protocolName':'TCMP', 'version':1000}
			)
	},
	handleMessage: function(obj){
		console.log(JSON.stringify(obj));
	}
}