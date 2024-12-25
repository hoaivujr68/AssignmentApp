import httpResource from '../../common/http-resource'
import Configuration from "@/configuration";
import { Message } from 'element-ui'
import { performLogout, parseDataFromStringV2 } from '@/common/utils';
import JSONbig from 'json-bigint';
import { NO_DEFAULT_ERROR_MSG } from "../../common/config";

export default {
  data() {
    return {
      // loadingButton: false,
    }
  },
  methods: {
    query(resource, params) {
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      return httpResource
        .get(resource, {
          params: params,
          transformResponse: (r) => r
        }).then((response) => {
          return parseDataFromStringV2(response)
        })
        .catch((error) => {
          if (error && error.data) {
            Message.warning({
              message: JSON.parse(error.data).message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }
          return error
        })
    },

    queryWithBigInt(resource, params) {
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      return httpResource
        .get(resource, { params: params, transformResponse: (r) => r }).then((response) => {
          return parseDataFromStringV2(response)
        })
        .catch((error) => {
          if (error && error.data) {
            Message.warning({
              message: JSON.parse(error.data).message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }
          return error
        })
    },

    get(resource, slug = '', option) {
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      return httpResource
        .get(`${resource}${slug ? `/${slug}` : ''}`, {
          ...option,
          // transformResponse: (r) => r
        })
        .then((response) => {
          return response
          // return parseDataFromStringV2(response)
        })
        .catch((error) => {
          if (error && error.data) {
            Message.warning({
              message: error.data.message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }

          return error
        })
    },

    getWithBigInt(resource, slug = '', option) {
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      return httpResource
        .get(`${resource}${slug ? `/${slug}` : ''}`, {
          ...option,
          transformResponse: (r) => r
        })
        .then((response) => {
          return parseDataFromStringV2(response)
        })
        .catch((error) => {
          if (error && error.data) {
            Message.warning({
              message: JSON.parse(error.data).message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }

          return error
        })
    },

    post(resource, params, option) {
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      return httpResource.post(`${resource}`, params, {
        ...option,
        transformResponse: (r) => {
          if (r) return r;
        }
      }).then((response) => {
        return parseDataFromStringV2(response)
      }).catch((error) => {
        Message.closeAll()
        if (error && error.data) {
          if (JSON.parse(error.data).code === "user_is_locked") {
            performLogout();
            return;
          }
          Message.warning({
            message: JSON.parse(error.data).message,
            showClose: true,
          });
        } else {
          Message.warning({
            message: 'Có lỗi xảy ra',
            showClose: true,
          });
        }
        return error;
      })
    },

    postV2(resource, params, option) {
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      return httpResource.post(`${resource}`, params, {
        ...option,
        transformResponse: (r) => {
          if (r) return r;
        }
      }).then((response) => {
        return parseDataFromStringV2(response)
      }).catch((error) => {
        return error ? JSON.parse(error) : error;
      })
    },

    update(resource, slug, params) {
      return httpResource.put(`${resource}/${slug}`, params).catch((error) => {
        console.log('++++ error axios', error.response);
      })
    },

    put(resource, params, custom) {
      return httpResource
        .put(`${resource}`, params).catch(error => {
          Message.closeAll()
          if (custom === NO_DEFAULT_ERROR_MSG) return error;
          if (error && error.data && error.data.message) {
            Message.warning({
              message: error.data.message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }
          return error;
        })
    },

    putWithBigInt(resource, params) {
      return httpResource
        .put(`${resource}`, params, {
          transformResponse: (r) => {
            if (r) return r;
          }
        }).catch(error => {
          Message.closeAll()
          if (error && error.data) {
            Message.warning({
              message: JSON.parse(error.data).message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }
          return error;
        })
    },

    putWithConfig(resource, params, config) {
      return httpResource
        .put(`${resource}`, params, {
          transformResponse: (r) => {
            if (r) return r;
          },
          ...config
        }).catch(error => {
          Message.closeAll()
          if (error && error.data) {
            Message.warning({
              message: JSON.parse(error.data).message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }
          return error;
        })
    },

    delete(resource, params) {
      return httpResource
        .delete(resource, {
          params
        })
        .catch((error) => {
          Message.closeAll()
          if (error && error.data && error.data.message) {
            Message.warning({
              message: error.data.message,
              showClose: true,
            });
          } else {
            Message.warning({
              message: 'Có lỗi xảy ra',
              showClose: true,
            });
          }
          return error;
        })
    }
  }
}
