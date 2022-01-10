<template>
  <div class="top-mask">
    <div @click="closeSettings" :class="['back-mask']">
    </div>
    <div class="center-box">
      <div class="show-content">
        <div class="file-bread-bar">
          <div class="path-display">
            <span class="view-text file-path">
              设置
            </span>
          </div>
          <div class="statistics">
            <span @click="closeSettings" class="path-icon iconfont icon-guanbi"></span>
          </div>
        </div>
        <div class="spaces">
          <ul class="left-item">
            <li class="active">路径管理</li>
            <li>用户管理</li>
            <li>其他</li>
          </ul>
          <div class="content">
          	<div class="path">
          		<selectPath />
          	</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import selectPath from './selectPath';
export default {
  props: [],
  data() {
    return {

    }
  },
  components:{
	selectPath
  },
  methods: {
    closeMask() {

    }
  }
}

</script>
<style scoped>
.show-enter-active,
.show-leave-active {
  pointer-events: auto;
  transition: opacity 150ms;
}

.show-enter,
.show-leave-to {
  pointer-events: none;
  opacity: 0;
}

.top-mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.top-mask .back-mask {
  background-color: rgba(27, 31, 36, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.top-mask .center-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  min-width: 10px;
  min-height: 10px;
  max-width: 100%;
  z-index: 10;
}

.top-mask .show-content {
  overflow: hidden;
  width: 700px;
  height: 500px;
  min-width: 50px;
  min-height: 50px;
  max-height: 100vh;
  max-width: 100%;
  background-color: #ffffff;
  border-radius: 6px;
  box-sizing: border-box;
  border: solid 1px #d5d8da;
  box-shadow: 0 0 18px rgb(0 0 0 / 15%);

}

.box-head {
  width: 446px;
  max-width: 100%;
  padding: 8px 16px;
  background-color: #f6f8fa;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px #d5d8da;
}

.top-mask .box-head .view-text {
  margin: 0;
}

.top-mask .box-head .iconfont {
  font-size: 16px;
}

.top-mask .box-head .iconfont:hover {
  color: #0969da;
}

.top-mask .box-head .btn {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-left: 8px;
}



.top-mask .file-bread-bar {
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

.top-mask .file-bread-bar .path-display {
  width: calc(100% - 100px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.path-icon {
  cursor: pointer;
}

.top-mask .file-bread-bar .path-display .file-path {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-self: flex-start;
  width: calc(100% - 30px);
}

.top-mask .file-bread-bar .path-display .file-path span {
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

.top-mask .file-bread-bar .path-display .file-path span:hover {
  color: #0969da;
}

.top-mask .file-bread-bar .path-display .file-path span:first-child:before {
  content: "";
  margin-right: 0;
}

.top-mask .file-bread-bar .path-display .file-path span::before {
  content: "/";
  color: #333333;
  margin-right: -4px;
  pointer-events: none;
}

.top-mask .file-bread-bar .path-display .file-path span:last-child {
  pointer-events: none;
}

.top-mask .file-bread-bar .statistics {
  font-size: 12px;
  font-weight: normal;
  user-select: none;
}

.spaces {
  width: 100%;
  height: calc(100% - 47px);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.spaces .left-item{
	padding: 0;
	margin: 0;
	height: 100%;
	width: 180px;
	box-sizing: border-box;
	border-right: solid 1px #d0d7de;
}

.spaces .left-item li{
	padding: 12px 16px;
	cursor: pointer;
	font-size: 14px;
	background-color: #f6f8fa;
	border-bottom: solid 1px #d8dee4;
}
.spaces .left-item li:hover{
	background-color: #f0f3f6;
}
.spaces .left-item li.active{
	background-color: #ffffff;
	border-left: solid 2px #fd8c73;
	text-indent: -2px;
}
.spaces .content{
	width: calc(100% - 200px);
	height: 100%;
}

.spaces .content .path{
	width: 100%;
	height: 100%;
}

</style>
