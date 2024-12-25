export default {
  get(key) {
    return window.sessionStorage.getItem(key);
  },

  save(key, data) {
    window.sessionStorage.setItem(key, data);
  },

  destroy(key) {
    window.sessionStorage.removeItem(key);
  }
}
