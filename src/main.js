// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import VueResource from 'vue-resource'
import VueClipboard from 'vue-clipboard2'
import App from './App'
import axios from 'axios'
import VueAxios from 'vue-axios'

import VueVideoPlayer from 'vue-video-player'

import 'video.js/dist/video-js.css'
import './assets/iconfont.css'

axios.defaults.withCredentials = true; // 设置axios跨域

Vue.use(VueVideoPlayer);
Vue.use(VueAxios, axios);
Vue.use(VueClipboard);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
