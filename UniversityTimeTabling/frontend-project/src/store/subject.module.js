import {
  CREATE_SUBJECT,
  FETCH_SUBJECTS,
  UPDATE_SUBJECT,
} from "./action.type";
import { SUCCESS } from "@/common/config"
import baseMixins from "../components/mixins/base"
import {SET_SUBJECTS} from "@/store/mutation.type";

const state = {
  subjects: [],
}

const getters = {
  subjects(state) {
    return state.subjects
  },
}

const mutations = {
  [SET_SUBJECTS] (state, payload) {
    state.subjects = payload
  },
}

const actions = {
  [FETCH_SUBJECTS] (context, params) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.getWithBigInt('/subject/search', '', {params})
      if (response && response.data && response.status === SUCCESS) {
        context.commit(SET_SUBJECTS, response.data)
        resolve(response.data)
      } else {
        resolve(null)
      }
    })
  },
  [CREATE_SUBJECT](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/subject/create', payload)
      resolve(response)
    })
  },
  [UPDATE_SUBJECT](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/subject/update', payload)
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
