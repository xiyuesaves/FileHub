<template>
  <div class="main-box">
    <div class="box-head">
      <p class="view-text">错误</p>
      <div class="controls">
        <button @click="closeMask" class="btn iconfont icon-guanbi close"></button>
      </div>
    </div>
    <div class="content">
      <p class="view-text"> {{attrData.errText}} </p>
    </div>
  </div>
</template>
<script>
	export default{
		props:["closeMask","attrData"]
	}
</script>
<style scoped>


</style>
