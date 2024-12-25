import StorageService from "../common/storage.service"
import {performLogout} from "./utils";

export default function authHeader() {
  let token = StorageService.get('Token');

  if (token) {
    let accessToken = JSON.parse(token);
    return {Authorization: accessToken.accessToken};
  } else {
    performLogout();
  }
}
