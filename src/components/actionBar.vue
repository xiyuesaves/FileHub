<template>
  <!-- 顶部工具栏 -->
  <div class="action-bar">
    <div class="float-left">
      <!-- 选择根目录按钮 -->
      <menuButton icon="icon-cipanbaohu" :showText="selectDrive" arrow="true" :menuContent="selectDirectory" :selectDrive="selectDrive" :rootList="rootList" v-bind="$attrs"/>
      <div class="drive-number">
        <span class="iconfont icon-cipanbaohu"></span>
        <span class="view-text">{{rootList.length}}</span>
        <!-- <span class="norm-text">目录</span> -->
      </div>
    </div>
    <div class="float-right">
      <!-- <menuButton showText="编辑" :clickFun="edit" v-bind="$attrs"/> -->
      <menuButton showText="创建" arrow="true" :menuContent="createMenu" align="right" v-bind="$attrs"/>
      <menuButton showText="上传" btnClass="btn-green" :clickFun="upload" v-bind="$attrs"/>
    </div>
  </div>
</template>
<script>
import menuButton from "./menuButton"
import selectDirectory from "./selectDirectory"
import createMenu from "./createMenu"
export default {
  name: "actionBar",
  props: ["rootList", "selectDrive"],
  data() {
    return {
      selectDirectory: selectDirectory,
      createMenu: createMenu
    }
  },
  components: {
    menuButton
  },
  methods: {
    edit(){

    },
    upload(){}
  }
}

</script>
<style scoped>
/*菜单栏*/
.mask {
  position: fixed;
  z-index: 900;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.mask.show {
  pointer-events: auto;
}

.action-bar {
  width: 100%;
  min-height: 32px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-bar .float-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.action-bar .drive-number {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 8px;
}

.action-bar .drive-number .iconfont {
  margin-right: 4px;
}

.action-bar .drive-number .view-text {
  margin-right: 4px;
}

.action-bar .drive-number .norm-text {
  font-size: 13px;
  font-weight: 400;
}

.action-bar .float-right>* {
  margin: 0;
  margin-left: 8px;
  float: left;
}

.action-bar .float-right .view-text {
  letter-spacing: 2px;
}


</style>
