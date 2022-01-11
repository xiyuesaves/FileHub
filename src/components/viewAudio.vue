<template>
  <div :class="['music-player',{'no-drop':dragProgress}]">
    <div class="main-box">
      <!-- 唱片 -->
      <div class="turntable">
        <div class="music-picture"></div>
        <div class="shadow"></div>
        <div class="picture-box" :style="{'transform': `rotateZ(${discRotate}deg)`}">
          <transition name='showp'>
            <div v-show="isPicture" :style="{'backgroundImage': discPicture}" class="picture"></div>
          </transition>
        </div>
        <div class="disc" :style="{'backgroundImage': discTexture,'transform': `rotateZ(${discRotate}deg)`}"></div>
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
          <div ref="progressBar" class="progress-bar">
            <div :style="{transform:`translateX(-${100 - progressRate}%)`,transition:`transform ${transitionDelay}`}" class="inside-bar"></div>
          </div>
          <div ref="drag" :style="{left:`${progressRate}%`,transition:`left ${transitionDelay}`}" class="progress-control"></div>
        </div>
        <span class="times">{{formatTime(playTime)}}/{{formatTime(endTime)}}</span>
      </div>
      <!-- 播放元素 -->
      <audio preload ref="audio" :src="musicLink" style="display: none;"></audio>
    </div>
  </div>
</template>
<script>
export default {
  props: ["selectFile", "newWran", "musicLink", "infoLink"],
  data() {
    return {
      discTexture: "", // 唱片纹理
      discPicture: "", // 专辑封面
      isPicture: false, // 是否有封面信息
      playTime: 0, // 已播放时长
      endTime: 0, // 总时长
      progressRate: 0, // 进度条位置
      lastRate: 0, // 当前进度条位置
      discRotate: 0, // 唱片旋转角度
      prevStatic: false, // 拖拽发生前播放器状态
      dragProgress: false, // 拖拽进度条判断
      transitionDelay: "300ms", // 进度条动画补间时长
      currentX: 0, // 当前进度条位置
      previousX: 0, // 选中时进度条位置
      showMusicName: "", // 显示的音乐名称
      overflowText: false, // 音乐名称是否启用滚动展示
      source: this.axios.CancelToken.source(), // axios防抖
      mediaInformation: "", // 唱片其他信息-艺术家
      isplayMusic: false, // 是否正在播放
      loadInfo: false, // 是否加载完成
      transitionPause: "", // 播放暂停过渡效果
    }
  },
  methods: {
    formatTime(time) { // 格式化时间
      let newTime,
        second = ("0" + (time % 60)).substr(-2),
        minute = ("0" + ((time - second) / 60)).substr(-2);
      newTime = `${minute}:${second}`;
      return newTime
    },
    initDisc() { // 初始化播放器
      clearTimeout(this.transitionPause)
      this.isPicture = false;
      this.isplayMusic = false;
      this.mediaInformation = "";
      this.showMusicName = "";
      this.playTime = 0;
      this.endTime = 0;
      this.progressRate = 0;
      this.lastRate = 0;
      this.$refs.audio.volume = 1;
      let turntableColor = "",
        leve = 30
      for (var i = 0; i < leve; i++) {
        let randNum = Math.floor(90 * Math.random())
        if (randNum == 0 || randNum == 1) {
          randNum = 90
        }
        turntableColor += `#000000,rgb(${randNum},${randNum},${randNum}),`
      }
      this.getMusicInfo()
      this.discTexture = `radial-gradient(#00000000 68%,#000000 68.1%,#000000 68.5%,rgb(60,60,60) 69%),radial-gradient(#000000 26%,${turntableColor}#000000)`
    },
    newCancelToken() { // axios 中止token
      this.source = this.axios.CancelToken.source()
      return this.source.token
    },
    getMusicInfo() { // 获取音乐详情
      // let infoLink = `${this.localhost}/info${window.location.pathname}${this.selectFile}`
      if (this.loadInfo) {
        this.source.cancel('结束上一次请求');
      }
      this.loadInfo = true
      this.axios.post(this.infoLink, {
        cancelToken: this.newCancelToken()
      }).then((res) => {
        this.loadInfo = false;
        this.discRotate = 0;
        let data = res.data.common
        console.log("接收到专辑信息", data)
        if (data.title) { // 音乐名称
          this.showMusicName = data.title
        }
        if (data.performerInfo) { // 创作者信息
          this.mediaInformation = `${data.performerInfo}`
        }
        if (!data.title) { // 如果没有标题则使用文件名
          this.showMusicName = this.selectFile
        }
        if (data.artist) { // 演唱者名称
          this.mediaInformation = `${data.artist}`
        }
        if (data.picture && data.picture[0]) { // 专辑封面
          var binary = '',
            bytes = new Uint8Array(data.picture[0].data.data);
          for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          let dataStr = window.btoa(binary)
          this.discPicture = `url(data:image/png;base64,${dataStr})`
          this.isPicture = true
        }
        this.scrollName()
      }).catch(err => {
        if (err.message !== "结束上一次请求") {
          this.newWran("请求预览文件失败")
          console.log("请求专辑信息出错", err)
        } else {
          console.log("用户关闭请求")
        }
      })
    },
    scrollName() { // 超长滚动名称
      this.overflowText = false
      setTimeout(() => {
        if (this.$refs.musicName.offsetWidth > (this.$refs.nameBox.offsetWidth - 20)) {
          this.showMusicName = this.showMusicName + "　　" + this.showMusicName + "　　"
          this.overflowText = true
        }
      })
    },
    pauseMusic() { // 渐入渐出暂停播放
      this.isplayMusic = !this.isplayMusic
      if (this.isplayMusic) {
        clearTimeout(this.transitionPause)
        this.$refs.audio.play()
        let upV = () => {
          this.transitionPause = setTimeout(() => {
            if (this.$refs.audio.volume !== 1) {
              this.$refs.audio.volume = Math.floor((this.$refs.audio.volume + 0.1) * 100) / 100
              upV()
            }
          }, 20)
        }
        upV()
      } else {
        clearTimeout(this.transitionPause)
        let downV = () => {
          this.transitionPause = setTimeout(() => {
            if (this.$refs.audio.volume !== 0) {
              this.$refs.audio.volume = Math.floor((this.$refs.audio.volume - 0.1) * 100) / 100
              downV()
            } else {
              this.$refs.audio.pause()
            }
          }, 20)
        }
        downV()
      }
    },
    holdBtn(e) { // 鼠标按下
      this.dragProgress = true
      this.previousX = e.clientX || e.touches[0].clientX
      this.lastRate = this.progressRate
      this.prevStatic = this.isplayMusic
      if (this.prevStatic) {
        this.pauseMusic()
      }
    },
    holdMove(e) { // 拖拽进度条
      if (this.dragProgress) {
        let moveX = e.clientX || e.touches[0].clientX,
          coverX = moveX - this.previousX,
          width = this.$refs.progressBar.offsetWidth,
          revise = coverX / width * 100,
          rateNum = this.lastRate + revise
        if (rateNum <= 0) {
          this.progressRate = 0
          this.playTime = 0
        } else if (rateNum >= 100) {
          this.progressRate = 100
          this.playTime = Math.floor(this.$refs.audio.duration)
        } else {
          this.progressRate = rateNum
          this.playTime = Math.floor(this.$refs.audio.duration * (rateNum / 100))
        }
      }
    },
    releaseBtn(e) { // 释放进度条
      if (this.dragProgress) {
        if (this.prevStatic) {
          this.pauseMusic()
        }
        this.dragProgress = false
        this.$refs.audio.currentTime = this.playTime
      }
    }
  },
  watch: {
    selectFile(newName) {
      this.initDisc();
      this.scrollName(); // 名称超长判断
    },
    dragProgress() {
      if (this.dragProgress) {
        this.transitionDelay = "0ms"
      } else {
        this.transitionDelay = "300ms"
      }
    }
  },
  mounted() {
    this.initDisc(); // 初始化播放器
    this.scrollName();
    this.$refs.audio.addEventListener("canplay", () => {
      this.endTime = Math.floor(this.$refs.audio.duration)
    })
    this.$refs.audio.addEventListener("timeupdate", () => {
      if (!this.dragProgress && this.$refs.audio) { // 执行前先判断元素是否存在
        this.progressRate = ((Math.floor(this.$refs.audio.currentTime) / Math.floor(this.$refs.audio.duration)) * 100) || 0
        this.playTime = Math.floor(this.$refs.audio.currentTime)
      }
    })
    this.$refs.audio.addEventListener("ended", () => {
      this.isplayMusic = false
    })

    // 唱片旋转动画
    let discRotate = (argument) => {
      console.log()
      if (this.isplayMusic && [3, 4].indexOf(this.$refs.audio.readyState) !== -1) {
        this.discRotate += 0.2
      }
      window.requestAnimationFrame(discRotate);
    }
    window.requestAnimationFrame(discRotate);

    // pc监听事件
    this.$refs.drag.addEventListener("mousedown", this.holdBtn);
    window.addEventListener("mouseup", this.releaseBtn);
    window.addEventListener("blur", this.releaseBtn);
    window.addEventListener("mousemove", this.holdMove);
    this.$refs.progressBar.addEventListener("mousedown", (e) => {
      console.log("触发监听")
      this.$refs.audio.currentTime = this.$refs.audio.duration * (e.offsetX / this.$refs.progressBar.offsetWidth)
      this.progressRate = (e.offsetX / this.$refs.progressBar.offsetWidth) * 100
    })
    // 手机监听事件
    this.$refs.drag.addEventListener("touchstart", this.holdBtn);
    window.addEventListener("touchend", this.releaseBtn);
    window.addEventListener("touchmove", this.holdMove);
    this.$refs.progressBar.addEventListener("touchstart", (e) => {
      let rect = e.target.getBoundingClientRect(),
        x = e.targetTouches[0].pageX - rect.left;
      this.$refs.audio.currentTime = this.$refs.audio.duration * (x / this.$refs.progressBar.offsetWidth)
    })
  }
}

