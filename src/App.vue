<template>
  <div @scroll="fileListScroll" id="app">
    <!-- 文件预览 -->
    <popUps :formatSize="formatSize" :isOpen="showPreviewFile" @changeSelectFile="changeSelectFile" :maskContent="previewFile" :filePath="filePath" :fileLists="fileList" :selectFile="selectFile" :fileIcons="fileIcons" :closeMask="closePreviewFile" />
    <!-- 报错提醒 -->
    <warning :showWarn="showWarn" />
    <div class="main-view">
      <topTitle :title="title" />
      <actionBar :selectDrive="selectDrive" :rootList="rootList" :switchDirectory="switchDirectory" :createFolder="createFolder" :createFile="createFile" />
      <fileDirectory ref="fileDirectory" :formatSize="formatSize" :formatDate="formatDate" :fileIcons="fileIcons" :isLoad="loadFileList" :filePath="filePath" :fileList="fileList" :openFile="openFile" :getFileList="getFileList" />
    </div>
    <div class="tool-bar">
      <toolBar :statisticsList="fileList" :urlHref="url" />
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
    warning
  },
  data() {
    return {
      title: "测试页面", // 页面标题
      rootList: [], // 文件列表
      source: this.axios.CancelToken.source(),
      selectDrive: "--", // 选中根目录
      filePath: "加载中...", // 文件路径
      localhost: 'http://192.168.0.101:88', // 后台地址
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
    getrootList() {
      this.axios.get(`${this.localhost}/getrootList`).then(res => {
        console.log("已获取根目录", res)
        if (res.data.status == 'success') {
          this.rootList = res.data.data
          if (this.urlPath.includes(':/')) { // 判断根目录是否有效
            let urlLetter = `${this.urlPath.split(":/")[0]}:/`,
              inLoad = false
            history.replaceState({ lastPath: this.url }, "", encodeURI(this.url))
            for (var i = 0; i < this.rootList.length; i++) {
              if (this.rootList[i].rootPath === urlLetter) {
                this.selectDrive = urlLetter
                this.filePath = this.urlPath
                this.getFileList(this.filePath, () => {
                  let viewFile = new URLSearchParams(window.location.search.substring(1)) // 获取当前预览文件名
                  this.selectFile = viewFile.get("view")
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
          console.log("打开文件预览", `${this.filePath}${target.name}/`)
          let url = window.location
          let nosearchUrl = url.href.replace(url.search, "")
          history.pushState({ lastPath: url.href }, "", `${nosearchUrl}?view=${target.name}`)
          this.showPreview(target.name)
          break
      }
    },
    showPreview(name) {
      console.log("预览文件", name)
      this.showPreviewFile = true;
      this.selectFile = name;
    },
    changeSelectFile(fileName) {
      this.selectFile = fileName
    },
    newCancelToken() {
      this.source = this.axios.CancelToken.source()
      return this.source.token
    },
    getFileList(path, callback) {
      let encode = encodeURI(path),
        lastPath = this.filePath,
        lastFileList = this.fileList
      // 处理链接路径的错误
      if (path.substr(-1) !== "/") {
        console.log("链接末尾添加/")
        path += "/"
        history.replaceState({ lastPath: this.url }, "", encodeURI(`${this.urlHost}/${path}`))
        this.urlPath = path
      }
      if (/\/{2,}/.test(path)) {
        console.log("删除无意义/")
        path = path.replace(/\/{2,}/, "/")
        history.replaceState({ lastPath: `${this.urlHost}/${path}` }, "", encodeURI(`${this.urlHost}/${path}`))
        this.urlPath = path
      }
      if (this.loadFileList) {
        this.source.cancel('结束上一次请求');
      }
      // this.fileList = []
      // this.filePath = encode
      this.loadFileList = true
      console.log("获取路径内容", path)
      this.axios.get(`${this.localhost}/path/${encode}`, {
        cancelToken: this.newCancelToken()
      }).then(res => {
        this.filePath = path
        this.loadFileList = false
        console.log("请求结束", res.data)
        if (res.data.status === "success") {
          this.fileList = res.data.data
          console.log(this.urlPath, path)
          if (this.urlPath !== path) {
            if (!history.state) {
              console.log("重写当前地址")
              history.replaceState({ lastPath: `${this.urlHost}/${path}` }, "", encodeURI(`${this.urlHost}/${path}`))
            } else {
              console.log("前进地址")
              history.pushState({ lastPath: window.location.href }, "", encodeURI(`${this.urlHost}/${path}`))
            }
            this.urlPath = path
          } else {
            console.log("不修改路径")
          }
          this.url = window.location.href
          if (callback) { // 回调
            callback()
          }
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
      let viewFile = new URLSearchParams(decodeURI(window.location.search.substring(1)))
      console.log(viewFile.get("view"))
      if (viewFile.get("view") == null) {
        console.log("关闭窗口_重写路径")
        history.replaceState({ lastPath: this.url }, "", `${window.location.origin}${window.location.pathname}`)
      } else if (viewFile.get("view") !== null) {
        console.log("关闭窗口_新增路径")
        // let goBack = this.$cookies.get("openFileDeep") ? this.$cookies.get("openFileDeep") : 1
        // history.go(-goBack)
        history.pushState({ lastPath: window.location.href }, "", `${window.location.origin}${window.location.pathname}`)
      }
      // this.$cookies.remove("openFileDeep")
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
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    formatDate(time) { // 格式化时间
      let date = new Date(time);
      return `${date.getFullYear()}/${fullZero(date.getMonth()+1)}/${fullZero(date.getDay())} ${fullZero(date.getHours())}:${fullZero(date.getMinutes())}:${fullZero(date.getSeconds())}`

      function fullZero(num) {
        let str = "00" + num
        return str.slice(-2)
      }
    },
  },
  mounted() {
    this.getrootList() // 获取根目录
    window.addEventListener("scroll", this.fileListScroll, true) // 监听全局滚动事件
    window.addEventListener('popstate', (event) => { // 监听浏览器前进返回事件
      this.urlPath = decodeURI(window.location.pathname.substring(1)) // 获取文件路径
      let viewFile = new URLSearchParams(decodeURI(window.location.search.substring(1))) // 获取当前预览文件名
      this.selectFile = viewFile.get("view") // 传递给实例
      if (this.showPreviewFile && (this.selectFile === null || this.selectFile == false)) { // 如果窗口是打开的，而且没有预览文件，则关闭预览框
        this.closePreviewFile()
      } else if (!this.showPreviewFile && this.selectFile) { // 如果有选中文件，则唤起预览窗口
        this.showPreview(this.selectFile)
      }
      // 更新当前路径
      if (this.urlPath !== this.filePath) {
        this.getFileList(this.urlPath)
        let thisletter = `${this.urlPath.split(":/")[0]}:/`
        if (thisletter && this.selectDrive !== thisletter) {
          this.selectDrive = thisletter
        }
      }
    });
  }
}

</script>
<style>
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
