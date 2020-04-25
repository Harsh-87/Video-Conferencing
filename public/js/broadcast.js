const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
  peerConnections[id].ontrack = event => {
    document.getElementById(id).srcObject=event.streams[0];
  };
});

socket.on("watcher", id => {
  if(!(id in peerConnections)){
    var remote=document.createElement('video');
    remote.autoplay=true;
    remote.setAttribute('id',id);
    remote.setAttribute('style',"width:40%;height:40%;padding:2%;");
    document.querySelector(".videos").append(remote);
    document.querySelector(".videos")
  }

  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = videoElement.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
  
  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  document.getElementById(id).remove();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

const videoElement = document.getElementById('localVideo');
const callButton = document.getElementById('callButton');
const endButton = document.getElementById('endButton');
endButton.disabled=true;
callButton.addEventListener('click',getStream);
async function getStream() {
  console.log('Requesting local stream');
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then(stream=>{
      window.stream = stream;
      videoElement.srcObject = stream;
      socket.emit("broadcaster");
      callButton.disabled = true;
      endButton.disabled=false;
    })
    .catch(e=>{
      alert("Media Permissions denied!!");
    });
}

endButton.addEventListener('click',endcall);
async function endcall(){
  callButton.disabled = true;
  endButton.disabled=false;
  window.location="/";
}
function handleError(error) {
  console.error("Error: ", error);
}