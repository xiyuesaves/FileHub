<template>
  <div class="select-path">
    <div class="top-option">
      <span class="login-field">添加根目录</span>
      <menuButton tabindex="3" showText="添加路径" :clickFun="addPath" :btnClass="`${!registerBtn ? 'disable-btn' : ''}`" />
      <menuButton tabindex="3" showText="完成" :clickFun="checkPath" :btnClass="`btn-green ${!registerBtn ? 'disable-btn' : ''}`" />
    </div>
    <transition-group name="addPath">
      <div class="input-path" :key="data.pathNum" v-for="(data,index) in pathList">
        <span class="flex-span">
          <p class="">显示路径</p>
          <input @click="removeShowErr" :keys="data.pathNum" :class="{'show-error':data.errorShow}" type="text" v-model="data.showPath" placeholder="" name="">
        </span>
        <span class="flex-span">
          <p>真实路径</p>
          <input @focus="removeRealErr" :keys="data.pathNum" :class="{'show-error':data.errorReal}" type="text" v-model="data.realPath" placeholder="" name="">
        </span>
        <div @click="deleteThis" :keys="data.pathNum" class="deleteThis" title="删除此条">
          <span class="iconfont icon-lajitong"></span>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
import menuButton from './menuButton';
export default {
  props: ["showErr", "localhost", "closeErr", "changeStep"],
  components: {
    menuButton
  },
  data() {
    return {
      registerBtn: true,
      pathList: []
    }
  },
  methods: {
    removeRealErr(e) {
      let key = e.target.getAttribute("keys")
      this.pathList.forEach((obj, i) => {
        if (obj.pathNum === parseInt(key)) {
          obj.errorReal = false
        }
      })
    },
    removeShowErr(e) {
      let key = e.target.getAttribute("keys")
      this.pathList.forEach((obj, i) => {
        if (obj.pathNum === parseInt(key)) {
          obj.errorShow = false
        }
      })
    },
    addPath() {
      if (this.registerBtn) {
        this.pathList.unshift({
          pathNum: new Date().getTime(),
          showPath: "",
          realPath: "",
          errorShow: false,
          errorReal: false
        })
      }
    },
    deleteThis(e) {
      let key = e.target.getAttribute("keys")
      if (this.pathList.length === 1) {
        this.showErr("至少保留一条路径")
      } else {
        this.pathList.forEach((obj, i) => {
          if (obj.pathNum === parseInt(key)) {
            this.pathList.splice(i, 1)
          }
        })
      }
    },
    checkPath() {
      if (this.registerBtn) {
        let checkOk = true;
        this.pathList.forEach(obj => {
          if (obj.showPath.length) {
            obj.errorShow = false
          } else {
            obj.errorShow = true
            checkOk = false
          }
          if (obj.realPath.length) {
            obj.errorReal = false
          } else {
            obj.errorReal = true
            checkOk = false
          }
        })
        if (checkOk) {
          this.closeErr()
          this.registerBtn = false
          this.axios.post(`${this.localhost}/initPath`, {
            data: this.pathList
          }).then(res => {
            console.log(res.data)
            if (res.data.status) {
              this.showErr("注册成功", "success")
              setTimeout(() => {
                history.replaceState("", "", location.href)
                location.reload()
              }, 2000)
            } else {
              this.registerBtn = true
              this.showErr(res.data.msg)
              res.data.errList.forEach(i => {
                this.pathList[i.num].errorShow = !!i.show
                this.pathList[i.num].errorReal = !!i.real
              })
            }
          }, err => {
            console.log("出错", err)
            this.registerBtn = true
          })
        } else {
          this.showErr("请检查填写内容")
        }
      }
    }
  },
  mounted() {
    console.log("aaa")
    this.pathList.unshift({
      pathNum: new Date().getTime(),
      showPath: "",
      realPath: "",
      errorShow: false,
      errorReal: false
    })
  }
}

</script>
<style scoped>
.select-path {
  margin: 0 auto;
  width: 800px;
  min-height: 100px;
  border-radius: 6px;
  border: solid 1px #d8dee4;
  padding: 20px;
  box-sizing: border-box;
  flex-direction: column;
  box-sizing: border-box;
}

.flex-span {
  width: 25%;
  float: left;
  height: 32px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.input-path .flex-span input {
  width: calc(100% - 72px);
}

.input-path .flex-span:nth-child(2) {
  width: 75%;
}

.input-path .flex-span:nth-child(2) input {
  width: calc(100% - 64px);
}

.flex-span p {
  font-size: 14px;
  margin: 0;
  color: #999999;
  white-space: nowrap;
  padding-right: 8px;
}

.login-field {
  display: block;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  margin-bottom: 7px;
  width: 100%;
}

.flex-span input {
  margin-bottom: 0;
}

.input-path {
  width: 758px;
  box-sizing: border-box;
  height: auto;
  overflow: hidden;
  position: relative;
  border-bottom: solid 1px #d8dee4;
  margin-bottom: 3px;
  padding: 8px 6px 6px;
}

.input-path .deleteThis {
  position: absolute;
  top: 8px;
  right: 0;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  background-color: #f6f8fa;
  /*border-radius: 6px 0 0 6px;*/
  border-radius: 6px;
  /*box-shadow: 0 0 3px rgba(0, 0, 0, 0.15);*/
  cursor: pointer;
  transition: all 300ms;
  border: solid 1px #d5d8da;
  /*border-right: none;*/
  color: #cf222e;
  transform: translateX(120%);
}

.input-path:hover .deleteThis {
  transform: translateX(-6px);
}

.input-path .flex-span:nth-child(2) input {
  transition: width 300ms, margin 300ms;
}

.input-path:hover .flex-span:nth-child(2) input {
  width: calc(100% - 103px);
}

.input-path .deleteThis:hover {
  color: #f6f8fa;
  background-color: #a40e26;
  border-color: #901125;
}

.input-path .deleteThis .iconfont {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: inherit;
  pointer-events: none;
}

.input-path hr {
  margin: 0;
  margin-top: 8px;
  margin-bottom: 8px;
  border: none;
  border-bottom: solid 1px #d8dee4;
}

/*  入场离场效果 */
.addPath-enter-active,
.addPath-leave-active,
.addPath-move {
  transition: all 300ms;
}

.addPath-enter,
.addPath-leave-to {
  transform: translateX(30%);
  opacity: 0;
}

.addPath-leave-active {
  position: absolute;
}

input {
  width: calc(100% - 64px);
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

input.show-error {
  border-color: #FF2828;
  outline: solid 3px #FF9393;
}

.button {
  margin-top: 10px;
  justify-content: center !important;
}

.top-option {
  width: 100%;
  margin-bottom: 20px;
}

</style>
