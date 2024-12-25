<template>
  <b-form @submit="handleSearch">
    <page-title :heading=heading :subheading=subheading :icon=icon :loading=loadingHeader :btn-title="userInfo && userInfo.permissions.indexOf('admin_user_insert') !== -1 ? btnTitle : ''"
                :modal-id="modalInfo.id"></page-title>
    <b-card class="main-card search-wrapper  mb-4">
      <template v-if="loadingHeader">
        <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
      </template>
      <template v-else>
      <b-row class="mb-3">
        <b-col md="2">
          <div class="label-form">Tên đăng nhập</div>
          <b-input type="text" placeholder="Nhập tên đăng nhập" v-model.trim="dataFilter.username"/>
        </b-col>
        <b-col md="2">
          <div class="label-form">Họ tên</div>
          <b-input type="text" placeholder="Nhập họ tên" v-model.trim="dataFilter.fullName"/>
        </b-col>
        <b-col md="2">
          <div class="label-form">Số điện thoại</div>
          <b-input type="text" placeholder="Nhập số điện thoại" v-model.trim="dataFilter.mobile"/>
        </b-col>
        <b-col md="2">
          <div class="label-form">Email</div>
          <b-input type="text" placeholder="Nhập email" v-model.trim="dataFilter.email"/>
        </b-col>
        <b-col md="2">
          <div class="label-form">Trạng thái</div>
          <multiselect v-model="selectedStatus" track-by="text" label="text" :show-labels="false"
                       placeholder="Chọn" :options="options" :searchable="true">
            <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
          </multiselect>
        </b-col>
        <b-col md="2">
          <div class="label-form">Vai trò</div>
          <multiselect v-model="selectedRoles" track-by="code" label="code" :show-labels="false"
                       placeholder="Chọn" :options="roles" :searchable="true">
            <template slot="singleLabel" slot-scope="{ option }">{{ option.code }}</template>
          </multiselect>
        </b-col>
        <b-col md="2">
          <div class="label-form">Thời gian tạo từ</div>
          <date-picker
            :disabled-date="(date) => date >= new Date()"
            input-error
            class="w-100"
            input-class="form-control"
            v-model.trim="createdDateFrom"
            format="DD/MM/YYYY"
            placeholder="Chọn"
          />
        </b-col>
        <b-col md="2">
          <div class="label-form">Thời gian tạo đến</div>
          <date-picker
            :disabled-date="(date) => date >= new Date()"
            input-error
            class="w-100"
            input-class="form-control"
            v-model.trim="createdDateTo"
            format="DD/MM/YYYY"
            placeholder="Chọn"
          />
        </b-col>
        <b-col md="8">
          <b-button variant="primary" class="mr-2 custom-btn-common" @click="handleSearch" type="submit">
            <font-awesome-icon :icon="['fas','search']"/>
            Tìm kiếm
          </b-button>
          <b-button variant="light" @click="handleReset" class="custom-btn-common">
            <font-awesome-icon :icon="['fas','eraser']"/>
            Xóa lọc
          </b-button>
        </b-col>
      </b-row>
      <b-table
        :items="adminUsers"
        :fields="visibleFields"
        :bordered="bordered"
        :hover="hover"
        :fixed="fixed"
        :foot-clone="footClone"
      >
        <template #cell(actions)="row" style="text-align: center">
          <a
            v-if="row.item.userName !== userInfo.username && userInfo && userInfo.permissions.indexOf('admin_user_update_password') !== -1"
            href="javascript:void(0)"
            type="button"
            class="mr-2"
            title="Đổi mật khẩu"
            v-b-tooltip.hover
            @click.prevent="openChangePasswordModal(row.item, row.index, $event.target)">
            <font-awesome-icon :icon="['fas', 'key']"/>
          </a>
          <a
            v-if="row.item.userName !== userInfo.username && userInfo && userInfo.permissions.indexOf('admin_user_update_status') !== -1"
            href="javascript:void(0)"
            class="mr-2"
            :class="row.item.status === 1 ? 'color-inactive' : 'color-active'"
            type="button"
            :title="row.item.status === 1 ? 'Khóa Người dùng' : 'Mở khóa Người dùng'"
            v-b-tooltip.hover
            @click.prevent="openModalChangeStatus(row.item)">
            <font-awesome-icon v-if="row.item.status === 1" :icon="['fas', 'unlock']"/>
            <font-awesome-icon v-else :icon="['fas', 'lock']"/>
          </a>
          <a
            v-if="userInfo && userInfo.permissions.indexOf('admin_user_update_roles') !== -1"
            href="javascript:void(0)" class="mr-2" type="button" title="Cập nhật vai trò"
            @click.prevent="openModalUpdateRole(row.item)"
            v-b-tooltip.hover>
            <font-awesome-icon :icon="['fas','user']"/>
          </a>
          <a
            v-if="userInfo && row.item.sotpId && userInfo.permissions.indexOf('admin_user_reset_sotp') !== -1"
            href="javascript:void(0)" class="mr-2" type="button" title="Đặt lại Smart OTP"
            @click.prevent="openModalResetSOTP(row.item)"
            v-b-tooltip.hover>
            <font-awesome-icon :icon="['fas','undo']"/>
          </a>
        </template>
        <template #cell(roles)="row">
          <b-badge v-for="(role, i) in row.item.roles.split(',')" :key="i" class="mr-2 badge-role"> {{ role }}
          </b-badge>
        </template>
        <template #cell(status)="row">
          <b-badge v-if="row.item.status === 1" class="mr-2 badge-active"> Hoạt động</b-badge>
          <b-badge v-else class="mb-2 mr-2 badge-inactive"> Khóa</b-badge>
        </template>
      </b-table>
      <b-row v-if="totalAdminUsers">
        <b-col>
          <b-pagination
            v-model="dataFilter.page"
            :per-page="dataFilter.pageSize"
            :total-rows="totalAdminUsers"
            @change="changePage"
          ></b-pagination>
        </b-col>
        <b-col>
          <span class="text-muted">
            {{ fromPage }} đến {{ toPage }} trên {{ totalAdminUsers }} bản ghi
          </span>
        </b-col>
      </b-row>
      </template>
    </b-card>
    <b-modal :id="modalInfo.id" size="lg" title="Tạo người dùng" ok-title="Lưu"
             cancel-title="Hủy" :no-close-on-backdrop="true">
      <b-form @reset="handlerReset" v-if="show" ref="form" @submit.stop.prevent="handlerSubmit">
        <b-tabs content-class="mt-3" ref="tabs" v-model="tabIndex">
          <b-tab title="Người dùng" active>
            <b-form-group>
              <label for="userName">Tên đăng nhập <span class="text-danger">*</span>:</label>
              <b-form-input
                id="userName"
                v-model.trim="$v.user.userName.$model"
                type="text"
                placeholder="Tài khoản đăng nhập"
                :class="{'is-invalid': validationStatus($v.user.userName)}"
              ></b-form-input>
              <div v-if="!$v.user.userName.required" class="invalid-feedback">Tên đăng nhập không được để trống.</div>
              <div v-if="!$v.user.userName.validateUserName" class="invalid-feedback">Tên đăng nhập không được chứa ký
                tự đặc biệt.
              </div>
              <div v-if="!$v.user.userName.minLength" class="invalid-feedback">Tên đăng nhập không được nhỏ hơn
                {{ $v.user.userName.$params.minLength.min }} ký
                tự.
              </div>
              <div v-if="!$v.user.userName.maxLength" class="invalid-feedback">Tên đăng nhập không được lớn hơn
                {{ $v.user.userName.$params.maxLength.max }}
                ký tự.
              </div>
            </b-form-group>

            <b-form-group>
              <label for="password">Mật khẩu <span class="text-danger">*</span>:</label>
              <b-input-group>
                <b-form-input
                  id="password"
                  v-model.trim="$v.user.password.$model"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu"
                  :class="{'is-invalid': validationStatus($v.user.password)}"
                ></b-form-input>
                <b-input-group-append>
                  <b-button class="btn-light2" @click="handleShowPassword">
                    <font-awesome-icon v-if="showPassword" :icon="['fas','eye']"/>
                    <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
                  </b-button>
                </b-input-group-append>
                <div v-if="!$v.user.password.required" class="invalid-feedback">Mật khẩu không được để trống.</div>
                <div v-if="!$v.user.password.minLength" class="invalid-feedback">Mật phẩu phải có ít nhất
                  {{ $v.user.password.$params.minLength.min }} ký tự.
                </div>
                <div v-if="!$v.user.password.maxLength" class="invalid-feedback">Mật khẩu không được vợt quá
                  {{ $v.user.password.$params.maxLength.max }} ký tự.
                </div>
                <div v-if="!$v.user.password.validatePassword" class="invalid-feedback">Mật khẩu phải bao gồm chữ thường
                  chữ hoa, số và ký tự đặc biệt.
                </div>
              </b-input-group>
            </b-form-group>
            <b-form-group>
              <label for="confirmPassword">Xác nhận mật khẩu <span class="text-danger">*</span>:</label>
              <b-input-group>
                <b-form-input
                  id="confirmPassword"
                  v-model.trim="$v.user.confirmPassword.$model"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Xác nhận mật khẩu"
                  :class="{'is-invalid': validationStatus($v.user.confirmPassword)}"
                ></b-form-input>
                <b-input-group-append>
                  <b-button class="btn-light2" @click="handleShowConfirmPassword">
                    <font-awesome-icon v-if="showConfirmPassword" :icon="['fas','eye']"/>
                    <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
                  </b-button>
                </b-input-group-append>
                <div v-if="!$v.user.confirmPassword.required" class="invalid-feedback">Xác nhận mật khẩu không được để
                  trống.
                </div>
                <div v-if="!$v.user.confirmPassword.sameAsPassword" class="invalid-feedback">Xác nhận mật khẩu không
                  khớp.
                </div>
              </b-input-group>
            </b-form-group>
            <b-form-group>
              <label for="fullName">Họ và tên <span class="text-danger">*</span>:</label>
              <b-form-input
                id="fullName"
                v-model.trim="$v.user.fullName.$model"
                type="text"
                placeholder="Tên, họ và tên đệm"
                :class="{'is-invalid': validationStatus($v.user.fullName)}"
              ></b-form-input>
              <div v-if="!$v.user.fullName.required" class="invalid-feedback">Họ và tên không được để trống.</div>
              <div v-if="!$v.user.fullName.maxLength" class="invalid-feedback">Họ và tên không được vuợt quá
                {{ $v.user.fullName.$params.maxLength.max }} ký tự..
              </div>
            </b-form-group>
            <b-form-group>
              <label>Số điện thoại <span class="text-danger">*</span>:</label>
              <b-form-input
                  v-model.trim="$v.user.mobile.$model"
                  type="text"
                  placeholder="Số điện thoại"
                  :class="{'is-invalid': validationStatus($v.user.mobile)}"
              ></b-form-input>
              <div v-if="!$v.user.mobile.required" class="invalid-feedback">Số điện thoại không được để trống.</div>
              <div v-if="!$v.user.mobile.isValidPhone" class="invalid-feedback">Số điện thoại không đúng định dạng.</div>
            </b-form-group>
            <b-form-group>
              <label>Email:</label>
              <b-form-input
                  v-model.trim="$v.user.email.$model"
                  type="text"
                  placeholder="Email"
                  :class="{'is-invalid': validationStatus($v.user.email)}"
              ></b-form-input>
              <div v-if="!$v.user.email.isValidEmail" class="invalid-feedback">Email không đúng định dạng.</div>
            </b-form-group>
          </b-tab>
          <b-tab title="Vai trò">
            <div v-if="errorRole" class="text-danger mb-2">
              {{ errorRole }}
            </div>
            <b-table
              :items="roles"
              :fields="roleFields"
              :bordered="false"
              :hover="hover"
              :fixed="fixed"
              :foot-clone="footClone"
              @row-clicked="(item, index, event) => handleRowClick(item, index, event)"
            >
              <template #cell(actions)="row">
                <b-form-group>
                  <b-checkbox
                    :checked="user.roles.includes(row.item.code)"
                    v-model="user.roles"
                    :value="row.item.code">
                  </b-checkbox>
                </b-form-group>
              </template>
            </b-table>
          </b-tab>
        </b-tabs>
      </b-form>
      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handlerReset"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          class="mr-2"
          @click.prevent="handlerOk"
        >
          Lưu
        </b-button>
      </template>
    </b-modal>
    <b-modal :id="changPasswordModal.id" title="Đổi mật khẩu" :no-close-on-backdrop="true"
             @hidden="handlerCancel">
      <b-form v-if="show">
        <b-form-group>
          <label for="passwordUser">Mật khẩu mới <span class="text-danger">*</span>:</label>
          <b-input-group>
            <b-form-input
              :type="showPassword ? 'text' : 'password'"
              id="passwordUser"
              v-model.trim="$v.changePasswordReq.password.$model"
              :class="{'is-invalid': validationStatus($v.changePasswordReq.password)}"
            ></b-form-input>
            <b-input-group-append>
              <b-button class="btn-light2" @click="handleShowPassword">
                <font-awesome-icon v-if="showPassword" :icon="['fas','eye']"/>
                <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
              </b-button>
            </b-input-group-append>
            <div v-if="!$v.changePasswordReq.password.required" class="invalid-feedback">Mật khẩu không được để trống.
            </div>
            <div v-if="!$v.changePasswordReq.password.minLength" class="invalid-feedback">Mật phẩu phải có ít nhất
              {{ $v.changePasswordReq.password.$params.minLength.min }} ký tự.
            </div>
            <div v-if="!$v.changePasswordReq.password.maxLength" class="invalid-feedback">Mật khẩu không được vợt quá
              {{ $v.changePasswordReq.password.$params.maxLength.max }} ký tự.
            </div>
            <div v-if="!$v.changePasswordReq.password.validatePassword" class="invalid-feedback">Mật khẩu phải bao gồm
              chữ
              thường
              chữ hoa, số và ký tự đặc biệt.
            </div>
          </b-input-group>
        </b-form-group>
        <b-form-group>
          <label for="confirmPasswordUser">Xác nhận mật khẩu mới <span class="text-danger">*</span>:</label>
          <b-input-group>
            <b-form-input
              id="confirmPasswordUser"
              v-model.trim="changePasswordReq.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :class="{'is-invalid': validationStatus($v.changePasswordReq.confirmPassword)}"
            ></b-form-input>
            <b-input-group-append>
              <b-button class="btn-light2" @click="handleShowConfirmPassword">
                <font-awesome-icon v-if="showConfirmPassword" :icon="['fas','eye']"/>
                <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
              </b-button>
            </b-input-group-append>
            <div v-if="!$v.changePasswordReq.confirmPassword.required" class="invalid-feedback">Xác nhận mật khẩu không
              được để trống.
            </div>
            <div v-if="!$v.changePasswordReq.confirmPassword.sameAsPassword" class="invalid-feedback">Xác nhận mật khẩu
              không khớp.
            </div>
          </b-input-group>

        </b-form-group>
      </b-form>
      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handlerCancel"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          class="mr-2"
          @click.prevent="handlerChangePasswordUser"
        >
          Lưu
        </b-button>
      </template>
    </b-modal>
    <b-modal :id="updateRoleModal.id" title="Cập nhật quyền" :no-close-on-backdrop="true" size="lg">
      <div v-if="errorRole" class="text-danger mb-2">
        {{ errorRole }}
      </div>
      <b-table
        :items="roles"
        :fields="roleFields"
        :bordered="true"
        :hover="hover"
        :fixed="fixed"
        :foot-clone="footClone"
        @row-clicked="(item, index, event) => handleUpdateRoleRowClick(item, index, event)"
      >
        <template #cell(actions)="row">
          <b-form-group>
            <b-checkbox
              :checked="roleSelected.includes(row.item.code)"
              v-model="roleSelected"
              :value="row.item.code">
            </b-checkbox>
          </b-form-group>
        </template>
      </b-table>

      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handleCancelUpdateRole"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          class="mr-2"
          @click.prevent="handleUpdateRole"
        >
          Lưu
        </b-button>
      </template>
    </b-modal>

    <b-modal id="update-status-user" title="Cập nhật trạng thái" :no-close-on-backdrop="true">
      <p class="my-4">Bạn có muốn thay đổi trạng thái với tài khoản <span style="font-weight: 500">{{ this.currentItem && this.currentItem.accountNo }}</span> không ?</p>
      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handleHideChangeStatus"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          class="mr-2"
          @click.prevent="changeStatus"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal id="reset-sotp" title="Reset SOTP" :no-close-on-backdrop="true">
      <p class="my-4">Bạn có muốn đặt lại SOTP với tài khoản <span style="font-weight: 500">{{ this.currentItem && this.currentItem.accountNo }}</span> không ?</p>
      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handleHideResetSOTP"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          class="mr-2"
          @click.prevent="resetSOTP"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

  </b-form>
