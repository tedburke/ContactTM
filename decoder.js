"use strict";

// Global identifiers for elements, etc.
const drawingCanvas = document.getElementById("drawingCanvas");
const spectrumCanvas = document.getElementById("spectrumCanvas");

let drawingCtx;  // drawing canvas context
let spectrumCtx; // spectrum canvas context
let audioCtx;    // audio context

function debugPrint(str) {
    console.log(str);
    document.getElementById("status").innerHTML += '<br>' + str;
}

window.onresize = function() {
    drawingCanvas.width = drawingCanvas.getBoundingClientRect().width;
    drawingCanvas.height = drawingCanvas.getBoundingClientRect().height;
    spectrumCanvas.width = spectrumCanvas.getBoundingClientRect().width;
    spectrumCanvas.height = spectrumCanvas.getBoundingClientRect().height;
    drawingCtx = drawingCanvas.getContext('2d', { alpha: false });
    spectrumCtx = spectrumCanvas.getContext('2d', { alpha: false });
};

window.onresize();

if (navigator.mediaDevices.getUserMedia)
{
    debugPrint("mediaDevices.getUserMedia() is supported.");
    
    let onSuccess = function(stream) {
        debugPrint("onSuccess function");

        processAudio(stream);
    }

    let onError = function(err) {
        debugPrint("onError function:" + err.name);
    }

    navigator.mediaDevices.getUserMedia({audio:true}).then(onSuccess, onError);
}
else
{
    debugPrint("mediaDevices.getUserMedia() is not supported.");
}

function processAudio(stream) {
    // Set up audio context, buffer, and analyser
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    const source = audioCtx.createMediaStreamSource(stream);
    const N = 2048;
    //const data = new Uint8Array(N);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = N;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);

    const timeDomainData = new Float32Array(analyser.fftSize);
    const freqDomainData = new Float32Array(analyser.frequencyBinCount);

    // Call the draw function once and it will submit a request
    // to be called again at each screen refresh 
    draw();

    function draw() {
        analyser.getFloatTimeDomainData(timeDomainData);
        analyser.getFloatFrequencyData(freqDomainData);
        
        //analyser.getByteTimeDomainData(data);
        //analyser.getByteFrequencyData(data);
        
        let w = drawingCanvas.width;
        let h = drawingCanvas.height;

        drawingCtx.fillStyle = "rgb(255 255 255)";
        drawingCtx.fillRect(0, 0, w, h);
        drawingCtx.lineWidth = 2.0;
        drawingCtx.strokeStyle = "rgb(0 0 0)";
        drawingCtx.beginPath();
        drawingCtx.moveTo(0, timeDomainData[0]);
        for (let n = 0 ; n < w ; ++n) {
            drawingCtx.lineTo(n, (1 - timeDomainData[n]) * h/2);
        }
        drawingCtx.stroke();
        
        w = spectrumCanvas.width;
        h = spectrumCanvas.height;

        spectrumCtx.fillStyle = "rgb(255 255 255)";
        spectrumCtx.fillRect(0, 0, w, h);
        spectrumCtx.lineWidth = 1.0;
        spectrumCtx.strokeStyle = "rgb(0 0 0)";
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(0, freqDomainData[0]);
        let bins = analyser.frequencyBinCount / 4; // only plot one quarter of the bins
        for (let n = 0 ; n < bins ; ++n) {
            spectrumCtx.lineTo(n * w / bins, h - (140 + freqDomainData[n]));
        }
        spectrumCtx.stroke();
        
        // Ask for this function to be called again at next
        // screen refresh
        requestAnimationFrame(draw);
    }
}

// For cross-browser compatibility, select getUserMedia method for current browser
//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// Disable this for now, because the visualize function creates a draw
// function that continuously requests that it be re-called, using
// requestAnimationFrame(draw).
//window.setInterval(draw, 100);

// This is currently not being used
function olddraw()
{
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
    //document.getElementById("status").innerHTML = scanningState ? 'Scanning' : 'Paused';
}

