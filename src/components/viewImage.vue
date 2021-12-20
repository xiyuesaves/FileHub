<template>
  <div ref="imgView" class="img-view">
    <div ref="imgEl" class="transform-box">
      <img :src="imageSrc">
    </div>
    <div class="controls">
      <div title="重置操作" @click="refresh" class="reset iconfont icon-reset"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["imageSrc"],
  data() {
    return {
      prevTranslateMap: { // 记录 Translate 的坐标值
        x: 0,
        y: 0
      },
      zoomDom: null, // 选中元素
      parentEl: null, // 父级元素
      elWidth: 0, // 元素初始宽高
      elHeight: 0, // 元素初始宽高
      mx: 0, // 记录鼠标按下时的 x 坐标
      my: 0, // 记录鼠标按下时的 y 坐标
      tLeft: 0, // 最后设置的 translateX 值
      tTop: 0, // 最后设置的 translateY 值
      newsetWidth: 0, // 拖动容器最新的宽度
      newsetHeight: 0, // 拖动容器最新的高度
      firstMoveFlag: false, // 第一次移动标记，防止用户第一次按下和松开鼠标但并未移动，第二次移动时 dom 出现闪现的情况
      scale: 1, // 初始缩放值
      zoomOption: { // 配置项
        interval: 1.1, // 每次缩放步幅
        minScale: 0.1, // 缩放最小值
        maxScale: 50, // 缩放最大值
        slopOver: true, // 是否可以移出元素
        disabledZoom: false, // 禁用缩放
        disabledDrag: false // 禁用拖拽
      }
    }
  },
  methods: {
    refresh() { // 重置属性
      this.scale = 1;
      this.prevTranslateMap = { // 记录 Translate 的坐标值
        x: 0,
        y: 0
      }
      this.zoomDom.style.transition = "all 300ms"
      this.zoomDom.style.transform = `translate(0px, 0px) scale(${this.scale})`;
      setTimeout(() => {
        this.zoomDom.style.transition = "all 0ms"
      })
    },
    init() { // 初始化
      // 判断是否启用缩放
      !this.zoomOption.disabledZoom && this.$refs.imgView.addEventListener('mousewheel', ev => {
          this.elWidth = this.parentEl.getBoundingClientRect().width; // 获取初始元素宽高
          this.elHeight = this.parentEl.getBoundingClientRect().height; // 获取初始元素宽高
          const isZoomOut = ev.deltaY < 0; // 缩小
          // 鼠标坐标
          const { x: mouseX, y: mouseY } = ev;
          // 元素当前宽高
          const { height, width } = this.zoomDom.getBoundingClientRect();
          const { top: pTop, left: pLeft } = this.parentEl.getBoundingClientRect()
          if (!isZoomOut) {
            // 缩小
            this.scale = this.scale * Math.pow(this.zoomOption.interval, -1.1);
            if (this.zoomOption.minScale && this.scale < this.zoomOption.minScale) {
              this.scale = this.zoomOption.minScale
            }
          } else {
            // 放大
            this.scale = this.scale * Math.pow(this.zoomOption.interval, 1.1);
            if (this.zoomOption.maxScale && this.scale > this.zoomOption.maxScale) {
              this.scale = this.zoomOption.maxScale
            }
          }
          // 获取比例
          let yScale = (mouseY - pTop - this.prevTranslateMap.y) / height;
          let xScale = (mouseX - pLeft - this.prevTranslateMap.x) / width;
          // 放大后的宽高
          const ampWidth = this.elWidth * this.scale
          const ampHeight = this.elHeight * this.scale
          // 需要重新运算的 translate 坐标
          const y = yScale * (ampHeight - height)
          const x = xScale * (ampWidth - width)
          // 更新
          const translateY = this.prevTranslateMap.y - y
          const translateX = this.prevTranslateMap.x - x
          this.zoomDom.style.transform = `translate(${translateX}px, ${translateY}px) scale(${this.scale})`;
          // 记录这次的值
          this.prevTranslateMap = {
            x: translateX,
            y: translateY
          }
          // 阻止默认事件
          ev.preventDefault()
        })

        // 鼠标按下去
        !this.zoomOption.disabledDrag && this.$refs.imgView.addEventListener('mousedown', ev => {
          this.mx = ev.x;
          this.my = ev.y;
          const clientRect = this.zoomDom.getBoundingClientRect()
          this.newsetWidth = clientRect.width
          this.newsetHeight = clientRect.height
          // 鼠标移动
          document.addEventListener('mousemove', this.mousemove);
          // 鼠标松开
          document.addEventListener('mouseup', this.mouseup);
          // 页面失焦
          document.addEventListener('blur', this.mouseup);
        });
    },
    mousemove(ev) {
      this.firstMoveFlag = true
      this.tTop = this.prevTranslateMap.y + (ev.y - this.my)
      this.tLeft = this.prevTranslateMap.x + (ev.x - this.mx)
      if (!this.zoomOption.slopOver) {
        if (this.tTop < 0) this.tTop = 0
        if (this.tLeft < 0) this.tLeft = 0
        const rightBoundary = this.parentEl.offsetWidth - this.newsetWidth // 右边边界
        const bottomBoundary = this.parentEl.offsetHeight - this.newsetHeight // 下边边界
        if (this.tTop > bottomBoundary) this.tTop = bottomBoundary
        if (this.tLeft > rightBoundary) this.tLeft = rightBoundary
      }
      // 设置样式
      this.zoomDom.style.cssText += `transform: translate(${this.tLeft}px, ${this.tTop}px) scale(${this.scale})`;
    },
    mouseup() {
      if (this.firstMoveFlag) {
        this.prevTranslateMap = {
          x: this.tLeft,
          y: this.tTop
        }
      }
      document.removeEventListener('mousemove', this.mousemove);
      document.removeEventListener('mouseup', this.mouseup);
      document.removeEventListener('blur', this.mouseup);
    }
  },
  watch: {
    imageSrc() {
      this.refresh()
    }
  },
  mounted(e) {
    // 初始化变量
    this.zoomDom = this.$refs.imgEl; // 获取缩放元素
    this.zoomDom.style.transformOrigin = "0 0"; // 初始化变形中心点为左上角
    this.parentEl = this.zoomDom.parentElement; // 获取元素父级
    this.elWidth = this.parentEl.getBoundingClientRect().width; // 获取初始元素宽高
    this.elHeight = this.parentEl.getBoundingClientRect().height; // 获取初始元素宽高
    // 初始化
    this.init();
    this.refresh();
  }
}

</script>
<style scoped>
.img-view {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  user-select: none;
  background-color: #dfdfdf;
}

.transform-box {
  width: 100%;
  height: 100%;
  /*padding: 8px;*/
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

img {
  max-width: 100%;
  max-height: 100%;
  pointer-events: none;
}

.controls {
  top: 0;
  right: 0;
  height: 28px;
  min-width: 28px;
  position: absolute;
  background-color: rgba(223, 223, 223, 0.9);
  border-radius: 0 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.controls .iconfont {
  width: 28px;
  height: 28px;
  line-height: 28px;
  cursor: pointer;
  text-align: center;
}

.controls .full-size {
  font-size: 18px;
  line-height: 26px;
}

.controls .reset {
  font-size: 22px;
}

.controls .iconfont:active {
  background-color: rgba(190, 190, 190, .9);
}

</style>