</template>

<script>
import PageTitle from "../Layout/Components/PageTitle";
import baseMixins from "../components/mixins/base";
import Vue from 'vue'
import {mapGetters} from "vuex";
import {formatDateTime, formatTime} from "../common/utils";
import {validateUserName, validatePassword, isValidEmail, isValidPhone} from "../common/validate";
import {required, minLength, sameAs, maxLength} from "vuelidate/lib/validators";
import DatePicker from 'vue2-datepicker';
import "vue2-datepicker/index.css";
import 'vue2-datepicker/locale/vi';
import 'vue-multiselect/dist/vue-multiselect.min.css'
import Multiselect from 'vue-multiselect'
import moment from 'moment-timezone';
import router from '@/router';
// register globally
Vue.component('multiselect', Multiselect)

const initDataFilter = {
  page: 1,
  pageSize: 20,
  username: '',
  fullName: '',
  status: null,
  role: '',
  mobile: '',
  email: null,
  createdDateFrom: null,
  createdDateTo: null,
}

const changePasswordUser = {
  id: 0,
  password: "",
  confirmPassword: "",
}

export default {
  name: "AdminUser",
  data() {
    return {
      subheading: "Tạo và quản lý người dùng, quyền truy cập của người dùng và hồ sơ người dùng",
      icon: "pe-7s-id icon-gradient bg-happy-itmeo",
      heading: "Quản lý người dùng",
      btnTitle: "Thêm tài khoản",
      bordered: true,
      hover: true,
      show: true,
      fixed: true,
      footClone: false,
      tabIndex: null,
      tabs: [],
      tabCounter: 0,
      showPassword: false,
      showConfirmPassword: false,
      currentItem: null,
      fields: [
        {key: "id", label: "ID", tdClass: 'align-middle', thClass: 'align-middle', visible: false},
        {key: "userName", label: "Tên đăng nhập", visible: true},
        {key: "fullName", label: "Tên người dùng", visible: true},
        {key: "mobile", label: "Số điện thoại", visible: true},
        {key: "email", label: "Email", visible: true},
        {
          key: "status",
          label: "Trạng thái",
          visible: true,
          thStyle: { width: '10%' }
        },
        {key: "roles", label: "Vai trò", visible: true},
        {
          key: "lastFailLogin",
          label: "Thời gian đăng nhập thất bại cuối cùng",
          formatter: (value, key, item) => {
            if (value != null) {
              let lastFailLogin = new Date(value);
              return formatDateTime(lastFailLogin);
            } else {
              return '';
            }
          }, visible: true,
          thStyle: { width: '18%' }
        },
        {
          key: "createdAt", label: "Ngày tạo",
          formatter: (value, key, item) => {
            let createdAt = new Date(value);
            return formatDateTime(createdAt);
          },
          visible: true
        },
        {key: 'actions', label: 'Chức năng', tdClass: 'align-middle', thClass: 'align-middle', visible: true, thStyle: { width: '8%' }}
      ],
      roleFields: [
        {key: "id", label: "ID"},
        {key: "code", label: "Mã vai trò"},
        {key: "description", label: "Mô tả"},
        {key: 'actions', label: 'Thêm/Bỏ', tdClass: 'text-center', thClass: 'text-center'}
      ],
      dataFilter: Object.assign({}, initDataFilter),
      modalInfo: {
        id: "create-user-model"
      },
      modalChangeStatus: {
        id: "change-status-model"
      },
      changPasswordModal: {
        id: "change-password-modal"
      },
      updateRoleModal: {
        id: "update-role-modal"
      },
      user: {
        userName: '',
        password: '',
        fullName: "",
        confirmPassword: '',
        roles: [],
        mobile: '',
        email: null,
      },
      selectedStatus: {value: null, text: 'Tất cả'},
      selectedRoles: {id: '', code: 'Tất cả' },
      roleSelected: [],
      currentUser: {
        id: 0,
        userName: "",
        password: "",
        fullName: "",
        status: 0,
        loginFailCount: 0,
        roles: "",
        createdAt: "",
        lastFailLogin: ""
      },
      options: [
        {value: null, text: 'Tất cả'},
        {value: 1, text: 'Hoạt động'},
        {value: 2, text: 'Khóa'},
      ],
      changePasswordReq: Object.assign({}, changePasswordUser),
      errorRole: '',
      datePickerConfig: {
        placeholder: 'Chọn',
        inputClass: 'form-control'
      },
      createdDateFrom: null,
      createdDateTo: null,
      loadingHeader: true
    };
  },
  mixins: [baseMixins],
  mounted() {
    const dataSearch = this.$route.query.dataSearch;
    if (!dataSearch) {
      this.fetchAdminUser();
      this.fetchTotalAdminUsers();
    }
    this.$store.dispatch("fetchRoles").then(() => {
      if (dataSearch) {
        this.dataFilter = JSON.parse(String(dataSearch));
        this.selectedStatus = this.options.filter((i) => i.value === this.dataFilter.status)[0];
        this.selectedRoles = this.roles.filter((i) => i.code === this.dataFilter.role)[0];

        this.createdDateFrom = this.dataFilter.createdDateFrom && new Date(this.dataFilter.createdDateFrom);
        this.createdDateTo = this.dataFilter.createdDateTo && new Date(moment(this.dataFilter.createdDateTo).subtract(1, 'day'));

        this.fetchAdminUser();
        this.fetchTotalAdminUsers();
      }
    });
  },
  validations: {
    user: {
      fullName: {
        required,
        maxLength: maxLength(300),
      },
      password: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(64),
        validatePassword
      },
      confirmPassword: {
        required, sameAsPassword: sameAs('password')
      },
      userName: {
        required,
        minLength: minLength(4),
        maxLength: maxLength(100),
        validateUserName
      },
      mobile: {
        required,
        isValidPhone,
      },
      email: {
        isValidEmail,
      }
    },
    changePasswordReq: {
      password: {
        required, minLength: minLength(8),
        maxLength: maxLength(64),
        validatePassword
      },
      confirmPassword: {
        required, sameAsPassword: sameAs('password')
      },
    }
  },
  components: {
    PageTitle, DatePicker
  },
  watch: {
    tabIndex(index) {
      if (index === 1) {
        this.$store.dispatch("fetchRoles");
      }
    }
  },
  computed: {
    ...mapGetters(["adminUsers", "totalAdminUsers", "roles", "userInfo"]),
    visibleFields() {
      return this.fields.filter(field => field.visible)
    },
    getTotalPage() {
      return Math.ceil(this.totalAdminUsers / this.dataFilter.pageSize);
    },
    fromPage() {
      return (this.dataFilter.page - 1) * this.dataFilter.pageSize + 1
    },
    toPage() {
      return this.dataFilter.page * this.dataFilter.pageSize >= this.totalAdminUsers
        ? this.totalAdminUsers
        : this.dataFilter.page * this.dataFilter.pageSize
    }
  },
  methods: {
    handleShowPassword(event) {
      event.preventDefault();
      this.showPassword = !this.showPassword;
    },
    handleShowConfirmPassword(event) {
      event.preventDefault();
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    changePage(e) {
      this.dataFilter.page = e
      const dataSearch = this.$route.query.dataSearch;
      if ((dataSearch && dataSearch !== JSON.stringify(this.dataFilter)) || !dataSearch) {
        router.push({ path: '/admin/user', query: { dataSearch: JSON.stringify(this.dataFilter) }})
      }

      this.fetchAdminUser();
      this.fetchTotalAdminUsers();
    },
    handlerCancel() {
      this.changePasswordReq = {
        id: 0,
        password: "",
        confirmPassword: ""
      };
      this.$nextTick(() => {
        this.$v.changePasswordReq.$reset();
      });
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.$root.$emit('bv::hide::modal', this.changPasswordModal.id);
    },
    handlerReset() {
      this.user = {
        userName: '',
        password: '',
        fullName: "",
        confirmPassword: '',
        roles: [],
        mobile: '',
        email: null
      };
      this.$nextTick(() => {
        this.$v.user.$reset();
      });
      this.$root.$emit('bv::hide::modal', this.modalInfo.id);
    },
    async handleUpdateRole() {
      if (this.roleSelected.length === 0) {
        this.errorRole = 'Bạn chưa chọn vai trò cho người dùng';
      } else {
        this.errorRole = '';
        let roleToUpdate = this.roleSelected.join();
        const dataUpdate = {
          id: this.currentUser.id,
          roles: roleToUpdate
        }
        let response = await this.post("/admin/user/role/update", dataUpdate);
        this.$message.closeAll()
        if (response && response.status === 200) {
          this.$message({
            message: "Cập nhật vai trò người dùng thành công.",
            type: "success",
            showClose: true,
          });
          // Hide the modal manually
          this.$nextTick(() => {
            this.$bvModal.hide(this.updateRoleModal.id)
          })
        } else {
          this.$message({
            message: "Cập nhật vai trò người dùng thất bại.",
            type: "error",
            showClose: true,
          });
        }
        await this.fetchAdminUser();
        await this.fetchTotalAdminUsers();
      }
    },
    handleCancelUpdateRole() {
      this.roleSelected = [];
      this.errorRole = '';
      this.$root.$emit('bv::hide::modal', this.updateRoleModal.id);
    },
    handleHideResetSOTP() {
      this.$root.$emit('bv::hide::modal', 'reset-sotp');
    },
    async resetSOTP() {
      const dataUpdate = {
        id: this.currentUser.id,
      }
      let response = await this.post("/admin/user/sotp/reset", dataUpdate);
      if (response && response.status === 200) {
        this.$message.closeAll()
        this.$message({
          message: "Đặt lại Smart OTP thành công.",
          type: "success",
          showClose: true,
        });
        this.handleHideResetSOTP();
        this.fetchAdminUser();
        this.fetchTotalAdminUsers();
      }
    },
    handleRowClick(item, index, event) {
      if (this.user.roles.includes(item.code)) {
        this.user.roles.splice(this.user.roles.findIndex(v => v === item.code), 1)
      } else {
        this.user.roles.push(item.code);
      }
    },
    handleUpdateRoleRowClick(item, index, event) {
      if (this.roleSelected.includes(item.code)) {
        this.roleSelected.splice(this.roleSelected.findIndex(v => v === item.code), 1);
      } else {
        this.roleSelected.push(item.code);
      }
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    openChangePasswordModal(item, index, button) {
      this.currentUser = Object.assign(this.currentUser, item);
      /*alert(JSON.stringify(this.currentUser));*/
      this.$root.$emit('bv::show::modal', this.changPasswordModal.id, button);
    },
    openModalUpdateRole(item) {
      this.currentUser = Object.assign(this.currentUser, item);
      let roleOfUser = this.currentUser.roles;
      this.roleSelected = roleOfUser.split(",");
      this.$store.dispatch("fetchRoles");
      this.$root.$emit('bv::show::modal', this.updateRoleModal.id);
    },
    openModalChangeStatus(item) {
      this.currentUser = Object.assign(this.currentUser, item);
      this.$root.$emit("bv::show::modal", "update-status-user");
    },
    openModalResetSOTP(item) {
      this.currentUser = Object.assign(this.currentUser, item);
      this.$root.$emit("bv::show::modal", "reset-sotp");
    },
    handleHideChangeStatus() {
      this.$root.$emit("bv::hide::modal", "update-status-user");
    },
    async changeStatus() {
      let currentStatus = this.currentUser.status;
      const dataUpdate = {
        id: this.currentUser.id,
        status: 0
      }
      dataUpdate.status = currentStatus === 1 ? 2 : 1
      let response = await this.post("/admin/user/status/update", dataUpdate);
      this.$root.$emit("bv::hide::modal", "update-status-user");
      this.$message.closeAll()

      if (response && response.status === 200) {
        this.$message({
          message: "Cập nhật trạng thái thành công.",
          type: "success",
          showClose: true,
        });
        this.fetchAdminUser();
        this.fetchTotalAdminUsers();
      } else {
        this.$message({
          message: "Cập nhật trạng thái thất bại.",
          type: "error",
          showClose: true,
        });
      }
    },
    async fetchAdminUser() {
      let vm = this;
      let response = await this.post("/admin/user/list", this.dataFilter);

      if (response) {
        setTimeout(() => {
          if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
        }, 200)
      }

      if (response && response.data) {
        vm.$store.commit("setAdminUsers", response.data);
      }
    },
    async fetchTotalAdminUsers() {
      let vm = this;
      let response = await this.post("/admin/user/count", this.dataFilter);
      if (response && response.data >= 0) {
        vm.$store.commit("setTotalAdminUsers", response.data);
      }
    },
    handlerOk(event) {
      event.preventDefault();
      this.handlerSubmit();
    },
    handleSearch(event) {
      event.preventDefault();
      this.dataFilter.status = this.selectedStatus === null ? null : this.selectedStatus.value;
      this.dataFilter.role = this.selectedRoles === null ? '' : this.selectedRoles.id === '' ? '' : this.selectedRoles.code;
      this.dataFilter.createdDateFrom = this.createdDateFrom && formatTime(this.createdDateFrom, 'START')
      this.dataFilter.createdDateTo = this.createdDateTo && formatTime(this.createdDateTo, 'END')
      this.dataFilter.page = 1;
      router.push({ path: '/admin/user', query: { dataSearch: JSON.stringify(this.dataFilter) }})
      this.fetchTotalAdminUsers();
      this.fetchAdminUser();
    },
    handleReset() {
      this.$router.replace('/admin/user')
      this.dataFilter = Object.assign({}, initDataFilter);
      this.selectedRoles = {id: '', code: 'Tất cả' };
      this.selectedStatus = {value: null, text: 'Tất cả'};
      this.createdDateFrom = null;
      this.createdDateTo = null;
      this.fetchTotalAdminUsers();
      this.fetchAdminUser();
    },
    async handlerChangePasswordUser(event) {
      event.preventDefault();
      this.$v.$touch();
      if (this.$v.changePasswordReq.$invalid) {
        return;
      }
      this.changePasswordReq.id = this.currentUser.id;
      let response = await this.post("/admin/user/password/update", this.changePasswordReq);
      this.$message.closeAll()
      if (response && response.status === 200) {
        this.$message({
          message: "Đổi mật khẩu người dùng thành công.",
          type: "success",
          showClose: true,
        });
        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide(this.changPasswordModal.id);
        })
      } else {
        this.$message({
          message: "Đổi mật khẩu người dùng thất bại.",
          type: "error",
          showClose: true,
        });
      }
    },
    async handlerSubmit() {
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.user.$invalid) {
        return;
      }

      if (this.user.roles.length === 0) {
        this.$message({
          message: "Chưa chọn vai trò cho người dùng.",
          type: "error",
          showClose: true,
        });
        this.errorRole = "";
        return;
      } else {
        this.errorRole = "";
      }
      //alert("SUCCESS!! :-)\n\n" + JSON.stringify(this.user));
      const createUserData = {
        userName: this.user.userName,
        password: this.user.password,
        fullName: this.user.fullName,
        roles: this.user.roles.join(),
        mobile: this.user.mobile,
        // email: this.user.email
        email: null
      }

      let response = await this.post("/admin/user/insert", createUserData);
      if (response && response.status === 200) {
        this.$message({
          message: "Tạo tài khoản người dùng thành công.",
          type: "success",
          showClose: true,
        });
        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide(this.modalInfo.id)
        })
      }
    }
  }
};
</script>

<style lang="scss">
//custom date picker

</style>
