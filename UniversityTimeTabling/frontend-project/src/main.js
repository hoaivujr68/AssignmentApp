// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from "@/store/store";
import filter from "@/common/filter";
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css';
// import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from 'element-ui/lib/locale/lang/en'
import "@/common/filter"
import Default from '@/Layout/Wrappers/baseLayout';
import {intervalMilliSeconds, refreshTokenInternal} from "./common/utils";
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import Vuelidate from 'vuelidate'
import money from 'v-money'
import "vue2-datepicker/index.css";
import "vue2-datepicker/locale/vi";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Multiselect from "vue-multiselect";
import { setupCalendar } from 'v-calendar'
import OtpInput from "@bachdgvn/vue-otp-input";
import Loading from 'vue-loading-overlay';
import VueSimpleContextMenu from 'vue-simple-context-menu'
import VueDOMPurifyHTML from 'vue-dompurify-html';

import VueCountdown from '@chenfengyuan/vue-countdown';
import VueObserveVisibility from 'vue-observe-visibility'
Vue.component(VueCountdown.name, VueCountdown);

import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import 'vue-loading-overlay/dist/vue-loading.css';
import "vue-select/src/scss/vue-select.scss";
import 'ant-design-vue/lib/menu/style/css';
import 'ant-design-vue/lib/icon/style/css';
import 'ant-design-vue/lib/select/style/css';
import 'ant-design-vue/lib/spin/style/css';
import 'ant-design-vue/lib/table/style/css';
import 'ant-design-vue/lib/row/style/css';
import 'ant-design-vue/lib/col/style/css';
import 'ant-design-vue/lib/input/style/css';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/steps/style/css';
import 'ant-design-vue/lib/tree-select/style/css';
import 'ant-design-vue/lib/skeleton/style/css';
import { Menu, Icon, Select, Spin, Table, Row, Col, Input, Button, Pagination, Steps, TreeSelect, Skeleton } from 'ant-design-vue';
Vue.use(Menu);
Vue.use(Icon);
Vue.use(Select);
Vue.use(Spin);
Vue.use(Table);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);
Vue.use(Button);
Vue.use(Pagination);
Vue.use(Steps);
Vue.use(TreeSelect);
Vue.use(Skeleton);

import ToggleButton from 'vue-js-toggle-button'

Vue.use(ToggleButton)

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

import VueZoomer from 'vue-zoomer'
Vue.use(VueZoomer)

Vue.component("v-otp-input", OtpInput);
setupCalendar({
  componentPrefix: 'v'
});

Vue.component('vue-simple-context-menu', VueSimpleContextMenu)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons)
Vue.use(Vuelidate)
Vue.use(ElementUI, {locale})
Vue.use(money)

Vue.use(VueDOMPurifyHTML);

Vue.use(VueObserveVisibility);

Vue.use(Loading, {
  color: '#01904a',
  width: 64,
  height: 64,
  backgroundColor: '#ffffff',
  opacity: 0.5,
  zIndex: 999,
  loader: 'dots'
});

library.add(fas);
Vue.component('font-awesome-icon', FontAwesomeIcon)
// Use v-calendar & v-date-picker components
Vue.config.productionTip = false;

Vue.component('default-layout', Default);
Vue.component("multiselect", Multiselect);

setInterval(async () => {
  await refreshTokenInternal();
}, intervalMilliSeconds);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  filter,
  components: {App},
  template: '<App/>',
});

