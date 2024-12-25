<template>
  <div id="sidebarV2">
    <a-menu mode="inline" :selected-keys="selectedKeys" @openChange="onOpenChange" :open-keys="openKeys" @select="onSelect">
      <a-sub-menu v-if="item.child" v-for="item in menu" :key="item.title">
        <span slot="title">
          <div class="d-flex align-item-center" style="width: 2rem">
            <div class="sidebar-icon-wrapper"><i :class='item.icon' /></div>
            <div class="ml-2 custom-title">{{item.title}}</div>
          </div>
        </span>

        <a-menu-item v-for="child in item.child" :key="child.href" @click="clickItem(child.href)">
          {{ child.title }}
        </a-menu-item>
      </a-sub-menu>

      <a-menu-item v-else :key="item.href" @click="clickItem(item.href)">
        {{ item.title }}
      </a-menu-item>
    </a-menu>
  </div>
</template>
<script>
import router from "@/router";
export default {
  data() {
    return {
      openKeys: [],
      selectedKeys: [],
      currentRoute: ''
    };
  },
  props: {
    menu: {
      type: Array,
      default: []
    },
    isCollapse: Boolean
  },
  methods: {
    onOpenChange(openKeys) {
      let latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
      if (this.openKeys.indexOf(latestOpenKey) === -1 && latestOpenKey) {
        this.openKeys = [latestOpenKey]
      }
      else {
        this.openKeys = []
      }
    },
    clickItem(href) {
      router.push(href)
    },
    onSelect({item, key, selectedKeys }) {
      this.selectedKeys = selectedKeys
    },
    addSelectedMenu(path) {
      this.currentRoute = path
      this.selectedKeys = [this.currentRoute]
      let openKeys = this.menu.find(item => item.child && item.child.indexOf(item.child.find(child => child.href === this.currentRoute)) > -1)
      this.openKeys = openKeys && openKeys.title ? [openKeys.title] : []
    }
  },
  mounted () {
    if (this.$router.path !== '/') this.addSelectedMenu(this.$route.path)
  },
  watch: {
    $route (to, from){
      this.addSelectedMenu(to.path)
    },
  }
};
</script>
<style lang="scss" scoped>
.closed-sidebar, .closed-sidebar-md {
  #sidebarV2 .custom-title {
    display: none !important
  }
}
.closed-sidebar-open {
  #sidebarV2 .custom-title {
    display: inline-block !important
  }
}
</style>
<style lang="scss">
.ant-menu-submenu-title {
  text-overflow: unset !important;
}
.sidebar-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff !important;
  background-color: #344767;
  box-shadow: 0 .25rem .375rem -.0625rem rgba(20,20,20,.12),0 .125rem .25rem -.0625rem rgba(20,20,20,.07);
  border: 0 solid rgba(0,0,0,.125) !important;
  border-radius: 0.4rem !important;
  height: 2rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
  padding: 0 0.5rem;

  i {
    width: 1rem;
    text-align: center;
  }
}
.ant-menu-submenu-selected {
  .sidebar-icon-wrapper {
    background-color: #01904a !important;
    i {
      color: #fff
    }
  }
}
.closed-sidebar {
  .ant-menu-submenu-arrow {
    display: none;
  }
}
</style>
