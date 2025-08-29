Some useful articles / guides / resources:

- [Useful article on HTML5 audio/video capture](https://web.dev/articles/getusermedia-intro)
- [Wikipedia article on the Goertzel algorithm](https://en.wikipedia.org/wiki/Goertzel_algorithm)
- [Good article on "Using the MediaStream Recording API"](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API)
- [AudioContext documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
- [AnalyserNode documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)

Comments:

- As I currently understand it, I am using two audio APIs
  1. Media Capture and Streams API (aka Media "Streams API" or "MediaStream API"). Specifically, I'm using the MediaDevices and MediaStream interfaces of the API. (e.g. navigator.mediaDevices.getUserMedia() returns a MediaStream on success).
  2. Web Audio API (e.g. AudioContext, MediaStreamAudioSourceNode, AnalyserNode)

