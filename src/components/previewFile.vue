<template>
  <div :class="['main-box',{'full-box':isFullSize}]">
    <div class="box-head">
      <p class="view-text">文件预览</p>
      <div class="controls">
        <!-- <button :title="isFullSize ? '恢复' : '最大化'" @click="isFullSize = !isFullSize" :class="['btn','iconfont',{'icon-maximizezuidahua':!isFullSize,'icon-huanyuan':isFullSize}]"></button> -->
        <button title="关闭" @click="closeMask" class="btn iconfont icon-guanbi close"></button>
      </div>
    </div>
    <div class="content">
      <div :class="['preview-view',{'hidenItem':!showItem}]">
        <download :downloadThisFile="downloadThisFile" :fileIcons="fileIcons" v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'defaultFile'" :selectFile="selectFile" />
        <viewImage v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'image'" :selectFile="selectFile" />
        <viewText v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'text'" :selectFile="selectFile" />
        <viewVideo v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'video'" :showPreviewPage="showPreviewPage" :localhost="localhost" :selectFile="selectFile" />
        <viewAudio v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'music'" :localhost="localhost" :selectFile="selectFile" />
      </div>
      <div v-on:keydown.enter="switchSelectFile" :class="['right-item',{'hidenItem':!showItem}]">
        <div class="hidden-item" :title="showItem ? '隐藏侧边栏' : '展开侧边栏'" @click="hidenRightItem"></div>
        <div class="right-item-content">
          <div ref="fileListEl" @scroll="handleScroll" class="scroll-file-list">
            <div :style="`height: ${scrollH}px;`" class="scroll-box">
              <div @mousedown.left="selectOther(file.name)" :style="`transform: translateY(${offsetY}px);`" v-for="(file,idnex) in realRender" v-if="file.type !== 'floder'" :class="['file-item',{'active':file.name === selectFile}]">
                <span :title="file.type" :class="['iconfont','file-icon', fileIcons(file.type)]"></span>
                <div class="file-detail">
                  <span :title="file.name" class="file-name">
                    <p class="hover-color">{{file.name}}</p>
                  </span>
                  <span :title="`${file.size} Byte`" class="file-size">
                    {{formatSize(file.size)}}
                  </span>
                  <menuButton :clickFun="downloadThisFile" :title="`下载${file.name}`" icon="icon-xiazai" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import download from "./download"
import viewImage from "./viewImage"
import viewText from "./viewText"
import viewVideo from "./viewVideo"
import viewAudio from "./viewAudio"
import menuButton from "./menuButton"

export default {
  props: ["closeMask", "filePath", "fileLists", "selectFile", "fileIcons", "formatSize"],
  components: {
    download,
    viewImage,
    viewText,
    viewVideo,
    viewAudio,
    menuButton
  },
  data() {
    return {
      isFullSize: false,
      fileList: this.filterFile(this.fileLists, "all"),
      realRender: [],
      viewH: window.screen.availHeight,
      itemH: 38,
      scrollH: 0,
      offsetY: 0,
      showNum: 0,
      loadingView: true,
      source: this.axios.CancelToken.source(),
      localhost: this.$parent.localhost,
      showItem: true
    }
  },
  methods: {
    downloadThisFile() {
      let tempa = document.createElement("a")
      tempa.href = `${this.localhost}/download${window.location.pathname}${this.selectFile}`
      tempa.style.display = `none`
      tempa.setAttribute("download", "")
      document.body.appendChild(tempa)
      tempa.click()
      tempa.remove()
    },
    switchSelectFile(event) {
      console.log(event)
    },
    hidenRightItem() {
      console.log("隐藏侧边栏")
      this.showItem = !this.showItem
    },
    filterFile(arr, type) {
      let newArr = []
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].type === type || (type === "all" && arr[i].type !== "floder")) {
          newArr.push(arr[i])
        }
      }
      return newArr
    },
    selectOther(fileName) {
      if (fileName !== this.selectFile) {
        this.$emit("changeSelectFile", fileName)
        let url = window.location
        history.pushState({ lastPath: url.href }, "", url.href.replace(/\?view=.+$/, `?view=${fileName}`))
      }
    },
    handleScroll(e) {
      this.showNum = Math.floor(this.viewH / this.itemH) + 1;
      let scrollTop = e.target.scrollTop; // 滚去的高度
      let scrollVal = scrollTop - (scrollTop % this.itemH)
      this.offsetY = scrollVal;
      this.realRender = this.fileList.slice(
        Math.floor(scrollTop / this.itemH),
        Math.floor(scrollTop / this.itemH) + this.showNum
      )
    },
    initView() {
      this.scrollH = this.itemH * this.fileList.length;
      this.showNum = Math.floor(this.viewH / this.itemH) + 1;
      this.realRender = this.fileList.slice(0, this.showNum);
      setTimeout(() => {
        this.scrollToFile();
      });
    },
    scrollToFile() {
      for (var i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i].name === this.selectFile) {
          let scrollToPoint = i * this.itemH,
            thisscrollTop = this.$refs.fileListEl.scrollTop,
            thisHeight = this.$refs.fileListEl.clientHeight
          if (thisscrollTop > scrollToPoint || (thisscrollTop + thisHeight) < scrollToPoint) { // 只有当选中项不在可见范围才进行滚动
            this.$refs.fileListEl.scrollTo({ top: i * this.itemH, behavior: "smooth" })
          }
          break
        }
      }
    },
    showPreviewPage(fileName) {
      fileName = fileName.toLocaleLowerCase()
      switch (fileName) {
        case "jpg":
        case "png":
        case "gif":
        case "webp":
        case "bmp":
        case "ico":
          return "image" // 图片
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
        case "cmd":
        case "ps1":
        case "xml":
        case "sh":
        case "md":
          return "text" // 可编辑文本图标
          break
        case "mp4":
          return "video" // 视频
          break
        case "mp3":
        case "flac":
          return "music" // 视频
          break
        default:
          return "defaultFile" // 默认文件图标
      }
    }
  },
  watch: {
    fileLists() {
      this.fileList = this.filterFile(this.fileLists, "all")
      this.initView()
    },
    selectFile() {
      this.scrollToFile()
    }
  },
  mounted() {
    this.initView()
  }
}

