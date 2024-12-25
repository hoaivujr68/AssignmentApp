<template>
  <div class="app-header header-shadow">
    <div class="logo-src" />
    <div class="app-header__content">
      <div class="app-header-left">
        <!-- <SearchBox /> -->
      </div>
      <div class="app-header-right">
        <UserArea />
      </div>
    </div>
    <div class="app-header__mobile-menu">
      <div class="hamburger-wrapper">
        <button
          type="button"
          class="hamburger close-sidebar-btn hamburger--elastic"
          v-bind:class="{ 'is-active': isOpen }"
          @click="toggleMobile('closed-sidebar-open')"
        >
          <span class="hamburger-box">
            <span class="hamburger-inner"></span>
          </span>
        </button>
      </div>
    </div>
    <div id="appHeaderUser" class="app-header__user">
      <UserArea />
    </div>
    <!-- <div class="app-header__menu">
      <span>
        <b-button
          class="btn-icon btn-icon-only"
          variant="primary"
          size="sm"
          v-bind:class="{ active: isOpenMobileMenu }"
          @click="toggleMobile2('header-menu-open')"
        >
          <div class="btn-icon-wrapper">
            <font-awesome-icon icon="ellipsis-v" />
          </div>
        </b-button>
      </span>
    </div> -->
  </div>
</template>

<script>
import SearchBox from "./Header/SearchBox";
import UserArea from "./Header/HeaderUserArea";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faEllipsisV);
export default {
  name: "Header",
  components: {
    SearchBox,
    UserArea,
    "font-awesome-icon": FontAwesomeIcon,
  },

  data() {
    return {
      isOpen: false,
      isOpenMobileMenu: false,
    };
  },
  props: {},
  methods: {
    toggleMobile(className) {
      const el = document.body;
      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
    },

    toggleMobile2(className) {
      const el = document.body;
      this.isOpenMobileMenu = !this.isOpenMobileMenu;

      if (this.isOpenMobileMenu) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.hamburger-wrapper {
  padding: 0.5rem;
  color: #fff;
  border-radius: 0.25rem;
  background-color: #01904a;
  border: none;
  &:hover {
    background: #016a36;
  }
}
.app-header {
  background-color: #f8f9fa !important;
  box-shadow: none !important;

  .app-header-right {
    padding-right: 1rem !important;
  }
}
</style>
<style lang="scss">
#appHeaderUser.app-header__user {
  display: none;
  order: 3;
  padding: 0 1.5rem;
  height: 60px;
  align-items: center;

  .dropdown-menu {
    right: 1.5rem !important;
    left: auto !important;
    top: 7rem !important;
    width: 15rem !important;
    transform: translateY(-50%) !important;
    min-width: 10px !important;
}
}
@media (max-width: 991.98px) {
  #appHeaderUser.app-header__user {
    display: flex !important;
  }
}
</style>
