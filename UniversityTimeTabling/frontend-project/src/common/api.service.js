import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import StorageService from '@/common/storage.service';

Vue.use(VueAxios, axios);
var baseUrl = process.env.API_SC5_ADMIM;
var instanceApiService = Vue.axios.create({
  baseURL: baseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": StorageService.get('sc5_token')
  }
});

const ApiService = {
  query(resource, params) {
    return instanceApiService
      .get(resource, params)
      .catch((error) => {
        console.log('++++ error axios', error.response);
      })
  },

  get(resource, slug = '') {
    return instanceApiService
      .get(`${resource}/${slug}`)
      .catch((error) => {
        console.log('++++ error axios', error.response);
      })
  },

  post(resource, params) {
    return instanceApiService.post(`${resource}`, params).then((response) => {
      return response
    }).catch((error) => {
      console.log('++++ error axios', error.response);
      throw error;
    })
  },

  update(resource, slug, params) {
    return instanceApiService.put(`${resource}/${slug}`, params).catch((error) => {
      console.log('++++ error axios', error.response);
    })
  },

  put(resource, params) {
    return instanceApiService
      .put(`${resource}`, params).catch(error => {
        console.log('++++ error axios', error.response);
      })
  },

  delete(resource, params) {
    return instanceApiService
      .delete(resource, params)
      .catch((error) => {
        console.log('++++ error axios', error.response);
      })
  }
}

export default ApiService;
