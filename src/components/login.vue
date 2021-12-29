<template>
  <div class="mask" @keydown="keys">
    <div class="center-content">
      <img class="logo" src="../assets/logo.png">
      <p class="login-title">Sign in to FileHub</p>
      <transition name="error">
        <div v-show="showErr" class="err-box">
          <div class="error">
            {{errormsg}}<div @click="closeErr" class="iconfont icon-guanbi"></div>
          </div>
        </div>
      </transition>
      <div class="login-box">
        <span class="login-field">用户名</span>
        <input ref="name" v-model="userName" tabindex="1" type="text" name="">
        <span class="login-field">密码</span>
        <input ref="psw" v-model="password" tabindex="2" type="password" name="">
        <menuButton tabindex="3" showText="登录" :clickFun="login" :btnClass="`btn-green ${!loginBtn ? 'disable-btn' : ''}`" />
      </div>
    </div>
  </div>
</template>
<script>
import menuButton from './menuButton';
import md5 from 'js-md5';

export default {
  props: ["localhost","loginFun"],
  data() {
    return {
      showErr: false,
      errormsg: "未知错误",
      loginBtn: true,
      userName: "",
      password: ""
    }
  },
  components: {
    menuButton
  },
  methods: {
    login() {
      if (this.loginBtn) {
        this.loginBtn = false;
        this.axios.post(`${this.localhost}/login`, {
          data: {
            name: this.userName,
            password: md5(this.password)
          }
        }).then(ref => {
          const data = ref.data
          console.log("登录结果", data)
          if (data.status) {
            // 判断登录成功调用父组件的方法二次验证
            this.loginFun();
          } else {
            this.errormsg = "未知错误";
            switch (data.code) {
              case 0:
                this.errormsg = "用户名或密码错误";
                break;
              case 1:
                this.errormsg = "该账号已禁用";
                break;
            }
            this.showErr = true;
          }
          this.loginBtn = true;
        }, err => {
          console.log("登录请求出错", err)
          this.errormsg = "登录失败,请检查网络连接";
          this.showErr = true;
          this.loginBtn = true;
        })
      }

    },
    closeErr() {
      this.showErr = false
    },
    keys(e) {
    	// 回车键切换到未填写内容上 如果全部填写则提交信息
      if (e.keyCode === 13) {
        if (this.userName.length) {
          if (this.password.length) {
            this.login()
          } else {
            this.$refs.psw.focus()
          }
        } else {
          this.$refs.name.focus()
        }
      }
    }
  }
}

</script>
<style scoped>
.button {
  margin-top: 10px;
  width: 100%;
  justify-content: center !important;
}

.logo {
  width: 48px;
  height: 48px;
  display: block;
  margin: 16px auto 24px;
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
  width: 340px;
  height: 350px;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
}

.login-title {
  width: 100%;
  text-align: center;
  font-size: 24px;
  font-weight: lighter;
  margin: 0 auto 20px;
}

.login-box {
  width: 100%;
  height: 230px;
  border-radius: 6px;
  border: solid 1px #d8dee4;
  background-color: #f6f8fa;
  padding: 20px;
  box-sizing: border-box;
  flex-direction: column;
  box-sizing: border-box;
}

.err-box {
  width: 100%;
  height: 50px;
  margin-bottom: 20px;
}

.error {
  width: 100%;
  color: #3c4e64;
  height: 50px;
  padding: 15px 20px;
  font-size: 12px;
  background-color: #ffebe9;
  border: solid 1px #ffc1c0;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error .iconfont {
  cursor: pointer;
}

.login-field {
  display: block;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  margin-bottom: 7px;
  width: 100%;
}

input {
  width: 100%;
  height: 32px;
  padding: 5px 12px;
  margin-bottom: 15px;
  border: solid 1px #d0d7de;
  border-radius: 6px;
  box-sizing: border-box;
  color: #3c4e64;
  letter-spacing: 0.2px;
}

input[type="password"] {
  letter-spacing: 2px;
  font-size: 14px;
}

input:focus {
  border-color: #0969da;
  outline: solid 3px #afcdf1;
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

.error-leave-active {}

</style>
