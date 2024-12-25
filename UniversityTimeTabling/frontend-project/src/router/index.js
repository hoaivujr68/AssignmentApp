import Vue from 'vue'
import Router from 'vue-router'
import StorageService from '@/common/storage.service';

Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta: { layout: 'userpages', loginPage: true, nonRequiresAuth: true, title: 'Đăng nhập' },
      component: () => import("@/views/Login"),
    },
    {
      path: '/',
      name: 'DefaultPage',
      meta: { title: 'Quản lý giảng dạy', layout: 'default' },
    },
    {
      path: '/admin/user',
      name: 'AdminUser',
      component: () => import("@/views/AdminUser"),
      meta: { title: 'Quản lý tài khoản', layout: 'default' }
    },
    {
      path: '/admin/role',
      name: 'Role',
      component: () => import("@/views/Role"),
      meta: { title: 'Quản lý vai trò', layout: 'default' }
    },
    {
      path: '/admin/permission',
      name: 'Permission',
      component: () => import("@/views/Permissions"),
      meta: { title: 'Quản lý quyền', layout: 'default' }
    },
    {
      path: '/admin/log',
      name: 'AdminUserLog',
      component: () => import("@/views/AdminUserLog"),
      meta: { title: 'Quản lý log', layout: 'default' }
    },
    {
      path: '/admin/teachers',
      name: 'Teachers',
      component: () => import("@/views/Teachers"),
      meta: { title: 'Quản lý giảng viên', layout: 'default' }
    },
    {
      path: '/admin/group-teachers',
      name: 'GroupTeachers',
      component: () => import("@/views/GroupTeachers"),
      meta: { title: 'Quản lý nhóm chuyên môn', layout: 'default' }
    },
    {
      path: '/admin/group-teacher/:id',
      name: 'GroupTeacher',
      component: () => import("@/views/GroupTeacherDetail"),
      meta: { title: 'Chi tiết nhóm chuyên môn', layout: 'default' }
    },
    {
      path: '/admin/classes',
      name: 'Classes',
      component: () => import("@/views/Classes"),
      meta: { title: 'Quản lý lớp học', layout: 'default' }
    },
    {
      path: '/admin/student-projects',
      name: 'StudentProjects',
      component: () => import("@/views/StudentProjects"),
      meta: { title: 'Quản lý sinh viên đăng ký đồ án', layout: 'default' }
    },
    {
      path: '/admin/subjects',
      name: 'Subjects',
      component: () => import("@/views/Subjects"),
      meta: { title: 'Quản lý học phần', layout: 'default' }
    },
    {
      path: '/admin/datasets',
      name: 'Datasets',
      component: () => import("@/views/Datasets"),
      meta: { title: 'Quản lý bộ dữ liệu', layout: 'default' }
    },
    {
      path: '/admin/constraints',
      name: 'Constraints',
      component: () => import("@/views/Constraints"),
      meta: { title: 'Quản lý ràng buộc', layout: 'default' }
    },
    {
      path: '/admin/timetabling/teacher',
      name: 'TimetablingTeacher',
      component: () => import("@/views/TimetablingTeacher"),
      meta: { title: 'Phân công giảng dạy', layout: 'default' }
    },
    {
      path: '/admin/timetabling/teacher/result',
      name: 'TimetablingTeacherResult',
      component: () => import("@/views/TimetablingTeacherResult"),
      meta: { title: 'Kết quả phân công giảng dạy', layout: 'default' }
    },
    {
      path: '/admin/timetabling/student',
      name: 'TimetablingStudent',
      component: () => import("@/views/TimetablingStudent"),
      meta: { title: 'Phân công hướng dẫn', layout: 'default' }
    },
    {
      path: '/admin/timetabling/student/result',
      name: 'TimetablingStudentResult',
      component: () => import("@/views/TimetablingStudentResult"),
      meta: { title: 'Kết quả phân công hướng dẫn', layout: 'default' }
    },
  ]
});
router.beforeEach((to, from, next) => {
  if (to.path !== '/login') {
    localStorage.setItem('savedPath', to.fullPath)
  }
  const publicPages = ['/login', '/config-api'];
  const authRequired = !publicPages.includes(to.path);
  const isAuthenticated = !!StorageService.get("Token");
  if (to.path.includes('/cs/') && isAuthenticated) {
    next()
  }
  if (to.path.includes('/admin/') && isAuthenticated) {
    next()
  }
  if (authRequired && !isAuthenticated) {
    next('/login')
  }
  next()
});

router.onError(error => {
  if (/ChunkLoadError:.*failed./i.test(error.message)) {
    Vue.prototype.$log.error('Reloading Window 1');
    window.location.reload();
  }
  else if (/Loading.*chunk.*failed./i.test(error.message)) {
    Vue.prototype.$log.error('Reloading Window 2');
    window.location.reload();
  }
});

const DEFAULT_TITLE = 'SC5 web admin'
router.afterEach((to, from) => {
  Vue.nextTick(() => {
    document.title = to.meta.title || DEFAULT_TITLE
  })
})

export default router;
