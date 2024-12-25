<template>
  <b-form @submit="login">
    <div class="h-100 bg-animation">
      <div class="d-flex h-100 justify-content-center align-items-center">
        <div class="mx-auto app-login-box">
          <div class="h5 modal-title text-center">
            <div>
              <img
                  src="@/assets/static/images/logo-soict-hust-1.png"
                  alt="SOICT"
                  width="300px"
                  class="brand-img"
              />
<!--              <img-->
<!--                  src="@/assets/static/images/logo-2.png"-->
<!--                  alt="SC5"-->
<!--                  width="500px"-->
<!--                  class="brand-img"-->
<!--              />-->
              <div style="display: inline-block; text-align: left"><b>ĐẠI HỌC BÁCH KHOA HÀ NỘI <br/>TRƯỜNG CÔNG NGHỆ
                THÔNG TIN VÀ TRUYỀN THÔNG</b></div>
            </div>
            <h4 class="mt-2">
              <span style="font-weight: 500">HỆ THỐNG QUẢN LÝ VÀ PHÂN CÔNG GIẢNG DẠY</span>
            </h4>
<!--            <h4 class="mt-2">-->
<!--              <span style="font-weight: 500">HỆ THỐNG QUẢN LÝ VÍ ĐIỆN TỬ SC5</span>-->
<!--            </h4>-->
          </div>
          <div class="modal-dialog w-100 mx-auto">
            <div class="modal-content">
              <div class="modal-body">
                <h4 class="mt-2 text-center">
                  <span style="font-weight: 500">Đăng nhập</span>
                </h4>
                <div>
                  <b-form-group id="exampleInputGroup1" label-for="exampleInput1">
                    <b-form-input
                        id="exampleInput1"
                        v-model="form.username"
                        type="text"
                        required
                        placeholder="Tên đăng nhập"
                    >
                    </b-form-input>
                  </b-form-group>
                  <b-form-group id="exampleInputGroup2" label-for="exampleInput2">
                    <b-form-input
                        id="exampleInput2"
                        v-model="form.password"
                        type="password"
                        required
                        placeholder="Mật khẩu"
                    >
                    </b-form-input>
                  </b-form-group>
                </div>
              </div>
              <div class="modal-footer clearfix justify-content-center">
                <div class="w-100">
                  <b-button
                      type="submit"
                      size="lg"
                      class="button-login"
                      block
                      style="height: 40px"
                      @click.prevent="submit"
                      :disabled="loadingButton"
                  >{{ 'Đăng nhập' }}
                  </b-button>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center opacity-8 mt-3">
            Copyright &copy; SOICT {{ new Date().getFullYear() }}
          </div>
        </div>

        <div class="right-content"></div>
      </div>
    </div>
  </b-form>
</template>

<script>
import axios from "axios";
import {EventBus} from "@/common/event-bus";
import Configuration from "@/configuration";
import baseMixins from "@/components/mixins/base";
// utility
import {mapGetters} from 'vuex'
import router from "@/router";
import StorageService from "@/common/storage.service";
import {getAuthenticatedUser} from "@/common/utils";

const API_SC5 = Configuration.value("sc5AdminURL");

export default {
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
      loadingButton: false,
      requestId: null,
    };
  },
  mixins: [baseMixins],
  created() {
  },
  computed: {
    ...mapGetters({
      eventData: 'eventData'
    })
  },
  watch: {
    eventData: {
      deep: true,
      immediate: true,
      handler: function (newVal, oldVal) {
      }
    }
  },
  mounted() {
    setInterval(() => {
    }, 1000)
  },
  methods: {
    submit() {
      this.login()
    },
    login() {
      this.loadingButton = true;
      EventBus.$emit("send-progress", true);
      axios
          .post(`${API_SC5}/login`, this.form)
          .then(async (response) => {
            EventBus.$emit("close-progress", true);
            if (response.status === 200) {
              this.loadingButton = false;

              StorageService.save("sc5_token", response.data.accessToken);
              StorageService.save("Token", JSON.stringify(response.data));

              console.log(StorageService.get("Token"));

              await getAuthenticatedUser();
              this.$message.closeAll();

              router.push("/").catch((e) => {
                this.$message({
                  message: 'Đã có lỗi xảy ra',
                  type: "warning",
                  showClose: true,
                });
              });
            }
          })
          .catch((error) => {
            EventBus.$emit("close-progress", true);
            this.loadingButton = false;
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
  },
};
</script>


<style lang="scss" scoped>
.button-login {
  color: #fff;
  background-color: #069255;
  border-color: #069255;
}

@media only screen and (max-width: 1024px) {
  .right-content {
    display: none;
  }

  .brand-img {
    width: 400px;
  }
}

@media only screen and (max-width: 1366px) {
  .brand-img {
    width: 300px;
  }
  .modal-dialog {
    margin: 0 auto;
  }
  .app-login-box h4 {
    margin-bottom: 5px;
  }
  .input-otp {
    height: 80px;
  }
}

@media only screen and (max-width: 768px) {
  .brand-img {
    width: 100%;
  }
}

.back-button {
  position: absolute;
  top: 30px;
  left: 18px;
}

.back-icon {
  font-weight: normal;
  color: #069255;
  cursor: pointer;
}

.input-otp {
  height: 100px;
}

</style>
