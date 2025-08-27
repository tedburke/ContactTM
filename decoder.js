"use strict";

// Global identifiers for elements, etc.
var drawingCanvas = document.getElementById("drawingCanvas");
var spectrumCanvas = document.getElementById("spectrumCanvas");
var startButton = document.getElementById("startButton");
var pauseButton = document.getElementById("pauseButton");

//var N=1024, n;
//var buffer = [], binary = [], s = [];

var scanningState = 0;    // 1 is scanning, 0 is paused

window.onload = function()
{
    console.log("Hello from window.onload function");

    // Connect buttons to callbacks
    startButton.onclick = startScanning;
    pauseButton.onclick = pauseScanning;
    pauseButton.disabled = true;

    // Error callback function for getUserMedia method
    var errorCallback = function(error) {console.log("Video capture error: ", error.code);};

    // For cross-browser compatibility, select getUserMedia method for current browser
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

    // Open video capture stream
    /*
    navigator.getUserMedia({video:{mandatory:{minWidth:vidw,maxWidth:vidw,minHeight:vidh,maxHeight:vidh}}}, function(stream)
        {
            //vid.src = window.URL.createObjectURL(stream);
            vid.srcObject=stream;
            vid.play();
        }, errorCallback);
    */

    window.setInterval(draw, 100);
}

function startScanning()
{
    console.log("startScanning function");
    pauseButton.disabled = false;
    startButton.disabled = true;
    scanningState = 1;
}

function pauseScanning()
{
    console.log("pauseScanning function");
    pauseButton.disabled = true;
    startButton.disabled = false;
    scanningState = 0;
}

function draw()
{
    /*
    vidctx.drawImage(vid,0,0);
    var idata = vidctx.getImageData(0,0,vidw,vidh); // get pixel data
    var data = idata.data;                          // extract data
    var x, y, m, left=0, right=0;
    */

    // Get contexts for both canvases
    let ctx = drawingCanvas.getContext("2d");
    let W = drawingCanvas.width;
    let H = drawingCanvas.height;
    console.log("drawingCanvas width and height: " + W + "," + H);

    let dx = 4, dy = 4;

    // Draw drawing
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx, H - dy);
    ctx.lineTo(W - dx, H - dy);
    ctx.lineTo(W - dx, dy);
    ctx.lineTo(dx, dy);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#BFBFBF";
    ctx.lineWidth = 1.0;
    ctx.moveTo(0, 230);
    ctx.lineTo(W, 230);
    ctx.stroke();

    ctx.font="20px Arial";
    ctx.fillStyle = "#BFBFBF";
    ctx.textAlign = "center";
    var m;
    for (m = 0 ; m <= W ; m += 40)
    {
        ctx.fillText(m, m, 120);
    }
    ctx.stroke();

    ctx = spectrumCanvas.getContext("2d");
    W = spectrumCanvas.width;
    H = spectrumCanvas.height;
    console.log("spectrumCanvas width and height: " + W + "," + H);

    // Draw spectrum graph
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx, H - dy);
    ctx.lineTo(W - dx, H - dy);
    ctx.lineTo(W - dx, dy);
    ctx.lineTo(dx, dy);
    ctx.stroke();

    // Draw grid lines on graph
    /*
    graphctx.beginPath();
    graphctx.strokeStyle = "#3F3F3F";
    graphctx.lineWidth = 1.0;
    graphctx.moveTo(ox, oy);
    graphctx.lineTo(ox+150*dx, oy);
    for (m=5 ; m<150 ; m+=5)
    {
        graphctx.moveTo(ox+m*dx, 0);
        graphctx.lineTo(ox+m*dx, 220);
    }
    graphctx.stroke();

    graphctx.font="20px Arial";
    graphctx.fillStyle = "#BFBFBF";
    graphctx.textAlign = "center";
    for (m=0 ; m<=15 ; ++m)
    {
        graphctx.fillText(m, ox + m*10*dx, 240);
    }

    // Plot samples
    graphctx.font="20px Arial";
    graphctx.fillStyle = "#00FFFF";
    graphctx.textAlign = "right";
    graphctx.fillText("0", ox-5, oy+7);
    graphctx.beginPath();
    graphctx.strokeStyle = "#00FFFF";
    graphctx.lineWidth = 2.0;
    graphctx.moveTo(ox, oy - dy * buffer[(n+1)%N]);
    for (m=1 ; m<N ; ++m)
    {
        graphctx.lineTo(ox + m*dx, oy - dy * buffer[(n+1+m)%N]);
    }
    graphctx.stroke();

    // Draw bounding rectangle around graph
    graphctx.strokeStyle = "#BFBFBF";
    graphctx.lineWidth = 2.0;
    graphctx.strokeRect(ox, 1, (N-1)*dx, 218);

    // Check if current buffer matches code
    graphctx.font="20px Arial";
    graphctx.fillStyle = "#000000";
    graphctx.textAlign = "center";

    */

    // Display status
    if (scanningState == 0)
    {
        document.getElementById("status").innerHTML = "Paused";
    }
    else
    {
        document.getElementById("status").innerHTML = "Scanning";
    }           
}

