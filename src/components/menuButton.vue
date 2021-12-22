<template>
  <div v-if="menuContent" :class="['menu-btn','hiden-menu-button',{showMenu:isOpen}]">
    <div :class="['mask',{'show-mask':isOpen}]" @click.self="closeMenu()"></div>
    <button :title="title" @click="openMenuFun()" :class="['button',btnClass,{'only-icon':!showText}]">
      <span v-if="icon" :class="['icon','iconfont',icon]"></span>
      <span v-if="showText" class="view-text">{{showText}}</span>
      <span v-if="arrow" class="arrow"></span>
    </button>
    <div :class="['menu-view',align ? align : '']">
      <div class="menu-box">
        <component :closeMenu="closeMenu" v-bind="$attrs" :is="this.menuContent" :isOpen="isOpen"></component>
      </div>
    </div>
  </div>
  <button :title="title" v-else :class="['menu-btn','button',btnClass,{'only-icon':!showText}]" @click.stop="clickFunction">
    <span v-if="icon" :class="['icon','iconfont',icon]"></span>
    <span v-if="showText" class="view-text">{{showText}}</span>
    <span v-if="arrow" class="arrow"></span>
  </button>
</template>
<script>
export default {
  props: ["icon", "showText", "arrow", "clickFun", "menuContent", "align", "btnClass", "title"],
  data() {
    return {
      isOpen: false,
    }
  },
  inheritAttrs: false,
  methods: {
    clickFunction(e){
      if (this.clickFun) {
        this.clickFun()
      }
    },
    closeMenu() {
      // 关闭菜单
      this.isOpen = false
    },
    openMenuFun() {
      // 打开菜单
      this.isOpen = true
    }
  }
}

</script>
<style scoped>
/*遮罩*/
.mask {
  position: fixed;
  z-index: 900;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.show-mask {
  pointer-events: auto;
}

/*按钮隐藏菜单*/
.hiden-menu-button {
  height: auto;
  width: auto;
  position: relative;
}



.menu-view {
  min-width: 10px;
  min-height: 10px;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: transform 150ms, opacity 150ms;
  transform: translateY(-10px);
}

.menu-view.right {
  left: auto;
  right: 0;
}

.showMenu .menu-view {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0px);
}

.menu-view.center {
  left: 50%;
  transform: translateY(-10px) translateX(-50%);
}

.showMenu .menu-view.center {
  left: 50%;
  transform: translateY(0px) translateX(-50%);
}

.menu-box {
  background-color: #ffffff;
  border-radius: 6px;
  border: solid 1px #d5d8da;
  margin: 8px 0 8px;
  box-shadow: rgba(140, 149, 159, 0.2) 0px 8px 24px;
}

/*按钮*/
.button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  max-width: 300px;
  vertical-align: top;
  padding: 5px 16px;
  box-sizing: border-box;
  height: 32px;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: solid 1px #d5d8da;
  user-select: none;
  cursor: pointer;
  position: relative;
}

.button .view-text {
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
  white-space: nowrap;
}

.button::before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 200ms;
  background-color: #000000;
  pointer-events: none;
}

.button:hover:before {
  opacity: 0.03;
}

.button:active:before {
  opacity: 0.08;
}

.btn-green {
  background-color: #2da44e;
}

.btn-green span {
  color: #ffffff;
  border-top-color: rgba(255, 255, 255, 0.8);
}

.arrow {
  display: inline-block;
  width: 0px;
  height: 0px;
  margin-left: 8px;
  margin-top: 7px;
  border: solid 4px transparent;
  border-top: solid 4px #333333;
}

.icon {
  color: #666666;
  margin-right: 4px;
}

.only-icon {
  width: 32px;
  padding: 5px 0;
}

.only-icon * {
  width: 100%;
  text-align: center;
  margin-right: 0;
}

</style>
