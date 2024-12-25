import axios from "axios";
import { performLogout } from "./utils";
import StorageService from "../common/storage.service"
import { EventBus } from "./event-bus";
const isHandlerEnable = (config = {}) => {
  return !(config.hasOwnProperty("handlerEnable") && !config.handlerEnable);
};

const instance = axios.create({
  timeout: 100000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

const requestHandler = request => {
  EventBus.$emit("send-progress", true)
  request.headers["Authorization"] = StorageService.get('sc5_token')
  if (isHandlerEnable(request)) {
    // console.log("Request Interceptor", request);
  }
  return request;
};

const errorHandler = error => {
  EventBus.$emit("close-progress", true)
  if (isHandlerEnable(error.config)) {
    // console.log("Error Interceptor", error);
  }
  if (error.status === 401) {
    performLogout();
  }
  return Promise.reject(error);
};
const successHandler = response => {
  EventBus.$emit("close-progress", true)
  if (isHandlerEnable(response.config)) {
    // console.log("Response Interceptor ", response);
  }
  return response;
};

instance.interceptors.request.use(request => requestHandler(request));

instance.interceptors.response.use(
  response => successHandler(response),
  error => errorHandler(error.response)
);

export default instance;
