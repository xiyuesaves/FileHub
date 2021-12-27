<template>
  <div class="text-view-content">
    <div v-if="showLine" class="for-box">
      <span class="line-number-bg" :style="{width:`${lineNW}px`}"></span>
      <p :tabindex="index" class="text-view-line" v-for="(textLine, index) in showTextArr">
        <span class="text-view-line-number-bg" :style="{width:`${lineNW}px`}"></span>
        <span v-text="index" :style="{width:`${lineNW}px`}" class="line-number"></span>
        <pre v-text="textLine" :style="{width:`calc(100% - ${lineNW}px - 6px)`}" class="text-view"></pre>
      </p>
    </div>
    <pre v-else v-text="showText" class="text-view text-view-line"></pre>
  </div>
</template>
<script>
export default {
  props: ["rawLink", "newWran"],
  data() {
    return {
      lineNW: 60,
      showTextArr: [""],
      showText: "",
      showLine: false,
      localhost: this.$parent.localhost
    }
  },
  methods: {
    getRaw() {
      this.axios.get(this.rawLink, {
        // 阻止axios自动格式化json
        transformResponse: (res) => {
          return res;
        }
      }).then(res => {
        this.showText = res.data
        this.showTextArr = res.data.split("\n")
        if (this.showTextArr.length > 1000) { // 行数过多时只展示内容不进行处理
          this.showLine = false;
        } else {
          this.showLine = true;
        }
      }).catch(error => {
        console.log("出错",error)
        this.newWran("请求预览文件失败")
      });
    }
  },
  watch: {
    rawLink() {
      this.getRaw()
    }
  },
  mounted() {
    this.getRaw()
  }
}

</script>
<style scoped>
/* 主元素 */
.text-view-content {
  font-family: "Consolas", "微软雅黑";
  font-size: 16px;
  box-sizing: border-box;
  line-height: 22px;
  margin: 0;
  width: 100%;
  overflow: auto;
  height: calc(607px - 46px);
  position: relative;
}

.text-view-content .line-number-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  min-width: 24px;
  background-color: #F9F9FA;
  z-index: -1;
}

/* 显示行 */
.text-view-content .text-view-line {
  position: relative;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.text-view-content .text-view-line:focus .line-number {
  color: #8A8F93;
}

.text-view-content .text-view-line:focus .text-view-line-number-bg {
  background-color: #f0f1f2;
}

/* 行数字 */
.text-view-content .text-view-line .line-number {
  text-align: center;
  user-select: none;
  /*background-color: #f6f8fa;*/
  color: #AEB0B1;
  display: inline-block;
  height: 100%;
}

/* 行背景 */
.text-view-content .text-view-line .text-view-line-number-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  min-width: 24px;
  background-color: #F9F9FA;
  z-index: -1;
}

/* 文本内容 */
.text-view-content .text-view {
  font-family: "Consolas", "微软雅黑";
  margin: 0;
  line-height: 22px;
}

@media (max-width: 630px) {
  .text-view-content {
    height: calc(507px - 46px);
  }
}

/*滚动条样式*/
.text-view-content::-webkit-scrollbar-button {
  display: none;
}

.text-view-content::-webkit-scrollbar-corner,
.text-view-content::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  background-color: #f1f1f1;
}

.text-view-content:hover:-webkit-scrollbar {
  width: 8px;
}

.text-view-content::-webkit-scrollbar-thumb {
  background-color: #d7dadd;
}

.text-view-content::selection {
  background: #0969da;
  color: #ffffff;
}

</style>
