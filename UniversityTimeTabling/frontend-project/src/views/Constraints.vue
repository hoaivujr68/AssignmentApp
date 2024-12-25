<template>
  <b-form @submit="handleSearch">
    <page-title
        :heading="heading"
        :subheading="subheading"
        :icon="icon"
        :loading="loadingHeader"
    ></page-title>
    <b-card class="main-card search-wrapper mb-20">
      <template v-if="loadingHeader">
        <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
      </template>
      <template v-else>
        <b-row class="mb-2">
          <b-col md="2">
            <div class="label-form">Trạng thái</div>
            <multiselect v-model="selectedStatus" track-by="text" label="text" :show-labels="false"
                         placeholder="Chọn" :options="optionsStatus" :searchable="true">
              <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
            </multiselect>
          </b-col>
          <b-col md="2">
            <div class="label-form">Bộ dữ liệu</div>
            <multiselect v-model="selectedDataset" track-by="text" label="text" :show-labels="false"
                         placeholder="Chọn" :options="optionsDataset" :searchable="true">
              <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
            </multiselect>
          </b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col md="4" style="margin-top: 30px">
            <b-button variant="primary" class="mr-2" @click="handleSearch" type="submit">
              <font-awesome-icon :icon="['fas', 'search']"/>
              Tìm kiếm
            </b-button>
            <b-button class="mr-2" variant="light" @click="handleReset">
              <font-awesome-icon :icon="['fas', 'eraser']"/>
              Xóa lọc
            </b-button>
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col md="4"><h5 style="padding-top: 50px">Hàm mục tiêu phân công</h5></b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="constraints.objectiveFunctions"
            :fields="visibleFieldsObjective"
            :bordered="true"
            :hover="true"
            :fixed="true"
            :foot-clone="false"
        >
          <template #table-colgroup="scope">
            <col
                v-for="field in scope.visibleFieldsObjective"
                :key="field.key"
            />
          </template>
          <template #cell(key)="row">
            {{ row.index + 1 }}
          </template>
          <template #cell(status)="row">
          <span v-if="row.item.status === 1">
            Hoạt động
          </span>
            <span v-if="row.item.status === 0">
            Không hoạt động
          </span>
          </template>
        </b-table>
        <b-row v-if="constraints.objectiveFunctions && constraints.objectiveFunctions.length === 0"
               class="justify-content-center">
          <span>Không tìm thấy bản ghi nào</span>
        </b-row>

        <b-row class="mb-2">
          <b-col md="4"><h5 style="padding-top: 50px">Ràng buộc tùy chỉnh</h5></b-col>
          <b-col md="8" class="text-right mt-30">
            <b-button
                v-if="checkPermission('custom_constraint_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateConstraintCompartment(null, false, 'custom')"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm ràng buộc tùy chỉnh
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="constraints.customConstraints"
            :fields="visibleFields"
            :bordered="true"
            :hover="true"
            :fixed="true"
            :foot-clone="false"
        >
          <template #table-colgroup="scope">
            <col
                v-for="field in scope.visibleFields"
                :key="field.key"
            />
          </template>
          <template #cell(key)="row">
            {{ row.index + 1 }}
          </template>
          <template #cell(status)="row">
          <span v-if="row.item.status === 1">
            Hoạt động
          </span>
            <span v-if="row.item.status === 0">
            Không hoạt động
          </span>
          </template>
          <template #cell(teacherConstraint)="row">
            {{ concatTeacherConstraint(row.item.teacherColumnCompare, row.item.teacherCompare, row.item.teacherValueCompare) }}
          </template>
          <template #cell(classConstraint)="row">
            {{ concatClassConstraint(row.item.classColumnCompare, row.item.classCompare, row.item.classValueCompare) }}
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật ràng buộc"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateConstraintCompartment(row.item, true, 'custom')">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="constraints.customConstraints && constraints.customConstraints.length === 0"
               class="justify-content-center">
          <span>Không tìm thấy bản ghi nào</span>
        </b-row>

        <b-row class="mb-2">
          <b-col md="4"><h5 style="padding-top: 50px">Ràng buộc bắt buộc</h5></b-col>
          <b-col md="8" class="text-right mt-30">
            <b-button
                v-if="checkPermission('required_constraint_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateConstraintCompartment(null, false, 'required')"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm ràng buộc bắt buộc
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="constraints.requiredConstraints"
            :fields="visibleFieldsRequired"
            :bordered="true"
            :hover="true"
            :fixed="true"
            :foot-clone="false"
        >
          <template #table-colgroup="scope">
            <col
                v-for="field in scope.visibleFields"
                :key="field.key"
            />
          </template>
          <template #cell(key)="row">
            {{ row.index + 1 }}
          </template>
          <template #cell(status)="row">
          <span v-if="row.item.status === 1">
            Hoạt động
          </span>
            <span v-if="row.item.status === 0">
            Không hoạt động
          </span>
          </template>
          <template #cell(type)="row">
          <span v-if="row.item.type === 'class'">
            Giảng dạy
          </span>
            <span v-if="row.item.type === 'student'">
            Hướng dẫn
          </span>
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật ràng buộc"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateConstraintCompartment(row.item, true, 'required')">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="constraints.requiredConstraints && constraints.requiredConstraints.length === 0"
               class="justify-content-center">
          <span>Không tìm thấy bản ghi nào</span>
        </b-row>
      </template>
    </b-card>

    <b-modal
        id="update-custom-constraint"
        :title="isUpdate ? 'Cập nhật thông tin ràng buộc tùy chỉnh' : 'Thêm mới ràng buộc tùy chỉnh'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateCustomConstraintCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Giảng viên có:</label>
            <b-form-select
                :options="optionsTeacherColumnCompare"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentData.teacherColumnCompare"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Điều kiện giảng viên:</label>
            <b-form-select
                :options="optionsTeacherCompare"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentData.teacherCompare"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Giá trị:</label>
            <b-form-input
                id="input-teacher-value-compare"
                v-model.trim="currentData.teacherValueCompare"
                placeholder=""
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Lớp học có:</label>
            <b-form-select
                :options="optionsClassColumnCompare"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentData.classColumnCompare"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Điều kiện lớp học:</label>
            <b-form-select
                :options="optionsClassCompare"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentData.classCompare"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Giá trị:</label>
            <b-form-input
                id="input-class-value-compare"
                v-model.trim="currentData.classValueCompare"
                placeholder=""
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Trạng thái:</label>
            <b-form-select
                :options="optionsStatus.filter(rank => rank.value != null)"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentData.status"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group :class="{'invalid-option': validationStatus($v.currentData.dataset)}">
            <label>Bộ dữ liệu<span class="text-danger">*</span>:</label>
            <b-form-select
                :options="optionsDataset.filter(rank => rank.value != null)"
                :searchable="true"
                value-field="value" text-field="text"
                :class="{'is-invalid-option': validationStatus($v.currentData.dataset)}"
                v-model.trim="currentData.dataset"
            >
            </b-form-select>
            <div v-if="!$v.currentData.dataset.required" class="invalid-feedback">
              Bộ dữ liệu không được để trống.
            </div>
          </b-form-group>
        </b-col>
      </b-row>
      <template #modal-footer>
        <b-button
            class="mr-2 btn-light2 pull-right"
            @click="closeModalCreateCustomConstraintCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateCustomConstraint"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal
        id="update-required-constraint"
        :title="isUpdate ? 'Cập nhật thông tin ràng buộc bắt buộc' : 'Thêm mới ràng buộc bắt buộc'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateRequiredConstraintCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Mã ràng buộc:</label>
            <b-form-input
                id="input-code"
                v-model.trim="currentDataRequired.code"
                placeholder=""
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Giá trị:</label>
            <b-form-input
                id="input-value"
                v-model.trim="currentDataRequired.value"
                placeholder=""
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Trạng thái:</label>
            <b-form-select
                :options="optionsStatus.filter(rank => rank.value != null)"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentDataRequired.status"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Loại ràng buộc:</label>
            <b-form-select
                :options="optionsType.filter(rank => rank.value != null)"
                :searchable="true"
                value-field="value" text-field="text"
                v-model.trim="currentDataRequired.type"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group :class="{'invalid-option': validationStatus($v.currentDataRequired.dataset)}">
            <label>Bộ dữ liệu<span class="text-danger">*</span>:</label>
            <b-form-select
                :options="optionsDataset.filter(rank => rank.value != null)"
                :searchable="true"
                value-field="value" text-field="text"
                :class="{'is-invalid-option': validationStatus($v.currentDataRequired.dataset)}"
                v-model.trim="currentDataRequired.dataset"
            >
            </b-form-select>
            <div v-if="!$v.currentDataRequired.dataset.required" class="invalid-feedback">
              Bộ dữ liệu không được để trống.
            </div>
          </b-form-group>
        </b-col>
      </b-row>
      <template #modal-footer>
        <b-button
            class="mr-2 btn-light2 pull-right"
            @click="closeModalCreateRequiredConstraintCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateRequiredConstraint"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

  </b-form>
