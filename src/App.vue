<template>
  <div @scroll="fileListScroll" id="app">
    <!-- 文件预览 -->
    <popUps :isOpen="showPreviewFile" @changeSelectFile="changeSelectFile" :maskContent="previewFile" :filePath="filePath" :fileLists="fileList" :selectFile="selectFile" :closeMask="closePreviewFile" />
    <!-- 报错提醒 -->
    <warning :showWarn="showWarn" />
    <div class="main-view">
      <topTitle :title="title" />
      <actionBar :driveList="driveList" :selectDrive="selectDrive" :switchDirectory="switchDirectory" :createFolder="createFolder" :createFile="createFile" />
      <fileDirectory ref="fileDirectory" :isLoad="loadFileList" :filePath="filePath" :fileList="fileList" :openFile="openFile" :getFileList="getFileList" />
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


var localhost = 'http://127.0.0.1:88'

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
      driveList: [], // 文件列表
      source: this.axios.CancelToken.source(),
      selectDrive: "--", // 选中根目录
      filePath: "加载中...", // 文件路径
      fileList: [], // 文件列表
      loadFileList: false,
      url: decodeURI(window.location.href),
      urlPath: decodeURI(window.location.pathname.replace(/\//, "")),
      urlHost: window.location.origin,
      selectFile: "",
      showWarn: [], // 错误提示数组
      showPreviewFile: false, // 文件预览窗口开关
      previewFile: previewFile, // 文件预览组件
      soo:0
    }
  },
  methods: {
    newWran(str) {
      this.soo++
      this.showWarn.unshift({
        str:str,
        key:this.soo
      })
      setTimeout(() => {
        this.showWarn.pop()
      },1500)
    },
    fileListScroll() {
      this.$refs.fileDirectory.handleScroll()
    },
    switchDirectory(driveLetter) {
      console.log("切换到", driveLetter)
      this.selectDrive = driveLetter
      this.getFileList(driveLetter)
    },
    createFile() {
      console.log("在此处创建文件", this.filePath)
    },
    createFolder() {
      console.log("在此处创建文件夹", this.filePath)
    },
    getRootList() {
      this.axios.get(`${localhost}/getDriveList`).then(res => {
        console.log("已获取根目录", res)
        if (res.data.status == 'success') {
          this.driveList = res.data.data
          if (this.urlPath.includes(':/')) { // 判断根目录是否有效
            let urlLetter = `${this.urlPath.split(":/")[0]}:/`,
              inLoad = false
            history.replaceState({ lastPath: this.url }, "", this.url)
            for (var i = 0; i < this.driveList.length; i++) {
              if (this.driveList[i].driveLetter === urlLetter) {
                this.selectDrive = urlLetter
                this.filePath = this.urlPath
                this.getFileList(this.filePath, () => {
                  let viewFile = new URLSearchParams(decodeURI(window.location.search.substring(1))) // 获取当前预览文件名
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
              this.selectDrive = this.driveList[0].driveLetter
              this.getFileList(this.selectDrive)
            }
          } else {
            this.selectDrive = this.driveList[0].driveLetter
            this.getFileList(this.selectDrive)
          }
        } else {
          console.log("重新获取")
          setTimeout(this.getRootList, 1500)
        }
      })
    },
    openFile(target) {
      switch (target.type) {
        case "floder":
          console.log("打开文件夹", target.name)
          this.getFileList(`${this.filePath}${target.name}/`)
          break
        default:
          let url = window.location
          let nosearchUrl = url.href.replace(url.search, "")
          history.pushState({ lastPath: url.href }, "", `${nosearchUrl}?view=${target.name}`)
          this.showPreview(target.name)
          break
      }
    },
    showPreview(name) {
      console.log("预览文件")
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
        history.replaceState({ lastPath: this.url }, "", `${this.urlHost}/${path}`)
        this.urlPath = path
      }
      if (/\/{2,}/.test(path)) {
        console.log("删除无意义/")
        path = path.replace(/\/{2,}/, "/")
        history.replaceState({ lastPath: `${this.urlHost}/${path}` }, "", `${this.urlHost}/${path}`)
        this.urlPath = path
      }
      if (this.loadFileList) {
        this.source.cancel('结束上一次请求');
      }
      // this.fileList = []
      this.filePath = path
      this.loadFileList = true
      this.axios.get(`${localhost}/path/${encode}`, {
        cancelToken: this.newCancelToken()
      }).then(res => {
        this.loadFileList = false
        console.log("获取路径内容", path)
        console.log("请求结束", res.data)
        if (res.data.status === "success") {
          this.fileList = res.data.data
          if (this.urlPath !== path) {
            if (!history.state) {
              console.log("重写当前地址")
              history.replaceState({ lastPath: `${this.urlHost}/${path}` }, "", `${this.urlHost}/${path}`)
            } else {
              console.log("前进地址")
              history.pushState({ lastPath: window.location.href }, "", `${this.urlHost}/${path}`)
            }
            this.urlPath = path
          }
          this.url = window.location.href
          if (callback) { // 回调
            callback()
          }
        } else {
          this.filePath = lastPath
          this.fileList = lastFileList
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
      if (viewFile.get("view") == false) {
        history.replaceState({ lastPath: this.url }, "", `${window.location.origin}${window.location.pathname}`)
      } else if (viewFile.get("view") !== null) {
        history.pushState({ lastPath: window.location.href }, "", `${window.location.origin}${window.location.pathname}`)
      }
    }
  },
  mounted() {
    this.getRootList() // 获取根目录
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
