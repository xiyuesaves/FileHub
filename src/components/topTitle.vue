<template>
  <span class="top-title">
    <p class="view-text">{{title}}</p>
    <span class="cursor"></span>
  </span>
</template>
<script>
    export default{
        name: 'topTitle',
        props: ['title']
    }
</script>
<style scoped>
    /*  顶部标题 */
.top-title {
    display: block;
    width: 100%;
    height: 20px;
    margin-bottom: 20px;
}

.top-title p {
    float: left;
    margin: 0;
    font-size: 18px;
    line-height: 20px;
}

.cursor {
    display: inline-block;
    width: 10px;
    height: 12px;
    border-top: solid 4px transparent;
    border-bottom: solid 4px #333333;
    margin-left: 4px;
    animation-name: flash;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;

}

@keyframes flash {
    0% {
        opacity: 0;
    }

    49% {
        opacity: 0;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 1;
    }
}
</style>