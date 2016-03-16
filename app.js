// Shim the prefixes
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var localVideo;
var remoteVideo;
var cameraStream;
var peerConnection;
// Using public STUN servers
var config = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

function ready() {
  
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');
  
  serverConnection = new WebSocket('ws://127.0.0.1:8080');
  serverConnection.onmessage = gotMessageFromServer;

  var mediaConstraints = {
    video: true,
    audio: true
  };
  
  if (navigator.mediaDevices.getUserMedia) {
    // New standard, used by mozilla
    console.log('New code');
    var promise = navigator.mediaDevices.getUserMedia(mediaConstraints);

    promise.then(function(stream) {
      cameraStream = stream;
      localVideo.src = window.URL.createObjectURL(stream);
      localVideo.play();
    });

    promise.catch(function(error) {
      console.log(error.name);
    });
  } else if(navigator.getUserMedia) {
    // Chrome uses this
    console.log('Old code');
    // getUserMediaSuccess and getUserMediaError are callbacks
    navigator.getUserMedia(mediaConstraints, getUserMediaSuccess, getUserMediaError);
  } else {
    alert('getUserMedia API unsupported');
  }
}

function getUserMediaSuccess(stream) {
  cameraStream = stream;
  localVideo.src = window.URL.createObjectURL(stream);
  localVideo.play();
}

function getUserMediaError(error) {
  console.log(error);
}

function call() {
    console.log('Making the call');
  
  // First create a RTCPeerConnection object (primary class used in WebRTC connection)
  // Once created, it will start gathering ICE candidates
  peerConnection = new RTCPeerConnection(config);
  // An ICE candidate is essentially a description of how to connect to a client 
  //  (This calls a callbacks, as candidates can take a long time to arrive)
  peerConnection.onicecandidate = gotIceCandidate;
  // Called whenever we get a stream from the other client
  //  (i.e. indicates connection success)
  peerConnection.onaddstream = gotRemoteStream;
  peerConnection.addStream(cameraStream);

  // Create an offer which tells the other client how to interact with us once the connection is established
  //  (These are also both callbacks, receives SDP)
  peerConnection.createOffer(gotDescription, createOfferError);
}

function answer() {
  console.log('Answering the call');
  
  // Almost the same as call()
  peerConnection = new RTCPeerConnection(config);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.onaddstream = gotRemoteStream;
  peerConnection.addStream(cameraStream);
}

function gotRemoteStream(event) {
  console.log('got remote stream');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function createOfferError(error) {
  console.log(error);
}

function gotDescription(description) {
  console.log('got description');
  peerConnection.setLocalDescription(description, function () {
    serverConnection.send(JSON.stringify({sdp: description}));
  }, function() {console.log('set description error')});
}

function gotIceCandidate(event) {
  if(event.candidate != null) {
    serverConnection.send(JSON.stringify({ice: event.candidate}));
  }
}

function gotMessageFromServer(msg) {
  // If we haven't got a perrConnection yet, we must be the receiving side
  if(!peerConnection) answer();
  
  // Need to determine if the message is a description or an ICE candidate
  var signal = JSON.parse(msg.data);
  if (signal.sdp) {
    console.log('Got SDP');
    // If it is a description, need to set it as the remote description on the RTCPeerConnection object
    // (and thereby create an answer)
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
      peerConnection.createAnswer(gotDescription, createAnswerError);
    });
  } else if (signal.ice) {
    console.log('Got ICE');
    // If it is an ICE candidate, simply need to add it to the RTCPeerConnection object
    // If we have an answer already but aren't connected, the browser will keep trying candidates
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
  }
}

function createAnswerError(error) {
  console.log(error);
}