<template>
  <div @scroll="fileListScroll" id="app">
    <popUps :isOpen="showMask" @changeSelectFile="changeSelectFile" :initComponent="initComponent" :isTransparent="maskTransparent" :maskContent="maskContent" :attrData="attrData" :closeMask="closeMask" />
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

var localhost = 'http://127.0.0.1:88'

export default {
  name: 'App',
  components: {
    topTitle,
    actionBar,
    fileDirectory,
    toolBar,
    popUps
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
      showMask: false,
      maskTransparent: false,
      maskContent: null,
      selectFile: "",
      attrData: {} // 遮罩层数据
    }
  },
  methods: {
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
          console.log(this.urlPath)
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
      this.showMask = true;
      this.maskContent = previewFile;
      this.selectFile = name;
      this.attrData = {
        filePath: this.filePath,
        fileList: this.fileList,
        selectFile: this.selectFile
      };
    },
    changeSelectFile(fileName){
      this.selectFile = fileName
    },
    initComponent() { //初始化弹窗组件
      this.maskContent = null
      this.attrData = {}
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
        history.replaceState({ lastPath: `${this.urlHost}/${path}` }, "", `${this.urlHost}/${path}`)
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
      this.fileList = []
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
              console.log("没有权限", history.state)
              this.showMask = true
              this.maskContent = error
              this.attrData = {
                errText: "没有访问权限"
              }
              break
            case "ENOENT":
              console.log("路径不存在", history.state)
              this.showMask = true
              this.maskContent = error
              this.attrData = {
                errText: "路径不存在"
              }
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
    closeMask() {
      this.showMask = false;
      if (this.maskContent === previewFile) {
        history.pushState({ lastPath: window.location.href }, "", `${window.location.origin}${window.location.pathname}`)
      }
    }
  },
  watch: {
    selectFile() {
      this.$set(this.attrData, "selectFile", this.selectFile)
    }
  },
  mounted() {
    this.getRootList() // 获取根目录
    window.addEventListener("scroll", this.fileListScroll, true) // 监听全局滚动事件
    window.addEventListener('popstate', (event) => { // 监听浏览器前进返回事件
      this.urlPath = decodeURI(window.location.pathname.substring(1)) // 获取文件路径
      let viewFile = new URLSearchParams(decodeURI(window.location.search.substring(1))) // 获取当前预览文件名
      this.selectFile = viewFile.get("view") // 传递给实例
      if (this.showMask && (this.selectFile === null || this.selectFile == false)) { // 如果窗口是打开的，而且没有预览文件，则关闭预览框
        this.showMask = false
      } else if (!this.showMask && this.selectFile) { // 如果有选中文件，则唤起预览窗口
        console.log("唤起预览页面")
        this.showPreview(this.selectFile)
      }
      if (this.urlPath !== this.filePath) {
        this.getFileList(this.urlPath)
        let thisletter = `${this.urlPath.split(":/")[0]}:/`
        if (thisletter && this.selectDrive !== thisletter) {
          this.selectDrive = thisletter
        }
      } else {
        console.log("跳过刷新")
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
