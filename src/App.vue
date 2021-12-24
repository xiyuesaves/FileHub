<template>
  <div @scroll="fileListScroll" id="app">
    <!-- 报错提醒 -->
    <warning :showWarn="showWarn" />
    <div class="main-view">
      <topTitle :title="title" />
      <actionBar :selectDrive="selectDrive" :rootList="rootList" :switchDirectory="switchDirectory" :createFolder="createFolder" :createFile="createFile" />
      <fileDirectory v-show="!selectFile" ref="fileDirectory" :encode="encode" :decode="decode" :downloadThisFile="downloadThisFile" :formatSize="formatSize" :formatDate="formatDate" :fileIcons="fileIcons" :isLoad="loadFileList" :filePath="filePath" :fileList="fileList" :openFile="openFile" :getFileList="getFileList" />
      <!-- 文件预览 -->
      <previewFile :encode="encode" :decode="decode" :localhost="localhost" :newWran="newWran" v-show="selectFile" :changeSelectFile="changeSelectFile" :filePath="filePath" :fileLists="fileList" :selectFile="selectFile" :downloadThisFile="downloadThisFile" :fileIcons="fileIcons" :closeMask="closePreviewFile" :formatSize="formatSize" />
      <!-- <popUps v-if="selectFile" :formatSize="formatSize" :isOpen="showPreviewFile" @changeSelectFile="changeSelectFile" :maskContent="previewFile" :filePath="filePath" :fileLists="fileList" :selectFile="selectFile" :fileIcons="fileIcons" :closeMask="closePreviewFile" /> -->
    </div>
    <div class="tool-bar">
      <toolBar :downloadThisFile="downloadThisFile" :selectFile="selectFile" :statisticsList="fileList" :urlHref="url" />
    </div>
  </div>
</template>
<script>
import topTitle from './components/topTitle'
import actionBar from './components/actionBar'
import fileDirectory from './components/fileDirectory'
import toolBar from './components/toolBar'
import popUps from './components/popUps'
import error from './components/error'
import previewFile from './components/previewFile'
import warning from './components/warning'

