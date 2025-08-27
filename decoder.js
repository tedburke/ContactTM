"use strict";

// Global identifiers for elements, etc.
var drawingCanvas = document.getElementById("drawingCanvas");
var spectrumCanvas = document.getElementById("spectrumCanvas");
var startButton = document.getElementById("startButton");
var pauseButton = document.getElementById("pauseButton");
var drawingContext, spectrumContext;

/*
var drawW = drawingCanvas.width;
var drawH = drawingCanvasHeight;
var specW = spectrumCanvas.width;
var specH = spectrumCanvas.height;
*/

var N=1024, n;
var buffer = [], binary = [], s = [];

var requestpauseflag = 0; // set to 1 when pause button is pressed
var scanningstate;        // 1 is scanning, 2 is paused
var validationtime = 0;
resetScanning();

window.onload = function()
{
    // Get contexts for both canvases
    drawingContext = drawingCanvas.getContext("2d");
    spectrumContext = spectrumCanvas.getContext("2d");

    // Error callback function for getUserMedia method
    var errorCallback = function(error) {console.log("Video capture error: ", error.code);};

    // For cross-browser compatibility, select getUserMedia method for current browser
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

    // Open video capture stream
    navigator.getUserMedia({video:{mandatory:{minWidth:vidw,maxWidth:vidw,minHeight:vidh,maxHeight:vidh}}}, function(stream)
        {
            //vid.src = window.URL.createObjectURL(stream);
            vid.srcObject=stream;
            vid.play();
        }, errorCallback);

    window.setInterval(draw, 100);
}

function resetScanning()
{
    n = N;
    while (n--) buffer[n] = binary[n] = s[n] = 0;

    validationtime = 0;

    document.getElementById("pausebutton").disabled = false;
    document.getElementById("startbutton").disabled = true;
    document.getElementById("resetbutton").disabled = false;

    scanningstate = 1;
}

function startScanning()
{
    document.getElementById("pausebutton").disabled = false;
    document.getElementById("startbutton").disabled = true;
    document.getElementById("resetbutton").disabled = false;

    scanningstate = 1;
}

function requestPause()
{
    requestpauseflag = 1;
}

function pauseScanning()
{
    document.getElementById("pausebutton").disabled = true;
    document.getElementById("startbutton").disabled = false;
    document.getElementById("resetbutton").disabled = false;

    requestpauseflag = 0;
    scanningstate = 2;
}

