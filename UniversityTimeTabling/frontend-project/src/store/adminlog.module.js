const state = {
  totalLogs: 0,
  adminLogs: []
}
const getters = {
  adminLogs(state) {
    return state.adminLogs;
  },
  totalLogs(state) {
    return state.totalLogs
  }
}
const mutations = {
  setAdminLogs(state, payload) {
    state.adminLogs = payload;
  },
  setTotalLogs(state, payload) {
    state.totalLogs = payload;
  }
}
const actions = {}

export default {
  state,
  getters,
  actions,
  mutations
}
