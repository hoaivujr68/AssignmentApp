import {
  ALL_GROUP_TEACHER, ALL_TEACHER,
  CREATE_TEACHER,
  FETCH_TEACHERS,
  UPDATE_TEACHER,
} from "./action.type";
import { SUCCESS } from "@/common/config"
import baseMixins from "../components/mixins/base"
import {SET_ALL_GROUP_TEACHERS, SET_ALL_TEACHERS, SET_TEACHERS} from "@/store/mutation.type";

const state = {
  teachers: [],
  allTeachers: []
}

const getters = {
  teachers(state) {
    return state.teachers
  },
  allTeachers(state) {
    return state.allTeachers
  },
}

const mutations = {
  [SET_TEACHERS] (state, payload) {
    state.teachers = payload
  },
  [SET_ALL_TEACHERS] (state, payload) {
    state.allTeachers = payload
  },
}

const actions = {
  [FETCH_TEACHERS] (context, params) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.getWithBigInt('/teacher/search', '', {params})
      if (response && response.data && response.status === SUCCESS) {
        context.commit(SET_TEACHERS, response.data)
        resolve(response.data)
      } else {
        resolve(null)
      }
    })
  },
  [CREATE_TEACHER](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/teacher/create', payload)
      resolve(response)
    })
  },
  [UPDATE_TEACHER](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/teacher/update', payload)
      resolve(response)
    })
  },
  [ALL_TEACHER] (context) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.getWithBigInt('/teacher/all', '', {})
      if (response && response.data && response.status === SUCCESS) {
        context.commit(SET_ALL_TEACHERS, response.data)
        resolve(response.data)
      } else {
        resolve(null)
      }
    })
  },
}
export default {
  state,
  getters,
  mutations,
  actions
}
