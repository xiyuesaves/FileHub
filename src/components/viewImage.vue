<template>
  <div class="img-view">
    <img :src="`http://127.0.0.1:88/raw${Dwindow.location.pathname}${selectFile}`">
  </div>
</template>
<script>
export default {
  props: ["selectFile"],
  data() {
    return {
      Dwindow: window
    }
  }
}

</script>
<style scoped>
.img-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-sizing: border-box;
}

img {
  max-width: 100%;
  max-height: 100%;
}

</style>
