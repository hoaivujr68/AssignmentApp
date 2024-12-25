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
          <b-row v-if="this.dataFilter.dataset != null && !timetablingTeacherStatus">
            <b-col md="4"><h4>Bắt đầu phân công</h4></b-col>
            <b-col md="8" style="font-weight: 500">
              <b-button
                  variant="primary"
                  class="custom-btn-add-common"
                  style="background: orange; border: none"
                  @click="openModalTimetablingTeacherCompartment"
              >
                Phân công
              </b-button>
            </b-col>
          </b-row>
          <b-row
              v-if="this.dataFilter.dataset != null && timetablingTeacherStatus && timetablingTeacherStatus.status === 'PROCESSING'">
            <b-col md="12"><h6>Hệ thống đang thực hiện phân công giảng dạy</h6></b-col>
          </b-row>
          <b-row
              v-if="this.dataFilter.dataset != null && timetablingTeacherStatus && timetablingTeacherStatus.status === 'FAILED'">
            <b-col md="12"><h6>Hệ thống thực hiện phân công giảng dạy thất bại</h6></b-col>
          </b-row>
          <b-row
              v-if="this.dataFilter.dataset != null && timetablingTeacherStatus && timetablingTeacherStatus.status === 'SUCCESS'">
            <b-col md="10"><h6>Hệ thống đã thực hiện phân công giảng dạy xong</h6></b-col>
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="exportTimetablingTeacher"
                      style="border: none">
              <font-awesome-icon :icon="['fas','file-excel']"/>
              Xuất dữ liệu phân công
            </b-button>
          </b-row>
        </template>
      </b-card>

      <b-card class="main-card search-wrapper mb-20"
              v-if="this.dataFilter.dataset != null && timetablingTeacherStatus && timetablingTeacherStatus.status === 'SUCCESS'"
              style="margin-top: 15px">
        <template v-if="loadingHeader">
          <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
        </template>
        <template v-else>
          <b-col md="12"><h6>Đánh giá kết quả sau phân công</h6></b-col>
          <b-table
              class="mt-3"
              :items="evaluateResponse.data"
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
          <b-row v-if="evaluateResponse.data && evaluateResponse.data.length === 0"
                 class="justify-content-center">
            <span>Không tìm thấy thông tin</span>
          </b-row>
        </template>
      </b-card>

      <b-modal
          id="timetabling-teacher"
          :title="'Phân công giảng dạy'"
          :no-close-on-backdrop="true"
          size="lg"
          @hidden="closeModalTimetablingTeacherCompartment"
      >
        <b-row>
          <b-col md="12">
            <h6>Bạn có chắc chắn muốn thực hiện phân công giảng dạy {{ inputData == null ? 0 : inputData.numOfClasses }}
              lớp học cho
              {{ inputData == null ? 0 : inputData.numOfTeachers }} giảng viên?</h6>
          </b-col>
        </b-row>
        <template #modal-footer>
          <b-button
              class="mr-2 btn-light2 pull-right"
              @click="closeModalTimetablingTeacherCompartment"
          >
            Hủy
          </b-button>
          <b-button
              variant="primary pull-right"
              @click.prevent="handleTimetablingTeacher"
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
import {checkPermission} from "@/common/utils";
import baseMixins from "../components/mixins/base";
import router from '@/router';
import {
  TIMETABLING_TEACHER,
  INPUT_DATA,
  TIMETABLING_TEACHER_STATUS,
  FETCH_EVALUATE_RESPONSE, CREATE_FILE_TIMETABLING_STUDENT, CREATE_FILE_TIMETABLING_TEACHER
} from "@/store/action.type";

const initData = {
  dataset: null
}

export default {
  name: "TimetablingTeacher",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      subheading: "Phân bổ các lớp cho giảng viên thỏa mãn các ràng buộc.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Phân công giảng dạy",
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
        {key: "key", label: "Tiêu chí", visible: true, thStyle: "width: 60%", thClass: 'align-middle'},
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
    this.fetchTimetablingTeacherStatus();
    this.fetchEvaluateResponse();
  },
  computed: {
    ...mapGetters(["inputData", "timetablingTeacherStatus", "evaluateResponse"]),
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
      this.fetchTimetablingTeacherStatus()
      this.fetchEvaluateResponse();
    },
    async fetchEvaluateResponse() {
      await this.$store.dispatch(FETCH_EVALUATE_RESPONSE, {
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({
        path: '/admin/timetabling/teacher',
        query: {dataSearch: JSON.stringify(this.dataFilter)}
      })
      this.fetchInputData()
      this.fetchTimetablingTeacherStatus()
      this.fetchEvaluateResponse();
    },
    handleReset() {
      this.$router.replace('/admin/timetabling/teacher')
      this.dataFilter = Object.assign({}, {
        ...initData,
      });
      this.handleDataFilter();
      this.fetchInputData()
      this.fetchTimetablingTeacherStatus()
      this.fetchEvaluateResponse();
    },
    checkPermission,
    async fetchInputData() {
      await this.$store.dispatch(INPUT_DATA, {
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    async fetchTimetablingTeacherStatus() {
      await this.$store.dispatch(TIMETABLING_TEACHER_STATUS, {
        dataset: this.dataFilter.dataset
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    openModalTimetablingTeacherCompartment() {
      this.$root.$emit("bv::show::modal", 'timetabling-teacher');
    },
    closeModalTimetablingTeacherCompartment() {
      this.$root.$emit("bv::hide::modal", 'timetabling-teacher');
    },
    async handleTimetablingTeacher() {
      const res = await this.$store.dispatch(TIMETABLING_TEACHER, {
        dataset: this.dataFilter.dataset
      });
      if (res && res.status === 200) {
        clearTimeout(this.handleDelay)
        this.handleDelay = setTimeout(() => {
          this.$message({
            message: 'Đang phân công giảng dạy',
            type: "success",
            showClose: true,
          });
          this.closeModalTimetablingTeacherCompartment()
          this.fetchInputData()
          this.fetchTimetablingTeacherStatus()
          this.fetchEvaluateResponse()
        }, 1000)
      }
    },
    exportTimetablingTeacher() {
      this.handleDataFilter()
      this.$store.dispatch(CREATE_FILE_TIMETABLING_TEACHER, {
        dataset: this.dataFilter.dataset
      });
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
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