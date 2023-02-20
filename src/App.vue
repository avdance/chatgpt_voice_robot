<template>
  <div class="app">
    <div id="chat-window">
    </div>
    <div id="operator">
      <button v-show="!recording" @click="startRecording">开始转写</button>
      <button v-show="recording" @click="stopRecording">停止转写</button>
      <audio ref="audio" controls></audio>
    </div>
  </div>
</template>

<script>
import CryptoJS from "crypto-js";
import { hex_md5 } from "@/utils/md5.js";

export default {
  name: "App",
  mounted() {
    //初始化
    this.init();
  },
  beforeDestroy() {
    this.uninit();
  },
  data() {
    return {
      //ChatGPT
      openApiKey: "xxxxxx", //ChatGPT APIKey
      configuration: null,
      openai: null,
      modelEngine: "text-davinci-003",
      chatCount: 0,

      //科大讯飞
      appid: "xxxxxx", //科大讯飞 AppID
      apiKey: "xxxxxx", //科大讯飞 APIKey
      uri: "wss://rtasr.xfyun.cn/v1/ws", // 科大讯飞地址
      result: "", 
      recording: false, 
      sessionID: "",

      socket: null, 

      //audio stream
      audioStream: null, 
      streamSource: null,
      audioContext: null,
      audioInput: null, 
      audioSampleRate: 16000, 
      audioBuffer: [], 
      audioBufferSize: 0, 
      audioSampleBits: 16, 
      audioChannels: 1, 

      recWorker: null,
      processer: null,

      handlerInterval: null,

      state: "none",
    };
  },
  methods: {
    resetDots(){
      this.dots=[]
    },
    startRecording() {
      this.recording = true;

      //开始采集音频数据
      console.log("start to capture audio data ......");
      this.captureAudio();
    },
    stopRecording() {
      this.recording = false;

      //关闭音频
      this.closeAudio();

      this.removeLastEle()
    },
    closeSocket(){
      //关闭websocket
      clearInterval(this.handlerInterval);
      this.socket.close();
      this.socket = null;
    },
    init() {
      console.log("initialize ......");
      this.state = "init";

      this.createWorker();
    },
    uninit() {
      console.log("uninit......");
      this.state = "terminal";

      this.closeAudio();
      this.recWorker.terminate();
    },
    createWorker() {
      this.recWorker = new Worker(
        new URL("./workers/worker", import.meta.url),
        { type: "module" }
      );

      this.recWorker.onmessage = (event) => {
        // this.result += event.data;
        this.audioBuffer.push(...event.data.buffer);
      };

      this.recWorker.onerror = function (event) {
        console.log("=======>", event.message, event.filename, event.lineno);
        this.recorder.terminate();
      };
    },
    captureAudio() {
      if (
        this.state === "init" ||
        this.state === "end" ||
        this.state === "pause"
      ) {
        this.state = "ing";

        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        if (this.audioContext) {
          this.processer = this.audioContext.createScriptProcessor(0, 1, 1);
          console.log("create processer......");
        }

        console.log("start to capure audio data ...");

        //采集音频数据
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then(
              (stream) => {
                this.audioStream = stream;

                this.streamSource =
                  this.audioContext.createMediaStreamSource(stream);

                this.processer.onaudioprocess = (e) => {
                  this.sendData(e.inputBuffer.getChannelData(0));
                };

                this.streamSource.connect(this.processer);

                this.processer.connect(this.audioContext.destination);
              },
              (e) => {
                alert("没有音频采集设备，请插入耳机！");
                console.log("error:", e);
              }
            );
        } else {
          navigator.getUserMedia({ audio: true, video: false }).then(
            (stream) => {
              this.mediaStream =
                this.audioContext.createMediaStreamSource(stream);
              this.recorder.onaudioprocess = (e) => {
                console.log("nodevice, recorder.onaujdioprocess......");
              };
            },
            (e) => {
              console.log("error:", e);
            }
          );
        }

        //打开websocket
        this.createWebSocket();

      } else {
        alert("You don't initialize......");
      }
    },
    closeAudio() {
      console.log("close audio...state:", this.state);
      if (this.state === "ing") {
        this.state = "pause";

        if (this.streamSource) this.streamSource.disconnect();
        if (this.processer) this.processer.disconnect();

        if (this.audioStream) {
          this.audioStream.getTracks().forEach((track) => {
            track.stop();
          });
          this.audioStream = null;
        }

        this.processer.onaudioprocess = null;
        this.processer = null;

        this.audioContext.close();
        this.audioContext = null;

        this.closeSocket()
      }
    },
    createWebSocket() {
      console.log("create websocket ...");

      let urlParam = this.handShakeParams();

      let url = this.uri + urlParam;
      console.log(url);
      if ("WebSocket" in window) {
        this.socket = new WebSocket(url);
      } else if ("MozWebSocket" in window) {
        this.socket = new MozWebSocket(url);
      } else {
        alert(notSupportTip);
        return null;
      }

      this.socket.onopen = (e) => {
        this.processWsOpen();
      };
      this.socket.onmessage = (e) => {
        this.processWsMessage(e);
      };
      this.socket.onerror = (e) => {
        console.log("关闭连接ws.onerror");
      };
      this.socket.onclose = (e) => {
        console.log("关闭连接ws.onclose");
      };
    },
    handShakeParams() {
      let appId = this.appid;
      let secretKey = this.apiKey;
      let ts = Math.floor(new Date().getTime() / 1000); 
      let signa = hex_md5(appId + ts); 
      let signatureSha = CryptoJS.HmacSHA1(signa, secretKey);
      let signature = CryptoJS.enc.Base64.stringify(signatureSha);
      signature = encodeURIComponent(signature);
      return "?appid=" + appId + "&ts=" + ts + "&signa=" + signature;
    },
    sendData(buf) {
      this.recWorker.postMessage({
        command: "transform",
        buffer: buf,
      });
    },
    processWsOpen() {
      if (!this.socket) {
        console.warn("socket is null");
        return;
      }

      if (this.socket.readyState !== 1) {
        return;
      }

      var audioData = this.audioBuffer.splice(0, 1280);

      this.addChatMessage("",'sent')

      this.socket.send(new Int8Array(audioData));

      this.handlerInterval = setInterval(() => {
        // websocket未连接
        if (this.socket.readyState !== 1) {
          clearInterval(this.handlerInterval); 
          return;
        }

        if (this.audioBuffer.length === 0) {
          if (this.state === "end") {
            this.ws.send('{"end": true}');
            console.log("发送结束标识");
            clearInterval(this.handlerInterval); 
          }
          return false;
        }

        var audioData = this.audioBuffer.splice(0, 1280);
        if (audioData.length > 0) {
          this.socket.send(new Int8Array(audioData));
        }
      }, 40); 
    },
    processWsMessage(e) {
      let jsonData = JSON.parse(e.data);
      if (jsonData.action == "started") {
        console.log("握手成功");
      } else if (jsonData.action == "result") {
        this.setResult(JSON.parse(jsonData.data));
      } else if (jsonData.action == "error") {
        console.log("出错了:", jsonData);
      }
    },
    setResult(data) {
      let rtasrResult = [];
      rtasrResult[data.seg_id] = data;
      rtasrResult.forEach((i) => {
        if (i.cn.st.type == 0) {
          let str = "";
          //获得结果：
          i.cn.st.rt.forEach((j) => {
            j.ws.forEach((k) => {
              k.cw.forEach((l) => {
                str += l.w.trim();
              });
            });
          });

          this.closeAudio();

          this.addChatMessage("我: " + str, "sent");
          this.getOpenAiReplay2(str);
        }
      });
    },
    getOpenAiReplay2(prompt) {
      const url =
        "https://api.openai.com/v1/engines/" +
        this.modelEngine +
        "/completions";

      console.log(url);
      this.addChatMessage("", 'received')

      fetch(url, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.openApiKey,
        }),
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: 4000,
        }),
      })
        .then(
          (response) => response.json(),
          (error) => {
            console.error(error);
          }
        )
        .then((data) => {
          console.log(data.choices[0].text);
          this.addChatMessage("AI: " + data.choices[0].text, "received");

          console.log("restart to catpure audio");
          this.captureAudio();
        });
    },
    addChatMessage(message, direction) {
      const chatWindow = document.querySelector("#chat-window");

      const messageElement = document.createElement("div");
      
      if(message === "") {
        messageElement.classList.add("dots-wrapper", "message", direction)
        messageElement.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>'
      }else{

        const lastChild = chatWindow.lastElementChild;
        chatWindow.removeChild(lastChild);

        messageElement.classList.add("message", direction);
        messageElement.innerHTML = '<p>' + message + "</p>";
      }
    
      chatWindow.appendChild(messageElement);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    },
    removeLastEle(){
      const chatWindow = document.querySelector("#chat-window");
      const lastChild = chatWindow.lastElementChild;
      
      console.log('lastChild', lastChild.className)

      if(lastChild.className.indexOf('dots-wrapper') >= 0) {
        chatWindow.removeChild(lastChild);
      }
        
    }
  },
};
</script>

