import httpResource from '../common/http-resource'
import Configuration from "@/configuration";
import {FETCH_PERMISSION} from "@/store/action.type";

const state = {
  roles: [],
  allRoles: [],
  permissions: []
}

const getters = {
  roles(state) {
    return state.roles;
  },
  allRoles(state) {
    return state.allRoles;
  },
  permissions(state) {
    return state.permissions;
  }
}

const mutations = {
  setRoles(state, roles) {
    state.roles = roles;
  },
  setAllRoles(state, roles) {
    state.allRoles = roles;
  },
  setPermissions(state, permissions) {
    state.permissions = permissions;
  }
}

const actions = {
  fetchRoles(context) {
    httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
    return new Promise((resolve, reject) => {
      httpResource.get('/role/list')
        .then(response => {
          if (response && response.status === 200 && response.data && response.data.length > 0) {
            response.data = [
              {id: null, code: 'Tất cả' },
              ...response.data
            ]
            context.commit("setRoles", response.data)
          }
          resolve(response)
        })
        .catch(error => {
          reject(error.response)
        })
    })
  },
  fetchAllRoles(context) {
    httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
    return new Promise((resolve, reject) => {
      httpResource.get('/role/list')
        .then(response => {
          if (response && response.status === 200 && response.data && response.data.length > 0) {
            context.commit("setAllRoles", response.data)
          }
          resolve(response)
        })
        .catch(error => {
          reject(error.response)
        })
    })
  },
  [FETCH_PERMISSION]() {
    httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
    return new Promise((resolve, reject) => {
      httpResource.get('/permission/list')
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error.response)
        })
    })
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}

