<template>
  <div class="video-content">
    <video ref="video" class="video-js vjs-big-play-centered" width="100%" :src="srcLink" controls=""></video>
  </div>
</template>
<script>
export default {
  props: ["selectFile", "localhost", "showPreviewPage"],
  data() {
    return {
      srcLink: `${this.localhost}/video${window.location.pathname}${this.selectFile}`,
      // srcLink: `127.0.0.1/`,
      videoObj: ""
    }
  },
  methods: {
    initVideo() {
      console.log("初始化")
      //初始化视频方法
      this.videoObj.src(this.srcLink)
      this.videoObj.load(this.srcLink)
    }
  },
  watch: {
    selectFile() {
    	console.log(showPreviewPage(this.selectFile))
      if (showPreviewPage(this.selectFile) === "video") {
        this.srcLink = `${this.localhost}/video${window.location.pathname}${this.selectFile}`
        this.videoObj.src(this.srcLink)
        this.videoObj.load(this.srcLink)
      } else {
      	this.videoObj.ended()
      }
    }
  },
  mounted() {
    this.videoObj = this.$video(this.$refs.video, {
      //确定播放器是否具有用户可以与之交互的控件。没有控件，启动视频播放的唯一方法是使用autoplay属性或通过Player API。
      controls: true,
      preload: "auto",
    })
    this.srcLink = `${this.localhost}/video${window.location.pathname}${this.selectFile}`
    this.initVideo()

  }
}

</script>
<style scoped>
.video-js {
  width: 100%;
  height: 100%;
}

.video-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
}

.video-content video {
  width: 100%;
}

</style>