<style>
.result {
  height: 50px;
  margin: 10px;
  padding: 10px;
  background-color: #eee;
  border-radius: 10px;
  overflow: scroll;
}

button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #4caf50;
  border: none;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition-duration: 0.3s;
}

button:hover {
  background-color: #3e8e41;
}

button:disabled {
  background-color: #aaa;
  cursor: default;
}

button,
audio {
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.stop-button {
  background-color: #f44336;
}

.app {
  text-align: center;
}

#chat-window {
  width: 600px;
  height: 400px;
  margin: 0 auto;
  padding: 10px;
  border: 1px solid #ddd;
  overflow-y: scroll;
}

.message {
  display: flex;
  margin: 10px 0;
}

.message.received {
  justify-content: flex-end;
}

.message p {
  background-color: #eee;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 1px 1px 5px #ddd;
  max-width: 80%;
}

.message.received p {
  background-color: #fff;
}

.message.sent p {
  background-color: #dcf8c6;
}

#operator {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.dots-wrapper {
  display: flex;
  align-items: center;
}

.dot {
  display: inline-block;
  margin-right: 0.3em;
  width: 0.5em;
  height: 0.5em;
  background-color: #333;
  border-radius: 50%;
  animation: scale 1s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes scale {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.5);
  }

  100% {
    transform: scale(1);
  }
}
</style>