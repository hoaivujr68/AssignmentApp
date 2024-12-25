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
            <div class="label-form">Họ và tên</div>
            <b-input type="text" placeholder="Nhập họ và tên" v-model.trim="dataFilter.name"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Mã sinh viên</div>
            <b-input type="text" placeholder="Nhập mã sinh viên" v-model.trim="dataFilter.studentCode"/>
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
          <b-col md="8" style="margin-top: 30px">
            <b-button variant="primary" class="mr-2" @click="handleSearch" type="submit">
              <font-awesome-icon :icon="['fas', 'search']"/>
              Tìm kiếm
            </b-button>
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="openModalUploadStudentProject"
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
          </b-col>
          <b-col md="4" class="text-right mt-30">
            <b-button
                v-if="checkPermission('student_project_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateStudentProjectCompartment(null, false)"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm sinh viên
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="studentProjects.data"
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
          <template #cell(teacher1Id)="row">
            {{ row.item.teacher1 ? row.item.teacher1.fullName : "" }}
          </template>
          <template #cell(teacher2Id)="row">
            {{ row.item.teacher2 ? row.item.teacher2.fullName : "" }}
          </template>
          <template #cell(teacher3Id)="row">
            {{ row.item.teacher3 ? row.item.teacher3.fullName : "" }}
          </template>
          <template #cell(teacherAssignedId)="row">
            {{ row.item.teacherAssigned ? row.item.teacherAssigned.fullName : "" }}
          </template>
          <template #cell(isAssigned)="row">
            {{ row.item.isAssigned === 1 ? "Đã phân công" : "Chưa phân công" }}
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  v-if="userInfo && userInfo.permissions.indexOf('student_project_update') !== -1"
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật thông tin sinh viên"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateStudentProjectCompartment(row.item, true)">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="studentProjects.data && studentProjects.data.length === 0 && this.dataFilter.page === 1"
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
        id="update-student-project"
        :title="isUpdate ? 'Cập nhật thông tin sinh viên' : 'Thêm mới sinh viên'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateStudentProjectCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Họ và tên<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.name.$model"
                placeholder="Nhập họ và tên"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.name) }"
            />
            <div v-if="!$v.currentData.name.required" class="invalid-feedback">
              Họ và tên không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mã sinh viên<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-student-code"
                v-model="$v.currentData.studentCode.$model"
                placeholder="Nhập mã sinh viên"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.studentCode) }"
            />
            <div v-if="!$v.currentData.studentCode.required" class="invalid-feedback">
              Mã sinh viên không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Số giờ HD:</label>
            <b-form-input
                id="input-class-id"
                v-model="currentData.timeHd"
                placeholder="Nhập số giờ HD"
                trim
            />
          </b-form-group>
        </b-col>

        <b-col md="12">
          <b-form-group>
            <label>Nguyện vọng 1:</label>
            <b-form-input
                id="input-teacher-1-id"
                v-model="currentData.teacher1Id"
                placeholder="Nhập nguyện vọng 1"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Nguyện vọng 2:</label>
            <b-form-input
                id="input-teacher-2-id"
                v-model="currentData.teacher2Id"
                placeholder="Nhập nguyện vọng 2"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Nguyện vọng 3:</label>
            <b-form-input
                id="input-teacher-3-id"
                v-model="currentData.teacher3Id"
                placeholder="Nhập nguyện vọng 3"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Giảng viên phụ trách:</label>
            <b-form-input
                id="input-teacher-assigned-id"
                v-model="currentData.teacherAssignedId"
                placeholder="Nhập giảng viên phụ trách"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Loại đồ án:</label>
            <b-form-input
                id="input-project-type"
                v-model="currentData.projectType"
                placeholder="Nhập loại đồ án"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mã lớp đồ án:</label>
            <b-form-input
                id="input-class-id"
                v-model="currentData.classId"
                placeholder="Nhập mã lớp đồ án"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Tên đồ án:</label>
            <b-form-input
                id="input-project-name"
                v-model="currentData.projectName"
                placeholder="Nhập tên đồ án"
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
            @click="closeModalCreateStudentProjectCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateStudentProject"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal
        id="modal-upload-student-project"
        :modal-class="['sc5-modal']"
        :header-class="['modal__header']"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalUpload"
    >
      <template slot="modal-header">
        <div class="modal__header--item title font-weight-500">
          Upload file ds sinh viên
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
              :href="SAMPLE_STUDENT_PROJECT_IMPORT_LINK"
              target="_self"
              style="font-weight: bold;color:black!important;"
          >Format_ThemSV</a
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
  </b-form>
