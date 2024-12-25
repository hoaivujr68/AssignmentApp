const state = {
  eventData: {
    refresh_token: null
  }
}

const getters = {
  eventData: (state) => {
    return state.eventData
  }
}

const mutations = {
  ADD_EVENT(state, dataEvent) {
    if (!dataEvent) return
    if (dataEvent.type === 'authentication' && dataEvent.payload) {
      state.eventData.refresh_token = dataEvent.payload.refresh_token || null
    }
  }
}

const actions = {
  getEvent({ commit }, dataEvent) {
    commit('ADD_EVENT', dataEvent)
  }
}


export default {
  state,
  getters,
  mutations,
  actions
}