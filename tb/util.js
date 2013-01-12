function swap32(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
}

function swap321(val) {
	return val;
}

function setCanvas(){

   var canvasNode = document.getElementById('drawingCanvas');

   var pw = canvasNode.parentNode.clientWidth;
   var ph = canvasNode.parentNode.clientHeight;

   // canvasNode.height = pw * 0.8 * (canvasNode.height/canvasNode.width);  
   // canvasNode.height = ph*0.8
   // canvasNode.width = pw * 0.8;
   // canvasNode.style.top = (ph-canvasNode.height)/2 + "px";
   // canvasNode.style.left = (pw-canvasNode.width)/2 + "px";

//    canvasNode.style.position = "fixed";

}

window.onload = window.onresize = setCanvas;