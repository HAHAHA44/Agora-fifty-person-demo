let rtc = {
  client: null,
  localStream: null,
};

// Options for joining a channel
let option = {
  appID: "",
  channel:"",
  uid: null,
  token: null,
}

window.onload = () => {
  let client = AgoraRTC.createClient({mode: "rtc", codec: "h264"});
  rtc.client = client;
}

document.getElementById("start-btn").onclick = () => {
  initCall();
}

function getParams() {
  option.appID = document.getElementById("appid-text").value;
  option.channel = document.getElementById("channel-text").value;
  option.token = document.getElementById("token-text").value;
}

function initCall() {
  getParams();
  rtc.client.init(option.appID, function () {
    console.log("init success, ready to join channel " + option.channel);
    rtc.client.join(option.token || null, option.channel, null, (uid) => {
      rtc.localStream = AgoraRTC.createStream({
        audio: false,
        video: true,
        screen: false,
      });
      rtc.localStream.setVideoProfile("120p_1");
      rtc.localStream.init(() => {
        console.log("init stream success, ready to publish.");
        rtc.client.publish(rtc.localStream);
        rtc.localStream.play('local-player');
      });
    });
  }, (err) => {
    console.error(err);
  });
}