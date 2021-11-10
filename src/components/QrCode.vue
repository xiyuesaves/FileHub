<template>
  <div class="canvas-box">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script>
import QRCode from "QRCode"
export default {
  props: ["url"],
  data() {
    return {
      canvas: document.getElementById('canvas_')
    }
  },
  watch: {
    url() {
      this.updateQrCode()
    }
  },
  methods: {
    updateQrCode() {
      this.canvas = document.getElementById('canvas')
      QRCode.toCanvas(this.canvas, this.url, { errorCorrectionLevel: "H" }, function(error) {
        if (error) console.error(error)
      })
    }
  },
  mounted() {
    this.updateQrCode()
  }
}

</script>
<style scoped>
#canvas {
  width: 180px;
  height: 180px;
  border-radius: 6px;
}

.canvas-box {
  position: relative;
}

.canvas-box::before {
  content: "";
  width: 10px;
  height: 10px;
  background-color: #ffffff;
  transform: rotateZ(45deg);
  top: -6px;
  right: 10px;
  position: absolute;
  border: solid 1px #d5d8da;
  border-right-color: transparent;
  border-bottom-color: transparent;
}

</style>
