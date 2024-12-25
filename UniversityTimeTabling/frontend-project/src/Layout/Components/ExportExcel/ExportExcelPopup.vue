<template>
  <b-toast id="export-toast" variant="success" solid :auto-hide-delay="30000">
    <template #toast-title>
      <div class="d-flex flex-grow-1 align-items-baseline">
        <b-img
          blank
          blank-color="#67C23A"
          class="mr-2"
          width="12"
          height="12"
        ></b-img>
        <strong class="mr-auto">Thông báo</strong>
      </div>
    </template>
    Chúng tôi đang tạo file báo cáo, điều này có thể mất vài phút, mã file:
    <div>
      <router-link
        :to="{ path: '/admin/file', query: { id: getCurrentFileId } }"
        class="waves-effect waves-classic font-weight-400"
        style="margin-right: 10px"
        target="_blank"
      >
        <i class="icon md-plus" aria-hidden="true"></i>
        {{ getCurrentFileId }}
      </router-link>
    </div>
  </b-toast>
</template>

<script>
export default {
  name: 'ExportExcelPopup',
  props: {
    currentFileId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
    }
  },
  computed: {
    getCurrentFileId() {
      return this.currentFileId
    }
  }
};
</script>

<style scoped>

</style>
