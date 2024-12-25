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
            <div class="label-form">Tên bộ dữ liệu</div>
            <b-input type="text" placeholder="Nhập tên bộ dữ liệu" v-model.trim="dataFilter.name"/>
          </b-col>

          <b-col md="6" style="margin-top: 30px">
            <b-button variant="primary" class="mr-2" @click="handleSearch" type="submit">
              <font-awesome-icon :icon="['fas', 'search']"/>
              Tìm kiếm
            </b-button>
            <b-button class="mr-2" variant="light" @click="handleReset">
              <font-awesome-icon :icon="['fas', 'eraser']"/>
              Xóa lọc
            </b-button>
          </b-col>
          <b-col md="2" class="text-right mt-30">
            <b-button
                v-if="checkPermission('dataset_create')"
                variant="primary"
                class="custom-btn-add-common"
                style="background: orange; border: none"
                @click="openModalCreateDatasetCompartment(null, false)"
            >
              <font-awesome-icon :icon="['fas','plus']"/>
              Thêm bộ dữ liệu
            </b-button>
          </b-col>
        </b-row>

        <b-table
            class="mt-3"
            :items="datasets.data"
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
          <template #cell(actions)="row" style="text-align: center">
            <div class="d-flex justify-content-center flex-wrap">
              <a
                  v-if="userInfo && userInfo.permissions.indexOf('dataset_update') !== -1"
                  href="javascript:void(0)"
                  class="m-1"
                  type="button"
                  title="Cập nhật thông tin bộ dữ liệu"
                  v-b-tooltip.hover
                  @click.prevent="openModalCreateDatasetCompartment(row.item, true)">
                <font-awesome-icon :icon="['fas', 'edit']"/>
              </a>
            </div>
          </template>
        </b-table>
        <b-row v-if="datasets.data && datasets.data.length === 0"
               class="justify-content-center">
          <span>Không tìm thấy bản ghi nào</span>
        </b-row>
      </template>
    </b-card>

    <b-modal
        id="update-dataset"
        :title="isUpdate ? 'Cập nhật thông tin bộ dữ liệu' : 'Thêm mới bộ dữ liệu'"
        :no-close-on-backdrop="true"
        size="lg"
        @hidden="closeModalCreateDatasetCompartment"
    >
      <b-row>
        <b-col md="12">
          <b-form-group>
            <label>Tên bộ dữ liệu<span class="text-danger">*</span>:</label>
            <b-form-input
                id="input-name"
                v-model="$v.currentData.name.$model"
                placeholder="Nhập tên bộ dữ liệu"
                trim
                :class="{ 'is-invalid': validationStatus($v.currentData.name) }"
            />
            <div v-if="!$v.currentData.name.required" class="invalid-feedback">
              Tên bộ dữ liệu không được để trống.
            </div>
          </b-form-group>
        </b-col>
        <b-col md="12">
          <b-form-group>
            <label>Mô tả:</label>
            <b-form-input
                id="input-description"
                v-model="currentData.description"
                placeholder="Nhập mô tả"
                trim
            />
          </b-form-group>
        </b-col>
      </b-row>
      <template #modal-footer>
        <b-button
            class="mr-2 btn-light2 pull-right"
            @click="closeModalCreateDatasetCompartment"
        >
          Hủy
        </b-button>
        <b-button
            variant="primary pull-right"
            @click.prevent="handleCreateDataset"
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
  CREATE_DATASET,
  FETCH_DATASETS,
  UPDATE_DATASET
} from "@/store/action.type"
import {mapGetters} from "vuex";
import {checkPermission} from "@/common/utils";
import baseMixins from "../components/mixins/base";
import router from '@/router';
import moment from 'moment-timezone';
import {required} from "vuelidate/lib/validators";

const initData = {
  id: null,
  name: null,
}

const initDataset = {
  id: null,
  name: null,
  description: null,
}

