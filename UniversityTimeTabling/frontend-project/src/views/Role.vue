<template>
  <div>
    <page-title
      :heading="heading"
      :subheading="subheading"
      :icon="icon"
      :btn-title="userInfo && userInfo.permissions.indexOf('role_insert') !== -1 ? btnTitle : ''"
      :modal-id="modalId"
      :loading="loadingHeader"
    ></page-title>
    <b-card class="main-card mb-4">
      <template v-if="loadingHeader">
        <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
      </template>
      <template v-else>
      <b-table :items="allRoles" :fields="fields" hover bordered>
        <template #cell(key)="row">
          {{ row.index + 1 }}
        </template>

        <template #cell(actions)="row" class="text-center">
          <a
            v-if="userInfo && userInfo.permissions.indexOf('role_update') !== -1"
            type="button"
            :key="row.item.id"
            title="Cập nhật vai trò"
            @click.prevent="openModalEditRole(row.item)"
            href="javascript:void(0)"
            class="mr-2"
            v-b-tooltip.hover
          >
            <font-awesome-icon :icon="['fas', 'pencil-alt']"/>
          </a>
        </template>
      </b-table>
      </template>
    </b-card>
    <b-modal
      :id="modalId"
      :title="modalTitle ? modalTitle : 'Thêm vai trò'"
      size="lg"
      :no-close-on-backdrop="true"
      @hidden="handleReset"
    >
      <b-form-group>
        <label>Mã vai trò <span v-if="!isUpdate" class="text-danger">*</span>:</label>
        <span v-if="isUpdate" style="font-weight: 500">{{ currentRole.code }}</span>
        <div v-else>
          <b-form-input
            id="input-1"
            v-model.trim="$v.filterAdd.code.$model"
            maxlength="100"
            placeholder="Nhập vai trò"
            :class="{ 'is-invalid': validationStatus($v.filterAdd.code) }"
          ></b-form-input>
          <div v-if="!$v.filterAdd.code.required" class="invalid-feedback">Mã vai trò không được để trống.</div>
          <div v-if="!$v.filterAdd.code.maxLength" class="invalid-feedback">Mã vai trò không được vượt quá
            {{ $v.filterAdd.code.$params.maxLength.max }} ký tự.
          </div>
        </div>
      </b-form-group>
      <b-form-group>
        <label>Mô tả <span class="text-danger">*</span>:</label>
        <b-form-textarea
            id="input-2"
            v-model.trim="$v.filterAdd.description.$model"
            placeholder="Nhập mô tả"
            :class="{'is-invalid': validationStatus($v.filterAdd.description)}"
            maxlength="300"
        ></b-form-textarea>
        <div v-if="!$v.filterAdd.description.required" class="invalid-feedback">
          Mô tả của vai trò không được để trống.
        </div>
        <div v-if="!$v.filterAdd.description.maxLength" class="invalid-feedback">Mã vai trò không được vượt quá
          {{ $v.filterAdd.description.$params.maxLength.max }} ký tự.
        </div>
      </b-form-group>
      <b-form-group>
        <label>Quyền hạn <span class="text-danger">*</span>:</label>
        <el-tree
          :data="permission"
          show-checkbox
          :default-expanded-keys="['406']"
          node-key="id"
          ref="tree"
          highlight-current
          :props="defaultProps">
        </el-tree>
        <div v-if="isPermissionEmpty" class="error">
          Quyền hạn không được để trống.
        </div>
      </b-form-group>
      <template #modal-footer>
        <b-button
          class="mr-2 btn-light2 pull-right"
          @click="handleReset"
        >
          Hủy
        </b-button>
        <b-button
          variant="primary pull-right"
          class="mr-2"
          @click.prevent="handleSubmit"
        >
          Lưu
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import PageTitle from "../Layout/Components/PageTitle";
import baseMixins from "../components/mixins/base";
import {mapGetters} from "vuex";
import {maxLength, required} from "vuelidate/lib/validators";
import {FETCH_PERMISSION} from "@/store/action.type";

const initDataAddRole = {
  code: null,
  description: null,
  permissions: null,
};

var initDataFilter = {
  id: null,
  name: null,
  code: null,
  parentId: null
};

