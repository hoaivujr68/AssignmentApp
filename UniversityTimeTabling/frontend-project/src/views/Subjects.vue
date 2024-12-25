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
            <div class="label-form">Tên học phần</div>
            <b-input type="text" placeholder="Nhập tên học phần" v-model.trim="dataFilter.name"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Mã học phần</div>
            <b-input type="text" placeholder="Nhập mã học phần" v-model.trim="dataFilter.code"/>
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
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="openModalUploadSubject"
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
                v-if="checkPermission('subject_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateSubjectCompartment(null, false)"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm học phần
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="subjects.data"
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
          <template #cell(groupId)="row">
            {{ row.item.groupTeacher ? row.item.groupTeacher.name : "" }}
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  v-if="userInfo && userInfo.permissions.indexOf('subject_update') !== -1"
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật thông tin học phần"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateSubjectCompartment(row.item, true)">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="subjects.data && subjects.data.length === 0 && this.dataFilter.page === 1"
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
        id="update-subject"
        :title="isUpdate ? 'Cập nhật thông tin học phần' : 'Thêm mới học phần'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateSubjectCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Tên học phần<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.name.$model"
                placeholder="Nhập tên học phần"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.name) }"
            />
            <div v-if="!$v.currentData.name.required" class="invalid-feedback">
              Tên học phần không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mã học phần<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.code.$model"
                placeholder="Nhập mã học phần"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.code) }"
            />
            <div v-if="!$v.currentData.code.required" class="invalid-feedback">
              Mã học phần không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Nhóm chuyên môn<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.groupId.$model"
                placeholder="Nhập nhóm chuyên môn"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.groupId) }"
            />
            <div v-if="!$v.currentData.groupId.required" class="invalid-feedback">
              Nhóm chuyên môn không được để trống.
            </div>
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
            @click="closeModalCreateSubjectCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateSubject"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal
        id="modal-upload-subject"
        :modal-class="['sc5-modal']"
        :header-class="['modal__header']"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalUpload"
    >
      <template slot="modal-header">
        <div class="modal__header--item title font-weight-500">
          Upload file ds học phần
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
              :href="SAMPLE_SUBJECT_IMPORT_LINK"
              target="_self"
              style="font-weight: bold;color:black!important;"
          >Format_ThemHP</a>
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
  CREATE_SUBJECT,
  FETCH_SUBJECTS,
  UPDATE_SUBJECT
} from "@/store/action.type"
import {mapGetters} from "vuex";
import {checkPermission, formatCurrencyToString, formatDate2, formatTime} from "@/common/utils";
import {PAGINATION_OPTIONS, SAMPLE_SUBJECT_IMPORT_LINK} from "@/common/config"
import baseMixins from "../components/mixins/base";
import router from '@/router';
import moment from 'moment-timezone';
import {required} from "vuelidate/lib/validators";
import * as XLSX from "xlsx";

const initData = {
  id: null,
  name: null,
  code: null,
  dataset: null,
  page: 1,
  pageSize: 20
}

const initSubject = {
  id: null,
  name: null,
  code: null,
  groupId: null,
  dataset: null,
}

const initNewDataExcel = {
  name: null,
  code: null,
  groupName: null,
};

export default {
  name: "Subjects",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      loadingFile: false,
      updatedAtFrom: new Date(),
      updatedAtTo: new Date(),
      totalRow: 0,
      PAGINATION_OPTIONS,
      SAMPLE_SUBJECT_IMPORT_LINK,
      subheading: "Quản lý danh sách học phần.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Danh sách học phần",
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
        {key: "name", label: "Tên học phần", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "code", label: "Mã học phần", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "groupId", label: "Nhóm chuyên môn", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
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
      actionType: null,
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
      currentData: Object.assign({}, {...initSubject}),
      currentDetail: null,
      currentFile: null,
      isUpdate: false,
      uploadDataExcel: [],
      dataExcel: [],
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
    }
  },
  validations: {
    currentData: {
      name: {required},
      code: {required},
      groupId: {required},
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

    this.fetchSubjects();
  },
  watch: {},
  computed: {
    ...mapGetters(["subjects"]),
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
      this.fetchSubjects();
    },
    checkPermission,
    async fetchSubjects() {
      let res = await this.$store.dispatch(FETCH_SUBJECTS, this.dataFilter)
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
      router.push({path: '/admin/subjects', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchSubjects();
    },
    changePageSize(e) {
      if (e) {
        this.dataFilter.pageSize = e.text
        this.dataFilter.page = 1
      }
      router.push({path: '/admin/subjects', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchSubjects();
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/subjects', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchSubjects();
    },
    handleReset() {
      this.$router.replace('/admin/subjects')
      this.dataFilter = Object.assign({}, {
        ...initData,
        pageSize: this.dataFilter.pageSize,
      });
      this.selectedDataset = {value: null, text: 'Tất cả'};
      this.handleDataFilter();
      this.fetchSubjects();
    },
    openModalCreateSubjectCompartment(subject, isUpdate) {
      this.isUpdate = isUpdate

      if (isUpdate) {
        this.currentData = Object.assign({}, {
          ...subject,
        });
      } else {
        this.currentData = Object.assign({}, {
          ...initSubject,
        });
      }
      this.$root.$emit("bv::show::modal", 'update-subject');
    },
    closeModalCreateSubjectCompartment() {
      this.currentData = Object.assign({}, {...initSubject})
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-subject')
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleCreateSubject() {
      this.$v.$reset();
      this.$v.$touch();

      if (this.$v.currentData.$invalid) return
      const payload = {
        id: this.isUpdate ? this.currentData.id : null,
        name: this.currentData.name,
        code: this.currentData.code,
        groupId: this.currentData.groupId,
        dataset: this.currentData.dataset,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_SUBJECT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin học phần thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateSubjectCompartment()
            this.fetchSubjects()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_SUBJECT, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới học phần thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateSubjectCompartment()
            this.fetchSubjects()
          }, 1000)
        }
      }
    },
    openModalUploadSubject() {
      this.$root.$emit("bv::show::modal", 'modal-upload-subject')
    },
    closeModalUpload() {
      this.currentDetail = null
      this.currentFile = null
      this.$root.$emit("bv::hide::modal", 'modal-upload-subject')
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
            let subject = Object.assign({});

            item.forEach((itemValue, indexValue) => {
              if (json[0][indexValue]) {
                let newAttribute = '';
                switch (json[0][indexValue]) {
                  case 'Tên học phần':
                    newAttribute = 'name';
                    break;
                  case 'Mã học phần':
                    newAttribute = 'code';
                    break;
                  case 'Nhóm chuyên môn':
                    newAttribute = 'groupName';
                    break;
                  default:
                    break;
                }
                subject[newAttribute] = itemValue;
              }
            });

            return subject;
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
        newData.code = item.code ? item.code : null;
        newData.groupName = item.groupName ? item.groupName : null

        this.uploadDataExcel.push({...newData})
      });

      this.loadingFile = true;
      const dataFiltered = this.uploadDataExcel.filter((item) => {
        return item.fullName !== null;
      });

      let res = await this.post('/subject/upload-excel', {
        subjectCreateRequests: dataFiltered,
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
          this.fetchSubjects();
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

#modal-upload-subject .modal-footer {
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