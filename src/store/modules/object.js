import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

    const state = {
        object: null,
        objectInfo:null,
        objectMaterial:null,
        objectGeometry:null,
        animation:null,
        objectURL:null 
    }

    const mutations = {
        OBJECT_SCENE(state,object){
            state.object = object
        },
        OBJECT_URL(state,objectURL){
            state.objectURL = objectURL
        },
        OBJECT_ANIMATION(state,object){
            state.animation = object
        },
        OBJECT_INFO(state,objectInfo){
            state.objectInfo = objectInfo
        },
        OBJECT_MATERIAL(state,objectMaterial){
            state.objectMaterial = objectMaterial
        },
        OBJECT_GEOMETRY(state,objectGeometry){
            state.objectGeometry = objectGeometry
        }

    }

    const actions = {

    }



export default {
    namespaced: true,
    state,
    // getters,
    actions,
    mutations
  }
