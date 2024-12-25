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
            <div class="label-form">ID</div>
            <b-input type="text" placeholder="Nhập ID" v-model.trim="dataFilter.id"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Nhóm chuyên môn</div>
            <b-input type="text" placeholder="Nhập tên nhóm chuyên môn" v-model.trim="dataFilter.name"/>
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
          <b-col md="6" style="margin-top: 30px">
            <b-button variant="primary" class="mr-2" @click="handleSearch" type="submit">
              <font-awesome-icon :icon="['fas', 'search']"/>
              Tìm kiếm
            </b-button>
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="openModalUploadGroupTeacher"
                      style="border: none">
              <font-awesome-icon :icon="['fas','file-excel']"/>
              <span v-if="!loadingFile"
              ><i class="fas fa-upload"></i> Upload file
              </span>
              <i v-if="loadingFile" class="fa fa-spinner fa-spin"/>
            </b-button>
            <b-button class="mr-2" variant="light" @click="handleReset">
              <font-awesome-icon :icon="['fas', 'eraser']"/>
              Xóa lọc
            </b-button>
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="openModalUploadGroupTeacherMapping"
                      style="border: none">
              <font-awesome-icon :icon="['fas','file-excel']"/>
              <span v-if="!loadingFileGroupTeacherMapping"
              ><i class="fas fa-upload"></i> Upload file giảng viên thuộc NCM
              </span>
              <i v-if="loadingFileGroupTeacherMapping" class="fa fa-spinner fa-spin"/>
            </b-button>
          </b-col>
          <b-col md="6" class="text-right mt-30">
            <b-button
                v-if="checkPermission('group_teacher_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateGroupTeacherCompartment(null, false)"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm mới
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="groupTeachers.data"
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
            {{ dataFilter.pageSize * (dataFilter.page - 1) + row.index + 1 }}
          </template>
          <template #cell(leader)="row">
            {{ row.item.leaderInfo ? row.item.leaderInfo.fullName : "" }}
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  v-if="(userInfo && userInfo.permissions.indexOf('group_teacher_detail') !== -1 && row.item.id)"
                  :href="`/admin/group-teacher/${row.item.id}`"
                  class="m-1"
                  type="button"
                  title="Chi tiết nhóm chuyên môn"
                  v-b-tooltip.hover
              >
                <font-awesome-icon :icon="['fas', 'info-circle']"/>
              </a>
              <a
                  v-if="userInfo && userInfo.permissions.indexOf('group_teacher_update') !== -1"
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật thông tin nhóm chuyên môn"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateGroupTeacherCompartment(row.item, true)">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="groupTeachers.data && groupTeachers.data.length === 0 && this.dataFilter.page === 1"
               class="justify-content-center">
          <span>Không tìm thấy bản ghi nào</span>
        </b-row>
        <b-row v-else>
          <b-col class="pagination">
            <b-pagination
                hide-goto-end-buttons
                v-model="dataFilter.page"
                :per-page="dataFilter.pageSize"
                :total-rows="totalRow"
                @change="changePage"
            ></b-pagination>
            <multiselect v-model="selectedPageSize" track-by="text" label="text" :show-labels="false"
                         class="pageSize"
                         placeholder="Chọn"
                         @input="changePagination"
                         @select="changePageSize"
                         :options="PAGINATION_OPTIONS" :searchable="true" :allow-empty="false">
              <template slot="singleLabel" slot-scope="{ option }">{{ option.text }} / trang</template>
            </multiselect>
          </b-col>
        </b-row>
      </template>
    </b-card>

    <b-modal
        id="update-group-teacher"
        :title="isUpdate ? 'Cập nhật thông tin nhóm chuyên môn' : 'Thêm mới nhóm chuyên môn'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateGroupTeacherCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Tên nhóm chuyên môn<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.name.$model"
                placeholder="Nhập tên nhóm chuyên môn"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.name) }"
            />
            <div v-if="!$v.currentData.name.required" class="invalid-feedback">
              Tên nhóm chuyên môn không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mô tả:</label>
            <b-form-input
                id="input-description"
                v-model="currentData.description"
                placeholder="Nhập mô tả nhóm chuyên môn"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Người phụ trách:</label>
            <b-form-input
                id="input-leader"
                v-model="currentData.leader"
                placeholder="Nhập tên người phụ trách"
                trim
            />
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
            @click="closeModalCreateGroupTeacherCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateGroupTeacher"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal
        id="modal-upload-group-teacher"
        :modal-class="['sc5-modal']"
        :header-class="['modal__header']"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalUpload"
    >
      <template slot="modal-header">
        <div class="modal__header--item title font-weight-500">
          Upload file ds nhóm chuyên môn
        </div>
        <div class="modal__header--item close-btn px-2" @click="closeModalUpload">
          <i class="fas fa-times"></i>
        </div>
      </template>
      <b-row>
        <b-col md="2">
          <div style="font-weight: bold">File mẫu</div>
        </b-col>
        <b-col md="6">
          <a
              :href="SAMPLE_GROUP_TEACHER_IMPORT_LINK"
              target="_self"
              style="font-weight: bold;color:black!important;"
          >Format_ThemNCM</a
          >
        </b-col>
      </b-row>
      <b-row class="mt-3">
        <b-col md="2">
          <div style="font-weight: bold">File đã upload</div>
        </b-col>
        <b-col md="6">
          <div style="font-weight: bold; color:black!important;" v-if="currentFile">
            {{ currentFile.name }} <i @click="handleResetFile" class="fas fa-times"
                                      style="margin-left: 10px;cursor: pointer;margin-top: 2px;color: gray"></i>
          </div>
        </b-col>
      </b-row>
      <div class="py-2">
        <b-form-group v-if="userInfo" class="mt-2">
          <i class="fas fa-upload custom-upload"></i>
          <div class="mr-4">
            <b-form-file
                id="input-file"
                ref="fileExcel"
                multiple
                type="file"
                accept=".xls, .xlsx"
                placeholder="Kéo thả file hoặc"
                browse-text="Chọn file"
                @change="handleFilesUpload"
            ></b-form-file>
          </div>
        </b-form-group>
        <div style="width: 100%; text-align: center">
          <b-button :disabled="!currentFile || loadingFile" variant="primary" class="py-2"
                    style="margin-top: 90px;z-index: 1000;width: 200px" @click.prevent="handleUploadDataExcel">
            <span v-if="!loadingFile"
            > Xác nhận</span>
            <i v-if="loadingFile" class="fa fa-spinner fa-spin mr-2"/>
          </b-button>
        </div>
      </div>
    </b-modal>

    <b-modal
        id="modal-upload-group-teacher-mapping"
        :modal-class="['sc5-modal']"
        :header-class="['modal__header']"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalUploadGroupTeacherMapping"
    >
      <template slot="modal-header">
        <div class="modal__header--item title font-weight-500">
          Upload file ds giảng viên thuộc nhóm chuyên môn
        </div>
        <div class="modal__header--item close-btn px-2" @click="closeModalUploadGroupTeacherMapping">
          <i class="fas fa-times"></i>
        </div>
      </template>
      <b-row>
        <b-col md="2">
          <div style="font-weight: bold">File mẫu</div>
        </b-col>
        <b-col md="6">
          <a
              :href="SAMPLE_GROUP_TEACHER_MAPPING_IMPORT_LINK"
              target="_self"
              style="font-weight: bold;color:black!important;"
          >Format_ThemGVThuocNCM</a
          >
        </b-col>
      </b-row>
      <b-row class="mt-3">
        <b-col md="2">
          <div style="font-weight: bold">File đã upload</div>
        </b-col>
        <b-col md="6">
          <div style="font-weight: bold; color:black!important;" v-if="currentFile">
            {{ currentFile.name }} <i @click="handleResetFileGroupTeacherMapping" class="fas fa-times"
                                      style="margin-left: 10px;cursor: pointer;margin-top: 2px;color: rgb(128,128,128)"></i>
          </div>
        </b-col>
      </b-row>
      <div class="py-2">
        <b-form-group v-if="userInfo" class="mt-2">
          <i class="fas fa-upload custom-upload"></i>
          <div class="mr-4">
            <b-form-file
                id="input-file"
                ref="fileExcelGroupTeacherMapping"
                multiple
                type="file"
                accept=".xls, .xlsx"
                placeholder="Kéo thả file hoặc"
                browse-text="Chọn file"
                @change="handleFilesUploadGroupTeacherMapping"
            ></b-form-file>
          </div>
        </b-form-group>
        <div style="width: 100%; text-align: center">
          <b-button :disabled="!currentFileGroupTeacherMapping || loadingFileGroupTeacherMapping" variant="primary" class="py-2"
                    style="margin-top: 90px;z-index: 1000;width: 200px" @click.prevent="handleUploadDataExcelGroupTeacherMapping">
            <span v-if="!loadingFileGroupTeacherMapping"
            > Xác nhận</span>
            <i v-if="loadingFileGroupTeacherMapping" class="fa fa-spinner fa-spin mr-2"/>
          </b-button>
        </div>
      </div>
    </b-modal>
  </b-form>
