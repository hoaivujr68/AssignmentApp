import {
  CREATE_CLASS,
  FETCH_CLASSES,
  UPDATE_CLASS,
} from "./action.type";
import { SUCCESS } from "@/common/config"
import baseMixins from "../components/mixins/base"
import {SET_CLASSES} from "@/store/mutation.type";

const state = {
  classes: [],
}

const getters = {
  classes(state) {
    return state.classes
  },
}

const mutations = {
  [SET_CLASSES] (state, payload) {
    state.classes = payload
  },
}

const actions = {
  [FETCH_CLASSES] (context, params) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.getWithBigInt('/class/search', '', {params})
      if (response && response.data && response.status === SUCCESS) {
        context.commit(SET_CLASSES, response.data)
        resolve(response.data)
      } else {
        resolve(null)
      }
    })
  },
  [CREATE_CLASS](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/class/create', payload)
      resolve(response)
    })
  },
  [UPDATE_CLASS](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/class/update', payload)
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
