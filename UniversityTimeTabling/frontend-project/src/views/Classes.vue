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
            <div class="label-form">Lớp học</div>
            <b-input type="text" placeholder="Nhập tên lớp học" v-model.trim="dataFilter.name"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Mã lớp học</div>
            <b-input type="text" placeholder="Nhập mã lớp học" v-model.trim="dataFilter.code"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Học kỳ</div>
            <multiselect v-model="selectedSemester" track-by="text" label="text" :show-labels="false"
                         placeholder="Chọn" :options="optionsSemester" :searchable="true">
              <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
            </multiselect>
          </b-col>
          <b-col md="2">
            <div class="label-form">Học phần</div>
            <b-input type="text" placeholder="Nhập tên học phần" v-model.trim="dataFilter.subjectId"/>
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
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="openModalUploadClass"
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
          <b-col md="8" class="text-right mt-30">
            <b-button
                v-if="checkPermission('class_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateClassCompartment(null, false)"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm lớp học
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="classes.data"
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
          <template #cell(room)="row">
            {{ concatBuildingAndRoom(row.item.building, row.item.room) }}
          </template>
          <template #cell(subjectId)="row">
            {{ row.item.subject ? row.item.subject.name : "" }}
          </template>
          <template #cell(teacherId)="row">
            {{ row.item.teacher ? row.item.teacher.fullName : "" }}
          </template>
          <template #cell(isAssigned)="row">
            {{ row.item.isAssigned === 1 ? "Đã phân công" : "Chưa phân công" }}
          </template>
          <template #cell(startTime)="row">
            {{ row.item.startTime.length === 3 ? "0" + row.item.startTime : row.item.startTime }}
          </template>
          <template #cell(endTime)="row">
            {{ row.item.endTime.length === 3 ? "0" + row.item.endTime : row.item.endTime }}
          </template>
          <template #cell(languageId)="row">
            {{ displayLanguage(row.item.languageId) }}
          </template>
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  v-if="userInfo && userInfo.permissions.indexOf('class_update') !== -1"
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật thông tin lớp học"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateClassCompartment(row.item, true)">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="classes.data && classes.data.length === 0 && this.dataFilter.page === 1"
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
        id="update-class"
        :title="isUpdate ? 'Cập nhật thông tin lớp học' : 'Thêm mới lớp học'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateClassCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Tên lớp học<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.name.$model"
                placeholder="Nhập tên lớp học"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.name) }"
            />
            <div v-if="!$v.currentData.name.required" class="invalid-feedback">
              Tên lớp học không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mã lớp học<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-code"
                v-model="$v.currentData.code.$model"
                placeholder="Nhập mã lớp học"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.code) }"
            />
            <div v-if="!$v.currentData.code.required" class="invalid-feedback">
              Mã lớp học không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group :class="{'invalid-option': validationStatus($v.currentData.semester)}">
            <label>Học kỳ<span class="text-danger">*</span>:</label>
            <b-form-select
                :options="optionsSemester.filter(semester => semester.value != null)"
                :searchable="true"
                value-field="value" text-field="text"
                :class="{'is-invalid-option': validationStatus($v.currentData.semester)}"
                v-model.trim="currentData.semester"
            >
            </b-form-select>
            <div v-if="!$v.currentData.semester.required" class="invalid-feedback">
              Học kỳ không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Học phần<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-subject-id"
                v-model="$v.currentData.subjectId.$model"
                placeholder="Nhập học phần"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.subjectId) }"
            />
            <div v-if="!$v.currentData.subjectId.required" class="invalid-feedback">
              Học phần không được để trống.
            </div>
          </b-form-group>
        </b-col>

        <b-col md="12">
          <b-form-group>
            <label>Tuần học:</label>
            <b-form-input
                id="input-week"
                v-model="currentData.week"
                placeholder="Nhập tuần học"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Ngày trong tuần:</label>
            <b-form-input
                id="input-day-of-week"
                v-model="currentData.dayOfWeek"
                placeholder="Nhập ngày học trong tuần"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Tiết học trong ngày:</label>
            <b-form-input
                id="input-time-of-day"
                v-model="currentData.timeOfDay"
                placeholder="Nhập tiết học trong ngày"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Tòa nhà:</label>
            <b-form-input
                id="input-building"
                v-model="currentData.building"
                placeholder="Nhập tòa nhà"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Phòng học:</label>
            <b-form-input
                id="input-room"
                v-model="currentData.room"
                placeholder="Nhập phòng học"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Số giờ trong tuần:</label>
            <b-form-input
                id="input-time-of-class"
                v-model="currentData.timeOfClass"
                placeholder="Nhập số giờ trong tuần"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Thời gian bắt đầu:</label>
            <b-form-input
                id="input-start-time"
                v-model="currentData.startTime"
                placeholder="Nhập thời gian bắt đầu"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Thời gian kết thúc:</label>
            <b-form-input
                id="input-end-time"
                v-model="currentData.endTime"
                placeholder="Nhập thời gian kết thúc"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mã ngôn ngữ:</label>
            <b-form-input
                id="input-language-id"
                v-model="currentData.languageId"
                placeholder="Nhập mã ngôn ngữ"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Số lượng sinh viên:</label>
            <b-form-input
                id="input-number-of-student"
                v-model="currentData.numberOfStudent"
                placeholder="Nhập số lượng sinh viên"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Số lượng tín chỉ:</label>
            <b-form-input
                id="input-number-of-credits"
                v-model="currentData.numberOfCredits"
                placeholder="Nhập số lượng tín chỉ"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Loại lớp học:</label>
            <b-form-input
                id="input-class-type"
                v-model="currentData.classType"
                placeholder="Nhập loại lớp học"
                trim
            />
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Chương trình:</label>
            <b-form-input
                id="input-class-type"
                v-model="currentData.program"
                placeholder="Nhập chương trình"
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
        <b-col md="12">
          <b-form-group>
            <label>Giảng viên phụ trách:</label>
            <b-form-input
                id="input-teacher-id"
                v-model="currentData.teacherId"
                placeholder="Nhập giảng viên phụ trách"
                trim
            />
          </b-form-group>
        </b-col>
      </b-row>
      <template #modal-footer>
        <b-button
            class="mr-2 btn-light2 pull-right"
            @click="closeModalCreateClassCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateClass"
        >
          Đồng ý
        </b-button>
      </template>
    </b-modal>

    <b-modal
        id="modal-upload-class"
        :modal-class="['sc5-modal']"
        :header-class="['modal__header']"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalUpload"
    >
      <template slot="modal-header">
        <div class="modal__header--item title font-weight-500">
          Upload file ds lớp học
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
              :href="SAMPLE_CLASS_IMPORT_LINK"
              target="_self"
              style="font-weight: bold;color:black!important;"
          >Format_ThemLH</a
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
import {CREATE_CLASS, FETCH_CLASSES, UPDATE_CLASS} from "@/store/action.type"
import {mapGetters} from "vuex";
import {checkPermission} from "@/common/utils";
import {PAGINATION_OPTIONS, SAMPLE_CLASS_IMPORT_LINK} from "@/common/config"
import baseMixins from "../components/mixins/base";
import router from '@/router';
import {required} from "vuelidate/lib/validators";
import * as XLSX from "xlsx";

