<template>
  <b-form @submit="handleSearch">
    <page-title :heading=heading :subheading=subheading :icon=icon :loading="loadingHeader"></page-title>
    <b-card class="main-card mb-4">
      <template v-if="loadingHeader">
        <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
      </template>
      <template v-else>
      <div class="mb-3">
        <b-row>
          <b-col md="2">
            <div class="label-form">Người tác động</div>
            <b-input type="text" placeholder="Nhập người tác động" v-model.trim="dataFilter.username"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Hành động</div>
            <b-input type="text" placeholder="Nhập hành động" v-model.trim="dataFilter.action"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Địa chỉ IP</div>
            <b-input type="text" placeholder="Nhập địa chỉ IP" v-model.trim="dataFilter.ipAddress"/>
          </b-col>
          <b-col md="2">
            <div class="label-form">Thời gian tạo từ</div>
            <date-picker
              :disabled-date="(date) => date >= new Date()"
              input-error
              class="w-100"
              input-class="form-control"
              v-model.trim="fromDate"
              format="DD/MM/YYYY"
              placeholder="Chọn"
            />
          </b-col>
          <b-col md="2">
            <div class="label-form">Thời gian tạo đến</div>
            <date-picker
              :disabled-date="(date) => date >= new Date()"
              input-error
              class="w-100"
              input-class="form-control"
              v-model.trim="toDate"
              format="DD/MM/YYYY"
              placeholder="Chọn"
            />
          </b-col>
          <b-col md="4" >
            <b-button variant="primary" @click="handleSearch" class="custom-btn-common mr-2" type="submit">
              <font-awesome-icon :icon="['fas','search']"/>
              Tìm kiếm
            </b-button>
            <b-button variant="light" @click="handleReset" class="custom-btn-common">
              <font-awesome-icon :icon="['fas','eraser']"/>
              Xóa lọc
            </b-button>
          </b-col>
        </b-row>
      </div>
      <b-table
        :items="adminLogs"
        :fields="fields"
        :bordered="bordered"
        :hover="hover"
        :fixed="fixed"
      >
      </b-table>
      <b-row v-if="totalLogs > 0">
        <b-col class="pagination">
          <b-pagination
            v-model="dataFilter.page"
            :per-page="dataFilter.pageSize"
            :total-rows="totalLogs"
            @change="changePage"
          >
          </b-pagination>
          <multiselect v-model="selectedPageSize" track-by="text" label="text" :show-labels="false"
                       class="pageSize"
                       placeholder="Chọn"
                       @input="changePagination"
                       :options="PAGINATION_OPTIONS" :searchable="true" :allow-empty="false" @select="changePageSize">
            <template slot="singleLabel" slot-scope="{ option }">{{ option.text }} / trang</template>
          </multiselect>
        </b-col>
        <b-col class="mt-1">
          <span class="text-muted">
            {{ fromPage }} đến {{ toPage }} trên {{ totalLogs }} bản ghi
          </span>
        </b-col>
      </b-row>

      <b-row v-else class="justify-content-center">
        <span>Không tìm thấy bản ghi nào</span>
      </b-row>
      </template>
    </b-card>
  </b-form>
</template>

<script>
import PageTitle from "../Layout/Components/PageTitle";
import {formatDateTime, formatTime} from "../common/utils";
import baseMixins from "../components/mixins/base";
import {mapGetters} from "vuex";
import DatePicker from 'vue2-datepicker';
import "vue2-datepicker/index.css";
import 'vue2-datepicker/locale/vi';
import {PAGINATION_OPTIONS} from "../common/config";
import router from '@/router';
import moment from 'moment-timezone';

const initDataFilter = {
  page: 1,
  pageSize: 20,
  username: "",
  action: null,
  ipAddress: null,
  fromDate: null,
  toDate: null,
}

