<template>
  <div>
    <template v-if="isCustomPagination">
      <slot name="customPagination"></slot>
    </template>
    <template v-if="!isCustomPagination">
      <b-row style="margin-left: 0 !important;">
        <b-col class="pagination">
          <b-pagination
            :hide-goto-end-buttons="hideGoToEndBtn"
            v-model="getCurrentPage"
            :per-page="getCurrentPageSize"
            :total-rows="total"
            @change="changePage"
          ></b-pagination>
          <multiselect
            v-model="getSelectedPageSize"
            track-by="text"
            label="text"
            :show-labels="false"
            class="pageSize"
            placeholder="Chọn"
            @input="changePagination"
            @select="changePageSize"
            :options="PAGINATION_OPTIONS"
            :searchable="true"
            :allow-empty="false"
          >
            <template slot="singleLabel" slot-scope="{ option }">
              {{ option.text }} / trang
            </template>
          </multiselect>
        </b-col>
        <b-col v-if="from && to && total" class="mt-1">
          <span class="text-muted">
            {{ from }} đến {{ to }} trên {{ total }} bản ghi
          </span>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import { PAGINATION_OPTIONS } from "@/common/config";
export default {
  name: "TablePagination",
  data() {
    return {
      PAGINATION_OPTIONS,
      getCurrentPage: this.currentPage,
      getCurrentPageSize: this.currentPageSize,
      getSelectedPageSize: this.selectedPageSize,

    };
  },
  props: {
    isCustomPagination: {
      type: Boolean,
      default: false,
    },
    from: {
      type: Number,
      default: 0,
    },
    to: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    selectedPageSize: {
      type: Object,
      default: null,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    currentPageSize: {
      type: Number,
      default: 20
    },
    hideGoToEndBtn: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    changePagination(event) {
      this.$emit('changePagination', event)
    },
    changePage(event) {
      this.$emit('changePage', event)
    },
    changePageSize(event) {
      this.$emit('changePageSize', event)
    },
  },
  watch: {
    currentPage (newValue) {
      this.getCurrentPage = newValue
    },
    currentPageSize (newValue) {
      this.getCurrentPageSize = newValue
    },
    selectedPageSize (newValue) {
      this.getSelectedPageSize = newValue
    }
  }
};
</script>

<style scoped>

</style>