</script>
<style scoped>
.no-drop {
  user-select: none;
}

.music-player {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 40px 15px;
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

.disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 400px;
  background-color: #000000;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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

.picture-box {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 31;
}

.picture {
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  top: 15%;
  left: 15%;
  /*transition: transform 1s linear;*/
  /*transform: translateY(-50%) translateX(-50%);*/
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
  max-width: 100%;
  margin: 0;
  font-size: 12px;
  display: block;
  height: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  left: 130px;
  color: #999;
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
  transform: translateX(-100%);
  background-color: #f95342;
  pointer-events: none;
  /*transition: transform 300ms;*/
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
  left: 0%;
  /*transition: left 300ms;*/
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

.showp-enter-active,
.showp-leave-active {
  transition: opacity 300ms;
}

.showp-enter,
.showp-leave-to {
  opacity: 0;
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

@media (max-width: 820px) {
  .turntable {
    left: 10px;
    bottom: 10px;
    width: 60px;
    height: 60px;
  }

  .music-name {
    left: 60px;
    width: calc(100% - 80px);
  }

  .other-info {
    left: 80px;
  }

  .controls {
    left: 80px;
    width: calc(100% - 90px);
  }
}

@media (max-width: 630px) {
  .music-player {
    padding: 18px 14px;
  }

  .main-box {
    max-width: 100%;
    border: none;
  }
}

</style>
