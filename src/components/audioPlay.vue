<template>
  <div class="audio-player">
    <div class="main-box">
      <div class="turntable">
        <!--  光碟信息 -->
        <div class="music-picture"></div>
        <!-- 光影 -->
        <div class="shadow"></div>
        <!-- 唱碟 -->
        <div class="disc" :style="`background-image: radial-gradient(#00000000 68%,#000000 68.1%,#000000 68.5%,rgb(60,60,60) 69%),radial-gradient(#000000 26%,${discTexture}#000000);`"></div>
        <!-- 探针 -->
        <div class="probe">
          <div class="shaft">
            <div class="probe-link">
              <div class="bending">
                <div class="pickup"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["selectFile"],
  data() {
    return {
      discTexture: this.renders(80)
    }
  },
  methods: {
    renders(leve) {
      let turntableColor = ""
      for (var i = 0; i < leve; i++) {
        let randNum = Math.floor(90 * Math.random())
        if (randNum == 0 || randNum == 1) {
          randNum = 90
        }
        turntableColor += `#000000,rgb(${randNum},${randNum},${randNum}),`
      }
      return turntableColor
    }
  },
  watch: {
    selectFile() {
      this.discTexture = this.renders(80)
    }
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
}

.main-box {
  width: 450px;
  height: 450px;
  box-sizing: border-box;
  position: relative;
  padding: 25px;
}

.turntable {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 400px;
  box-shadow: rgb(140 149 159 / 40%) 0px 4px 20px 10px;
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
  width: 130px;
  height: 130px;
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
  width: 15px;
  height: 15px;
  border-radius: 10px;
  z-index: 10;
  background-color: #000000;
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

.probe {
  width: 100px;
  height: 100px;
  border-radius: 100px;
  position: absolute;
  top: -60px;
  right: -90px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  /*background-color: #383838;*/
  /*border-right: solid 1px #828282;*/
  /*border-left: solid 1px #111111;*/
  box-sizing: border-box;
}

.shaft {
  box-sizing: border-box;
  width: 46px;
  height: 46px;
  border-radius: 46px;
  position: relative;
  transform: rotateZ(28deg);
}

.shaft::after {
  content: "";
  display: flex;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 42px;
  background-color: #444444;
  transform: rotateZ(16deg);
  /*border: solid 1px #999999;*/
  box-sizing: border-box;
  z-index: 10;
  box-shadow: #00000040 0px 4px 15px;
}

.probe-link {
  transform-origin: center 63px;
  transform: rotateZ(0deg);
  width: 10px;
  height: 310px;
  background-color: #444444;
  position: absolute;
  top: -40px;
  left: calc(50% - 5px);
  border-radius: 10px 0 3px 0;
  box-shadow: #0000005f 0 0 8px;
}

.bending {
  width: 10px;
  transform-origin: top left;
  transform: rotateZ(17deg);
  height: 50px;
  background-color: #444444;
  position: absolute;
  top: 99%;
  left: 0;
}

.pickup {
  width: 24px;
  height: 38px;
  background-color: #444444;
  position: absolute;
  top: 100%;
  left: calc(50% - 12px);
  border-radius: 6px;
  box-shadow: #0000005f 0 0 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  box-sizing: border-box;
  padding: 7px 0;
  cursor: grab;
}

.pickup:active {
  cursor: grabbing;
}

.pickup::before {
  content: "";
  display: block;
  width: 16px;
  height: 4px;
  border-radius: 4px;
  background-color: #666666;
}

.pickup::after {
  content: "";
  display: block;
  width: 16px;
  height: 4px;
  border-radius: 4px;
  background-color: #666666;
}

</style>
