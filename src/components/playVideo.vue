<template>
  <div class="video-content">
    <video ref="video" width="100%" :src="srcLink" controls=""></video>
  </div>
</template>
<script>
export default {
  props: ["selectFile", "localhost", "showPreviewPage"],
  data() {
    return {
      srcLink: `${this.localhost}/raw${window.location.pathname}${this.selectFile}`
    }
  },
  methods: {},
  watch: {
    selectFile() {
      this.srcLink = `${this.localhost}/raw${window.location.pathname}${this.selectFile}`
    }
  },
  mounted() {
    this.srcLink = `${this.localhost}/raw${window.location.pathname}${this.selectFile}`
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
