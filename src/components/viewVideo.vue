<template>
  <div class="video-content">
    <video-player ref="video" :options="playerOptions" class="vjs-custom-skin vjs-big-play-centered" />
    <!-- <video ref="video" width="100%" :src="srcLink" controls=""></video> -->
  </div>
</template>
<script>
export default {
  props: ["selectFile", "localhost", "showPreviewPage"],
  data() {
    return {
      srcLink: `${this.localhost}/raw${window.location.pathname}${this.selectFile}`,
      playerOptions: {
        width: 360,
        language: 'cn',
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        fluid: true,
        sources: [{
          src: `${this.localhost}/raw${window.location.pathname}${this.selectFile}`,
        }]
      }
    }
  },
  methods: {},
  watch: {
    selectFile() {
      this.$refs.video.player.src(`${this.localhost}/raw${window.location.pathname}${this.selectFile}`)
    }
  }
}

</script>
<style scoped>
.vjs-custom-skin,
.video-js {
  width: 100%;
  height: auto;
}

.video-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
}

</style>
