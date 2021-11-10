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
        <div class="image">
        </div>
        <div class="video">
        </div>
        <div class="text">
        </div>
        <div class="audio">
        </div>
      </div>
      <div class="file-list">
        <div class="scroll-box">
          <div @click="selectOther(file.name)" v-for="(file,idnex) in attrData.fileList" v-if="file.type !== 'floder'" :class="['file-item',{'active':file.name === selectFile}]">
            <span :title="file.type" class="iconfont file-icon icon-wenjian"></span>
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
</template>
<script>
export default {
  props: ["closeMask", "attrData"],
  data() {
    return {
      isFullSize: false,
      selectFile: this.attrData.selectFile
    }
  },
  methods: {
    selectOther(fileName) {
      this.selectFile = fileName
      let url = window.location
      history.pushState({ lastPath: url.href }, "", url.href.replace(/\?view=.+$/,`?view=${this.selectFile}`))
    }
  },
  watch: {
    'attrData.selectFile'() {
      this.selectFile = this.attrData.selectFile
    }
  },
  mounted() {
    console.log(this.attrData)
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
  width: 100%;
  height: 100%;
  padding: 16px;
}

.content .file-list {
  box-sizing: border-box;
  height: 100%;
  min-width: 296px;
  /*padding: 16px;*/
  overflow-y: auto;
  border-left: solid 1px #d5d8da;
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
  border-bottom: none;
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

.scroll-box {
  width: 100%;
  height: auto;
}

</style>
