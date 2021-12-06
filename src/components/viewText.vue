<template>
  <pre v-html="showText" class="text-view">
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
        // hljs.highlightAuto(res.data).value
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
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
	}
</style>
