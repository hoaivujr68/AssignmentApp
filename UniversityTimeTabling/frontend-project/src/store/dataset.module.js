import {
  CREATE_DATASET,
  FETCH_DATASETS,
  UPDATE_DATASET,
} from "./action.type";
import { SUCCESS } from "@/common/config"
import baseMixins from "../components/mixins/base"
import {SET_DATASETS} from "@/store/mutation.type";

const state = {
  datasets: [],
}

const getters = {
  datasets(state) {
    return state.datasets
  },
}

const mutations = {
  [SET_DATASETS] (state, payload) {
    state.datasets = payload
  },
}

const actions = {
  [FETCH_DATASETS] (context, params) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.getWithBigInt('/dataset/search', '', {params})
      if (response && response.data && response.status === SUCCESS) {
        context.commit(SET_DATASETS, response.data)
        resolve(response.data)
      } else {
        resolve(null)
      }
    })
  },
  [CREATE_DATASET](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/dataset/create', payload)
      resolve(response)
    })
  },
  [UPDATE_DATASET](context, payload) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/dataset/update', payload)
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
