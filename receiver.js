let rtc = {
  clients: [],
  remoteStreams: [],
};

// Options for joining a channel
let option = {
  appID: "",
  channels: ["test00", "test01", "test02", "test03"],
  uid: null,
  token: null,
}

window.onload = () => {
  for (let i = 0;i < 4; i++) {
    let client = AgoraRTC.createClient({mode: "rtc", codec: "h264"});

    rtc.clients.push(client);

    client.on("stream-added", function (evt) {
      let remoteStream = evt.stream;
      let id = remoteStream.getId();
      client.subscribe(remoteStream, function (err) {
        console.log("stream subscribe failed", err);
      });
      console.log('stream-added remote-uid: ', id);
    });

    client.on("stream-subscribed", function (evt) {
      let remoteStream = evt.stream;
      let id = remoteStream.getId();
      let domId = "client_" + i + "_stream_" + id;
      if (rtc.remoteStreams.indexOf(id) === -1) {
        rtc.remoteStreams.push(id);
        addView(domId);
      }
      remoteStream.play(domId + "_player");
      console.log('stream-subscribed remote-uid: ', id);
    });
    client.on("stream-removed", function (evt) {
      let remoteStream = evt.stream;
      let id = remoteStream.getId();
      let domId = "client_" + i + "_stream_" + id;
      // Stop playing the remote stream.
      remoteStream.stop(domId);
      // Remove the view of the remote stream. 
      removeView(domId);
      rtc.remoteStreams.splice(rtc.remoteStreams.indexOf(id), 1);
      console.log('stream-removed remote-uid: ', id);
    });
    client.on("peer-leave", function(evt) {
      var uid = evt.uid;
      var reason = evt.reason;
      let domId = "client_" + i + "_stream_" + uid;
      removeView(domId);
      rtc.remoteStreams.splice(rtc.remoteStreams.indexOf(uid), 1);
      console.log("remote user left ", uid, "reason: ", reason);
    });
  }

  document.getElementById("start-btn").onclick = () => {
    initPull();
  }
  document.getElementById("stop-btn").onclick = () => {
    stopPull();
  }
}

function getParams() {
  option.appID = document.getElementById("appid-text").value;
  option.token = document.getElementById("token-text").value;
}

function initPull() {
  getParams();
  rtc.clients.forEach((client, index) => {
    client.init(option.appID, function () {
      console.log("init success, ready to join channel " + option.channels[index]);
      client.join(option.token || null, option.channels[index]);
    }, (err) => {
      console.error(err);
    });
  });
}

function stopPull() {
  rtc.clients.forEach((client) => {
    client.leave();
  });
  rtc.remoteStreams = [];
  document.getElementById("container").innerHTML = "";
}

function addView(domId) {
  let newView = document.createElement("div");
  let title = document.createElement("p");
  let player = document.createElement("div");
  player.id = domId + "_player";
  newView.appendChild(title);
  newView.appendChild(player);
  title.innerText = domId;
  player.style.width = "160px";
  player.style.height = "120px";
  newView.id = domId;
  document.getElementById("container").appendChild(newView);
}

function removeView(domId) {
  let view = document.getElementById(domId);
  view && view.remove();
}

