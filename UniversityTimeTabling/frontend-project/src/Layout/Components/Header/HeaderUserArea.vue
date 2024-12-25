<template>
  <div class="d-flex">
    <div class="header-btn-lg pr-0">
      <div class="widget-content p-0">
        <div class="widget-content-wrapper">
          <div class="widget-content-left header-user-info">
            <div class="widget-heading">
              {{ userInfo.fullName }}
            </div>
            <div class="widget-subheading">
              {{ userInfo.username }}@sis.hust.edu.vn
            </div>
          </div>
          <div class="widget-content-left ml-3">
            <b-dropdown
              toggle-class="p-0 mr-2"
              menu-class="dropdown-menu-lg"
              variant="link"
              right
            >
              <span slot="button-content">
                <div class="icon-wrapper icon-wrapper-alt rounded-circle">
                  <img
                    width="42"
                    class="rounded-circle"
                    src="@/assets/images/avatars/default-user.png"
                    alt=""
                  />
                </div>
              </span>
              <button type="button" tabindex="0" class="dropdown-item" @click="openModalChangePassword">Đổi mật khẩu
              </button>
              <div tabindex="-1" class="dropdown-divider"></div>
              <button
                type="button"
                tabindex="0"
                class="dropdown-item"
                @click="logout"
              >
                Đăng xuất
              </button>
            </b-dropdown>
          </div>
        </div>
      </div>
      <b-modal :id="changePasswordModal.id" title="Đổi mật khẩu" :no-close-on-backdrop="true" @hidden="handlerCancelChangePassword" :hide-footer="false">
        <b-form>
          <b-form-group>
            <label for="oldPassword">Mật khẩu cũ <span class="text-danger">*</span>:</label>
            <b-input-group>
              <b-form-input
                id="oldPassword"
                :type="showPassword ? 'text' : 'password'"
                v-model.trim="$v.changePasswordPayload.oldPassword.$model"
                :class="{'is-invalid': validationStatus($v.changePasswordPayload.oldPassword)}"
              ></b-form-input>
              <b-input-group-append>
                <b-button class="btn-light2" @click="handleShowPassword(1)">
                  <font-awesome-icon v-if="showPassword" :icon="['fas','eye']"/>
                  <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
                </b-button>
              </b-input-group-append>
              <div v-if="!$v.changePasswordPayload.oldPassword.required" class="invalid-feedback">Mật khẩu cũ không được
                để
                trống.
              </div>
            </b-input-group>
          </b-form-group>
          <b-form-group>
            <label for="newPassword">Mật khẩu mới <span class="text-danger">*</span>:</label>
            <b-input-group>
              <b-form-input
                id="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                v-model.trim="$v.changePasswordPayload.newPassword.$model"
                :class="{'is-invalid': validationStatus($v.changePasswordPayload.newPassword)}"
              ></b-form-input>
              <b-input-group-append>
                <b-button class="btn-light2" @click="handleShowPassword(2)">
                  <font-awesome-icon v-if="showNewPassword" :icon="['fas','eye']"/>
                  <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
                </b-button>
              </b-input-group-append>
              <div v-if="!$v.changePasswordPayload.newPassword.required" class="invalid-feedback">Mật khẩu mới không
                được
                để
                trống.
              </div>
              <div v-if="!$v.changePasswordPayload.newPassword.minLength" class="invalid-feedback">Mật phẩu phải có ít
                nhất
                {{ $v.changePasswordPayload.newPassword.$params.minLength.min }} ký tự.
              </div>
              <div v-if="!$v.changePasswordPayload.newPassword.maxLength" class="invalid-feedback">Mật khẩu không được
                vợt
                quá
                {{ $v.changePasswordPayload.newPassword.$params.maxLength.max }} ký tự.
              </div>
              <div v-if="!$v.changePasswordPayload.newPassword.validatePassword" class="invalid-feedback">Mật khẩu phải
                bao
                gồm chữ
                thường
                chữ hoa, số và ký tự đặc biệt.
              </div>
            </b-input-group>
          </b-form-group>
          <b-form-group>
            <label for="confirmPassword">Xác nhận mật khẩu mới <span class="text-danger">*</span>:</label>
            <b-input-group>
              <b-form-input
                id="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model.trim="changePasswordPayload.confirmPassword"
                :class="{'is-invalid': validationStatus($v.changePasswordPayload.confirmPassword)}"
              ></b-form-input>
              <b-input-group-append>
                <b-button class="btn-light2" @click="handleShowPassword(3)">
                  <font-awesome-icon v-if="showConfirmPassword" :icon="['fas','eye']"/>
                  <font-awesome-icon v-else :icon="['fas','eye-slash']"/>
                </b-button>
              </b-input-group-append>
              <div v-if="!$v.changePasswordPayload.confirmPassword.required" class="invalid-feedback">Xác nhận mật khẩu
                không
                được để trống.
              </div>
              <div v-if="!$v.changePasswordPayload.confirmPassword.sameAsPassword" class="invalid-feedback">Xác nhận mật
                khẩu
                không khớp.
              </div>
            </b-input-group>
          </b-form-group>
        </b-form>
        <template #modal-footer>
          <b-button
            class="mr-2 btn-light2 pull-right"
            @click="handlerCancelChangePassword"
          >
            Hủy
          </b-button>
          <b-button
            variant="primary pull-right"
            class="mr-2"
            @click.prevent="handlerChangePassword"
          >
            Lưu
          </b-button>
        </template>
      </b-modal>

    </div>
  </div>
