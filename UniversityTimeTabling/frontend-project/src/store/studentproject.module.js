import {
  CREATE_STUDENT_PROJECT,
  FETCH_STUDENT_PROJECTS,
  UPDATE_STUDENT_PROJECT,
} from "./action.type";
import { SUCCESS } from "@/common/config"
import baseMixins from "../components/mixins/base"
import {SET_STUDENT_PROJECTS} from "@/store/mutation.type";

const state = {
  studentProjects: [],
}

const getters = {
  studentProjects(state) {
    return state.studentProjects
  },
}

const mutations = {
  [SET_STUDENT_PROJECTS] (state, payload) {
    state.studentProjects = payload
  },
}

const actions = {
  [FETCH_STUDENT_PROJECTS] (context, params) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.getWithBigInt('/student-project/search', '', {params})
      if (response && response.data && response.status === SUCCESS) {
        context.commit(SET_STUDENT_PROJECTS, response.data)
        resolve(response.data)
      } else {
        resolve(null)
      }
    })
  },
  [CREATE_STUDENT_PROJECT](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/student-project/create', payload)
      resolve(response)
    })
  },
  [UPDATE_STUDENT_PROJECT](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/student-project/update', payload)
      resolve(response)
    })
  },
}
export default {
  state,
  getters,
  mutations,
  actions
}
