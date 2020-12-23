import Vue from 'vue'
import Vuex from 'vuex'
import object from './modules/object'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    object,    
  }
})