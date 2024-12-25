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
                           placeholder="Chọn" :options="optionsDataset" :searchable="true"
                           @select="changeDataset">
                <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
              </multiselect>
            </b-col>
            <b-col md="2">
              <div class="label-form">Giảng viên</div>
              <multiselect v-model="selectedTeacher" track-by="text" label="text" :show-labels="false"
                           placeholder="Chọn" :options="optionsTeacher" :searchable="true"
                           :disabled="!selectedDataset || !selectedDataset.value">
                <template slot="singleLabel" slot-scope="{ option }">{{ option.text }}</template>
              </multiselect>
            </b-col>
            <b-col md="2" style="margin-top: 30px">
              <b-button variant="primary" class="mr-2" @click="handleSearch" type="submit">
                <font-awesome-icon :icon="['fas', 'search']"/>
                Tìm kiếm
              </b-button>
            </b-col>
            <b-button variant="primary" class="mr-2 custom-btn-add-common" @click="exportTimetablingTeacherResult"
                      style="border: none">
              <font-awesome-icon :icon="['fas','file-excel']"/>
              Xuất thời khóa biểu của GV
            </b-button>
          </b-row>

          <b-table
              class="mt-3"
              :items="timetablingResponse.data"
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
          </b-table>
          <b-row v-if="timetablingResponse.data && timetablingResponse.data.length === 0"
                 class="justify-content-center">
            <span>Không tìm thấy thông tin</span>
          </b-row>
        </template>
      </b-card>
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
  CREATE_FILE_TIMETABLING_TEACHER, CREATE_FILE_TIMETABLING_TEACHER_RESULT, FETCH_TIMETABLING_RESPONSE
} from "@/store/action.type";

const initData = {
  teacherId: null,
  dataset: null
}

export default {
  name: "TimetablingTeacherResult",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      subheading: "Thời khóa biểu của giảng viên sau phân công.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Kết quả phân công giảng dạy",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
      selectedDataset: {value: null, text: 'Tất cả'},
      optionsDataset: [],
      selectedTeacher: {value: null, text: 'Tất cả'},
      optionsTeacher: [],
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
      fields: [
        {
          key: "key",
          label: "STT",
          tdClass: 'align-middle',
          thClass: 'align-middle',
          visible: true,
          thStyle: {width: '3%'}
        },
        {key: "dayOfWeek", label: "Thứ trong tuần", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "timeTeaching", label: "Thời gian", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "className", label: "Lớp học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "classCode", label: "Mã lớp học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "room", label: "Phòng học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "week", label: "Tuần học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "program", label: "Chương trình học", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {key: "languageName", label: "Ngôn ngữ", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
      ],
    }
  },
  watch: {},
  validations: {},
  mounted() {
    this.fetchAllDatasets();
    this.fetchAllTeachers();
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));
      this.selectedDataset = this.optionsDataset.filter(
          (i) => i.value === this.dataFilter.dataset
      )[0];
      this.selectedTeacher = this.optionsTeacher.filter(
          (i) => i.value === this.dataFilter.teacherId
      )[0];
    }
    this.handleDataFilter();
    this.fetchTimetablingResponse();
  },
  computed: {
    ...mapGetters(["timetablingResponse"]),
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
    validation() {
    },
  },
  methods: {
    changeDataset(item) {
      this.selectedDataset = item
      this.selectedTeacher = { value: null, text: "Tất cả" };
      this.handleDataFilter();
      this.fetchAllTeachers();
    },
    async fetchAllTeachers() {
      let params = this.selectedDataset != null && this.selectedDataset.value != null ? '?dataset=' + this.selectedDataset.value : ''
      let response = await this.get('/teacher/all' + params);

      if (response && response.data) {
        this.optionsTeacher = this.formatOptionsTeacher(response.data.data);
      }
    },
    formatOptionsTeacher(teachers) {
      if (!teachers) return [];
      const result = teachers.map((item) => {
        return {text: item.fullName, value: item.id}
      });

      return [{value: null, text: 'Tất cả'}, ...result];
    },
    handleDataFilter() {
      this.dataFilter.dataset = this.selectedDataset == null ? null : this.selectedDataset.value;
      this.dataFilter.teacherId = this.selectedTeacher == null ? null : this.selectedTeacher.value;
    },
    reload() {
      this.handleDataFilter();
      this.fetchTimetablingResponse();
    },
    async fetchTimetablingResponse() {
      await this.$store.dispatch(FETCH_TIMETABLING_RESPONSE, {
        dataset: this.dataFilter.dataset,
        teacherId: this.dataFilter.teacherId
      });
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({
        path: '/admin/timetabling/teacher/result',
        query: {dataSearch: JSON.stringify(this.dataFilter)}
      })
      this.fetchTimetablingResponse();
    },
    handleReset() {
      this.$router.replace('/admin/timetabling/teacher/result')
      this.dataFilter = Object.assign({}, {
        ...initData,
      });
      this.handleDataFilter();
      this.fetchTimetablingResponse();
    },
    checkPermission,
    exportTimetablingTeacherResult() {
      this.handleDataFilter()
      this.$store.dispatch(CREATE_FILE_TIMETABLING_TEACHER_RESULT, {
        dataset: this.dataFilter.dataset,
        teacherId: this.dataFilter.teacherId
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