<template>
  <p>{{text}}</p>
</template>
<script>
export default {
  props: ["closeMenu", "url", "isOpen"],
  data(){
  	return{
  		text:"复制中"
  	}
  },
  watch: {
    isOpen() {
      if (this.isOpen) {
        this.$copyText(this.url).then(e => {
          this.text = "复制成功"
        }, function(e) {
          this.text = "复制失败"
        })
        setTimeout(() => {
        	this.closeMenu()
        },500)
      }
    }
  }
}

</script>
<style scoped>
p {
  font-size: 14px;
  margin: 0;
  padding: 6px;
  display: block;
  width: 60px;
  text-align: center;
}
</style>
