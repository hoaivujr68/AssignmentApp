import Vue from "vue";
import Vuex from "vuex";
import auth from "./auth.module";
import adminUser from "./adminuser.module";
import role from "../store/role.module";
import log from "./adminlog.module"
import file from "./file.module"
import event from "./event.module"
import teacher from "./teacher.module"
import groupTeacher from "./groupteacher.module"
import classes from "./class.module"
import studentProject from "./studentproject.module"
import subject from "./subject.module"
import constraint from "./constraint.module"
import timetablingTeacher from "./timetablingteacher.module"
import timetablingStudent from "./timetablingstudent.module"
import dataset from "./dataset.module"

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth: auth,
    adminUser: adminUser,
    role: role,
    log: log,
    teacher,
    groupTeacher,
    classes,
    studentProject,
    subject,
    file,
    event,
    constraint,
    timetablingTeacher,
    timetablingStudent,
    dataset,
  }
});