export default {
  name: "AdminUserLog",
  components: {
    PageTitle,
    DatePicker
  },
  mixins: [baseMixins],
  data() {
    return {
      PAGINATION_OPTIONS,
      selectedPageSize: { text: initDataFilter.pageSize },
      subheading: "Theo dõi log người dùng của hệ thống",
      icon: "pe-7s-id icon-gradient bg-happy-itmeo",
      heading: "Log",
      bordered: true,
      hover: true,
      fixed: true,
      fields: [
        {key: "action", label: "Hành động"},
        {
          key: "createdAt",
          label: "Thời gian",
          formatter: (value, key, item) => {
            let createdAt = new Date(value);
            return formatDateTime(createdAt);
          }
        },
        {key: "userName", label: "Người tác động"},
        {key: "ipAddress", label: "IP"},
        {key: "data", label: "Data"},
      ],
      datePickerConfig: {
        placeholder: 'Chọn',
        inputClass: 'form-control'
      },
      currentPage: 1,
      pageSize: 20,
      dataFilter: Object.assign({}, initDataFilter),
      fromDate: null,
      toDate: null,
      loadingHeader: true
    }
  },
  methods: {
    changePagination(e) {
      this.dataFilter.pageSize = e.text;
    },
    changePage(e) {
      this.dataFilter.page = e
      const dataSearch = this.$route.query.dataSearch;
      if ((dataSearch && dataSearch !== JSON.stringify(this.dataFilter)) || !dataSearch) {
        router.push({ path: '/admin/log', query: { dataSearch: JSON.stringify(this.dataFilter) }})
      }

      this.fetchAdminLogs();
      this.fetchTotalLogs();
    },
    changePageSize(e) {
      if(e) this.dataFilter.pageSize = e.text
      this.dataFilter.page = 1
      const dataSearch = this.$route.query.dataSearch;
      if ((dataSearch && dataSearch !== JSON.stringify(this.dataFilter)) || !dataSearch) {
        router.push({ path: '/admin/log', query: { dataSearch: JSON.stringify(this.dataFilter) }})
      }

      this.fetchAdminLogs();
      this.fetchTotalLogs();
    },
    async fetchAdminLogs() {
      let response = await this.post("/admin/user/log/list", this.dataFilter);
      if(response) {
        setTimeout(() => {
          if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
        }, 200)
      }
      if (response && response.data && response.data) {
        this.$store.commit("setAdminLogs", response.data);
      }
    },
    async fetchTotalLogs() {
      let response = await this.post("/admin/user/log/count", this.dataFilter);
      if (response && response.data >= 0) {
        this.$store.commit("setTotalLogs", response.data);
      }
    },
    handleSearch(event) {
      event.preventDefault();
      this.dataFilter.toDate = this.toDate && formatTime(this.toDate, 'END')
      this.dataFilter.fromDate = this.fromDate && formatTime(this.fromDate, 'START')
      this.dataFilter.page = 1;
      this.dataFilter.action = this.dataFilter.action !== '' ? this.dataFilter.action : null;
      router.push({ path: '/admin/log', query: { dataSearch: JSON.stringify(this.dataFilter) }})
      this.fetchAdminLogs();
      this.fetchTotalLogs();
    },
    handleReset() {
      this.$router.replace('/admin/log')
      this.dataFilter = Object.assign({}, {
        ...initDataFilter,
        pageSize: this.dataFilter.pageSize
      });
      this.toDate = null;
      this.fromDate = null;
      this.fetchAdminLogs();
      this.fetchTotalLogs();
    }
  },
  computed: {
    ...mapGetters(["adminLogs", "totalLogs"]),
    getTotalLogPage() {
      return Math.ceil(this.totalLogs / this.pageSize);
    },
    fromPage() {
      return (this.dataFilter.page - 1) * this.dataFilter.pageSize + 1
    },
    toPage() {
      return this.dataFilter.page * this.dataFilter.pageSize >= this.totalLogs
        ? this.totalLogs
        : this.dataFilter.page * this.dataFilter.pageSize
    }
  },
  watch: {
  },
  mounted() {
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));

      this.fromDate = this.dataFilter.fromDate && new Date(this.dataFilter.fromDate);
      this.toDate = this.dataFilter.toDate && new Date(moment(this.dataFilter.toDate).subtract(1, 'day'));
    }

    this.fetchTotalLogs();
    this.fetchAdminLogs();
  }
}
</script>
<style scoped lang="scss">
@import "../style/admin.scss";
</style>
