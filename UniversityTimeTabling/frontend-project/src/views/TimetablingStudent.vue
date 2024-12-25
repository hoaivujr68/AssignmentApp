<template>
  <b-form @submit="handleSearch">
    <div>
      <page-title
          :heading="heading"
          :subheading="subheading"
          :icon="icon"
      ></page-title>
      <b-card class="main-card search-wrapper mb-20">
        <template v-if="loadingHeader">
          <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
        </template>
        <template v-else>
          <b-row class="mb-2">
            <b-col md="2">
              <div class="label-form">Bộ dữ liệu</div>
              <multiselect v-model="selectedDataset" track-by="text" label="text" :show-labels="false"
                           placeholder="Chọn" :options="optionsDataset" :searchable="true">
                <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
              </multiselect>
            </b-col>
            <b-col md="2" style="margin-top: 30px">
              <b-button variant="primary" class="mr-2" @click="handleSearch" type="submit">
                <font-awesome-icon :icon="['fas', 'search']"/>
                Tìm kiếm
              </b-button>
            </b-col>
          </b-row>
          <b-row v-if="this.dataFilter.dataset != null && !timetablingStudentStatus">
            <b-col md="4"><h4>Bắt đầu phân công</h4></b-col>
            <b-col md="8" style="font-weight: 500">
              <b-button
                  variant="primary"
                  class="custom-btn-add-common"
                  style="background: orange; border: none"
                  @click="openModalTimetablingStudentCompartment"
              >
                Phân công
              </b-button>
            </b-col>
          </b-row>
          <b-row
              v-if="this.dataFilter.dataset != null && timetablingStudentStatus && timetablingStudentStatus.status === 'PROCESSING'">
            <b-col md="12"><h6>Hệ thống đang thực hiện phân công hướng dẫn</h6></b-col>
          </b-row>
          <b-row
              v-if="this.dataFilter.dataset != null && timetablingStudentStatus && timetablingStudentStatus.status === 'FAILED'">
            <b-col md="12"><h6>Hệ thống thực hiện phân công hướng dẫn thất bại</h6></b-col>
          </b-row>
          <b-row
              v-if="this.dataFilter.dataset != null && timetablingStudentStatus && timetablingStudentStatus.status === 'SUCCESS'">
            <b-col md="10"><h6>Hệ thống đã thực hiện phân công hướng dẫn xong</h6></b-col>
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="exportTimetablingStudent"
                      style="border: none">
              <font-awesome-icon :icon="['fas','file-excel']"/>
              Xuất dữ liệu
            </b-button>
          </b-row>
        </template>
      </b-card>

      <b-card class="main-card search-wrapper mb-20"
              v-if="this.dataFilter.dataset != null && timetablingStudentStatus && timetablingStudentStatus.status === 'SUCCESS'"
              style="margin-top: 15px">
        <template v-if="loadingHeader">
          <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
        </template>
        <template v-else>
          <b-col md="12"><h6>Đánh giá kết quả sau phân công</h6></b-col>
          <b-table
              class="mt-3"
              :items="evaluateStudentResponse.data"
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
            <template #cell(stt)="row">
              {{ row.index + 1 }}
            </template>
          </b-table>
          <b-row v-if="evaluateStudentResponse.data && evaluateStudentResponse.data.length === 0"
                 class="justify-content-center">
            <span>Không tìm thấy thông tin</span>
          </b-row>
        </template>
      </b-card>

      <b-modal
          id="timetabling-student"
          :title="'Phân công hướng dẫn'"
          :no-close-on-backdrop="true"
          size="lg"
          @hidden="closeModalTimetablingStudentCompartment"
      >
        <b-row>
          <b-col md="12">
            <h6>Bạn có chắc chắn muốn thực hiện phân công hướng dẫn {{ inputDataStudent.numOfStudents }} sinh viên cho
              {{ inputDataStudent.numOfTeachers }} giảng viên?</h6>
          </b-col>
        </b-row>
        <template #modal-footer>
          <b-button
              class="mr-2 btn-light2 pull-right"
              @click="closeModalTimetablingStudentCompartment"
          >
            Hủy
          </b-button>
          <b-button
              variant="primary pull-right"
              @click.prevent="handleTimetablingStudent"
          >
            Đồng ý
          </b-button>
        </template>
      </b-modal>
    </div>
  </b-form>
