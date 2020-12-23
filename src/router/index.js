import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'
import Scene from '../components/Scene.vue'
import Scene2d from '../components/scene2d.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/Scene',
    name: 'Scene',
    component: Scene
  },
  {
    path: '/Scene2d',
    name: 'Scene2d',
    component: Scene2d
  },

]

const router = new VueRouter({
  routes
})

export default router
