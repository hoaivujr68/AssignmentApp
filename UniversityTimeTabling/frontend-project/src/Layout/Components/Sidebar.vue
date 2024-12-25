<template>
<div>
  <div
      class="app-sidebar sidebar-shadow"
      @mouseover="toggleSidebarHover('add', 'closed-sidebar-open')"
      @mouseleave="toggleSidebarHover('remove', 'closed-sidebar-open')"
  >
    <div class="app-header__logo">
      <img
          class="logo-header-sc5"
          src="@/assets/static/images/download.png"
      />
      <span class="title-logo">SOICT HUST</span>
    </div>
    <div class="app-sidebar-content custom-box-shadow">
      <VuePerfectScrollbar class="app-sidebar-scroll" v-once>
        <SidebarV2 :menu="menu" :collapsed="collapsed"/>
      </VuePerfectScrollbar>
    </div>
  </div>
  <div class="app-header__toggle" @click="toggleSidebar('closed-sidebar')">
      <template v-if="!clickedToggleSidebar">
        <i class="fas fa-bars"></i>
      </template>
      <template v-else>
        <i class="fas fa-align-left"></i>
      </template>
    </div>
</div>
</template>

<script>
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import SidebarV2 from "./SidebarV2";
import '@fortawesome/fontawesome-free/css/all.css'

export default {
  components: {
    VuePerfectScrollbar,
    SidebarV2
  },
  data() {
    return {
      isOpen: false,
      sidebarActive: false,
      menu: [
        {
          title: "Quản lý bộ dữ liệu",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/datasets",
              title: "Danh sách bộ dữ liệu",
              permission: 'dataset_search'
            }
          ],
        },
        {
          title: "Quản lý giảng viên",
          icon: 'fa fa-user',
          child: [
            {
              href: "/admin/teachers",
              title: "Danh sách giảng viên",
              permission: 'teacher_search'
            }
          ],
        },
        {
          title: "Quản lý nhóm chuyên môn",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/group-teachers",
              title: "Danh sách nhóm chuyên môn",
              permission: 'group_teacher_search'
            }
          ],
        },
        {
          title: "Quản lý học phần",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/subjects",
              title: "Danh sách học phần",
              permission: 'subject_search'
            }
          ],
        },
        {
          title: "Quản lý lớp học",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/classes",
              title: "Danh sách lớp học",
              permission: 'class_search'
            }
          ],
        },
        {
          title: "Quản lý sinh viên đăng kí đồ án",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/student-projects",
              title: "Danh sách sinh viên đăng kí đồ án",
              permission: 'student_project_search'
            }
          ],
        },
        {
          title: "Quản lý ràng buộc",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/constraints",
              title: "Danh sách ràng buộc",
              permission: 'constraint_search'
            }
          ],
        },
        {
          title: "Phân công GD và HD",
          icon: 'fa fa-wallet',
          child: [
            {
              href: "/admin/timetabling/teacher",
              title: "Phân công giảng dạy",
              permission: 'timetabling_teacher'
            },
            {
              href: "/admin/timetabling/teacher/result",
              title: "Kết quả phân công giảng dạy",
              permission: 'timetabling_teacher_result'
            },
            {
              href: "/admin/timetabling/student",
              title: "Phân công hướng dẫn",
              permission: 'timetabling_student'
            },
            {
              href: "/admin/timetabling/student/result",
              title: "Kết quả phân công hướng dẫn",
              permission: 'timetabling_student_result'
            },
          ],
        },
        {
          title: "Quản trị",
          icon: 'fa fa-user',
          child: [
            {
              href: "/admin/user",
              title: "Người dùng",
              permission: 'admin_user_list'
            },
            {
              href: "/admin/role",
              title: "Vai trò",
              permission: 'role_list'
            },
            {
              href: "/admin/permission",
              title: "Quyền hạn",
              permission: 'permission_list'
            },
            {
              href: "/admin/log",
              title: "Log hệ thống",
              permission: 'admin_log_list'
            },
          ],
        },
      ],
      collapsed: true,

      windowWidth: 0,

      clickedToggleSidebar: false
    };
  },
  props: {
    sidebarbg: String,
  },
  methods: {
    toggleSidebar(className) {
      const el = document.body;
      this.sidebarActive = !this.sidebarActive;
      this.clickedToggleSidebar = !this.clickedToggleSidebar

      this.windowWidth = document.documentElement.clientWidth;

      if (this.windowWidth > "992") {
        if (this.clickedToggleSidebar) {
          el.classList.add(className);
        } else {
          el.classList.remove(className);
        }
      }
    },
    toggleSidebarHover(add, className) {
      const el = document.body;
      this.sidebarActive = !this.sidebarActive;

      this.windowWidth = document.documentElement.clientWidth;

      if (this.windowWidth > "992") {
        if (add === "add") {
          el.classList.add(className);
        } else {
          el.classList.remove(className);
        }
      }
    },
    getWindowWidth() {
      const el = document.body;

      this.windowWidth = document.documentElement.clientWidth;

      if (this.windowWidth < "1350") {
        this.clickedToggleSidebar = true
        el.classList.add("closed-sidebar", "closed-sidebar-md");
      } else {
        this.clickedToggleSidebar = false
        el.classList.remove("closed-sidebar", "closed-sidebar-md");
      }
    },
  },
  created() {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null

    if (!userInfo) return;

    if (userInfo.roles.indexOf('admin') !== -1) return;

    userInfo.permissions = userInfo.permissions.replaceAll(' ', '').split(',')

    this.menu.forEach((item) => {
      item.child = item.child.filter((child) => userInfo.permissions.includes(child.permission))
    })

    this.menu = this.menu.filter((item) => item.child.length > 0)
  },
  mounted() {
    this.$nextTick(function () {
      window.addEventListener("resize", this.getWindowWidth);

      //Init
      this.getWindowWidth();
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.getWindowWidth);
  },
};
</script>

<style lang="scss" scoped>
.logo-header-sc5 {
  margin-top: 1px;
  height: 47px;
  background: no-repeat;
  cursor: pointer;
}
</style>

<style lang="scss">
@import '../../assets/custom-menu-antd.scss';
.app-sidebar {
  padding-top: 0 !important;
}
.logo-src {
  background: no-repeat;
}
.title-logo {
  margin-left: 20px;
  font-weight: 500;
  font-size: 16px;
}
.app-header__toggle {
  padding: 0 1rem;
  height: 60px;
  width: auto;
  display: flex;
  align-items: center;
  transition: width .2s;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  margin-left: 1rem;
  left: calc(300px);
  z-index: 10;
  cursor: pointer;

  i {
    color: #01904a;
    font-size: 1.5rem;
    padding: 0.5rem;
    background: #fff;
    border-radius: 0 0 4px 4px;
    &:active {
      color: rgb(196, 196, 196);
      transform: translateY(3px);
    }
    border: 0 solid rgba(0,0,0,.125) !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 .25rem .375rem -.0625rem rgba(20,20,20,.12),0 .125rem .25rem -.0625rem rgba(20,20,20,.07);
  }
}
.closed-sidebar {
  .app-header__toggle {
    left: 80px;
  }
}
.closed-sidebar-md {
  .app-header__toggle {
    display: none !important;
  }
}
.app-header__logo {
  color: #fff;
  background: #375271 !important;
  position: unset !important;
}
.app-sidebar-content {
  background: linear-gradient(313deg, rgba(66,109,173,1) 0%, #342b2b 0%, rgba(55,82,113,1) 56%) !important;
}
</style>
