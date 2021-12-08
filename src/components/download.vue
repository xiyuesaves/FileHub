<template>
  <div class="download">
    <span :class="['iconfont','file-icon',fileIcons(selectFile ? selectFile.split('.').pop() : '')]"></span>
    <p class="selFile">{{selectFile}}</p>
    <menuButton title="下载该文件" showText="下载" :clickFun="downloadThisFile" />
  </div>
</template>
<script>
import menuButton from "./menuButton"
export default {
  props: ["selectFile","fileIcons","downloadThisFile"],
  data() {
    return {}
  },
  components: {
    menuButton
  },
  methods: {
    
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
