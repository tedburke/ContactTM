"use strict";

// Global identifiers for elements, etc.
const drawingCanvas = document.getElementById("drawingCanvas");
const spectrumCanvas = document.getElementById("spectrumCanvas");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");

var drawingCtx, spectrumCtx; // canvas contexts

window.onresize = function() {
    drawingCanvas.width = drawingCanvas.getBoundingClientRect().width;
    drawingCanvas.height = drawingCanvas.getBoundingClientRect().height;
    spectrumCanvas.width = spectrumCanvas.getBoundingClientRect().width;
    spectrumCanvas.height = spectrumCanvas.getBoundingClientRect().height;
    drawingCtx = drawingCanvas.getContext('2d', { alpha: false });
    spectrumCtx = drawingCanvas.getContext('2d', { alpha: false });
};

window.onresize();

//var N=1024, n;
//var buffer = [], binary = [], s = [];

var scanningState = 0;    // 1 is scanning, 0 is paused

// Connect buttons to event listeners
startButton.addEventListener("click", startScanning);
pauseButton.addEventListener("click", pauseScanning);
pauseButton.disabled = true;

// Error callback function for getUserMedia method
var errorCallback = function(error) {console.log("Video capture error: ", error.code);};

if (navigator.mediaDevices.getUserMedia)
{
    console.log("mediaDevices.getUserMedia() is supported.");
    
    let onSuccess = function(stream) {
        console.log("onSuccess function");
        //const mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        /*
        mediaRecorded.ondataavailable = function(e) {
            console.log("data");
        }
        */
    }

    let onError = function(err) {
        console.log("onError function");
    }

    navigator.mediaDevices.getUserMedia({audio:true}).then(onSuccess, onError);
}
else
{
    console.log("mediaDevices.getUserMedia() is not supported.");
}

function visualize(stream) {
    // Set up audio context, buffer, and analyser
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    const source = audioCtx.createMediaStreamSource(stream);
    const bufferLength = 2048;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = bufferLength;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    draw();

    function draw() {
        const w = spectrumCanvas.width;
        const h = spectrumCanvas.height;

        // Ask for this function to be called again at next
        // screen refresh
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);
        
        spectrumCtx.fillStyle = "rgb(100 100 100)";
        spectrumCtx.fillRect(0, 0, w, h);
        spectrumCtx.lineWidth = 1.0;
        spectrumCtx.strokeStyle = "rgb(0 0 0)";
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(0, dataArray[0]);
        for (let n = 0 ; n < w ; ++n) {
            spectrumCtx.lineTo(n, dataArray[n]);
        }
        spectrumCtx.stroke();
    }
}

// For cross-browser compatibility, select getUserMedia method for current browser
//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

window.setInterval(draw, 100);

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

function olddraw()
{
    /*
    vidctx.drawImage(vid,0,0);
    var idata = vidctx.getImageData(0,0,vidw,vidh); // get pixel data
    var data = idata.data;                          // extract data
    var x, y, m, left=0, right=0;
    */

    // Get contexts for both canvases
    let ctx = drawingCanvas.getContext('2d', { alpha: false });
    let W = ctx.canvas.width;
    let H = ctx.canvas.height;

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
    ctx.closePath();
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

    ctx = spectrumCanvas.getContext('2d', { alpha: false });
    W = ctx.canvas.width;
    H = ctx.canvas.height;

    // Draw spectrum graph
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 4.0;
    ctx.strokeRect(2*dx, 2*dx, W-4*dx, H-4*dx);
    
    // Check if current buffer matches code
    ctx.font="20px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    // Display status
    document.getElementById("status").innerHTML = scanningState ? 'Scanning' : 'Paused';
}

