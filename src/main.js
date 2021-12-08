// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import VueResource from 'vue-resource'
import VueClipboard from 'vue-clipboard2'
import App from './App'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'
import Video from 'video.js'

import './assets/iconfont.css'
import 'video.js/dist/video-js.css'

Vue.prototype.$video = Video
Vue.use(VueCookies);
Vue.use(VueAxios, axios);
Vue.use(VueClipboard);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
