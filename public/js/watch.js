let peerConnection;
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const socket = io.connect(window.location.origin);
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById("remoteVideo");
const endButton = document.getElementById('endButton');
endButton.addEventListener('click',endcall);
async function endcall(){
  endButton.disabled=false;
  window.location="/";
}
const showme = document.getElementById('showme');

showme.addEventListener('click',getStream);
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
      localVideo.srcObject = stream;
      showme.disabled=true;
      hideme.disabled=false;
      socket.emit("watcher");
    })
    .catch(e=>{
      alert("Media Permissions denied!!");
    });
}

const hideme = document.getElementById('hideme');
hideme.addEventListener('click',hideStream);
async function hideStream() {
  console.log('Hiding local stream');
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  showme.disabled=false;
  hideme.disabled=true;
}

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  if(localVideo.srcObject!=null){
      let stream = localVideo.srcObject;
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  }
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  getStream();
  const roomName=localStorage.getItem("roomname");
  const userName=localStorage.getItem("username");
  socket.emit("newUser",roomName,userName);
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

socket.on("disconnectPeer", () => {
  peerConnection.close();
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};
