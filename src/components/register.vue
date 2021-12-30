<template>
  <div class="login-box">
    <span class="login-field">用户名</span>
    <input ref="name" v-model="userName" tabindex="1" type="text" name="">
    <span class="login-field">密码</span>
    <input ref="psw" v-model="password" tabindex="2" type="password" name="">
    <span class="login-field">确认密码</span>
    <input ref="psw2" v-model="tryPassword" tabindex="3" type="password" name="">
    <menuButton tabindex="3" showText="创建管理员" :clickFun="verify" :btnClass="`btn-green ${!registerBtn ? 'disable-btn' : ''}`" />
  </div>
</template>
<script>
import menuButton from './menuButton';
export default {
  props: ["showErr", "localhost", "closeErr","changeStep"],
  components: {
    menuButton
  },
  data() {
    return {
      userName: "",
      password: "",
      tryPassword: "",
      registerBtn: true
    }
  },
  methods: {
    verify() {
          this.changeStep("selectPath")
      if ((this.userName.length >= 2 && this.userName.length <= 8)) {
        if ((this.password.length >= 6 && this.password.length <= 18)) {
          if (this.tryPassword === this.password) {
            this.closeErr()
            this.register()
          } else {
            this.showErr("两次密码不一致")
          }
        } else {
          this.showErr("请输入长度在6-18位的密码")
        }
      } else {
        this.showErr("请输入2-8位用户名")
      }
    },
    register() {
      this.registerBtn = false;
      this.axios.post(`${this.localhost}/initialization`, {
        data: {
          name: this.userName,
          password: this.password
        }
      }).then(res => {
        console.log("初始化接口返回", res.data)
        this.closeErr()
        this.registerBtn = true;
        if (res.data.status) {
          console.log("默认管理员注册成功,跳转到目录设置")
          this.changeStep("selectPath")
        } else {
          switch (res.data.code) {
            case 0:
              this.showErr("用户名长度错误")
              break;
            case 1:
              this.showErr("密码长度错误")
              break;
          }
        }
      }, err => {
        console.log("初始化出错", err)
        this.showErr("初始化失败,请检查网络连接")
        this.registerBtn = true;
      })
    },
  }
}

</script>
<style scoped>
.login-box {
  width: 308px;
  min-height: 230px;
  border-radius: 6px;
  border: solid 1px #d8dee4;
  background-color: #f6f8fa;
  padding: 20px;
  margin: 0 auto;
  box-sizing: border-box;
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


.button {
  margin-top: 10px;
  width: 100%;
  justify-content: center !important;
}

</style>
