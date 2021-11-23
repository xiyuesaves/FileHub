<template>
  <div class="download">
    <span class="iconfont file-icon icon-wenjian"></span>
    <p class="selFile">{{selectFile}}</p>
    <menuButton title="下载该文件" showText="下载" :clickFun="downloadThisFile" />
  </div>
</template>
<script>
import menuButton from "./menuButton"
export default {
  props: ["selectFile"],
  data() {
    return {

    }
  },
  components: {
    menuButton
  },
  methods: {
    downloadThisFile() {
      let tempa = document.createElement("a")
      // tempa.href = `${window.location.origin}/raw${window.location.pathname}${this.selectFile}`
      tempa.href = `http://127.0.0.1:88/raw${window.location.pathname}${this.selectFile}`
      tempa.style.display = `none`
      tempa.setAttribute("download", "")
      document.body.appendChild(tempa)
      tempa.click()
      tempa.remove()
    }
  }
}

</script>
<style scoped>
.download {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.file-icon {
  font-size: 52px;
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.selFile {
  color: #666666;
  margin-bottom: 60px !important;
  max-width: calc(100% - 60px);
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
