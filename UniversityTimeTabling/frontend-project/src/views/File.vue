<template>
  <b-form @submit="handleSearch">
    <page-title heading="File xuất dữ liệu" :loading="loadingHeader"></page-title>
    <b-card class="main-card search-wrapper mb-20">
      <template v-if="loadingHeader">
        <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
      </template>
      <template v-else>
      <b-row class="mb-3">
        <b-col md="2">
          <div class="label-form">Mã file</div>
          <b-input
            type="text"
            placeholder="Mã file"
            v-model.trim="dataFilter.id"
          />
        </b-col>
        <b-col md="2" style="margin-top: 30px">
          <b-button
            variant="primary"
            class="mr-2"
            @click="handleSearch"
            type="submit"
          >
            <font-awesome-icon :icon="['fas', 'search']" />
            Tìm kiếm
          </b-button>
        </b-col>
      </b-row>
      <table class="table b-table table-hover table-bordered b-table-fixed">
        <thead>
          <tr>
            <th style="width: 4%">
              <div class="text-center">STT</div>
            </th>
            <th style="width: 12%">
              <div>Mã file</div>
            </th>
            <th>
              <div>Tên file</div>
            </th>
            <th>
              <div>Mô tả</div>
            </th>
            <th style="width: 9%">
              <div>Trạng thái</div>
            </th>
            <th style="width: 15%">
              <div>Ngày tạo</div>
            </th>
            <th style="width: 8%">
              <div>Hành động</div>
            </th>
          </tr>
        </thead>
        <tbody v-if="totalFile > 0">
          <tr v-for="(file, i) in files" :key="i" style="height: 46px">
            <td class="text-center">
              {{ i + 1 }}
            </td>
            <td>
              {{ file.id }}
            </td>
            <td>
              {{ file.fileName + ".zip" }}
            </td>
            <td>
              {{ file.description }}
            </td>
            <td>
              <b-badge
                class="mr-2 badge-active"
                v-if="file.status === 'completed'"
              >
                Hoàn thành
              </b-badge>
              <b-badge
                class="mr-2 badge-init"
                v-else-if="file.status === 'processing'"
              >
                Đang xử lý
              </b-badge>
              <b-badge class="mr-2 badge-inactive" v-else> Thất bại </b-badge>
            </td>
            <td>
              {{ file.createdAt | formatDateTime }}
            </td>
            <td>
              <b-button
                v-if="file.status === 'completed'"
                size="lg"
                variant="primary"
                class="mb-2"
                title="Tải xuống"
                v-b-tooltip.hover
                @click="downloadFile(file)"
              >
                <b-icon icon="cloud-download" aria-label="Help"></b-icon>
              </b-button>
              <a
                style="font-size: 22px; margin-left: 10px"
                href="javascript:void(0)"
                class="mr-2"
                type="button"
                title="Xóa"
                v-b-tooltip.hover
                @click.prevent="openModalDeleteFile(file)"
              >
                <font-awesome-icon
                  class="color-inactive"
                  :icon="['fas', 'trash']"
                />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <b-row v-if="totalFile > 0">
        <b-col class="pagination">
          <b-pagination
            v-model="dataFilter.page"
            :per-page="dataFilter.pageSize"
            :total-rows="totalFile"
          ></b-pagination>
        </b-col>
        <b-col class="mt-1">
          <span class="text-muted">
            {{ fromPage }} đến {{ toPage }} trên {{ totalFile }} bản ghi
          </span>
        </b-col>
      </b-row>
      <b-row
        v-if="totalFile == 0"
        style="margin: 20px 0; justify-content: center"
      >
        <span>Không tìm thấy bản ghi nào</span>
      </b-row>
        <b-modal
          id="delete-file"
          title="Xóa file"
          :no-close-on-backdrop="true"
          @hidden="handleResetDelete"
        >
          <p class="my-4">Bạn có chắc chắn muốn xóa file <span class="font-weight-bold">{{ currentData && currentData.fileName }}</span> không ?</p>
          <template #modal-footer>
            <b-button
              class="mr-2 btn-light2 pull-right"
              @click="handleResetDelete"
            >
              Hủy
            </b-button>
            <b-button
              variant="primary pull-right"
              @click.prevent="deleteFile"
            >
              Đồng ý
            </b-button>
          </template>
        </b-modal>
      </template>
    </b-card>
  </b-form>
