<template>
  <div class="top-warning">
    <transition-group name="show">
        <div :style="`z-index: -${index};`" :key="warnText.key" v-for="(warnText , index) in showWarn" class="show-warning">
          <p>{{warnText.str}}</p>
        </div>
    </transition-group>
  </div>
</template>
<script>
export default {
  props: ["showWarn"],
  data() {
    return {}
  },
  methods: {},
}

</script>
<style scoped>
.show-enter-active,
.show-leave-active,
.show-move {
  transition: all 300ms;
}

.show-enter,
.show-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.show-leave-active{
  left: 50%;
  transform: translateX(-50%) translateY(-30px);
  position: absolute;
}

.top-warning {
  position: fixed;
  top: 0;
  left: 0;
  height: 30px;
  pointer-events: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  z-index: 2000;
}

.show-warning {
  font-size: 14px;
  color: #636363;
  padding: 0 20px;
  width: auto;
  min-width: 200px;
  max-width: 100%;
  box-sizing: border-box;
  height: 36px;
  line-height: 30px;
  border-radius:6px;
  padding-top: 6px;
  border: solid 1px #eed888;
  border-top: none;
  background-color: #fff8c5;
  box-shadow: rgb(140 149 159 / 40%) 0px 4px 24px;
  margin-top: -6px;
  position: relative;
}

.show-warning p {
  margin: 0;
  display: block;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
}

</style>
