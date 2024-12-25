<template>
  <b-button v-if="checkPermission(permission)" variant="light" @click="$emit('submit')" class="mr-2" style="max-width: 20rem;">
    <font-awesome-icon :icon="['fas','file']"/>
    <span>{{title}}</span>
  </b-button>
</template>
<script>
import { checkPermission } from "@/common/utils";
export default {
  name: 'ExportExcelButton',
  data() {
    return {}
  },
  props: {
    permission: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Xuất excel',
      required: false
    }
  },
  methods: {
    checkPermission(permission) {
      return checkPermission(permission)
    },
  }
}
</script>
<style>

</style>