</template>

<script>
import baseMixins from "../components/mixins/base";
import { mapGetters } from "vuex";
import PageTitle from "../Layout/Components/PageTitle";
import { DOWNLOAD_FILE_EXPORT } from "@/store/action.type";
import { SUCCESS } from '@/common/config';
import { Message } from 'element-ui';
import JSONbig from 'json-bigint';

export default {
  name: "File",
  components: {
    PageTitle,
  },
  mixins: [baseMixins],
  data() {
    var filters = {
      id: this.$route.query.id ? this.$route.query.id : null,
      page: this.$route.query.page ? this.$route.query.page : 1,
      pageSize: this.$route.query.pageSize
        ? parseInt(this.$route.query.pageSize)
        : 20,
    };
    return {
      dataFilter: filters,
      loadingModal: false,
      loadingHeader: true,
      currentData: null
    };
  },
  watch: {
    $route(to, from) {
      this.dataFilter.page = to.query.page ? to.query.page : 1;
      this.fetchFileExport();
    },
    "dataFilter.page": function () {
      this.routerPush();
    },
    "dataFilter.pageSize": function () {
      this.dataFilter.page = 1;
      this.routerPush();
    },
  },
  mounted() {
    this.fetchFileExport();
  },
  computed: {
    ...mapGetters(["files", "totalFile"]),
    fromPage() {
      return (this.dataFilter.page - 1) * this.dataFilter.pageSize + 1
    },
    toPage() {
      return this.dataFilter.page * this.dataFilter.pageSize >= this.totalFile
        ? this.totalFile
        : this.dataFilter.page * this.dataFilter.pageSize
    }
  },
  methods: {
    async deleteFile() {
      let res = await this.post('/file/delete', {
        id: this.currentData.id
      });
      if (res && res.status !== 200) {
        return;
      }

      this.$message({
        message: "Xoá file thành công",
        type: "success",
        showClose: true,
      });

      this.$root.$emit("bv::hide::modal", "delete-file");
      await this.fetchFileExport();
    },
    handleResetDelete() {
      this.$root.$emit("bv::hide::modal", "delete-file");
    },
    openModalDeleteFile(data) {
      this.currentData = Object.assign({}, data);
      this.$root.$emit("bv::show::modal", "delete-file");
    },
    async fetchFileExport() {
      let response = await this.query("/file", this.dataFilter);

      if (response) {
        setTimeout(() => {
          if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
        }, 200)
      }

      if (response && response.data) {
        this.$store.commit("setFiles", response.data.data);
        this.$store.commit("setTotalFiles", response.data.total);
      } else {
        this.$store.commit("setTotalFiles", 0);
      }
    },
    downloadFile(file) {
      this.$store.dispatch(DOWNLOAD_FILE_EXPORT, {
        id: JSONbig.stringify(file.id),
        file_name: file.fileName + ".zip",
      });
    },
    handleSearch(event) {
      event.preventDefault();
      this.dataFilter.page = 1;
      this.fetchFileExport();
    },
    routerPush() {
      var query = {};
      if (this.dataFilter.id) {
        query.id = this.dataFilter.id;
      }
      if (this.dataFilter.page) {
        query.page = this.dataFilter.page;
      }
      if (this.dataFilter.limit) {
        query.limit = this.dataFilter.limit;
      }
      this.$router.push({ path: this.$route.path, query: query });
    },
    changePagination(e) {
      this.dataFilter.pageSize = e.text;
    },
  },
};
</script>

<style>
</style>
