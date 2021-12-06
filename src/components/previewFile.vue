<template>
  <div :class="['main-box',{'full-box':isFullSize}]">
    <div class="box-head">
      <p class="view-text">文件预览</p>
      <div class="controls">
        <button :title="isFullSize ? '恢复' : '最大化'" @click="isFullSize = !isFullSize" :class="['btn','iconfont',{'icon-maximizezuidahua':!isFullSize,'icon-huanyuan':isFullSize}]"></button>
        <button title="关闭" @click="closeMask" class="btn iconfont icon-guanbi close"></button>
      </div>
    </div>
    <div class="content">
      <div class="preview-view">
        <download v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'defaultFile'" :selectFile="selectFile" />
        <images v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'image'" :selectFile="selectFile" />
        <viewText v-if="showPreviewPage(selectFile ? selectFile.split('.').pop() : '') === 'text'" :selectFile="selectFile" />
      </div>
      <div class="right-item">
        <div ref="fileListEl" @scroll="handleScroll" class="scroll-file-list">
          <div :style="`height: ${scrollH}px;`" class="scroll-box">
            <div @click="selectOther(file.name)" :style="`transform: translateY(${offsetY}px);`" v-for="(file,idnex) in realRender" v-if="file.type !== 'floder'" :class="['file-item',{'active':file.name === selectFile}]">
              <span :title="file.type" :class="['iconfont','file-icon', fileIcons(file.type)]"></span>
              <div class="file-detail">
                <span :title="file.name" class="file-name">
                  {{file.name}}
                </span>
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
import images from "./image"
import viewText from "./viewText"

export default {
  props: ["closeMask", "filePath", "fileLists", "selectFile", "fileIcons"],
  components: {
    download,
    images,
    viewText
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
    }
  },
  methods: {
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
      this.showNum = Math.floor(this.viewH / this.itemH) + 4;
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
      switch (fileName) {
        case "jpg":
        case "png":
        case "gif":
        case "webp":
        case "bmp":
          return "image" // 图片
          break
        case "mp4":
        case "avi":
          return "video" // 视频
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
        case "xml":
          return "text" // 可编辑文本图标
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
.file-item.active {
  background-color: #f6f8fa;
  color: #0969da;
}

.main-box {
  width: 1152px;
  max-width: 100%;
  height: 608px;
  transition: width 300ms, height 300ms;
}

.main-box.full-box {
  width: 100vw;
  height: 100vh;
}

.box-head {
  width: 100%;
  max-width: 100%;
  padding: 8px 16px;
  background-color: #f6f8fa;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px #d5d8da;
}

.view-text {
  margin: 0;
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
  height: calc(100% - 38px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.content .preview-view {
  box-sizing: border-box;
  width: calc(100% - 295px);
  height: 100%;
  /*padding: 16px;*/
  position: relative;
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
  /*padding: 16px;*/
  overflow: hidden;
  border-left: solid 1px #d5d8da;
}

.content .right-item .scroll-file-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
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
  border-bottom: solid 1px #d5d8da;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.file-item:nth-child(n + 10):last-child {
  /*border-bottom: none;*/
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
  justify-content: space-between;
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
  width: 100%;
}

.file-item .file-detail .file-size {
  width: 90px;
  text-align: right;
  color: #666666;
}

.file-item .file-detail .file-date {
  width: 170px;
  padding-left: 8px;
  text-align: right;
  box-sizing: border-box;
  color: #666666;
}

</style>
