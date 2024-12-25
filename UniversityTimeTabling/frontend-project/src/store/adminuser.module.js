const state = {
  adminUsers: [],
  totalAdminUsers: 0
}

const getters = {
  adminUsers(state) {
    return state.adminUsers;
  },
  totalAdminUsers(state) {
    return state.totalAdminUsers;
  },
}

const mutations = {
  setAdminUsers(state, adminUsers) {
    state.adminUsers = adminUsers
  },
  setTotalAdminUsers(state, totalAdminUsers) {
    state.totalAdminUsers = totalAdminUsers
  },
}

const actions = {

}

export default {
  state,
  actions,
  mutations,
  getters
};