</template>
<script>
import PageTitle from "../Layout/Components/PageTitle";
import DatePicker from "vue2-datepicker"
import {
  CREATE_GROUP_TEACHER,
  FETCH_GROUP_TEACHERS,
  UPDATE_GROUP_TEACHER
} from "@/store/action.type"
import {mapGetters} from "vuex";
import {checkPermission} from "@/common/utils";
import {PAGINATION_OPTIONS, SAMPLE_GROUP_TEACHER_IMPORT_LINK} from "@/common/config"
import baseMixins from "../components/mixins/base";
import router from '@/router';
import {required} from "vuelidate/lib/validators";
import * as XLSX from "xlsx";
import {SAMPLE_GROUP_TEACHER_MAPPING_IMPORT_LINK} from "@/common/config";

const initData = {
  id: null,
  name: null,
  dataset: null,
  page: 1,
  pageSize: 20
}

const initGroupTeacher = {
  id: null,
  name: null,
  description: null,
  leader: null,
  leaderInfo: null,
  dataset: null,
}

const initNewDataExcel = {
  name: null,
  description: null,
  leaderName: null,
};

const initNewDataExcelGroupTeacherMapping = {
  teacherName: null,
  groupName: null,
  role: null,
};

export default {
  name: "GroupTeachers",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      loadingFile: false,
      loadingFileGroupTeacherMapping: false,
      totalRow: 0,
      PAGINATION_OPTIONS,
      SAMPLE_GROUP_TEACHER_IMPORT_LINK,
      SAMPLE_GROUP_TEACHER_MAPPING_IMPORT_LINK,
      subheading: "Quản lý danh sách nhóm chuyên môn.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Danh sách nhóm chuyên môn",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
      selectedPageSize: {text: initData.pageSize},
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
        {key: "name", label: "Nhóm chuyên môn", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "description", label: "Mô tả", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {
          key: "leader",
          label: "Người phụ trách",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        },
        {
          key: "actions",
          label: "Chức năng",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        }
      ],
      datePickerConfig: {
        placeholder1: "Chọn",
        inputClass: "form-control",
      },
      requestTimeFilter: null,
      actionType: null,
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
      currentData: Object.assign({}, {...initGroupTeacher}),
      currentDetail: null,
      currentFile: null,
      isUpdate: false,
      uploadDataExcel: [],
      dataExcel: [],
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
      currentFileGroupTeacherMapping: null,
      currentDetailGroupTeacherMapping: null,
      uploadDataExcelGroupTeacherMapping: [],
      dataExcelGroupTeacherMapping: [],
    }
  },
  validations: {
    currentData: {
      name: {required},
      dataset: {required},
    },
  },
  mounted() {
      this.fetchAllDatasets();
      this.handleDataFilter();
      const dataSearch = this.$route.query.dataSearch;

      if (dataSearch) {
        this.dataFilter = JSON.parse(String(dataSearch));

        this.selectedPageSize = {text: this.dataFilter.pageSize}
        this.selectedDataset = this.optionsDataset.filter(
            (i) => i.value === this.dataFilter.dataset
        )[0];
      }

      this.fetchGroupTeachers();
  },
  watch: {},
  computed: {
    ...mapGetters(["groupTeachers"]),
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
    validation() {
    },
  },
  methods: {
    handleDataFilter() {
      this.dataFilter.page = 1;
      this.dataFilter.pageSize = this.selectedPageSize.text
      this.dataFilter.dataset = this.selectedDataset == null ? null : this.selectedDataset.value;
    },
    reload() {
      this.fetchGroupTeachers();
    },
    checkPermission,
    async fetchGroupTeachers() {
      let res = await this.$store.dispatch(FETCH_GROUP_TEACHERS, this.dataFilter)
      if (res && res.data.length > 0 && res.data.length === this.dataFilter.pageSize) {
        this.totalRow = 1000000000;
      } else {
        this.totalRow = this.dataFilter.page * this.dataFilter.pageSize
      }
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    changePagination(e) {
      this.dataFilter.pageSize = e.text;
    },
    changePage(e) {
      this.dataFilter.page = e
      router.push({path: '/admin/group-teachers', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchGroupTeachers();
    },
    changePageSize(e) {
      if (e) {
        this.dataFilter.pageSize = e.text
        this.dataFilter.page = 1
      }
      router.push({path: '/admin/group-teachers', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchGroupTeachers();
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/group-teachers', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchGroupTeachers();
    },
    handleReset() {
      this.$router.replace('/admin/group-teachers')
      this.dataFilter = Object.assign({}, {
        ...initData,
        pageSize: this.dataFilter.pageSize,
      });
      this.selectedDataset = {value: null, text: 'Tất cả'};
      this.handleDataFilter();
      this.fetchGroupTeachers();
    },
    openModalCreateGroupTeacherCompartment(groupTeacher, isUpdate) {
      this.isUpdate = isUpdate

      if (isUpdate) {
        this.currentData = Object.assign({}, {
          ...groupTeacher,
        });
      } else {
        this.currentData = Object.assign({}, {
          ...initGroupTeacher,
        });
      }
      this.$root.$emit("bv::show::modal", 'update-group-teacher');
    },
    closeModalCreateGroupTeacherCompartment() {
      this.currentData = Object.assign({}, {...initGroupTeacher})
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-group-teacher')
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleCreateGroupTeacher() {
      this.$v.$reset();
      this.$v.$touch();

      if (this.$v.currentData.$invalid) return
      const payload = {
        id: this.isUpdate ? this.currentData.id : null,
        name: this.currentData.name,
        description: this.currentData.description,
        leader: this.currentData.leader,
        dataset: this.currentData.dataset,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_GROUP_TEACHER, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin nhóm chuyên môn thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateGroupTeacherCompartment()
            this.fetchGroupTeachers()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_GROUP_TEACHER, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới nhóm chuyên môn thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateGroupTeacherCompartment()
            this.fetchGroupTeachers()
          }, 1000)
        }
      }
    },
    openModalUploadGroupTeacher() {
      this.$root.$emit("bv::show::modal", 'modal-upload-group-teacher')
    },
    closeModalUpload() {
      this.currentDetail = null
      this.currentFile = null
      this.$root.$emit("bv::hide::modal", 'modal-upload-group-teacher')
    },
    handleResetFile() {
      this.uploadDataExcel = []
      this.dataExcel = []
      this.currentFile = null
      this.$nextTick(() => {
        this.$refs.fileExcel.reset();
      })
    },
    handleFilesUpload(event) {
      this.dataExcel = [];
      this.uploadDataExcel = [];
      this.currentFile = null;
      let uploadedFiles = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
      if (!uploadedFiles) return;

      this.currentFile = uploadedFiles;
      let reader = new FileReader();
      reader.onload = (e) => {
        const target = reader.result;
        const wb = XLSX.read(target, {type: "array", cellDates: true});
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, {header: 1, raw: false});
        this.handleFormatJSONFromExcel(data);
      };
      reader.readAsArrayBuffer(uploadedFiles);
    },
    handleFormatJSONFromExcel(json) {
      if (!json || json.length <= 1) return;

      this.dataExcel = json
          .filter((item, index) => index !== 0)
          .map((item, index) => {
            let groupTeacher = Object.assign({});

            item.forEach((itemValue, indexValue) => {
              if (json[0][indexValue]) {
                let newAttribute = '';
                switch (json[0][indexValue]) {
                  case 'Nhóm chuyên môn':
                    newAttribute = 'name';
                    break;
                  case 'Mô tả':
                    newAttribute = 'description';
                    break;
                  case 'Người phụ trách':
                    newAttribute = 'leaderName';
                    break;
                  default:
                    break;
                }
                groupTeacher[newAttribute] = itemValue;
              }
            });

            return groupTeacher;
          });
    },
    async handleUploadDataExcel() {
      this.handleDataFilter();
      if (!this.dataExcel || this.dataExcel.length === 0) {
        this.$message({
          message: "Tải dữ liệu không thành công. Vui lòng kiểm tra lại file excel đã chọn",
          type: "warning",
          showClose: true,
        });
        return
      }
      if (!this.dataExcel || this.dataExcel.length === 0) return null

      this.dataExcel.forEach(item => {
        let newData = Object.assign({}, {...initNewDataExcel})
        newData.name = item.name ? item.name : null;
        newData.description = item.description ? item.description : null;
        newData.leaderName = item.leaderName ? item.leaderName : null

        this.uploadDataExcel.push({...newData})
      });

      this.loadingFile = true;
      const dataFiltered = this.uploadDataExcel.filter((item) => {
        return item.name !== null;
      });

      let res = await this.post('/group-teacher/upload-excel', {
        groupTeacherCreateRequests: dataFiltered,
        dataset: this.dataFilter.dataset,
      });
      setTimeout(() => {
        this.loadingFile = false;
      }, 300);

      if (res.status === 200) {
        this.$message({
          message: 'Tải dữ liệu lên thành công.',
          type: "success",
          showClose: true,
        });

        this.uploadDataExcel = []
        this.dataExcel = []
        this.currentFile = null
        this.$nextTick(() => {
          this.$refs.fileExcel.reset();
        })

        setTimeout(() => {
          this.closeModalUpload();
          this.fetchGroupTeachers();
        }, 1000);
      }
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
    openModalUploadGroupTeacherMapping() {
      this.$root.$emit("bv::show::modal", 'modal-upload-group-teacher-mapping')
    },
    closeModalUploadGroupTeacherMapping() {
      this.currentDetailGroupTeacherMapping = null
      this.currentFileGroupTeacherMapping = null
      this.$root.$emit("bv::hide::modal", 'modal-upload-group-teacher-mapping')
    },
    handleResetFileGroupTeacherMapping() {
      this.uploadDataExcelGroupTeacherMapping = []
      this.dataExcelGroupTeacherMapping = []
      this.currentFileGroupTeacherMapping = null
      this.$nextTick(() => {
        this.$refs.fileExcelGroupTeacherMapping.reset();
      })
    },
    handleFilesUploadGroupTeacherMapping(event) {
      this.dataExcelGroupTeacherMapping = [];
      this.uploadDataExcelGroupTeacherMapping = [];
      this.currentFileGroupTeacherMapping = null;
      let uploadedFiles = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
      if (!uploadedFiles) return;

      this.currentFileGroupTeacherMapping = uploadedFiles;
      let reader = new FileReader();
      reader.onload = (e) => {
        const target = reader.result;
        const wb = XLSX.read(target, {type: "array", cellDates: true});
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, {header: 1, raw: false});
        this.handleFormatJSONFromExcelGroupTeacherMapping(data);
      };
      reader.readAsArrayBuffer(uploadedFiles);
    },
    handleFormatJSONFromExcelGroupTeacherMapping(json) {
      if (!json || json.length <= 1) return;

      this.dataExcelGroupTeacherMapping = json
          .filter((item, index) => index !== 0)
          .map((item, index) => {
            let groupTeacherMapping = Object.assign({});

            item.forEach((itemValue, indexValue) => {
              if (json[0][indexValue]) {
                let newAttribute = '';
                switch (json[0][indexValue]) {
                  case 'Tên giảng viên':
                    newAttribute = 'teacherName';
                    break;
                  case 'Nhóm chuyên môn':
                    newAttribute = 'groupName';
                    break;
                  case 'Vai trò':
                    newAttribute = 'role';
                    break;
                  default:
                    break;
                }
                groupTeacherMapping[newAttribute] = itemValue;
              }
            });

            return groupTeacherMapping;
          });
    },
    async handleUploadDataExcelGroupTeacherMapping() {
      this.handleDataFilter();
      if (!this.dataExcelGroupTeacherMapping || this.dataExcelGroupTeacherMapping.length === 0) {
        this.$message({
          message: "Tải dữ liệu không thành công. Vui lòng kiểm tra lại file excel đã chọn",
          type: "warning",
          showClose: true,
        });
        return
      }
      if (!this.dataExcelGroupTeacherMapping || this.dataExcelGroupTeacherMapping.length === 0) return null

      this.dataExcelGroupTeacherMapping.forEach(item => {
        let newData = Object.assign({}, {...initNewDataExcelGroupTeacherMapping})
        newData.teacherName = item.teacherName ? item.teacherName : null;
        newData.groupName = item.groupName ? item.groupName : null;
        newData.role = item.role ? item.role : null

        this.uploadDataExcelGroupTeacherMapping.push({...newData})
      });

      this.loadingFileGroupTeacherMapping = true;
      const dataFiltered = this.uploadDataExcelGroupTeacherMapping;

      let res = await this.post('/group-teacher-mapping/upload-excel', {
        groupTeacherMappingCreateRequests: dataFiltered,
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        this.loadingFileGroupTeacherMapping = false;
      }, 300);

      if (res.status === 200) {
        this.$message({
          message: 'Tải dữ liệu lên thành công.',
          type: "success",
          showClose: true,
        });

        this.uploadDataExcelGroupTeacherMapping = []
        this.dataExcelGroupTeacherMapping = []
        this.currentFileGroupTeacherMapping = null
        this.$nextTick(() => {
          this.$refs.fileExcelGroupTeacherMapping.reset();
        })

        setTimeout(() => {
          this.closeModalUploadGroupTeacherMapping();
          this.fetchGroupTeacherDetail();
        }, 1000);
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

#modal-upload-group-teacher .modal-footer {
  display: none;
}

#modal-upload-group-teacher-mapping .modal-footer {
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