export default {
  name: "Datasets",
  components: {PageTitle, DatePicker},
  mixins: [baseMixins],
  data() {
    return {
      subheading: "Quản lý danh sách bộ dữ liệu.",
      icon: "pe-7s-portfolio icon-gradient bg-happy-itmeo",
      heading: "Danh sách bộ dữ liệu",
      loadingHeader: true,
      dataFilter: Object.assign({}, {
        ...initData,
      }),
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
        {key: "name", label: "Tên bộ dữ liệu", visible: true, thStyle: {width: '7%'}, thClass: 'align-middle'},
        {key: "description", label: "Mô tả", visible: true, thStyle: "width: 7%", thClass: 'align-middle'},
        {
          key: "actions",
          label: "Chức năng",
          visible: true,
          thStyle: "width: 6%",
          thClass: 'align-middle'
        }
      ],
      actionType: null,
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
      currentData: Object.assign({}, {...initDataset}),
      isUpdate: false,
    }
  },
  validations: {
    currentData: {
      name: {required},
    },
  },
  mounted() {
    this.handleDataFilter();
    const dataSearch = this.$route.query.dataSearch;

    if (dataSearch) {
      this.dataFilter = JSON.parse(String(dataSearch));
    }

    this.fetchDatasets();
  },
  watch: {},
  computed: {
    ...mapGetters(["datasets"]),
    visibleFields() {
      return this.fields.filter((field) => field.visible);
    },
    validation() {
    },
  },
  methods: {
    handleDataFilter() {
    },
    reload() {
      this.fetchDatasets();
    },
    checkPermission,
    async fetchDatasets() {
      let res = await this.$store.dispatch(FETCH_DATASETS, this.dataFilter)
      setTimeout(() => {
        if (this.loadingHeader) this.loadingHeader = !this.loadingHeader
      }, 200);
    },
    handleSearch(event) {
      event.preventDefault();
      this.handleDataFilter();
      router.push({path: '/admin/datasets', query: {dataSearch: JSON.stringify(this.dataFilter)}})
      this.fetchDatasets();
    },
    handleReset() {
      this.$router.replace('/admin/datasets')
      this.dataFilter = Object.assign({}, {
        ...initData,
      });
      this.handleDataFilter();
      this.fetchDatasets();
    },
    openModalCreateDatasetCompartment(dataset, isUpdate) {
      this.isUpdate = isUpdate

      if (isUpdate) {
        this.currentData = Object.assign({}, {
          ...dataset,
        });
      } else {
        this.currentData = Object.assign({}, {
          ...initDataset,
        });
      }
      this.$root.$emit("bv::show::modal", 'update-dataset');
    },
    closeModalCreateDatasetCompartment() {
      this.currentData = Object.assign({}, {...initDataset})
      this.$nextTick(() => {
        this.$v.currentData.$reset();
      });
      this.$root.$emit("bv::hide::modal", 'update-dataset')
    },
    validationStatus: function (validation) {
      return typeof validation != "undefined" ? validation.$error : false;
    },
    async handleCreateDataset() {
      this.$v.$reset();
      this.$v.$touch();

      if (this.$v.currentData.$invalid) return
      const payload = {
        id: this.isUpdate ? this.currentData.id : null,
        name: this.currentData.name,
        description: this.currentData.description,
      }

      if (this.isUpdate) {
        const res = await this.$store.dispatch(UPDATE_DATASET, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Cập nhật thông tin bộ dữ liệu thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateDatasetCompartment()
            this.fetchDatasets()
          }, 1000)
        }
      } else {
        const res = await this.$store.dispatch(CREATE_DATASET, payload)
        if (res && res.status === 200) {
          clearTimeout(this.handleDelay)
          this.handleDelay = setTimeout(() => {
            this.$message({
              message: 'Thêm mới bộ dữ liệu thành công',
              type: "success",
              showClose: true,
            });
            this.closeModalCreateDatasetCompartment()
            this.fetchDatasets()
          }, 1000)
        }
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