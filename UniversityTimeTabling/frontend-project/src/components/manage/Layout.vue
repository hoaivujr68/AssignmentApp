<template>
  <b-form @submit="$emit('search')" v-if="checkPermission(permission)">
    <div class="app-page-title">
      <div class="page-title-wrapper" :style="loadingHeader ? {'padding-top': '0.5rem', 'padding-bottom': '0.5rem'} : null">
        <template v-if="!loadingHeader">
          <div class="page-title-heading">
            <div>
              <h4>{{ heading }}</h4>
              <div class="page-title-subheading">{{subHeading}}</div>
            </div>
          </div>
          <div class="page-title-actions">
            <button
              v-if="showBtn" type="button"
              class="btn-shadow align-items-center mr-2 btn btn-add"
              style="background: orange; border: none; color: #FFFFFF"
              @click="toggle"
            >
              <font-awesome-icon :icon="['fas', 'plus']"/>
              {{ btnTitle }}
            </button>
          </div>
        </template>
        <template v-else>
          <a-skeleton active :paragraph="{ rows: 1 }" :title="{width: 200}"></a-skeleton>
        </template>
      </div>
    </div>
    <b-card class="main-card search-wrapper mb-20">
      <template v-if="loadingHeader">
        <a-skeleton active :paragraph="{ rows: 5 }"></a-skeleton>
      </template>
      <template v-else>
        <slot name="content"></slot>
      </template>
    </b-card>
  </b-form>
</template>

<script>
import PageTitle from "@/Layout/Components/PageTitle";
import { checkPermission } from "@/common/utils";

export default {
  name: "ManageLayout",
  props: {
    heading: {
      type: String,
      default: null
    },
    subHeading: {
      type: String,
      default: null
    },
    loadingHeader: {
      type: Boolean,
      default: true
    },
    permission: {
      type: String,
      default: null
    },
    btnTitle: {
      type: String,
      default: null
    },
    showBtn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    }
  },
  components: { PageTitle },
  mounted() {},
  beforeDestroy () {},
  methods: {
    checkPermission,
    toggle () {
      this.$emit('toggle')
    }
  },
}
</script>

<style scoped>
.multiselect--disabled {
  background: none !important
}
</style>
