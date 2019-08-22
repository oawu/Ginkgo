import Vue from 'vue'
import App from '@/View/App.vue'
import router from '@/Lib/Router.js'
import store from '@/Lib/Store.js'

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: (h) => h(App)
}).$mount('#app')