</script>
<style scoped>
.button.only-icon {
  padding: 0;
  height: 28px;
  width: 28px;
  opacity: 0;
}

.file-item:hover .button.only-icon {
  opacity: 1;
}

.file-item.active {
  background-color: #f6f8fa;
  color: #0969da;
}

.main-box {
  border: solid 1px #d5d8da;
  border-radius: 6px;
  width: 1152px;
  overflow: hidden;
  max-width: 100%;
  height: 607px;
  transition: width 300ms, height 300ms;
}

.main-box.full-box {
  width: 100vw;
  height: 100vh;
}

.box-head {
  width: 100%;
  max-width: 100%;
  padding: 12px 16px;
  background-color: #f6f8fa;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px #d5d8da;
}

.view-text {
  margin: 0;
  user-select: none;
}

.iconfont {
  font-size: 16px;
}

.iconfont:hover {
  color: #0969da;
}

.content {
  box-sizing: border-box;
  padding: 0;
  height: calc(100% - 46px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.content .preview-view {
  box-sizing: border-box;
  width: calc(100% - 295px);
  height: 100%;
  position: relative;
  transition: width 300ms;
  overflow: hidden;
}

.content .preview-view.hidenItem {
  width: 100%;
}

.content .loading-view {
  position: absolute;
  width: 100%;
  font-size: 32px;
  color: #dadada;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  background-color: #ffffff;
}

.content .right-item {
  box-sizing: border-box;
  height: 100%;
  width: 296px;
  position: relative;
  border-left: solid 1px #d5d8da;
  transition: width 300ms;
}

.content .right-item .right-item-content {
  width: 296px;
  height: 100%;
}

.content .right-item.hidenItem {
  width: 0px;
  border-left: none;
}

.content .right-item .scroll-file-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.content .right-item .scroll-file-list::-webkit-scrollbar {
  width: 7px;
  background-color: #f1f1f1;
}

.content .right-item .scroll-file-list::-webkit-scrollbar-button {
  display: none;
}

.content .right-item .scroll-file-list::-webkit-scrollbar-thumb {
  background-color: #d7dadd;
}

.content .right-item.hidenItem .hidden-item {
  pointer-events: auto;
  transform: rotateY(180deg);
  left: -10px;
  transition: opacity 300ms 1s;
}

.content .right-item.hidenItem .hidden-item:hover {
  transition: opacity 300ms 0s;
  opacity: 1;
}

.content .right-item .hidden-item {
  position: absolute;
  width: 10px;
  height: 60px;
  top: calc(50% - 30px);
  left: 0;
  z-index: 10;
  /*background-color: #f8f8f8;*/
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  /*transform: rotateY(180deg);*/
  /*left: -10px;*/
  transition: opacity 300ms;
}

.content .right-item:hover .hidden-item {
  pointer-events: auto;
  opacity: 1;
}

.content .right-item .hidden-item::after {
  content: "";
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  width: 10px;
  height: 60px;
  background-color: #f8f8f8;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.08);
  border: solid 1px #dfdfdf;
  border-left: none;
  border-right: solid 2px #dfdfdf;
  border-radius: 0 4px 4px 0;
  transform: perspective(10px) rotateY(10deg);
}

.content .right-item .hidden-item::before {
  content: "";
  position: absolute;
  display: block;
  z-index: 20;
  width: 8px;
  left: -4px;
  top: calc(50% - 4px);
  box-shadow: 2px -2px 0 #858D93A1;
  transform: rotateZ(45deg);
  height: 8px;
  /*background-color: red;*/
}

.scroll-box {
  width: 100%;
  height: auto;
}

.btn {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.file-item {
  width: 100%;
  height: 38px;
  padding: 8px 16px;
  padding-right: 8px;
  border-bottom: solid 1px #d5d8da;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.file-item:hover {
  background-color: #f6f8fa;
}

.file-item .file-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 10px;
  font-size: 14px;
  line-height: 18px;
}

.file-item .file-detail {
  width: calc(100% - 32px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.file-item .file-detail span {
  font-size: 14px;
  font-weight: normal;
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.file-item .file-detail .file-name {
  width: calc(100% - 28px - 60px);
}

.file-item .file-detail .file-name .hover-color {
  margin: 0;
  float: left;
  cursor: pointer;
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  max-width: 100%;
}

.file-item .file-detail .file-name .hover-color:hover {
  color: #0969da;
  text-decoration: underline;
}

.file-item .file-detail .file-size {
  width: 50px;
  font-size: 12px;
  text-align: right;
  color: #999999;
  margin-right: 10px;
}

.file-item .file-detail .file-date {
  width: 170px;
  padding-left: 8px;
  text-align: right;
  box-sizing: border-box;
  color: #999999;
}

@media (max-width: 990px) {
  .right-item {
    /*display: none;*/
    width: 0!important;
    border-left: none!important;
  }

  .content .preview-view {
    width: 100%;
  }
}

</style>
