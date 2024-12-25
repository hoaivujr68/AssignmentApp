import StorageService from "../common/storage.service"

const state = {
  intervalName: "",
  userInfo: {
    id: 0,
    fullName: "",
    username: "",
    createAt: "",
    roles: ""
  }
}
const getters = {
  getIntervalName(state) {
    return state.intervalName;
  },
  userInfo(state) {
    return state.userInfo;
  }
}

const mutations = {
  setIntervalName(state, intervalName) {
    state.intervalName = intervalName;
  },
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo;
  }
}

const actions = {
  fetchUserInfo(context) {
    if (StorageService.get("userInfo")) {
      let userInfo = JSON.parse(StorageService.get("userInfo"));
      context.commit("setUserInfo", userInfo);
    }
  }
}

export default {
  namespaced: false,
  state,
  actions,
  mutations,
  getters
};
