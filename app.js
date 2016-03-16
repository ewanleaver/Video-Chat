// Shim the prefixes
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var localVideo;
var remoteVideo;
var peerConnection;
// Using public STUN servers
var config = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

function ready() {
  
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');
  
  serverConnection = // To implement

  var mediaConstraints = {
    video: true,
    audio: true
  };
  
  if(navigator.getUserMedia) {
    // getUserMediaSuccess and getUserMediaError are callbacks
    navigator.getUserMedia(mediaConstraints, getUserMediaSuccess, getUserMediaError);
  } else {
    alert('getUserMedia API unsupported');
  }
  
  function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
  }
  
  function getUserMediaError(error) {
    console.log(error);
  }
}