</template>
<script>
import PageTitle from "../Layout/Components/PageTitle";
import DatePicker from "vue2-datepicker"
import {
  CREATE_STUDENT_PROJECT,
  FETCH_STUDENT_PROJECTS,
  UPDATE_STUDENT_PROJECT
} from "@/store/action.type"
import {mapGetters} from "vuex";
import {checkPermission, formatDate2, formatTime} from "@/common/utils";
import {PAGINATION_OPTIONS, SAMPLE_STUDENT_PROJECT_IMPORT_LINK} from "@/common/config"
import baseMixins from "../components/mixins/base";
import router from '@/router';
import moment from 'moment-timezone';
import {required} from "vuelidate/lib/validators";
import * as XLSX from "xlsx";

const initData = {
  id: null,
  name: null,
  studentCode: null,
  dataset: null,
  page: 1,
  pageSize: 20
}

const initStudentProject = {
  id: null,
  name: null,
  studentCode: null,
  timeHd: null,
  isAssigned: null,
  teacher1Id: null,
  teacher2Id: null,
  teacher3Id: null,
  teacherAssignedId: null,
  dataset: null,
  projectType: null,
  projectName: null,
  classId: null,
}

const initNewDataExcel = {
  name: null,
  studentCode: null,
  teacher1Name: null,
  teacher2Name: null,
  teacher3Name: null,
  projectType: null,
  projectName: null,
  classId: null,
};

