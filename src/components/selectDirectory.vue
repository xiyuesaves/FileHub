<template>
  <div class="box-size">
    <header class="menu-header">
      <span class="view-text menu-title">
        选择目录
      </span>
    </header>
    <div class="menu-content">
      <div class="drive-list">
        <!-- 循环输出磁盘列表 -->
        <div v-for="(drive,index) in rootList" class="drive-item" :key="drive.rootPath" @click.stop="selectedDisk(drive.rootPath)">
          <span :class="['iconfont','icon-gougou',drive.rootPath == selectDrive ? '' : 'hide']"></span>
          <span :title="drive.name" class="view-text drive-name">
            <!-- {{drive.name}} -->
            {{drive.rootPath}}
          </span>
          <!-- <span class="drive-letter view-text">
          </span> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["rootList", "selectDrive", "switchDirectory", "closeMenu"],
  data() {
    return {}
  },
  methods: {
    selectedDisk(letter) {
      this.switchDirectory(letter)
      this.closeMenu()
    }
  }
}

</script>
<style scoped>
  
.box-size {
  width: 220px;
  min-height: 60px;
  overflow: hidden;
}

.menu-header {
  padding: 7px 7px 7px 16px;
  width: 100%;
  height: 34px;
  box-sizing: border-box;
  border-bottom: solid 1px #d8dee4;
}

.menu-header .menu-title {
  font-size: 14px;
  color: #24292f;
  float: left;
  user-select: none;
}

.menu-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: auto;
}

/*  磁盘列表 */
.drive-list {
  width: 100%;
  min-height: 10px;
  padding: 4px 0;
}

.drive-item {
  width: 100%;
  height: 35px;
  padding: 7px 7px 7px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}

.drive-item:hover {
  background-color: #f4f6f8;
}

.drive-item .iconfont {
  margin-right: 6px;
}

.drive-item .hide.iconfont {
  opacity: 0;
}

.drive-item .drive-name {
  display: inline-block;
  font-weight: normal;
  font-size: 13px;
  line-height: 16px;
  width: 176px;
  /*margin-right: 10px;*/
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.drive-item .drive-letter {
  font-size: 12px;
  line-height: 16px;
  border-radius: 10px;
  border: solid 1px #d5d8da;
  padding: 0 8px;
  user-select: none;
}

</style>