</template>

<script>
import {library} from "@fortawesome/fontawesome-svg-core";
import {
  faAngleDown,
  faCalendarAlt,
  faTrashAlt,
  faCheck,
  faFileAlt,
  faCloudDownloadAlt,
  faFileExcel,
  faFilePdf,
  faFileArchive,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {
  getAuthenticatedUser, logout, performLogout,
} from "@/common/utils";
import {validatePassword} from "@/common/validate";
import {required, minLength, sameAs, maxLength} from "vuelidate/lib/validators";
import baseMixins from "../../../components/mixins/base";

library.add(
  faAngleDown,
  faCalendarAlt,
  faTrashAlt,
  faCheck,
  faFileAlt,
  faCloudDownloadAlt,
  faFileExcel,
  faFilePdf,
  faFileArchive,
  faEllipsisH
);
import {mapGetters} from "vuex";
import {EventBus} from "@/common/event-bus";
import axios from "axios";
import StorageService from "@/common/storage.service";
import router from "@/router";
import Configuration from "@/configuration";
const API_SC5 = Configuration.value("sc5AdminURL");

const initChangePassword = {
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: ""
}

export default {
  name: "HeaderUserArea",
  components: {
    "font-awesome-icon": FontAwesomeIcon,
  },
  data() {
    return {
      changePasswordModal: {
        id: 'change-password-user-modal'
      },
      changePasswordPayload: Object.assign({}, initChangePassword),
      showPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
    }
  },
  mixins: [baseMixins],
  validations: {
    changePasswordPayload: {
      oldPassword: {
        required
      },
      newPassword: {
        required, minLength: minLength(8),
        maxLength: maxLength(15),
        validatePassword
      },
      confirmPassword: {
        required, sameAsPassword: sameAs('newPassword')
      },
    }
  },
  computed: {
    ...mapGetters(["userInfo"])
  },
  mounted() {
    this.fetchUserInfo();
  },
  methods: {
    handleShowPassword(type) {
      switch (type) {
        case 1:
          this.showPassword = !this.showPassword;
          break;
        case 2:
          this.showNewPassword = !this.showNewPassword;
          break;
        case 3:
          this.showConfirmPassword = !this.showConfirmPassword;
          break;
      }
    },
    fetchUserInfo() {
      this.$store.dispatch("fetchUserInfo");
    },
    openModalChangePassword() {
      this.$root.$emit('bv::show::modal', this.changePasswordModal.id);
    },
    logout() {
      logout();
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    login() {
      let loader = this.$loading.show({
        loader: 'dots',
        color: '#069255'
      });
      axios
          .post(`${API_SC5}/login`, {
            username: JSON.parse(localStorage.getItem('userInfo')).username,
            password: this.changePasswordPayload.newPassword
          })
          .then(async (response) => {
            this.$nextTick(() => {
              this.$bvModal.hide(this.changePasswordModal.id);
            });

            loader.hide();
            if (response.status === 200) {
              StorageService.save("sc5_token", response.data.accessToken);
              StorageService.save("Token", JSON.stringify(response.data));
              await getAuthenticatedUser();
              this.$message.closeAll();
              this.$message({
                message: 'Thay đổi mật khẩu thành công.',
                type: "success",
                showClose: true,
              });
            }
          })
          .catch((error) => {
            loader.hide();
            if (error.response && error.response.data) {
              this.$message({
                message: error.response.data.message,
                type: "warning",
                showClose: true,
              });
            } else {
              this.$message({
                message: "Có lỗi xảy ra",
                type: "warning",
                showClose: true,
              });
            }
          });
    },
    async handlerChangePassword(event) {
      event.preventDefault();
      this.$v.$touch();
      if (this.$v.changePasswordPayload.$invalid) {
        return;
      }
      let response = await this.post("change-password", this.changePasswordPayload);
      if (response && response.status === 200) {
        // Hide the modal manually
        this.changePasswordPayload = {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        };
        this.$nextTick(() => {
          this.$bvModal.hide(this.changePasswordModal.id);
        });
        this.showMsgBoxTwo();
      }
    },
    handlerCancelChangePassword() {
      this.changePasswordPayload = {
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      };
      this.$nextTick(() => {
        this.$v.changePasswordPayload.$reset();
      });
      this.$root.$emit('bv::hide::modal', this.changePasswordModal.id);
    },
    showMsgBoxTwo() {
      this.$bvModal.msgBoxOk('Đổi mật khẩu thành công. Sau khi đổi mật khẩu thành công cần đăng xuất khỏi hệ thống và đăng nhập lại.', {
        title: 'Thông báo',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'success',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        centered: false
      })
        .then(value => {
          if (value) {
            performLogout();
          }
        })
        .catch(err => {
          alert(err);
        })
    }
  },
};
</script>

<style lang="scss" scoped>
.widget-heading {
  color: #01904a !important;
}
.widget-subheading {
  color: #01904a !important;
}
.widget-content-wrapper {
  padding: 0 1rem;
  background-color: #fff;
  box-shadow: 0 .25rem .375rem -.0625rem rgba(20,20,20,.12),0 .125rem .25rem -.0625rem rgba(20,20,20,.07);
  border: 0 solid rgba(0,0,0,.125) !important;
  border-radius: 1rem !important;
}
</style>
