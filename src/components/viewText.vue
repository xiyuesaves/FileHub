<template>
  <pre v-text="showText" class="text-view">
  </pre>
</template>
<script>
import hljs from 'highlight.js'
export default {
  props: ["selectFile"],
  data() {
    return {
      showText: ""
    }
  },
  methods: {
    getRaw() {
      this.axios.get(`http://127.0.0.1:88/raw${window.location.pathname}${this.selectFile}`,{
      	// 阻止axios自动格式化json
      	transformResponse: (res) => {
            return res;
        }}).then(res => {
        this.showText = res.data
      })
    }
  },
  watch: {
    selectFile() {
      this.getRaw()
    }
  },
  mounted() {
    this.getRaw()
  }
}

</script>
<style scoped>
	.text-view{
		font-family: "Consolas","微软雅黑";
		font-size: 16px;
    box-sizing: border-box;
    line-height: 22px;
		padding: 8px;
		margin: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
	}
  .text-view::-webkit-scrollbar-button{
    display: none;
  }
  .text-view::-webkit-scrollbar-corner,
  .text-view::-webkit-scrollbar{
    width: 7px;
    height: 7px;
    background-color: #f1f1f1;
  }
  .text-view:hover:-webkit-scrollbar{
    width: 8px;
  }
  .text-view::-webkit-scrollbar-thumb{
    background-color: #d7dadd;
  }
  /*.text-view::-webkit-scrollbar-corner,
  .text-view::-webkit-scrollbar-track-piece{
    background-color: #dddddd;
  }*/

</style>
