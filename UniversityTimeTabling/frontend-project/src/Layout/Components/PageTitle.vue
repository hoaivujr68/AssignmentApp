<template>
  <div class="app-page-title">
    <div class="page-title-wrapper" :style="loading ? {'padding-top': '0.5rem', 'padding-bottom': '0.5rem'} : null">
      <template v-if="!loading">
      <div class="page-title-heading">
        <div>
          <h4>{{ heading }}</h4>
          <div class="page-title-subheading">{{subheading}}</div>
        </div>
      </div>
      <div class="page-title-actions">

        <button
          v-if="btnTitle" type="button"
          class="btn-shadow align-items-center mr-2 btn btn-add"
          style="background: orange; border: none; color: #FFFFFF"
          @click="handlerClick($event.target)"
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
</template>

<script>

export default {
  name: "PageTitle",
  components: {},
  props: {
    icon: String,
    heading: String,
    subheading: String,
    btnTitle: String,
    modalId: String,
    loading: {
      default: false,
      type: Boolean
    },
    isCustomAction: Boolean,
    customActionName: String
  },
  methods: {
    handlerClick(button) {
      if (this.modalId && this.modalId !== '') this.$root.$emit('bv::show::modal', this.modalId, button);

      if (this.isCustomAction && this.customActionName) this.$emit(this.customActionName)
    }
  }
};
</script>