</template>
<script>
import PageTitle from "../Layout/Components/PageTitle";
import DatePicker from "vue2-datepicker"
import {
  FETCH_CONSTRAINTS,
  CREATE_CUSTOM_CONSTRAINT,
  UPDATE_CUSTOM_CONSTRAINT,
  CREATE_REQUIRED_CONSTRAINT,
  UPDATE_REQUIRED_CONSTRAINT
} from "@/store/action.type"
import {mapGetters} from "vuex";
import {checkPermission} from "@/common/utils";
import baseMixins from "../components/mixins/base";
import router from '@/router';
import {required} from "vuelidate/lib/validators";

const initData = {
  status: null,
  dataset: null,
}

const initCustomConstraint = {
  id: null,
  teacherCompare: null,
  teacherColumnCompare: null,
  teacherValueCompare: null,
  classCompare: null,
  classColumnCompare: null,
  classValueCompare: null,
  status: null,
  dataset: null,
}

const initRequiredConstraint = {
  id: null,
  code: null,
  value: null,
  status: null,
  type: null,
  dataset: null,
}

export default {
  name: "Constraints",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      loadingFile: false,
      subheading: "Quản lý danh sách ràng buộc.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Danh sách ràng buộc",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
      selectedStatus: {value: null, text: 'Tất cả'},
      optionsStatus: [
        {value: null, text: 'Tất cả'},
        {value: 0, text: 'Không hoạt động'},
        {value: 1, text: 'Hoạt động'},
      ],
      selectedType: null,
      optionsType: [
        {value: 'class', text: 'Giảng dạy'},
        {value: 'student', text: 'Hướng dẫn'},
      ],
      selectedTeacherColumnCompare: null,
      optionsTeacherColumnCompare: [
        {value: 'id', text: 'Id'},
        {value: 'rank_and_degree', text: 'Học hàm, học vị'},
        {value: 'rating', text: 'Rating'},
      ],
      selectedTeacherCompare: null,
      optionsTeacherCompare: [
        {value: '=', text: 'Bằng'},
        {value: '>', text: 'Lớn hơn'},
        {value: '<', text: 'Nhỏ hơn'},
        {value: '>=', text: 'Lớn hơn hoặc bằng'},
        {value: '<=', text: 'Nhỏ hơn hoặc bằng'},
        {value: '!=', text: 'Khác'},
      ],
      selectedClassColumnCompare: null,
      optionsClassColumnCompare: [
        {value: 'id', text: 'Id'},
      ],
      selectedClassCompare: null,
      optionsClassCompare: [
        {value: '=', text: 'Bằng'},
        {value: '>', text: 'Lớn hơn'},
        {value: '<', text: 'Nhỏ hơn'},
        {value: '>=', text: 'Lớn hơn hoặc bằng'},
        {value: '<=', text: 'Nhỏ hơn hoặc bằng'},
        {value: '!=', text: 'Khác'},
      ],
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
      fieldsObjective: [
        {
          key: "key",
          label: "STT",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {key: "code", label: "Mã mục tiêu", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "value", label: "Nội dung", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "status", label: "Trạng thái", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "type", label: "Loại phân công", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
      ],
      fields: [
        {
          key: "key",
          label: "STT",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {
          key: "id",
          label: "ID",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {key: "teacherConstraint", label: "Điều kiện giảng viên", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "classConstraint", label: "Điều kiện lớp học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "status", label: "Trạng thái", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {
          key: "actions",
          label: "Chức năng",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        }
      ],
      fieldsRequired: [
        {
          key: "key",
          label: "STT",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {
          key: "id",
          label: "ID",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {key: "code", label: "Mã ràng buộc", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "value", label: "Nội dung ràng buộc", visible: true, thStyle: "width: 12%", thClass: 'align-middle'},
        {key: "status", label: "Trạng thái", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "type", label: "Loại ràng buộc", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {
          key: "actions",
          label: "Chức năng",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        }
      ],
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
      currentData: Object.assign({}, {...initCustomConstraint}),
      currentDataRequired: Object.assign({}, {...initRequiredConstraint}),
      currentDetail: null,
      isUpdate: false,
    }
  },
  validations: {
    currentData: {
      dataset: {required}
    },
    currentDataRequired: {
      dataset: {required}
    }
  },
  mounted() {
    this.fetchAllDatasets();
    this.handleDataFilter();
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));
      this.selectedDataset = this.optionsDataset.filter(
          (i) => i.value === this.dataFilter.dataset
      )[0];
      this.selectedStatus = this.optionsStatus.filter(
          (i) => i.value === this.dataFilter.status
      )[0];
    }

    this.fetchConstraints();
  },
  watch: {},
  computed: {
    ...mapGetters(["constraints"]),
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
    visibleFieldsObjective() {
      return this.fieldsObjective.filter((field) => field.visible);
    },
    visibleFieldsRequired() {
      return this.fieldsRequired.filter((field) => field.visible);
    },
    validation() {
    },
  },
  methods: {
    handleDataFilter() {
      this.dataFilter.status = this.selectedStatus === null ? null : this.selectedStatus.value;
      this.dataFilter.dataset = this.selectedDataset == null ? null : this.selectedDataset.value;
    },
    reload() {
      this.fetchConstraints();
    },
    checkPermission,
    async fetchConstraints() {
      let res = await this.$store.dispatch(FETCH_CONSTRAINTS, this.dataFilter)
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/constraints', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchConstraints();
    },
    handleReset() {
      this.$router.replace('/admin/constraints')
      this.dataFilter = Object.assign({}, {
        ...initData,
      });
      this.selectedStatus = {value: null, text: 'Tất cả'};
      this.selectedDataset = {value: null, text: 'Tất cả'};
      this.handleDataFilter();
      this.fetchConstraints();
    },
    openModalCreateConstraintCompartment(constraint, isUpdate, type) {
      if (type === 'custom') {
        this.isUpdate = isUpdate

        if (isUpdate) {
          this.currentData = Object.assign({}, {
            ...constraint,
          });
        } else {
          this.currentData = Object.assign({}, {
            ...initCustomConstraint,
            status: 1,
          });
        }
        this.$root.$emit("bv::show::modal", 'update-custom-constraint');
      } else {
        this.isUpdate = isUpdate

        if (isUpdate) {
          this.currentDataRequired = Object.assign({}, {
            ...constraint,
          });
        } else {
          this.currentDataRequired = Object.assign({}, {
            ...initRequiredConstraint,
            status: 1,
          });
        }
        this.$root.$emit("bv::show::modal", 'update-required-constraint');
      }
    },
    closeModalCreateCustomConstraintCompartment() {
      this.currentData = Object.assign({}, {...initCustomConstraint})
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-custom-constraint')
    },
    closeModalCreateRequiredConstraintCompartment() {
      this.currentDataRequired = Object.assign({}, {...initRequiredConstraint})
      this.$nextTick(() => {
        this.$v.currentDataRequired.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-required-constraint')
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleCreateCustomConstraint() {
      this.$v.$reset();
      this.$v.$touch();

      const payload = {
        id: this.isUpdate ? this.currentData.id : null,
        teacherCompare: this.currentData.teacherCompare,
        teacherColumnCompare: this.currentData.teacherColumnCompare,
        teacherValueCompare: this.currentData.teacherValueCompare,
        classCompare: this.currentData.classCompare,
        classColumnCompare: this.currentData.classColumnCompare,
        classValueCompare: this.currentData.classValueCompare,
        status: this.currentData.status,
        dataset: this.currentData.dataset,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_CUSTOM_CONSTRAINT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin ràng buộc thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateCustomConstraintCompartment()
            this.fetchConstraints()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_CUSTOM_CONSTRAINT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới ràng buộc thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateCustomConstraintCompartment()
            this.fetchConstraints()
          }, 1000)
        }
      }
    },
    async handleCreateRequiredConstraint() {
      this.$v.$reset();
      this.$v.$touch();

      const payload = {
        id: this.isUpdate ? this.currentDataRequired.id : null,
        code: this.currentDataRequired.code,
        value: this.currentDataRequired.value,
        status: this.currentDataRequired.status,
        type: this.currentDataRequired.type,
        dataset: this.currentDataRequired.dataset,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_REQUIRED_CONSTRAINT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin ràng buộc thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateRequiredConstraintCompartment()
            this.fetchConstraints()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_REQUIRED_CONSTRAINT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới ràng buộc thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateRequiredConstraintCompartment()
            this.fetchConstraints()
          }, 1000)
        }
      }
    },
    concatTeacherConstraint(column, compare, value) {
      if (column && compare && value) {
        return column + " " + compare + " " + value;
      }
      return "";
    },
    concatClassConstraint(column, compare, value) {
      if (column && compare && value) {
        return column + " " + compare + " " + value;
      }
      return "";
    },
    formatOptionsDataset(datasets) {
      if (!datasets) return [];
      const result = datasets.map((item) => {
        return {text: item.name, value: item.id}
      });

      return [{value: null, text: 'Tất cả'}, ...result];
    },
    async fetchAllDatasets() {
      let response = await this.get('/dataset/search');

      if (response && response.data) {
        this.optionsDataset = this.formatOptionsDataset(response.data.data);
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.disabled-icon {
  cursor: not-allowed;
  color: #838790 !important;
  opacity: 0.5;
}

.error {
  color: #dc3545;
  font-size: 13px;
}
</style>
<style>
.custom-file-label {
  height: 120px;
  border: 1px dashed #01904a;
  justify-content: center;
  display: flex;
  align-items: end;
  padding: 20px;
}
.custom-file-label::after {
  content: 'Chọn file' !important;
  position: relative !important;
  background: none;
  border: none;
  padding: 0;
  height: unset;
  margin-left: 5px;
  color: #01904a;
  font-weight: bold;
  font-size: 15px;
}

#modal-upload-teacher .modal-footer {
  display: none;
}

.custom-upload {
  font-size: 35px;
  color: #01904a;
  position: absolute;
  z-index: 1000;
  top: 120px;
  left: 46%;
}

.custom-file-label {
  font-weight: bold;
  font-size: 15px;
}
</style>