export default {
  name: "StudentProjects",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      loadingFile: false,
      updatedAtFrom: new Date(),
      updatedAtTo: new Date(),
      totalRow: 0,
      PAGINATION_OPTIONS,
      SAMPLE_STUDENT_PROJECT_IMPORT_LINK,
      subheading: "Quản lý danh sách sinh viên đăng ký đồ án.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Danh sách sinh viên đăng ký đồ án",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
      selectedPageSize: {text: initData.pageSize},
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
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
        {key: "name", label: "Họ và tên", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "studentCode", label: "Mã sinh viên", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "timeHd", label: "Số giờ HD", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "projectType", label: "Loại đồ án", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "projectName", label: "Tên đồ án", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "classId", label: "Mã lớp", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "isAssigned", label: "Trạng thái gán GV", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "teacher1Id", label: "Nguyện vọng 1", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "teacher2Id", label: "Nguyện vọng 2", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "teacher3Id", label: "Nguyện vọng 3", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "teacherAssignedId", label: "Giảng viên phụ trách", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
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
      currentData: Object.assign({}, {...initStudentProject}),
      currentDetail: null,
      currentFile: null,
      isUpdate: false,
      uploadDataExcel: [],
      dataExcel: [],
    }
  },
  validations: {
    currentData: {
      name: {required},
      studentCode: {required},
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

    this.fetchStudentProjects();
  },
  watch: {},
  computed: {
    ...mapGetters(["studentProjects"]),
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
      this.fetchStudentProjects();
    },
    checkPermission,
    async fetchStudentProjects() {
      let res = await this.$store.dispatch(FETCH_STUDENT_PROJECTS, this.dataFilter)
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
      router.push({path: '/admin/student-projects', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchStudentProjects();
    },
    changePageSize(e) {
      if (e) {
        this.dataFilter.pageSize = e.text
        this.dataFilter.page = 1
      }
      router.push({path: '/admin/student-projects', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchStudentProjects();
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/student-projects', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchStudentProjects();
    },
    handleReset() {
      this.$router.replace('/admin/student-projects')
      this.dataFilter = Object.assign({}, {
        ...initData,
        pageSize: this.dataFilter.pageSize,
      });
      this.selectedDataset = {value: null, text: 'Tất cả'};
      this.handleDataFilter();
      this.fetchStudentProjects();
    },
    openModalCreateStudentProjectCompartment(studentProject, isUpdate) {
      this.isUpdate = isUpdate

      if (isUpdate) {
        this.currentData = Object.assign({}, {
          ...studentProject,
        });
      } else {
        this.currentData = Object.assign({}, {
          ...initStudentProject,
        });
      }
      this.$root.$emit("bv::show::modal", 'update-student-project');
    },
    closeModalCreateStudentProjectCompartment() {
      this.currentData = Object.assign({}, {...initStudentProject})
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-student-project')
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleCreateStudentProject() {
      this.$v.$reset();
      this.$v.$touch();

      if (this.$v.currentData.$invalid) return
      const payload = {
        id: this.isUpdate ? this.currentData.id : null,
        name: this.currentData.name,
        studentCode: this.currentData.studentCode,
        timeHd: this.currentData.timeHd,
        teacher1Id: this.currentData.teacher1Id,
        teacher2Id: this.currentData.teacher2Id,
        teacher3Id: this.currentData.teacher3Id,
        teacherAssignedId: this.currentData.teacherAssignedId,
        dataset: this.currentData.dataset,
        projectType: this.currentData.projectType,
        projectName: this.currentData.projectName,
        classId: this.currentData.classId,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_STUDENT_PROJECT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin sinh viên thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateStudentProjectCompartment()
            this.fetchStudentProjects()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_STUDENT_PROJECT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới sinh viên thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateStudentProjectCompartment()
            this.fetchStudentProjects()
          }, 1000)
        }
      }
    },
    openModalUploadStudentProject() {
      this.$root.$emit("bv::show::modal", 'modal-upload-student-project')
    },
    closeModalUpload() {
      this.currentDetail = null
      this.currentFile = null
      this.$root.$emit("bv::hide::modal", 'modal-upload-student-project')
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
            let studentProject = Object.assign({});

            item.forEach((itemValue, indexValue) => {
              if (json[0][indexValue]) {
                let newAttribute = '';
                switch (json[0][indexValue]) {
                  case 'Họ và tên':
                    newAttribute = 'name';
                    break;
                  case 'Mã sinh viên':
                    newAttribute = 'studentCode';
                    break;
                  case 'Nguyện vọng 1':
                    newAttribute = 'teacher1Id';
                    break;
                  case 'Nguyện vọng 2':
                    newAttribute = 'teacher2Id';
                    break;
                  case 'Nguyện vọng 3':
                    newAttribute = 'teacher3Id';
                    break;
                  case 'Loại đồ án':
                    newAttribute = 'projectType';
                    break;
                  case 'Tên đồ án':
                    newAttribute = 'projectName';
                    break;
                  case 'Mã lớp đồ án':
                    newAttribute = 'classId';
                    break;
                  default:
                    break;
                }
                studentProject[newAttribute] = itemValue;
              }
            });

            return studentProject;
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
        newData.studentCode = item.studentCode ? item.studentCode : null;
        newData.teacher1Name = item.teacher1Name ? item.teacher1Name : null
        newData.teacher1Name = item.teacher1Name ? item.teacher1Name : null
        newData.teacher1Name = item.teacher1Name ? item.teacher1Name : null
        newData.projectType = item.projectType ? item.projectType : null
        newData.projectName = item.projectName ? item.projectName : null
        newData.classId = item.classId ? item.classId : null

        this.uploadDataExcel.push({...newData})
      });

      this.loadingFile = true;
      const dataFiltered = this.uploadDataExcel.filter((item) => {
        return item.name !== null &&
            item.code !== null;
      });

      let res = await this.post('/student-project/upload-excel', {
        studentProjectCreateRequests: dataFiltered,
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
          this.fetchStudentProjects();
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

#modal-upload-student-project .modal-footer {
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