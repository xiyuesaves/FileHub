<template>
  <div class="audio-player">
    <div class="main-box">
      <!-- 唱片 -->
      <div class="turntable">
        <div class="music-picture"></div>
        <div class="shadow"></div>
        <div class="disc" :style="`background-image: radial-gradient(#00000000 68%,#000000 68.1%,#000000 68.5%,rgb(60,60,60) 69%),radial-gradient(#000000 26%,${discTexture}#000000);`"></div>
      </div>
      <!-- 歌名 -->
      <p :class="['music-name',{'scrollText':overflowText}]" ref="nameBox"><span ref="musicName">{{showMusicName}}</span></p>
      <!-- 其他信息 -->
      <p class="other-info">{{mediaInformation}}</p>
      <!-- 播放控制器 -->
      <div class="controls">
        <button @click="pauseMusic" :class="['play-btn','iconfont',{'icon-24gf-pause2':isplayMusic},{'icon-24gf-play':!isplayMusic}]">
        </button>
        <div class="progress">
          <div class="progress-bar">
            <div class="inside-bar"></div>
          </div>
          <div class="progress-control"></div>
        </div>
        <span class="times">00:00/00:00</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["selectFile", "localhost"],
  data() {
    return {
      discTexture: "",
      showMusicName: "",
      overflowText: false,
      musicLink: `${this.localhost}/raw${window.location.pathname}${this.selectFile}`,
      mediaInformation: "",
      isplayMusic: true
    }
  },
  methods: {
    initDisc() { // 初始化播放器
      this.mediaInformation = ""
      this.showMusicName = ""
      let turntableColor = "",
        leve = 30
      for (var i = 0; i < leve; i++) {
        let randNum = Math.floor(90 * Math.random())
        if (randNum == 0 || randNum == 1) {
          randNum = 90
        }
        turntableColor += `#000000,rgb(${randNum},${randNum},${randNum}),`
      }
      this.musicLink = `${this.localhost}/raw${window.location.pathname}${this.selectFile}`
      this.getMusicInfo()
      return turntableColor
    },
    getMusicInfo() {
      let infoLink = `${this.localhost}/info${window.location.pathname}${this.selectFile}`
      console.log("发起请求")
      this.axios({
        methods: "get",
        url: infoLink,
      }).then((res) => {
        let data = res.data.common
        console.log("接收到专辑信息", data)
        if (data.title) {
          this.showMusicName = data.title
        }
        if (data.performerInfo) {
          this.mediaInformation += `${data.performerInfo}`
        }
        if (!this.showMusicName) {
          this.showMusicName = this.selectFile
        }
        if (data.artist) {
          this.mediaInformation = `${data.artist}`
        }
        this.scrollName()
      }).catch((err) => {
        console.log("请求专辑信息出错", err)
      })
    },
    scrollName() {
      this.overflowText = false
      setTimeout(() => {
        if (this.$refs.musicName.offsetWidth > this.$refs.nameBox.offsetWidth) {
          this.showMusicName = this.selectFile + "　　" + this.selectFile + "　　"
          this.overflowText = true
        }
      })
    },
    pauseMusic() {
      this.isplayMusic = !this.isplayMusic
      console.log("暂停")
    }
  },
  watch: {
    selectFile(newName) {
      this.discTexture = this.initDisc();
      // this.showMusicName = this.selectFile
      // 名称超长判断
      this.scrollName()
    }
  },
  mounted() {
    this.discTexture = this.initDisc();
    // this.showMusicName = this.selectFile
    this.scrollName()
  }
}

</script>
<style scoped>
.audio-player {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 20px;
  box-sizing: border-box;
}

.main-box {
  max-width: 450px;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
  position: relative;
  border-radius: 6px;
  border: solid 1px #d5d8da;
  background-color: #ffffff;
}

.turntable {
  width: 100px;
  height: 100px;
  border-radius: 400px;
  position: absolute;
  z-index: 20;
  bottom: 12px;
  left: 8px;
  box-shadow: rgb(140 149 159 / 50%) 0px 4px 10px;
}

@keyframes rotate {
  from {
    transform: rotateZ(0deg);
  }

  to {
    transform: rotateZ(3600deg);
  }
}

.disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 400px;
  background-color: #000000;
  animation: rotate 60s;
}

.disc::after {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 400px;
  position: absolute;
  z-index: 10;
  background-image: url(../assets/noise.png);
  opacity: 0.5;
  /*background-size: 20px 20px;*/
}

.music-picture {
  width: 20px;
  height: 20px;
  background-color: #F95342;
  border-radius: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 30;
  transform: translateY(-50%) translateX(-50%);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.music-picture::after {
  content: "";
  display: block;
  top: 50%;
  left: 50%;
  position: absolute;
  transform: translateY(-50%) translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 10px;
  z-index: 10;
  background-color: #ffffff;
}

.shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 400px;
  z-index: 20;
  background-image:
    conic-gradient(#000000 15%, #00000020 30%, #00000090 34%, #00000050 38%, #000000 45%, #000000 70%, #00000020 85%, #000000 100%);
}

.music-name {
  position: absolute;
  top: 6px;
  width: calc(100% - 150px);
  left: 110px;
  margin: 0;
  font-size: 16px;
  text-shadow: 1px 1px 2px #dddddd;
  white-space: nowrap;
  overflow: hidden;
  padding-left: 20px;
  z-index: 10;
}

.scrollText span {
  display: block;
  float: left;
  animation: scrollText 6s ease-in-out infinite;
}

.scrollText::after {
  content: "";
  display: block;
  width: 20px;
  height: 100%;
  position: absolute;
  background-image: linear-gradient(to right, #00000000, #ffffff);
  z-index: 10;
  top: 0;
  right: 0;
}

.scrollText::before {
  content: "";
  display: block;
  width: 20px;
  height: 100%;
  position: absolute;
  background-image: linear-gradient(to left, #00000000, #ffffff);
  z-index: 10;
  top: 0;
  left: 0;
}

.other-info {
  position: absolute;
  top: 28px;
  margin: 0;
  font-size: 12px;
  left: 130px;
  color: #999999;
}

.controls {
  width: calc(100% - 135px);
  height: 30px;
  position: absolute;
  top: 45px;
  left: 130px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.play-btn {
  width: 16px;
  height: 16px;
  border: none;
  background-color: #ffffff;
  font-size: 15px;
  color: #999999;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  line-height: 20px;
  transform: translateY(-2px);
  padding: 0;
  transition: background-color 150ms;
}

.play-btn:active {
  color: #555555;
}

.progress {
  width: calc(100% - 100px);
  height: 3px;
  position: relative;
}

.progress-bar {
  width: 100%;
  height: 100%;
  background-color: #d5d8da;
  overflow: hidden;
}

.inside-bar {
  width: 100%;
  height: 100%;
  transform: translateX(-50%);
  background-color: #f95342;
}

.progress-control {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #ffffff;
  border: solid 1px #d5d8da;
  box-sizing: border-box;
  position: absolute;
  top: -5.5px;
  left: 50%;
  transform: translateX(-50%);
}

.times {
  font-size: 12px;
  line-height: 30px;
  text-align: right;
  color: #555555;
  width: 65px;
  padding-bottom: 2px;
}

@keyframes scrollText {
  0% {
    transform: translateX(0%);
  }

  30% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(-50%);
  }
}

</style>