export default {
  name: 'App',
  components: {
    topTitle,
    actionBar,
    fileDirectory,
    toolBar,
    popUps,
    warning,
    previewFile
  },
  data() {
    return {
      title: "测试页面", // 页面标题
      rootList: [], // 文件列表
      source: this.axios.CancelToken.source(),
      selectDrive: "--", // 选中根目录
      filePath: "加载中...", // 文件路径
      localhost: 'http://192.168.0.103:88', // 后台地址
      fileList: [], // 文件列表
      loadFileList: false,
      url: decodeURI(window.location.href),
      urlPath: decodeURI(window.location.pathname.replace(/\//, "")),
      urlHost: decodeURI(window.location.origin),
      selectFile: "",
      showWarn: [], // 错误提示数组
      showPreviewFile: false, // 文件预览窗口开关
      previewFile: previewFile, // 文件预览组件
      rarnKey: 0
    }
  },
  methods: {
    newWran(str) {
      this.rarnKey++
      this.showWarn.unshift({
        str: str,
        key: this.rarnKey
      })
      setTimeout(() => {
        this.showWarn.pop()
      }, 1500)
    },
    fileListScroll() {
      this.$refs.fileDirectory.handleScroll()
    },
    switchDirectory(rootPath) {
      console.log("切换到", rootPath)
      this.selectDrive = rootPath
      this.getFileList(rootPath)
    },
    createFile() {
      console.log("在此处创建文件", this.filePath)
    },
    createFolder() {
      console.log("在此处创建文件夹", this.filePath)
    },
    validRoot(path) { // 判断根目录是否有效
      for (var i = 0; i < this.rootList.length; i++) {
        if (this.rootList[i].rootPath === path) {
          return true;
        };
      };
      return false;
    },
    getrootList() {
      this.axios.get(`${this.localhost}/getRootList`).then(res => {
        console.log("已获取根目录", res)
        if (res.data.status == 'success') {
          this.rootList = res.data.data
          if (this.validRoot(this.urlPath.split("/")[0])) { // 判断根目录是否有效
            let urlLetter = this.urlPath.split("/")[0],
              inLoad = false
            history.replaceState({ lastPath: this.url }, "", encodeURI(this.url))
            for (var i = 0; i < this.rootList.length; i++) {
              if (this.rootList[i].rootPath === urlLetter) {
                this.selectDrive = urlLetter
                this.filePath = this.decode(this.urlPath);
                this.getFileList(this.filePath, () => {
                  this.selectFile = this.gerURLSearch();
                  if (this.selectFile) { // 如果有选中文件，则唤起预览窗口
                    console.log("唤起预览页面")
                    this.showPreview(this.selectFile)
                  }
                })
                inLoad = true
                break
              }
            }
            if (!inLoad) {
              this.selectDrive = this.rootList[0].rootPath
              this.getFileList(this.selectDrive)
            }
          } else {
            this.selectDrive = this.rootList[0].rootPath
            this.getFileList(this.selectDrive)
          }
        } else {
          console.log("重新获取")
          setTimeout(this.getrootList, 1500)
        }
      })
    },
    openFile(target) {
      switch (target.type) {
        case "floder":
          console.log("打开文件夹", `${this.filePath}${target.name}/`)
          this.getFileList(`${this.filePath}${target.name}/`)
          break
        default:
          let url = window.location
          let nosearchUrl = url.href.replace(url.search, "")
          console.log("打开文件预览", `${nosearchUrl}?view=${this.encode(target.name)}`)
          history.pushState({ lastPath: url.href }, "", `${nosearchUrl}?view=${this.encode(target.name)}`)
          this.showPreview(target.name)
          this.url = window.location.href
          break
      }
    },
    showPreview(name) {
      console.log("预览文件", name)
      this.showPreviewFile = true;
      this.selectFile = name;
    },
    changeSelectFile(fileName) {
      console.log("切换预览文件", name)
      this.url = window.location.href
      this.selectFile = fileName
    },
    newCancelToken() {
      this.source = this.axios.CancelToken.source()
      return this.source.token
    },
    encode(str) {
      if (str) {
        return str.replace(/%|#/g, str => {
          switch (str) {
            case "%":
              return "%25";
            case "#":
              return "%23";
            default:
              return str;
          }
        })
      } else {
        return str
      }
    },
    decode(str) {
      if (str) {
        return str.replace(/%25|%23/g, function(str) {
          switch (str) {
            case "%25":
              return "%"
            case "%23":
              return "#"
          }
        })
      } else {
        return str
      }
    },
    getFileList(path, callback) {
      let lastPath = this.filePath,
        lastFileList = this.fileList,
        replyPath = this.encode(path);
      // 处理链接路径的错误
      if (replyPath.substr(-1) !== "/") {
        console.log("链接末尾添加/")
        history.replaceState({ lastPath: window.location.href }, "", encodeURI(`${this.urlHost}/${replyPath}/`))
        this.urlPath = replyPath
      }
      if (this.loadFileList) {
        this.source.cancel('结束上一次请求');
      }
      this.loadFileList = true
      console.log("获取路径内容", replyPath)
      this.axios.post(`${this.localhost}/path`, {
        data: {
          path: replyPath
        }
      }).then(res => {
        this.filePath = replyPath
        this.loadFileList = false
        console.log("请求结束", res.data)
        if (res.data.status === "success") {
          this.fileList = res.data.data
          window.scrollTo(0, 0) // 请求成功后滚动到页面顶部
          console.log(this.urlPath, this.filePath)
          if (this.urlPath !== this.filePath) {
            if (!history.state) {
              console.log("重写当前地址")
              history.replaceState({ lastPath: window.location.href }, "", encodeURI(`${this.urlHost}/${replyPath}`))
            } else {
              console.log("前进地址")
              history.pushState({ lastPath: window.location.href }, "", encodeURI(`${this.urlHost}/${replyPath}`))
            }
            this.urlPath = replyPath
          } else {
            console.log("不修改路径")
          }
          this.url = window.location.href
          if (callback) { // 回调
            callback()
          }
          this.checkURL()
        } else {
          // this.fileList = lastFileList
          this.filePath = lastPath
          switch (res.data.error.code) {
            case "EPERM":
              console.log("没有权限")
              this.showMask = true
              this.maskContent = error
              this.newWran("没有访问权限")
              break
            case "ENOENT":
              console.log("路径不存在")
              this.showMask = true
              this.maskContent = error
              this.newWran("路径不存在")
              break
            default:
              console.log("未知错误:", res.data.error)
              this.showMask = true
              this.maskContent = error
              this.attrData = {
                errText: `未知错误:${res.data.error.code}`
              }
              break
          }
          console.log("请求文件出错", res.data.error.code)
        }
      }, err => {
        if (!err.message) {
          console.log("请求出错", err)
          this.showMask = true
          this.maskContent = error
          this.attrData = {
            errText: `网络故障`
          }
        } else {
          console.log(err)
        }
      })
    },
    closePreviewFile() { // 关闭预览窗口
      this.showPreviewFile = false;
      let viewFile = this.gerURLSearch();
      console.log("关闭预览窗口",viewFile)
      if (viewFile === "") {
        console.log("关闭窗口_重写路径")
        history.replaceState({ lastPath: this.url }, "", `${window.location.origin}${window.location.pathname}`)
      } else if (viewFile !== null) {
        console.log("关闭窗口_新增路径")
        history.pushState({ lastPath: window.location.href }, "", `${window.location.origin}${window.location.pathname}`)
      }
      this.selectFile = ""
    },
    fileIcons(type) {
      type = type.toLocaleLowerCase()
      switch (type) {
        case "floder":
          return "icon-wenjianjia" // 文件夹图标
          break
        case "jpg":
        case "png":
        case "gif":
        case "webp":
        case "ico":
        case "bmp":
          return "icon-tupian" // 图片图标
          break
        case "mp4":
        case "rmvb":
        case "avi":
        case "wmv":
        case "mpeg":
          return "icon-video" // 视频图标
          break
        case "mp3":
        case "flac":
          return "icon-music-note" // 音乐图标
          break
        case "txt":
        case "log":
        case "ini":
        case "js":
        case "ts":
        case "c":
        case "cpp":
        case "h":
        case "json":
        case "conf":
        case "html":
        case "css":
        case "bat":
        case "xml":
        case "cmd":
        case "md":
        case "ps1":
        case "sh":
          return "icon-24gl-fileText" // 可编辑文本图标
          break
        default:
          return "icon-wenjian" // 默认文件图标
      }
    },
    formatSize(bytes) { // 格式化文件大小
      if (bytes === 0) return '0 B';
      let k = 1024,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
      if (!sizes[i]) {
        return "未知大小"
      }
      return parseInt((bytes / Math.pow(k, i)).toPrecision(3)) + ' ' + sizes[i];
    },
    formatDate(time) { // 格式化时间
      let date = new Date(time);
      return `${date.getFullYear()}/${fullZero(date.getMonth()+1)}/${fullZero(date.getDay())} ${fullZero(date.getHours())}:${fullZero(date.getMinutes())}:${fullZero(date.getSeconds())}`

      function fullZero(num) {
        let str = "00" + num
        return str.slice(-2)
      }
    },
    gerURLSearch(){
      if (window.location.search === "") {
        return null;
      } else {
        return decodeURI(window.location.search.substring(6));
      };
    },
    checkURL() {
      this.url = window.location.href // 缩短路径
      this.urlPath = decodeURI(window.location.pathname.substring(1)) // 获取文件路径
      this.selectFile = this.gerURLSearch() // 传递给实例
      if (this.showPreviewFile && (this.selectFile === null || this.selectFile == false)) { // 如果窗口是打开的，而且没有预览文件，则关闭预览框
        this.closePreviewFile()
      } else if (!this.showPreviewFile && this.selectFile) { // 如果有选中文件，则唤起预览窗口
        this.showPreview(this.selectFile)
      }
      // 更新当前路径
      if (this.urlPath !== this.filePath) {
        this.getFileList(this.decode(this.urlPath))
        let thisletter = `${this.urlPath.split("/")[0]}`
        if (thisletter && this.selectDrive !== thisletter) {
          this.selectDrive = thisletter
        }
      }
    },
    downloadThisFile(selectFile) { // 文件下载方法
      selectFile = this.encode(selectFile || this.selectFile)
      let tempa = document.createElement("a")
      tempa.href = `${this.localhost}/download${window.location.pathname}${selectFile}`
      tempa.style.display = `none`
      tempa.setAttribute("download", "")
      document.body.appendChild(tempa)
      tempa.click()
      tempa.remove()
    },
  },
  mounted() {
    this.getrootList() // 获取根目录
    window.addEventListener("scroll", this.fileListScroll, true) // 监听全局滚动事件
    window.addEventListener('popstate', () => { // 监听浏览器前进返回事件
      this.checkURL()
    });
  }
}

</script>
<style>
.icon-wenjianjia:before {
  color: #54aeff;
}

.icon-yinle {
  font-size: 18px !important;
  line-height: 16px !important;
}

@font-face {
  font-family: "iconfont";
  src: url('./assets/iconfont.ttf?t=7784654652') format('truetype');
}

.iconfont {
  color: #666666;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI  Emoji";
}

button {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI  Emoji";
}

#app {
  min-height: 200px;
  max-width: 1216px;
  width: calc(100% - 48px);
  margin: 30px auto 30px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.main-view {
  width: calc(100% - 321px);
}

.tool-bar {
  width: 296px;
  height: 100%;
  min-height: 100px;
  margin-top: 16px;
}

.view-text {
  color: #333333;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
}

@media (max-width: 820px) {
  #app {
    width: calc(100% - 30px);
    display: block;
  }

  .main-view {
    width: 100%;
  }

  .tool-bar {
    width: 100%;
  }
}

</style>
