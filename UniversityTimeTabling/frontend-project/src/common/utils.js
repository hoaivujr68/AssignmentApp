import httpResource from "../common/http-resource"
import store from "../store/store"
import StorageService from "../common/storage.service"
import SessionStorageService from "../common/session.storage.service"
import router from "../router/index"
import authHeader from "./auth-header"
import Configuration from "@/configuration";
import moment from "moment-timezone";
import JSONbig from 'json-bigint';

/**
 *
 * @param file Blob
 * @param fileName string
 */
export function download(file, fileName) {
  const url = window.URL.createObjectURL(new Blob([file]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
}

export function getExtension(fileName = '') {
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex < 0) {
    return '';
  }

  return fileName.substring(lastDotIndex + 1);
}

export function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export function formatDate(date) {
  if (!date) return null;
  return [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(),
    date.getFullYear()].join('/');
}

export function formatDate2(value) {
  if (!value) return null;
  let date = new Date(value);
  return [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(),
    date.getFullYear()].join('/');
}

export function formatDateYYYYMMDD(date) {
  if (!date) return null;
  return [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join('/');
}

export function formatDateTime(date) {
  if (!date) return '';
  return [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(),
      date.getFullYear()].join('/') + ' ' +
    [date.getHours().padLeft(),
      date.getMinutes().padLeft(),
      date.getSeconds().padLeft()].join(':');
}

export function formatDateTimeCs(date) {
  if (!date) return '';
  return moment(date).format('HH:mm DD/MM/YYYY');
}

Number.prototype.padLeft = function (base, chr) {
  let len = (String(base || 10).length - String(this).length) + 1;
  return len > 0 ? new Array(len).join(chr || '0') + this : this;
}

export function parseDate(date) {
  if (!date) return null;
  const [day, month, year] = date.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function downloadExportExcel(result, fileName) {
  if (result != null) {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = URL.createObjectURL(result)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function convertStringddMMyyyy2Date(str) {
  if (!str) return null;
  var date1 = str.split('/')
  var newDate = date1[1] + '/' + date1[0] + '/' + date1[2];
  var date = new Date(newDate);
  return date;
}

/*ham xu ly loi*/
export function parseApiError(error) {
  try {
    if (error && error.hasOwnProperty("data")) {
      const apiError = error.data;
      return {
        // status: apiError.status,
        // statusCode: error.status,
        // timestamp: apiError.time,
        // message: apiError.message
      }
    }
  } catch (parseError) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      timestamp: new Date(),
      message: "Server is not responding ..."
    };
  }
}

// perform logout
export function performLogout() {
  const intervalName = store.getters.getIntervalName;
  if (intervalName) {
    clearInterval(intervalName);
  }
  StorageService.destroy("sc5_token");
  StorageService.destroy("Token");
  StorageService.destroy("userInfo");
  SessionStorageService.destroy("config");
  router.push("/login").catch(() => {
  });
}

export async function logout() {
  let token = StorageService.get("Token");
  if (token) {
    token = JSON.parse(token);
    httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
    await httpResource.post("/logout", token.refreshToken, { headers: { "Content-Type": "text/plain" } });
    StorageService.destroy("sc5_token");
    StorageService.destroy("Token");
    StorageService.destroy("userInfo");
    SessionStorageService.destroy("config");
    router.push("/login").catch(() => {
    });
  }
}

export async function refreshTokenInternal() {
  try {
    let token = StorageService.get("Token");
    if (token) {
      token = JSON.parse(token);
      httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
      const response = await httpResource.post("/auth/token/refresh", token.refreshToken, {headers: {"Content-Type": "text/plain"}});
      if (response.status !== 200) {
        performLogout();
      } else {
        token.accessToken = response.data.accessToken;
        StorageService.save("sc5_token", response.data.accessToken);
        StorageService.save("Token", JSON.stringify(token));
      }
    } else {
      console.log("Refresh token not store in local storage")
    }
  } catch (error) {
    console.log("Error in refresh token ", error);
  }
}

export async function checkToken() {
  httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
  const response = await httpResource.get("/profile", {headers: authHeader()});
  return response.status;
}

export async function getAuthenticatedUser() {
  httpResource.defaults.baseURL = Configuration.value("sc5AdminURL");
  try {
    const response = await httpResource.get("/profile", {headers: authHeader()});
    if (response.status === 200) {
      const currentUser = response.data;
      //Store user info to LocalStorage
      /*await refreshTokenInternal();*/
      StorageService.save("userInfo", JSON.stringify(currentUser));
      const intervalName = "Test";
      store.commit("setIntervalName", intervalName);
    } else {
      performLogout();
    }
  } catch (error) {
    performLogout();
  }
}


export const intervalMilliSeconds = 300000; // 5 minutes
/*export const intervalMilliSeconds = 30000;*/ // 1 minutes

let delayTimer;
export const doSearch = (callback) => {
  clearTimeout(delayTimer);
  delayTimer = setTimeout(function() {
    callback()
  }, 1000); // Will do the ajax stuff after 1000 ms, or 1 s
}

export const formatTime = (time, type) => {
  if (!time) return null
  return type === 'START'
    ? moment(time).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    : moment(time).startOf('day').add(1, 'day').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
}

export const formatTimeV2 = (time, type, formatType) => {
  if (!time || !formatType) return null
  return type === 'START'
    ? moment(time).startOf('day').format(formatType)
    : moment(time).startOf('day').add(1, 'day').format(formatType)
}

export const formatTimeStamp = (time, type) => {
  if (!time) return null
  return type === 'START'
    ? new Date(moment(time).startOf('day')).getTime()
    : new Date(moment(time).startOf('day').add(1, 'day')).getTime()
}

export const convertSpaceToCommas = (value) => {
  if (!value) return '';
  return value.replaceAll(' ', ',')
}

export const parseDataFromStringV2 = (response) => {
  if (response.data instanceof Blob) {
    return response;
  }
  if (response && response.data) {
    response.data = JSONbig.parse(response.data)
  }
  return response
}

export const parseParam = (params, fieldConvert) => {
  if (params[fieldConvert]) params[fieldConvert] = JSONbig.stringify(params[fieldConvert])
  return params
}

export const formatCurrencyToString = (value) => {
  return value ? value.replace(/\D/g, "") : ''
}

export const strForSearch = (str) => {
  return str
    ? str
      .normalize("NFD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
    : str;
};

export const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function countWords(str, word) {
  return str ? (str.toLowerCase().match(new RegExp(`\\b${word.toLowerCase()}\\b`, "g")) || []).length : 0;
}

export const checkPermission = (permission) => {
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  if (!permission) return
  return userInfo && ((userInfo.permissions.indexOf(permission) !== -1) || userInfo.roles.includes('admin'))
}

export const validateKeyCode = (e) => {
  if ((e.key < 48 || e.key > 57 || e.charCode === 13) && e.charCode !== 45 && e.charCode !== 32) {
    return true
  }

  e.preventDefault()
}

export const allowAlphaNumericSpace = (e) => {
  const code = ("charCode" in e) ? e.charCode : e.keyCode;
  if (!(code > 47 && code < 58) && // numeric (0-9)
    !(code > 64 && code < 91) && // upper alpha (A-Z)
    !(code > 96 && code < 123)) { // lower alpha (a-z)
    e.preventDefault();
  }
}