export default {
  name: "Role",
  mixins: [baseMixins],
  data() {
    return {
      subheading: "Tạo và quản lý các vai trò, phân quyền cho các vai trò.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Vai trò và quyền hạn",
      btnTitle: "Thêm vai trò",
      modalTitle: "",
      modalId: "add-role",
      isUpdate: false,
      modalEdit: "edit-role",
      fields: [
        { key: "key", label: "STT", tdClass: 'align-middle', thClass: 'align-middle', visible: true, thStyle: { width: '3%' } },
        {key: "code", label: "Mã vai trò"},
        {key: "description", label: "Mô tả"},
        {key: "actions", label: "Chức năng", thClass: 'text-center', tdClass : 'text-center', thStyle: "width: 8%"},
      ],
      keys: 214,
      filterAdd: Object.assign({}, initDataAddRole),
      filterUpdate: {},
      currentRole: {},
      dataFilter: Object.assign({}, initDataFilter),
      idDelete: null,
      permission: [],
      permissionsOriginal: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      isPermissionEmpty: false,
      permissionLength: 0,
      loadingHeader: true,
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    };
  },
  components: {
    PageTitle,
  },
  computed: {
    ...mapGetters(["allRoles"]),
  },
  mounted() {
    this.fetchRoles();
    // this.fetchPermission();
    this.fetchPermissionV2()
  },
  validations: {
    filterAdd: {
      code: {
        required,
        maxLength: maxLength(100)
      },
      description: {
        required,
        maxLength: maxLength(300)
      },
    }
  },
  methods: {
    getPosition(string, subString, index) {
      return string.split(subString, index).join(subString).length;
    },
    handleReset() {
      this.filterAdd = {
        code: null,
        description: null,
        permissions: null,
      };
      this.isPermissionEmpty = false;
      this.$nextTick(() => {
        this.$v.filterAdd.$reset();
      });
      this.isUpdate = false;
      this.modalTitle = "";
      this.$root.$emit("bv::hide::modal", this.modalId);
    },
    async fetchRoles() {
      let res = await this.$store.dispatch("fetchAllRoles");
      if (res) {
        setTimeout(() => {
          if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
        }, 200)
      }
    },

    formatChildren(parentId, childArr) {
      return childArr.map(item => {
        if (item.children && item.children.length > 0) {
          return this.formatChildren(item.id, item.children)
        } else {
          return { id: item.id, label: item.name, parentId: parentId }
        }
      })
    },

    async fetchPermissionV2() {
      let res = await this.get("/permission/groups", '', this.dataFilter);

      let dataArr = [...res.data];

      if (dataArr.length === 0) return

      this.permissionsOriginal = res.data;

      const idMapping = dataArr.reduce((acc, el, i) => {
        acc[el.id] = i;
        return acc;
      }, {});

      let root;
      dataArr.forEach((el) => {
        // Handle the root element
        if (el.parentId === null) {
          root = el;
          // root.label = <span style="font-weight: 500">{el.label}</span>
          return;
        }
        // Use our mapping to locate the parent element in our data array
        const parentEl = dataArr[idMapping[el.parentId]];
        // Add our current el to its parent's `children` array
        parentEl.children = [...(parentEl.children || []), el];
        parentEl.label = <span style="font-weight: 500">{parentEl.label}</span>
      });

      this.permission = [root];
    },

    fetchPermission() {
      this.$store.dispatch(FETCH_PERMISSION).then((res) => {
        const dataArr = Object.entries(res.data);

        if (dataArr.length === 0) return;

        const newDataArr = dataArr.map((item) => {
          return {
            [`${item[0]}`]: item[1]
          }
        })

        const newData = newDataArr.map((item) => {

          const key = Object.keys(item)[0]

          return {
            id: key,
            parentId: key.slice(0, this.getPosition(key, '_', 1)),
            label: item[key]
          }
        });

        this.permissionLength = newData.length

        // group by key
        const groups = {};
        for (let i = 0; i < newData.length; i++) {
          let groupName = newData[i].parentId;
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(newData[i]);
        }
        let reFormatGroupData = [];
        for (let groupName in groups) {
          let parentTxt = '';
          switch (groupName) {
            case 'account':
              parentTxt = <span style="font-weight: 500">Quản lý ngăn ví</span>
              break;
            case 'admin':
              parentTxt = <span style="font-weight: 500">Quản lý hệ thống</span>
              break;
            case 'bank':
              parentTxt = <span style="font-weight: 500">Quản lý ngân hàng</span>
              break;
            case 'config':
              parentTxt = <span style="font-weight: 500">Quản lý cấu hình</span>
              break;
            case 'fee':
              parentTxt = <span style="font-weight: 500">Quản lý phí</span>
              break;
            case 'holiday':
              parentTxt = <span style="font-weight: 500">Quản lý ngày nghỉ</span>
              break;
            case 'init':
              parentTxt = <span style="font-weight: 500">Quản lý nạp tiền thủ công</span>
              break;
            case 'inquiry':
              parentTxt = <span style="font-weight: 500">Quản lý tài khoản đảm bảo</span>
              break;
            case 'napas':
              parentTxt = <span style="font-weight: 500">Quản lý napas</span>
              break;
            case 'transaction':
              parentTxt = <span style="font-weight: 500">Quản lý giao dịch</span>
              break;
            case 'payment':
              parentTxt = <span style="font-weight: 500">Quản lý giao dịch thanh toán</span>
              break;
            case 'merchant':
              parentTxt = <span style="font-weight: 500">Quản lý merchant</span>
              break;
            case 'request':
              parentTxt = <span style="font-weight: 500">Quản lý phê duyệt</span>
              break;
            case 'role':
              parentTxt = <span style="font-weight: 500">Quản lý nhóm quyền</span>
              break;
            case 'user':
              parentTxt = <span style="font-weight: 500">Quản lý ví</span>
              break;
            case 'permission':
              parentTxt = <span style="font-weight: 500">Quản lý quyền</span>
              break;
            case 'transfer':
              parentTxt = <span style="font-weight: 500">Quản lý các giao dịch rút tiền theo lịch trên Ví</span>
              break;
            case 'merchant':
              parentTxt = <span style="font-weight: 500">Quản lý merchant</span>
              break;
            case 'block':
              parentTxt = <span style="font-weight: 500">Quản lý chặn rút tiền trên Ví</span>
              break;
            case 'vpbank':
              parentTxt = <span style="font-weight: 500">Đối soát VPBank</span>
              break;
            case 'cs':
              parentTxt = <span style="font-weight: 500">Quản lý cho CS</span>
              break;
            case 'withdraw':
              parentTxt = <span style="font-weight: 500">Quản lý rút tiền</span>
              break;
            case 'exchange':
              parentTxt = <span style="font-weight: 500">Quản lý chuyển tiền</span>
              break;
            default:
              break;
          }
          reFormatGroupData.push({label: parentTxt, children: groups[groupName]});
        }
        this.permission = reFormatGroupData;
      });
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleSubmit() {
      this.$v.$touch();
      this.isPermissionEmpty = this.$refs.tree.getCheckedKeys().length === 0
      if (this.$v.filterAdd.$invalid || this.$refs.tree.getCheckedKeys().length === 0) {
        return;
      }
      let url = "";
      if (this.isUpdate) {
        url = '/role/update';
        this.filterAdd.id = this.currentRole.id;
      } else {
        url = "/role/insert";
      }

      const permissions = this.$refs.tree.getCheckedKeys().filter(function( element ) {
        return element !== undefined && element !== '' && element !== null;
      });

      const idMapping = this.permissionsOriginal.reduce((acc, el, i) => {
        acc[el.id] = i;
        return acc;
      }, {});
      const codes = permissions.map((i) => this.permissionsOriginal[idMapping[i]] && this.permissionsOriginal[idMapping[i]].code);
      const codesFiltered = codes.filter((i) => i !== null && i !== '' && i !== 'ALL');
      this.filterAdd.permissions = codesFiltered.join(',');

      let res = await this.post(url, this.filterAdd);
      this.$message.closeAll()
      if (res && res.status === 200) {
        this.$message({
          message: `Thực hiện ${this.isUpdate ? 'cập nhật' : 'thêm'} vai trò thành công.`,
          type: "success",
          showClose: true,
        });
        this.$root.$emit("bv::hide::modal", this.modalId);
        this.fetchRoles();
      } else {
        this.$message({
          message: `Thực hiện ${this.isUpdate ? 'cập nhật' : 'thêm'} vai trò thất bại.`,
          type: "error",
          showClose: true,
        });
      }
    },
    openModalEditRole(role) {
      this.isUpdate = true;
      this.modalTitle = "Cập nhật vai trò";
      this.currentRole = role;
      this.filterAdd = role;
      this.$root.$emit("bv::show::modal", this.modalId);
      setTimeout(() => {
        const codes = role.permissions.replaceAll(' ', '').split(',');
        const idMapping = this.permissionsOriginal.reduce((acc, el, i) => {
          acc[el.code] = i;
          return acc;
        }, {});
        const ids = codes.map((i) => this.permissionsOriginal[idMapping[i]] && this.permissionsOriginal[idMapping[i]].id);
        this.$refs.tree.setCheckedKeys(ids);
      }, 0)
    },
    handleCancel(event) {
      event.preventDefault();
      this.$root.$emit("bv::hide::modal", this.modalEdit);
    },
  },
};
</script>

<style>
.tooltip {
  top: 0;
}

.el-tree-node__content>label.el-checkbox {
  margin-bottom: 0;
}

.error {
  color: #FF7851;
  font-size: 80%;
}

.el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #069255;
  border-color: #069255;
}

.el-checkbox__inner:hover {
  border-color: #069255;
}
</style>
