<template>
  <div class="mask init">
    <div class="center-content">
      <img class="logo" src="../assets/logo.png">
      <p class="login-title">Welcome to FileHub</p>
      <transition name="error">
        <div v-show="showErr" class="err-box">
          <div class="error" :class="errClass">
            {{errormsg}}<div @click="closeErr" class="iconfont icon-guanbi"></div>
          </div>
        </div>
      </transition>
      <transition name="register" mode="out-in">
        <component v-bind="$attrs" :localhost="localhost" :changeStep="changeStep" :closeErr="closeErr" :showErr="showErrFun" :is="step"></component>
      </transition>
    </div>
  </div>
</template>
<script>
import register from './register';
import selectPath from './selectPath';
import md5 from 'js-md5';
export default {
  props: ["registerFun","localhost"],
  inheritAttrs: false,
  data() {
    return {
      componens: {
        register,
        selectPath
      },
      step: register,
      registerBtn: true,
      showErr: false,
      errClass: "errorRed",
      errormsg: "未知错误",
      userName: "",
      password: "",
      tryPassword: "",
      pathList: []
    }
  },
  methods: {
    changeStep(comp) {
      console.log("修改组件", this.componens[comp])
      this.step = this.componens[comp]
    },
    closeErr() {
      this.showErr = false
    },
    showErrFun(str, style = "errorRed") {
      this.errClass = style
      this.errormsg = str
      this.showErr = true
    }
  },
  mounted() {
    this.axios.get(`${this.localhost}/login`).then(res => {
      console.log("步骤判断", res.data)
      if (res.data.code === -2) {
        this.changeStep("selectPath")
      }
    })
  }
}

</script>
<style scoped>
.logo {
  width: 48px;
  height: 48px;
  display: block;
  margin: 16px auto 24px;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: #ffffff;
}


.mask {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  position: fixed;
  z-index: 999;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #ffffff;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.center-content {
  width: 100%;
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
  max-height: 100vh;
  overflow-x: hidden;
  overflow-y: scroll;
  padding-right: 9px;
}


.login-title {
  width: 100%;
  text-align: center;
  font-size: 24px;
  font-weight: lighter;
  margin: 0 auto 20px;
}

.err-box {
  width: 308px;
  margin: 0 auto;
  height: 50px;
  margin-bottom: 20px;
}

.error {
  width: 100%;
  height: 50px;
  padding: 15px 20px;
  font-size: 12px;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error.errorRed {
  color: #3c4e64;
  background-color: #ffebe9;
  border: solid 1px #ffc1c0;
}

.error.success {
  color: #0F3300;
  background-color: #D6FEDA;
  border: solid 1px #70FF80;
}

.error .iconfont {
  cursor: pointer;
}

.error-enter-active,
.error-leave-active,
.error-move {
  transition: all 300ms;
}


.error-enter,
.error-leave-to {
  height: 0;
  margin-bottom: 0;
  opacity: 0;
}

.register-enter-active,
.register-leave-active,
.register-move {
  transition: all 300ms;
}

.register-enter {
  transform: translateX(30%);
  opacity: 0;
}

.register-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

*::-webkit-scrollbar-button {
  display: none;
}

*::-webkit-scrollbar-corner,
*::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  background-color: #ffffff;
}

*::-webkit-scrollbar-thumb {
  background-color: #d7dadd;
}

*::selection {
  background: #0969da;
  color: #ffffff;
}

</style>
