import Configuration from "@/configuration";
import StorageService from "@/common/storage.service";
import axios from "axios";
import {
  DOWNLOAD_FILE_EXPORT,
  CREATE_FILE_TRANSACTION,
  CREATE_FILE_ACCOUNT,
  DOWNLOAD_FILE_AR,
  DOWNLOAD_FILE_WITH_NAME,
} from "@/store/action.type";
import baseMixins from "../components/mixins/base";
import { SUCCESS } from "../common/config";

const API_ADMIN_SC5 = Configuration.value("sc5AdminURL");

const state = {
  files: [],
  totalFile: 0
}

const getters = {
  files(state) {
    return state.files;
  },
  totalFile(state) {
    return state.totalFile;
  }
}

const mutations = {
  setFiles(state, files) {
    state.files = files;
  },
  setTotalFiles(state, totalFile) {
    state.totalFile = totalFile;
  },
}

const actions = {
  [CREATE_FILE_ACCOUNT](context, data) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/file/account', data)
      if (response && response.status === SUCCESS) {
        resolve(response)
      }
    })
  },
  [CREATE_FILE_TRANSACTION](context, data) {
    return new Promise(async resolve => {
      let response = await baseMixins.methods.post('/file/transaction', data)
      if (response && response.status === SUCCESS) {
        resolve(response)
      }
    })
  },
  [DOWNLOAD_FILE_EXPORT](context, params) {
    return axios({
      url: `${API_ADMIN_SC5}/file/download`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': StorageService.get('sc5_token')
      },
      method: 'GET',
      params: params,
      responseType: 'blob',
    }).then(({ data }) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', params.file_name + ".zip");
      document.body.appendChild(link);
      link.click();
    })
      .catch(({ error }) => error);
  },
  [DOWNLOAD_FILE_AR](context, params) {
    return axios({
      url: `${API_ADMIN_SC5}/bill-ar/file/download`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': StorageService.get('sc5_token')
      },
      method: 'GET',
      params: params,
      responseType: 'blob',
    }).then(({ data }) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', params.fileName + ".xlsx");
      document.body.appendChild(link);
      link.click();
    })
        .catch(({ error }) => error);
  },
  [DOWNLOAD_FILE_WITH_NAME](context, params) {
    return axios({
      url: `${API_ADMIN_SC5}/file/download-with-file-name?file_name=${params.fileName}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': StorageService.get('sc5_token')
      },
      method: 'GET',
      params: params,
      responseType: 'blob',
    }).then(({ data }) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', params.fileName);
      document.body.appendChild(link);
      link.click();
    }).catch(({ error }) => error);
  },
}
export default {
  state,
  getters,
  mutations,
  actions
}

