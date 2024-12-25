<template>
  <div>
    <page-title
      :btn-title="getBtnTitle"
      :loading="loadingHeader"
      heading="Danh sách các quyền trong hệ thống"
      icon="pe-7s-portfolio icon-gradient bg-happy-itmeo"
      modal-id="modal-update-permission"
      subheading="Quản lý danh sách các quyền trong hệ thống"
    ></page-title>

    <b-card class="main-card search-wrapper mb-20">
      <template v-if="loadingHeader">
        <a-skeleton :paragraph="{ rows: 5 }" active></a-skeleton>
      </template>
      <template v-else>
        <b-table
          :bordered="true"
          :fields="visibleFields"
          :fixed="true"
          :foot-clone="false"
          :hover="true"
          :items="permissions"
        >
          <template #cell(key)="row">
            {{ row.index + 1 }}
          </template>
          <template #cell(parentId)="row">
            {{ convertParentIdToName(row.item.parentId) }}
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <a
              v-if="userInfo && userInfo.permissions.indexOf('permission_group_update') !== -1"
              v-b-tooltip.hover
              class="mr-2"
              href="javascript:void(0)"
              title="Cập nhật"
              type="button"
              @click.prevent="openModalEditPermission(row.item)"
            >
              <font-awesome-icon :icon="['fas', 'pencil-alt']"/>
            </a>
            <a
              v-if="userInfo && userInfo.permissions.indexOf('permission_group_delete') !== -1"
              v-b-tooltip.hover
              class="mr-2"
              href="javascript:void(0)"
              title="Xóa"
              type="button"
              @click.prevent="openModalDeleteProduct(row.item)"
            >
              <font-awesome-icon
                :icon="['fas', 'trash']"
                class="color-inactive"
              />
            </a>
          </template>
        </b-table>

        <b-row v-if="!permissions || permissions.length === 0" class="justify-content-center">
          <span>Không tìm thấy bản ghi nào</span>
        </b-row>
      </template>
    </b-card>

    <b-modal
      id="modal-update-permission"
      :no-close-on-backdrop="true"
      :title="isUpdate ? 'Cập nhật quyền' : 'Thêm quyền'"
      size="lg"
      @hidden="handleCancel"
    >
      <div class="d-flex flex-wrap">
        <div style="flex: 1 1 0">
          <b-form-group>
            <label>Tên quyền<span class="text-danger">*</span>:</label>
            <b-form-input
              id="input-0"
              v-model="$v.currentData.label.$model"
              :class="{
                'is-invalid': validationStatus($v.currentData.label),
              }"
              placeholder="Nhập tên"
            ></b-form-input>
            <div v-if="!$v.currentData.label.required" class="invalid-feedback">
              Tên không được để trống.
            </div>
          </b-form-group>
          <b-form-group>
            <label>Mã quyền:</label>
            <b-form-input
              id="input-0"
              v-model.trim="currentData.code"
              placeholder="Nhập mã"
            ></b-form-input>
          </b-form-group>
          <b-form-group>
            <label>Quyền liên quan:</label>
            <multiselect
              v-model="permissionSelected"
              :options="permissionOption"
              :searchable="true"
              :show-labels="false"
              label="text"
              placeholder="Chọn"
              track-by="value"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                {{ option.text }}
              </template>
            </multiselect>
          </b-form-group>
        </div>
      </div>
      <template #modal-footer>
        <b-button class="mr-2 btn-light2 pull-right" @click="handleCancel">
          Hủy
        </b-button>
        <b-button variant="primary" @click.prevent="handleSubmit">
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal
      id="delete-permission"
      :no-close-on-backdrop="true"
      title="Xóa quyền"
      @hidden="handleResetDelete"
    >
      <p class="my-4">Bạn có chắc chắn muốn xóa quyền <span class="font-weight-bold">{{ this.currentData.label }}</span>
        không ?</p>
      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handleResetDelete"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          @click.prevent="deletePermission"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import PageTitle from "@/Layout/Components/PageTitle";
import baseMixins from "@/components/mixins/base";
import { required } from "vuelidate/lib/validators";
import { PAGINATION_OPTIONS } from "../common/config";
import { formatDateTime } from "../common/utils";
import Vue from "vue";
import Multiselect from "vue-multiselect";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import "vue2-datepicker/locale/vi";
import router from "@/router";

Vue.component("multiselect", Multiselect);

const initPermission = {
  id: null,
  label: null,
  code: null,
  parentId: null,
};

var initDataFilter = {
  id: null,
  label: null,
  code: null,
  parentId: null
};

