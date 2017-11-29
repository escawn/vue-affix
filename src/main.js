// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Demo from './Demo'
import xcui from 'xcui'
import 'xcui/lib/xcui.css'
Vue.use(xcui)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<Demo/>',
  components: { Demo }
})