</template>
<script>
import PageTitle from "../Layout/Components/PageTitle";
import DatePicker from "vue2-datepicker"
import {mapGetters} from "vuex";
import {checkPermission, formatDate2, formatTime} from "@/common/utils";
import baseMixins from "../components/mixins/base";
import router from '@/router';
import moment from 'moment-timezone';
import {required} from "vuelidate/lib/validators";
import {
  TIMETABLING_STUDENT,
  INPUT_DATA_STUDENT,
  TIMETABLING_STUDENT_STATUS,
  FETCH_STUDENTS_BY_TEACHER,
  ALL_TEACHER,
  UPDATE_STUDENT_PROJECT,
  CREATE_FILE_TIMETABLING_TEACHER,
  CREATE_FILE_TIMETABLING_STUDENT, FETCH_EVALUATE_STUDENT_RESPONSE
} from "@/store/action.type";
import {SET_ALL_TEACHERS} from "@/store/mutation.type";

const initData = {
  dataset: null
}

export default {
  name: "TimetablingStudent",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      subheading: "Phân bổ sinh viên cho giảng viên thỏa mãn các ràng buộc.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Phân công hướng dẫn",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
      fields: [
        {
          key: "stt",
          label: "STT",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {key: "key", label: "Tiêu chí", visible: true, thStyle: {width: '60%'}, thClass: 'align-middle'},
        {key: "value", label: "Giá trị", visible: true, thStyle: "width: 20%", thClass: 'align-middle'},
      ],
    }
  },
  watch: {},
  validations: {},
  mounted() {
    this.fetchAllDatasets();
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));
      this.selectedDataset = this.optionsDataset.filter(
          (i) => i.value === this.dataFilter.dataset
      )[0];
    }
    this.handleDataFilter();
    this.fetchInputData()
    this.fetchTimetablingStudentStatus()
    this.fetchEvaluateStudentResponse();
  },
  computed: {
    ...mapGetters(["inputDataStudent", "timetablingStudentStatus", "evaluateStudentResponse"]),
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
    validation() {
    },
  },
  methods: {
    handleDataFilter() {
      this.dataFilter.dataset = this.selectedDataset == null ? null : this.selectedDataset.value;
    },
    reload() {
      this.handleDataFilter();
      this.fetchInputData()
      this.fetchTimetablingStudentStatus()
      this.fetchEvaluateStudentResponse();
    },
    async fetchEvaluateStudentResponse() {
      await this.$store.dispatch(FETCH_EVALUATE_STUDENT_RESPONSE, {
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/timetabling/student', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchInputData()
      this.fetchTimetablingStudentStatus()
      this.fetchEvaluateStudentResponse();
    },
    handleReset() {
      this.$router.replace('/admin/timetabling/student')
      this.dataFilter = Object.assign({}, {
        ...initData,
      });
      this.handleDataFilter();
      this.fetchInputData()
      this.fetchTimetablingStudentStatus()
      this.fetchEvaluateStudentResponse();
    },
    checkPermission,
    async fetchInputData() {
      await this.$store.dispatch(INPUT_DATA_STUDENT, {
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    async fetchTimetablingStudentStatus() {
      await this.$store.dispatch(TIMETABLING_STUDENT_STATUS, {
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    openModalTimetablingStudentCompartment() {
      this.$root.$emit("bv::show::modal", 'timetabling-student');
    },
    closeModalTimetablingStudentCompartment() {
      this.$root.$emit("bv::hide::modal", 'timetabling-student');
    },
    async handleTimetablingStudent() {
      this.handleDataFilter()
      const res = await this.$store.dispatch(TIMETABLING_STUDENT, {
        dataset: this.dataFilter.dataset
      });
      if (res && res.status === 200) {
        clearTimeout(this.handleDelay)
        this.handleDelay = setTimeout(() => {
          this.$message({
            message: 'Đang phân công hướng dẫn',
            type: "success",
            showClose: true,
          });
          this.closeModalTimetablingStudentCompartment()
          this.fetchInputData()
          this.fetchTimetablingStudentStatus()
          this.fetchEvaluateStudentResponse()
        }, 1000)
      }
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    exportTimetablingStudent() {
      this.handleDataFilter()
      this.$store.dispatch(CREATE_FILE_TIMETABLING_STUDENT, {
        dataset: this.dataFilter.dataset
      });
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
</style>