export default {
  name: "Permission",
  components: { PageTitle, DatePicker },
  data() {
    return {
      PAGINATION_OPTIONS,
      currentData: Object.assign({ parent: null }, initPermission),
      dataFilter: Object.assign({}, initDataFilter),
      userInfo: localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null,
      permissions: [],
      getTotalPermission: 0,
      loadingHeader: true,
      isUpdate: false,
      permissionSelected: null,
      fields: [
        {
          key: "key",
          label: "STT",
          tdClass: "align-middle",
          thClass: "align-middle",
          visible: true,
          thStyle: { width: "3%", "vertical-align": "middle" },
        },
        {
          key: "id",
          label: "ID",
          visible: true,
          thStyle: { width: "6%", "vertical-align": "middle" },
        },
        {
          key: "label",
          label: "Tên quyền",
          visible: true,
          thStyle: { width: "9%", "vertical-align": "middle" },
        },
        {
          key: "code",
          label: "Mã quyền",
          visible: true,
          thStyle: { width: "7%", "vertical-align": "middle" },
        },
        {
          key: "parentId",
          label: "Quyền cha",
          visible: true,
          thStyle: { width: "9%", "vertical-align": "middle" },
        },
        {
          key: "actions",
          label: "Chức năng",
          tdClass: "align-middle",
          thClass: "align-middle",
          visible: true,
          thStyle: { width: "4%", "vertical-align": "middle" },
        },
      ],
    };
  },
  mixins: [baseMixins],
  validations: {
    currentData: {
      label: {
        required,
      }
    },
  },
  created() {
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));
    }
    this.handleDataFilter();

    if (this.userInfo && this.userInfo.permissions.indexOf('permission_list') !== -1) this.fetchPermissions();
  },
  computed: {
    permissionOption() {
      return this.permissions.map(item => {
        return { text: item.label, value: item.id }
      })
    },
    getBtnTitle() {
      return this.userInfo ? "Thêm quyền" : null;
    },
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
  },
  methods: {
    convertParentIdToName(parentId) {
      const permissionFiltered = this.permissions && this.permissions.length > 0 && this.permissions.filter((item) => Number(item.id) === Number(parentId));
      return permissionFiltered.length > 0 ? permissionFiltered[0].label : ''
    },
    openModalDeleteProduct(data) {
      this.currentData = Object.assign({}, data);
      this.$root.$emit("bv::show::modal", "delete-permission");
    },
    handleResetDelete() {
      this.$root.$emit("bv::hide::modal", "delete-permission");
    },
    async deletePermission() {
      let response = await this.post("/permission/delete", {
        id: this.currentData.id
      });

      if (response && response.status !== 200) {
        this.$message({
          message: "Xoá quyền không thành công. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          type: "error",
          showClose: true,
        });
        return;
      }
      this.$message({
        message: "Xóa quyền thành công.",
        type: "success",
        showClose: true,
      });
      this.$root.$emit("bv::hide::modal", "delete-permission");
      this.fetchPermissions().then();
    },
    formatDateTime(value) {
      if (value) {
        let date = new Date(value);
        return formatDateTime(date);
      }
      return "";
    },
    async fetchPermissions() {
      let res = await this.get("/permissions", '', this.dataFilter);

      if (res) {
        setTimeout(() => {
          if (this.loadingHeader) this.loadingHeader = !this.loadingHeader;
        }, 200);
      }

      if (res && res.status === 200) {
        this.permissions = res.data;
        this.getTotalPermission = res.data.length;
      }
    },
    async handleCreateAndUpdatePermission() {
      let { id, label, code } = { ...this.currentData };

      let payload = {
        label: label ? label.trim() : null,
        parentId: this.permissionSelected ? this.permissionSelected.value : null,
        code
      };

      let response = {}

      if (this.isUpdate) {
        response = await this.post('/permission/update', { id, ...payload });
      }

      if (!this.isUpdate) {
        response = await this.post('/permission/add', payload);
      }

      if (response && response.status === 200) {
        this.dataFilter.page = 1;
        this.fetchPermissions();
        this.$root.$emit("bv::hide::modal", "modal-update-permission");
        this.currentData = Object.assign({}, initPermission);
        this.permissionSelected = null;
        this.$message({
          message: `${this.isUpdate ? 'Cập nhật' : 'Thêm'} quyền thành công.`,
          type: "success",
          showClose: true,
        });
      }
    },
    handleSubmit() {
      this.$v.$reset();
      this.$v.$touch();
      if (this.$v.currentData.$invalid) {
        return;
      }
      this.handleCreateAndUpdatePermission();
    },
    openModalEditPermission(data) {
      this.isUpdate = true;
      this.currentData = Object.assign({}, { ...data });

      if (this.currentData.parentId) {
        let parent = this.permissions.filter((item) => Number(item.id) === Number(this.currentData.parentId))[0]
        this.permissionSelected = parent ? { text: parent.label, value: parent.id } : null
      }

      this.$root.$emit("bv::show::modal", "modal-update-permission");
    },
    handleCancel() {
      this.$root.$emit("bv::hide::modal", "modal-update-permission");
      this.isUpdate = false;
      this.currentData = Object.assign({}, initPermission);
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    handleSearch() {
      this.dataFilter.page = 1;
      this.handleDataFilter();
      router.push({
        path: "/admin/permission",
        query: { dataSearch: JSON.stringify(this.dataFilter) },
      });
      this.fetchPermissions();
    },
    handleDataFilter() {
    },
    handleResetFilter() {
      this.$router.replace("/admin/permission");
      this.dataFilter = Object.assign({}, initDataFilter);
      this.handleSearch();
    },
  },
};
</script>

<style lang="scss" scoped>
#modal-update-permission {
  .multiselect {
    min-height: 32px !important;
  }
}

.is-invalid-option {
  border-radius: 5px;
  border: 1px solid #ff7851 !important;
}

.custom-wrapper {
  overflow-wrap: break-word;
}

.custom-banner-image {
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.banner-image__preview {
  width: 20rem;
  height: 8rem;

  .overlay {
    width: 100%;
    height: 100%;
    display: none;
    background-color: rgba(0, 0, 0, 0.4);
  }

  &:hover .overlay {
    display: block;
    display: flex;
    justify-content: center;
    cursor: pointer;
    transition-duration: 500ms;
  }

  .banner-image__btn {
    border: none;
    outline: none;
    background-color: transparent;
    margin: 1rem;
    cursor: pointer;
    border-radius: 10px;
    color: white;
    font-size: 1.5rem;
  }
}
</style>
