<template>
  <div>
    <div class="tool-box">
      <p class="title-text">功能</p>
      <div class="copy-link-box">
        <input class="input-style copy-link" :style="{width: isShow ? `calc(100% - 105px)` : ''}" type="" :value="urlHref" name="">
        <menuButton v-show="isShow" title="下载" align="center" icon="icon-xiazai" :clickFun="downloadThisFile" />
        <menuButton title="复制链接" align="center" icon="icon-fuzhi" :menuContent="copy" :url="urlHref" />
        <menuButton title="显示二维码" :url="urlHref" :menuContent="QrCode" align="right" icon="icon-erweima" />
      </div>
    </div>
    <div class="tool-box">
      <p class="title-text">同步</p>
      <textarea class="edit-area input-style" @focus="isFocus = true" @blur="isFocus = false" v-model="syncMessages" placeholder="记点什么..."></textarea>
    </div>
    <div class="tool-box" v-if="sliders.length">
      <p class="title-text">统计</p>
      <div class="progress">
        <span v-for="slider in sliders" :style="{background:slider.color,width:slider.width+'%'}" :title="slider.num +' '+slider.type" class="slider"></span>
      </div>
      <ul class="type-list">
        <li v-for="slider in sliders">
          <span class="point" :style="{background: slider.color}"></span>
          <p class="file-type" :title="slider.type">{{slider.type}}</p>
          <p class="file-number" :title="slider.num">{{slider.width}}%</p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import menuButton from "./menuButton"
import QrCode from "./QrCode"
import copy from "./copy"
import md5 from 'js-md5'
import { io } from "socket.io-client"

export default {
  props: ["statisticsList", "urlHref", "selectFile", "downloadThisFile", "localhost", "userId"],
  data() {
    return {
      sliders: [],
      isShow: false,
      copy: copy,
      QrCode: QrCode,
      syncMessages: "",
      isFocus: false,
      io: io,
      socket: null,
      debounceFun: null
    }
  },
  components: {
    menuButton
  },
  watch: {
    statisticsList: "updateData",
    selectFile: "showDownloadbtn",
    userId: "contentSocket",
    syncMessages: "sendMessages"
  },
  methods: {
    updateData() {
      let statisticsData = [],
        totalNum = 0,
        isExisted = false
      for (var i = 0; i < this.statisticsList.length; i++) {
        totalNum++
        isExisted = false
        for (var j = 0; j < statisticsData.length; j++) {
          if (statisticsData[j].type === this.statisticsList[i].type) {
            statisticsData[j].num++
            isExisted = true
          }
        }
        if (!isExisted) {
          statisticsData.push({
            type: this.statisticsList[i].type,
            num: 1
          })
        }
      }
      for (var i = 0; i < statisticsData.length; i++) {
        statisticsData[i].color = getColor(statisticsData[i].type)
        statisticsData[i].width = (statisticsData[i].num / totalNum * 100).toFixed(2)
      }

      function hashCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        console.log(hash.toString(16))
        return hash.toString(16);
      }

      function getColor(type) {
        switch (type) {
          case "floder":
            return "#f5eee6"
            break;
          case "image":
            return "#d0e8f2"
            break
          case "file":
            return "#79a3b1"
            break
          case "video":
            return "#456268"
            break
          default:
            return '#' + md5(type).substr(3, 6);
        }
      }
      this.sliders = statisticsData
    },
    showDownloadbtn() {
      if (this.selectFile) {
        this.isShow = true
      } else {
        this.isShow = false
      }
    },
    contentSocket() {
      if (this.userId) {
        this.socket = io(`${this.localhost}`, {
          withCredentials: true
        })
        this.socket.on("connect", () => {
          console.log("socket连接成功,请求初始数据")
          this.socket.emit("getMessage")
        })
        this.socket.on("newMessage", (data) => {
          console.log("新消息数据", data)
          this.syncMessages = data;
        })
      }
    },
    sendMessages() {
      if (this.socket && this.isFocus) {
        this.socket.emit("updateMessage",this.syncMessages)
      }
    }
  },
  mounted() {
    this.canvas = document.getElementById('qrCode')
    this.updateData()
  }
}

</script>
<style scoped>
.type-list {
  width: 100%;
  min-height: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.type-list li {
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
  height: 18px;
}

.type-list li:hover .file-number {
  color: #0969da;
}

.type-list li p {
  margin: 0;
  font-size: 12px;
  height: 18px;
}

.type-list li .file-type {
  font-weight: 600;
  color: #333333;
  margin-right: 4px;
  max-width: calc(100% - 40px - 16px);
  overflow: hidden;
  word-wrap: normal;
  display: block;
  text-overflow: ellipsis;
}

.type-list li .file-number {
  max-width: 55px;
  color: #57606a;
}

.type-list .point {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 4px;
  /*background-color: red;*/
  border-radius: 4px;
}

.tool-box {
  width: 100%;
  min-height: 10px;
  padding: 24px 0;
  border-bottom: solid 1px #d8dee4;
}

.tool-box:last-child {
  border-bottom: none;
}

.tool-box .title-text {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}

.input-style {

  width: 100%;
  box-sizing: border-box;
  outline: none;
  padding: 8px;
  border-radius: 6px;
  border: solid 1px #d5d8da;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI  Emoji";
  font-size: 15px;
  letter-spacing: 1px;
  transition: box-shadow 300ms;
}

.input-style:focus {
  box-shadow: rgb(140 149 159 / 20%) 0px 8px 24px;
}

.copy-link-box {
  width: 100%;
  height: 32px;
  /*margin-bottom: 24px;*/
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copy-link {
  width: calc(100% - 70px);
  height: 32px;
}

.tool-box .edit-area {
  min-height: 130px;
  resize: none;
}

.canvas-box {
  width: 100%;
  height: auto;
  padding: 0 15%;
  box-sizing: border-box;
}

.rectangle {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
}

.rectangle canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 6px;
  box-sizing: border-box;
  border: solid 1px #d5d8da;
}

.progress {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition: width 300ms;
  margin-bottom: 8px;
}

.slider {
  width: 50%;
  height: 100%;
  background-color: #7FC9FF;
  display: block;
  box-sizing: border-box;
  /*border-right: solid 2px #ffffff;*/
}

.slider:last-child {
  border-right: none;
}

</style>