const initData = {
  id: null,
  name: null,
  code: null,
  semester: null,
  dataset: null,
  page: 1,
  pageSize: 20
}

const initClass = {
  id: null,
  name: null,
  code: null,
  semester: null,
  subjectId: null,
  week: null,
  dayOfWeek: null,
  timeOfDay: null,
  isAssigned: null,
  teacherId: null,
  building: null,
  room: null,
  timeOfClass: null,
  startTime: null,
  endTime: null,
  languageId: null,
  numberOfStudent: null,
  numberOfCredits: null,
  classType: null,
  program: null,
  dataset: null
}

const initNewDataExcel = {
  name: null,
  code: null,
  semester: null,
  subjectCode: null,
  week: null,
  dayOfWeek: null,
  languageName: null,
  room: null,
  timeInDay: null,
  numberOfStudent: null,
  numberOfCredits: null,
  classType: null,
  program: null,
};

export default {
  name: "Classes",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      loadingFile: false,
      updatedAtFrom: new Date(),
      updatedAtTo: new Date(),
      totalRow: 0,
      PAGINATION_OPTIONS,
      SAMPLE_CLASS_IMPORT_LINK,
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
      subheading: "Quản lý danh sách lớp học.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Danh sách lớp học",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
      selectedPageSize: {text: initData.pageSize},
      selectedSemester: {value: null, text: 'Tất cả'},
      optionsSemester: [
        {value: null, text: 'Tất cả'},
        {value: '20231', text: '20231'},
        {value: '20223', text: '20223'},
        {value: '20222', text: '20222'},
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
        {key: "name", label: "Lớp học", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "code", label: "Mã lớp học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "languageId", label: "Ngôn ngữ", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {
          key: "semester",
          label: "Học kỳ",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        },
        {
          key: "subjectId",
          label: "Học phần",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        },
        {
          key: "week",
          label: "Tuần học",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        },
        {
          key: "dayOfWeek",
          label: "Ngày trong tuần",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        },
        {
          key: "timeOfDay",
          label: "Tiết trong ngày",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        },
        {key: "startTime", label: "Thời gian bắt đầu", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "endTime", label: "Thời gian kết thúc", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "room", label: "Phòng học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "timeOfClass", label: "Số giờ dạy", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "numberOfStudent", label: "Số lượng sinh viên", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "numberOfCredits", label: "Số tín chỉ", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "classType", label: "Loại lớp", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "program", label: "Chương trình", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {
          key: "teacherId",
          label: "Giảng viên phụ trách",
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
      currentData: Object.assign({}, {...initClass}),
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
      code: {required},
      semester: {required},
      subjectId: {required},
      dataset:{required},
    },
  },
  mounted() {
    this.fetchAllDatasets();
    this.handleDataFilter();
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));

      this.selectedSemester = this.optionsSemester.filter((i) => i.value === this.dataFilter.semester)[0];

      this.selectedPageSize = {text: this.dataFilter.pageSize}
      this.selectedDataset = this.optionsDataset.filter(
          (i) => i.value === this.dataFilter.dataset
      )[0];
    }

    this.fetchClasses();
  },
  watch: {},
  computed: {
    ...mapGetters(["classes"]),
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
    validation() {
    },
  },
  methods: {
    handleDataFilter() {
      this.dataFilter.semester = this.selectedSemester === null ? null : this.selectedSemester.value;
      this.dataFilter.page = 1;
      this.dataFilter.pageSize = this.selectedPageSize.text
      this.dataFilter.dataset = this.selectedDataset == null ? null : this.selectedDataset.value;
    },
    reload() {
      this.fetchClasses();
    },
    checkPermission,
    async fetchClasses() {
      let res = await this.$store.dispatch(FETCH_CLASSES, this.dataFilter)
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
      router.push({path: '/admin/classes', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchClasses();
    },
    changePageSize(e) {
      if (e) {
        this.dataFilter.pageSize = e.text
        this.dataFilter.page = 1
      }
      router.push({path: '/admin/classes', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchClasses();
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/classes', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchClasses();
    },
    handleReset() {
      this.$router.replace('/admin/classes')
      this.dataFilter = Object.assign({}, {
        ...initData,
        pageSize: this.dataFilter.pageSize,
      });
      this.selectedSemester = {value: null, text: 'Tất cả'};
      this.selectedDataset = {value: null, text: 'Tất cả'};
      this.handleDataFilter();
      this.fetchClasses();
    },
    openModalCreateClassCompartment(classItem, isUpdate) {
      this.isUpdate = isUpdate

      if (isUpdate) {
        this.currentData = Object.assign({}, {
          ...classItem,
        });
      } else {
        this.currentData = Object.assign({}, {
          ...initClass,
          semester: '20231',
        });
      }
      this.$root.$emit("bv::show::modal", 'update-class');
    },
    closeModalCreateClassCompartment() {
      this.currentData = Object.assign({}, {...initClass})
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-class')
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleCreateClass() {
      this.$v.$reset();
      this.$v.$touch();

      if (this.$v.currentData.$invalid) return
      const payload = {
        id: this.isUpdate ? this.currentData.id : null,
        name: this.currentData.name,
        code: this.currentData.code,
        semester: this.currentData.semester,
        subjectId: this.currentData.subjectId,
        week: this.currentData.week,
        dayOfWeek: this.currentData.dayOfWeek,
        timeOfDay: this.currentData.timeOfDay,
        teacherId: this.currentData.teacherId,
        building: this.currentData.building,
        room: this.currentData.room,
        timeOfClass: this.currentData.timeOfClass,
        startTime: this.currentData.startTime,
        endTime: this.currentData.endTime,
        languageId: this.currentData.languageId,
        numberOfStudent: this.currentData.numberOfStudent,
        numberOfCredits: this.currentData.numberOfCredits,
        classType: this.currentData.classType,
        program: this.currentData.program,
        dataset: this.currentData.dataset,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_CLASS, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin lớp học thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateClassCompartment()
            this.fetchClasses()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_CLASS, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới lớp học thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateClassCompartment()
            this.fetchClasses()
          }, 1000)
        }
      }
    },
    openModalUploadClass() {
      this.$root.$emit("bv::show::modal", 'modal-upload-class')
    },
    closeModalUpload() {
      this.currentDetail = null
      this.currentFile = null
      this.$root.$emit("bv::hide::modal", 'modal-upload-class')
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
            let classItem = Object.assign({});

            item.forEach((itemValue, indexValue) => {
              if (json[0][indexValue]) {
                let newAttribute = '';
                switch (json[0][indexValue]) {
                  case 'Lớp học':
                    newAttribute = 'name';
                    break;
                  case 'Mã lớp học':
                    newAttribute = 'code';
                    break;
                  case 'Học kỳ':
                    newAttribute = 'semester';
                    break;
                  case 'Học phần':
                    newAttribute = 'subjectCode';
                    break;
                  case 'Tuần học':
                    newAttribute = 'week';
                    break;
                  case 'Ngày trong tuần':
                    newAttribute = 'dayOfWeek';
                    break;
                  case 'Phòng học':
                    newAttribute = 'room';
                    break;
                  case 'Thời gian trong ngày':
                    newAttribute = 'timeInDay';
                    break;
                  case 'Ngôn ngữ':
                    newAttribute = 'languageName';
                    break;
                  case 'Số lượng SV':
                    newAttribute = 'numberOfStudent';
                    break;
                  case 'Số tín chỉ':
                    newAttribute = 'numberOfCredits';
                    break;
                  case 'Loại lớp':
                    newAttribute = 'classType';
                    break;
                  case 'Chương trình':
                    newAttribute = 'program';
                    break;
                  default:
                    break;
                }
                classItem[newAttribute] = itemValue;
              }
            });

            return classItem;
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
        newData.semester = item.semester ? item.semester : null;
        newData.subjectCode = item.subjectCode ? item.subjectCode : null
        newData.week = item.week ? item.week : null
        newData.dayOfWeek = item.dayOfWeek ? item.dayOfWeek : null
        newData.room = item.room ? item.room : null
        newData.timeInDay = item.timeInDay ? item.timeInDay : null
        newData.languageName = item.languageName ? item.languageName : null
        newData.numberOfStudent = item.numberOfStudent ? item.numberOfStudent : null
        newData.numberOfCredits = item.numberOfCredits ? item.numberOfCredits : null
        newData.classType = item.classType ? item.classType : null
        newData.program = item.program ? item.program : null

        this.uploadDataExcel.push({...newData})
      });

      this.loadingFile = true;
      const dataFiltered = this.uploadDataExcel.filter((item) => {
        return item.name !== null;
      });

      const length = Math.floor(dataFiltered.length / 3500) + 1;

      for (let i = 0; i < length; i++) {
        const dataUpload = (i < (length - 1)) ? dataFiltered.slice(i * 3500, i * 3500 + 3500) : dataFiltered.slice(i * 3500, dataFiltered.length);
        let res = await this.post('/class/upload-excel', {
          classCreateRequests: dataUpload,
          dataset: this.dataFilter.dataset,
        });
      }

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
          this.fetchTeachers();
        }, 1000);
      }
    },
    concatBuildingAndRoom(building, room) {
      if (building && room) {
        return building + "-" + room;
      }
      return "";
    },
    displayLanguage(languageId) {
      if (languageId === 1) {
        return "English";
      }
      if (languageId === 2) {
        return "Vietnamese";
      }
      if (languageId === 3) {
        return "French";
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

#modal-upload-class .modal-footer {
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