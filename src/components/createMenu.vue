<template>
  <div class="menu-content">
    <div class="create-list">
      <div @click="_createFile()" class="create-item">
        <span class="view-text">创建文件</span>
      </div>
      <div @click="_createFolder()" class="create-item">
        <span class="view-text">创建文件夹</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props:["closeMenu","createFile","createFolder"],
  data() {
    return {}
  },
  methods:{
    _createFile(){
      this.createFile()
      this.closeMenu()
    },
    _createFolder(){
      this.createFolder()
      this.closeMenu()
    }
  }
}

</script>
<style scoped>
.menu-content {
  position: relative;
  z-index: 10;
  width: 160px;
  height: auto;
  user-select: none;
  min-height: 60px;
}

.menu-content::before {
  content: "";
  width: 10px;
  height: 10px;
  background-color: #ffffff;
  transform: rotateZ(45deg);
  top: -6px;
  right: 15px;
  position: absolute;
  border: solid 1px #d5d8da;
  border-right-color: transparent;
  border-bottom-color: transparent;
}

.create-list {
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: 10px;
  padding: 4px 0;
}

.create-item {
  width: 100%;
  padding: 4px 7px 4px 16px;
  box-sizing: border-box;
  cursor: pointer;
}

.create-item:hover {
  background-color: #0969da;
}

.create-item:hover .view-text {
  color: #ffffff;
}

.create-item .view-text {
  font-size: 13px;
  font-weight: normal;
}
</style>
