<template>
  <div class="video-content">
    <video-player ref="video" :options="playerOptions" class="vjs-custom-skin vjs-big-play-centered" />
  </div>
</template>
<script>
export default {
  props: ["videoSrc"],
  data() {
    return {
      playerOptions: {
        language: 'cn',
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        fluid: true,
        sources: [{
          src: this.videoSrc,
        }]
      }
    }
  },
  methods: {},
  watch: {
    videoSrc() {
      this.$refs.video.player.src(this.videoSrc)
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