function draw()
{
    vidctx.drawImage(vid,0,0);
    var idata = vidctx.getImageData(0,0,vidw,vidh); // get pixel data
    var data = idata.data;                          // extract data
    var x, y, m, left=0, right=0;

    // Calculate current left/right balanace
    for (y=-boxr ; y < boxr; y++)
    {
        for (x=-boxr ; x < boxr; x++)
        {
            m = 4*(vidw*(y1+y)+(x1+x));
            left  += data[m] + data[m+1] + data[m+2];
            m = 4*(vidw*(y2+y)+(x2+x));
            right += data[m] + data[m+1] + data[m+2];
        }
    }

    if (scanningstate == 1)
    {
        // Log data point
        n = ++n % N;
        buffer[n] = (right-left)/(4.0*boxr*boxr*3.0*255.0);
        binary[n] = buffer[n] > 0;
    }

    // Draw graph
    var ox = 100, oy = 80, dx = 4, dy = 80.0;
    graphctx.clearRect(0, 0, graphw, graphh);

    // Draw grid lines on graph
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

    // Plot binary signal
    graphctx.font="20px Arial";
    graphctx.fillStyle = "#00FF00";
    graphctx.textAlign = "right";
    graphctx.fillText("1", ox-5, 160+7);
    graphctx.fillText("0", ox-5, 200+7);
    graphctx.beginPath();
    graphctx.strokeStyle = "#00FF00";
    graphctx.lineWidth = 2.0;
    graphctx.moveTo(ox, 200 - 40 * binary[(n+1)%N]);
    for (m=1 ; m<N ; ++m)
    {
        graphctx.lineTo(ox + m*dx, 200 - 40 * binary[(n+m)%N]);
        graphctx.lineTo(ox + m*dx, 200 - 40 * binary[(n+1+m)%N]);
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

    // Create a chronological buffer
    var k;
    for (k=0 ; k<N ; ++k) s[k] = binary[(n+1+k)%N];

    // Find leading edge of byte 1 start bit
    var state = 0, bit, byte1 = 0, byte2 = 0;
    k = 0;
    while (state == 0)
    {
        k++;
        if (k >= N) state = -1;
        else if (s[k-1] == 0 && s[k] == 1)
        {
            firstedge = k;
            state = 1;
        }
    }

    // Check start bit of byte 1
    while (state == 1)
    {
        k = k + 2;
        if (k >= N) state = -1;
        else if (s[k] == 1) state = 2;
        else state = -1;
    }

    // Parse 8 data bits of byte 1
    byte1 = 0;
    while (state >= 2 && state <= 9)
    {
        k = k + 5;
        if (k >= N) state = -1;
        else
        {
            bit = state - 2;
            byte1 += s[k]*Math.pow(2,bit);
            state++;
        }
    }

    // Check stop bit of byte 1
    while (state == 10)
    {
        k = k + 5;
        if (k >= N) state = -1;
        else if (s[k] == 0) state = 11;
        else state = -1;
    }

    // Find leading edge of byte 2 start bit
    while (state == 11)
    {
        k++;
        if (k >= N) state = -1;
        else if (s[k-1] == 0 && s[k] == 1) state = 12;
    }

    // Check start bit of byte 2
    while (state == 12)
    {
        k = k + 2;
        if (k >= N) state = -1;
        else if (s[k] == 1) state = 13;
        else state = -1;
    }

    // Parse 8 data bits of byte 2
    byte2 = 0;
    while (state >= 13 && state <= 20)
    {
        k = k + 5;
        if (k >= N) state = -1;
        else
        {
            bit = state - 13;
            byte2 += s[k]*Math.pow(2,bit);
            state++;
        }
    }

    // Check stop bit of byte 2
    while (state == 21)
    {
        k = k + 5;
        if (k >= N) state = -1;
        else if (s[k] == 0) state = 22;
        else state = -1;
    }

    while (state == 22)
    {
        // If sum of bytes is 255 and byte1 is lower value, then pattern is matched.
        k = k + 5; // Allow full stop bit to appear on graph
        if (k >= N) state = -1;
        else if (byte1 + byte2 != 255) state = -1;
        else if (byte1 > byte2) state = -1;
        else if (firstedge%5 > 0) state = -1;
        else patternMatch();
    }

    // Check if a pause is pending. If so stop when leading edge
    // coincides with a grid line.
    if (requestpauseflag == 1 && firstedge%5 == 0)
    {
        pauseScanning();
    }

    // Display status
    if (scanningstate == 2)
    {
        document.getElementById("status").innerHTML = "Paused";
    }
    else
    {
        document.getElementById("status").innerHTML = "Scanning";
    }           

    // Display 1 or 0 on video sampling boxes
    vidctx.fillStyle = "#FF0000";
    vidctx.font="40px Arial";
    if (buffer[n] < 0) vidctx.fillText("0", x1-boxr+8, y1-boxr-5);
    else vidctx.fillText("1", x2-boxr+8, y2-boxr-5);

    // Display video sampling boxes
    vidctx.strokeStyle = "#FF0000";
    vidctx.lineWidth = 2.0;
    vidctx.strokeRect(x1-boxr,y1-boxr,boxr+boxr,boxr+boxr);
    vidctx.strokeRect(x2-boxr,y2-boxr,boxr+boxr,boxr+boxr);
}
