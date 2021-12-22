<template>
  <!-- 文件列表 -->
  <div class="file-directory">
    <div class="file-bread-bar">
      <div class="path-display">
        <span class="path-icon iconfont icon-orbit-full"></span>
        <span class="view-text file-path">
          <span :title="path" @click="gotoFolder(index)" v-for="(path,index) in pathArr">
            {{path}}
          </span>
        </span>
      </div>
      <div class="statistics">
        <span class="view-text">{{fileList.length}}</span> 个文件
      </div>
    </div>
    <div ref="fileListEl" :style="`height:${realViewH}px`" :class="['file-list',{loading:isLoad}]">
      <div @click="openFile(file)" @mouseenter="hoverFile = file.name" :style="`transform:translateY(${offsetY}px);`" v-for="(file,index) in realRender" :class="['file-item',{'hover-this':hoverFile == file.name}]">
        <span :title="file.type" :class="['iconfont','file-icon', fileIcons(file.type)]"></span>
        <div class="file-detail">
          <span :title="file.name" class="file-name">
            <p class="hover-color">{{file.name}}</p>
          </span>
          <span></span>
          <span :title="file.size+' Byte'" class="file-size">
            {{file.type !== "floder" ? formatSize(file.size) : ""}}
          </span>
          <span :title="new Date(file.date)" class="file-date">
            {{formatDate(file.date)}}
          </span>
        </div>
      </div>
      <div title="对，这里是空的" class="file-item no-file" v-if="fileList.length == 0">
        <!-- <p v-if="isLoad">加载中...</p> -->
        <!-- <p v-else>没有内容</p> -->
        <p>没有内容</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "fileDirectory",
  props: ["filePath", "fileList", "openFile", "getFileList", "isLoad", "fileIcons", "formatSize", "formatDate"],
  data() {
    return {
      activeIndex: -1,
      hoverFile: "",
      pathArr: this.filePath.split("/"),
      lastPath: "",
      realRender: [],
      scrollH: 0,
      showNum: 0,
      offsetY: 0,
      itemH: 38,
      viewH: this.fileList.length * 38 > window.screen.availHeight ? window.screen.availHeight : this.fileList.length * 38,
      realViewH: this.fileList.length * 38 - 1 >= 0 ? this.fileList.length * 38 - 1 : 0
    }
  },
  watch: {
    filePath() {
      this.pathArr = this.filePath.split("/")
    },
    fileList() {
      this.viewH = this.fileList.length * 38 > window.screen.availHeight ? window.screen.availHeight : this.fileList.length * 38;
      this.offsetY = 0;
      this.realViewH = this.fileList.length * 38 - 1 >= 0 ? this.fileList.length * 38 - 1 : 0;
      this.updateScroll();
    }
  },
  methods: {
    gotoFolder(path) {
      path++
      let newPath = ""
      for (var i = 0; i < path; i++) {
        newPath += this.pathArr[i] + "/"
      }
      console.log(newPath)
      this.getFileList(newPath)
    },
    handleScroll() {
      let scrollTop = (window.scrollY - this.$refs.fileListEl.offsetTop) < 0 ? 0 : window.scrollY - this.$refs.fileListEl.offsetTop; // 滚去的高度
      let scrollVal = scrollTop - (scrollTop % this.itemH)
      this.offsetY = scrollVal;
      this.realRender = this.fileList.slice(
        Math.floor(scrollTop / this.itemH),
        Math.floor(scrollTop / this.itemH) + this.showNum
      )
    },
    updateScroll() { // 初始化滚动参数
      this.scrollH = this.fileList.length * this.itemH;
      this.showNum = Math.floor(this.viewH / this.itemH) + 2;
      this.realRender = this.fileList.slice(0, this.showNum);
    }
  },
  mounted() {
    this.updateScroll()
  }
}

</script>
<style scoped>
/* 文件目录 */
.file-directory {
  width: 100%;
  min-height: 200px;
  height: 100%;
  overflow-y: auto;
  border-radius: 6px;
  box-sizing: border-box;
  border: solid 1px #d5d8da;
  overflow: hidden;
}

.no-file p {
  width: 100%;
  user-select: none;
  text-align: center;
  margin: 0;
  color: #57606a;
}

.file-directory .file-bread-bar {
  width: 100%;
  height: 47px;
  background-color: #f6f8fa;
  border-bottom: solid 1px #d5d8da;
  padding: 12px 16px 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-directory .file-bread-bar .path-display {
  width: calc(100% - 100px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.file-directory .file-bread-bar .path-display .path-icon {
  margin-right: 8px;
}

.file-directory .file-bread-bar .path-display .path-icon::before {
  font-size: 16px;
  display: inline-block;
  transform: rotateZ(45deg);
}

.file-directory .file-bread-bar .path-display .file-path {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-self: flex-start;
  width: calc(100% - 30px);
}

.file-directory .file-bread-bar .path-display .file-path span {
  display: block;
  width: auto;
  height: auto;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  min-width: 16px;
  user-select: none;
  position: relative;
  cursor: pointer;
}

.file-directory .file-bread-bar .path-display .file-path span:hover {
  color: #0969da;
}

.file-directory .file-bread-bar .path-display .file-path span:first-child:before {
  content: "";
  margin-right: 0;
}

.file-directory .file-bread-bar .path-display .file-path span::before {
  content: "/";
  color: #333333;
  margin-right: -4px;
  pointer-events: none;
}

.file-directory .file-bread-bar .path-display .file-path span:last-child {
  pointer-events: none;
}

.file-directory .file-bread-bar .statistics {
  font-size: 12px;
  font-weight: normal;
  user-select: none;
}

.file-directory .file-list {
  width: 100%;
  height: 100%;
  min-height: 189px;
}

.file-directory .file-list.loading {
  opacity: 0.5;
  pointer-events: none;
}

.file-directory .file-list .file-item {
  width: 100%;
  height: 38px;
  padding: 8px 16px;
  border-bottom: solid 1px #d5d8da;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.file-directory .file-list .file-item:last-child {
  margin-bottom: -1px;
}

/*.file-directory .file-list .file-item:hover {
  background-color: #f6f8fa;
}*/

.hover-this {
  background-color: #f6f8fa;
}

.file-directory .file-list .file-item .file-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 16px;
  /*font-size: 18px;*/
}

.file-directory .file-list .file-item .file-detail {
  width: calc(100% - 32px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-directory .file-list .file-item .file-detail span {
  font-size: 14px;
  font-weight: normal;
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.file-directory .file-list .file-item .file-detail .file-name {
  width: 82%;
}

.file-directory .file-list .file-item .file-detail .file-name .hover-color {
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

.file-directory .file-list .file-item .file-detail .file-name .hover-color:hover {
  color: #0969da;
  text-decoration: underline;
}

.file-directory .file-list .file-item .file-detail .file-size {
  width: 90px;
  text-align: right;
  color: #666666;
}

.file-directory .file-list .file-item .file-detail .file-date {
  width: 170px;
  padding-left: 8px;
  text-align: right;
  box-sizing: border-box;
  color: #666666;
}

@media (max-width: 820px) {
  .file-directory .file-list .file-item .file-detail .file-name .hover-color:hover {
    color: #000000;
    text-decoration: none;
  }
  .hover-this {
    background-color: #ffffff;
  }
}

@media (max-width: 480px) {
  .file-date {
    display: none !important;
  }
}

</style>
