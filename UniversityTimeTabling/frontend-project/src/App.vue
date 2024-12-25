<template>
  <div id="app">
    <div>
      <component :is="layout">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </component>
    </div>
  </div>
</template>

<script>
const userpages_layout = "userpages";
const default_layout = "default";
const default_cs_layout = "cs";

export default {
  name: "App",
  computed: {
    layout() {
      return ((this.$route.meta.layout) ? (this.$route.meta.layout) : userpages_layout) + "-layout" ;
    }
  },
};
</script>

<style>
#app {
  font-family: Roboto, Inter var, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, Noto Sans, sans-serif,
  Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  line-height: 1.5;
  font-weight: 400;
  color: #212121 !important;
  font-size: 14px;
}

.modal-backdrop {
  opacity: 0.5;
}
</style>

<style lang="scss">
@import "assets/base.scss";
</style>
