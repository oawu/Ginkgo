import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      name: 'main',
      path: '/',
      meta: {
        title: '首頁'
      },
      component: () => import('@/View/Main/Main.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  window.document.title = to.meta.title + ' | ' + window.document.title
  next()
})

export default router
