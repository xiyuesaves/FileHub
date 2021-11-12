<template>
  <transition name="show">
    <div v-show="isOpen" class="top-mask">
      <div @click="closeMask" :class="['back-mask']">
      </div>
      <div class="center-box">
        <div class="show-content">
          <component v-on="$listeners" :closeMask="closeMask" v-bind="$attrs" :is="this.maskContent"></component>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: ["maskContent", "isOpen", "closeMask"],
  inheritAttrs: false, // 用于隐藏未被props接受的绑定数据
  methods: {}
}

</script>
<style>
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
  width: auto;
  height: auto;
  min-width: 50px;
  min-height: 50px;
  max-width: 100%;
  background-color: #ffffff;
  border-radius: 6px;
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

.top-mask .content {
  padding: 16px;
}

.top-mask .content p {
  text-align: center;
  font-weight: normal;
  margin: 16px 0;
}

.top-mask .box-head .btn {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-left: 8px;
}

</style>
