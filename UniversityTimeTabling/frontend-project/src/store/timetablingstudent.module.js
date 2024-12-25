import {
    SET_EVALUATE_STUDENT_RESPONSE,
    SET_INPUT_DATA_STUDENT,
    SET_STUDENTS_BY_TEACHER,
    SET_TIMETABLING_STUDENT_RESPONSE,
    SET_TIMETABLING_STUDENT_STATUS
} from "@/store/mutation.type";
import {SUCCESS} from "@/common/config"
import baseMixins from "../components/mixins/base"
import {
    CREATE_FILE_TIMETABLING_STUDENT,
    CREATE_FILE_TIMETABLING_STUDENT_RESULT,
    CREATE_FILE_TIMETABLING_TEACHER,
    CREATE_FILE_TIMETABLING_TEACHER_RESULT,
    FETCH_EVALUATE_STUDENT_RESPONSE,
    FETCH_STUDENTS_BY_TEACHER,
    FETCH_TIMETABLING_STUDENT_RESPONSE,
    INPUT_DATA_STUDENT,
    TIMETABLING_STUDENT,
    TIMETABLING_STUDENT_STATUS
} from "@/store/action.type";

const state = {
    inputDataStudent: null,
    timetablingStudentStatus: null,
    studentsByTeacher: [],
    evaluateStudentResponse: [],
    timetablingStudentResponse: [],
}

const getters = {
    inputDataStudent(state) {
        return state.inputDataStudent
    },
    timetablingStudentStatus(state) {
        return state.timetablingStudentStatus
    },
    studentsByTeacher(state) {
        return state.studentsByTeacher
    },
    evaluateStudentResponse(state) {
        return state.evaluateStudentResponse
    },
    timetablingStudentResponse(state) {
        return state.timetablingStudentResponse
    }
}

const mutations = {
    [SET_INPUT_DATA_STUDENT] (state, payload) {
        state.inputDataStudent = payload
    },
    [SET_TIMETABLING_STUDENT_STATUS] (state, payload) {
        state.timetablingStudentStatus = payload
    },
    [SET_STUDENTS_BY_TEACHER] (state, payload) {
        state.studentsByTeacher = payload
    },
    [SET_EVALUATE_STUDENT_RESPONSE] (state, payload) {
        state.evaluateStudentResponse = payload
    },
    [SET_TIMETABLING_STUDENT_RESPONSE] (state, payload) {
        state.timetablingStudentResponse = payload
    }
}

const actions = {
    [INPUT_DATA_STUDENT] (context, payload) {
        let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetabling-student/input-data' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_INPUT_DATA_STUDENT, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [TIMETABLING_STUDENT_STATUS] (context, payload) {
        let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetabling/student/status' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_TIMETABLING_STUDENT_STATUS, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [TIMETABLING_STUDENT](context, payload) {
        let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.post('/timetabling/student' + params, null)
            resolve(response)
        })
    },
    [FETCH_STUDENTS_BY_TEACHER] (context, params) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetable/student', '', {params})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_STUDENTS_BY_TEACHER, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [CREATE_FILE_TIMETABLING_STUDENT](context, params) {
        baseMixins.methods.get('/admin/timetabling-student/list/excel', '', {params: params, responseType: 'blob'})
            .then(({ data }) => {
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "student_timetabling.xlsx");
                document.body.appendChild(link);
                link.click();
            })
            .catch(({ error }) => error);
    },
    [FETCH_EVALUATE_STUDENT_RESPONSE] (context, payload) {
        let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetabling/student/evaluate' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_EVALUATE_STUDENT_RESPONSE, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [FETCH_TIMETABLING_STUDENT_RESPONSE] (context, payload) {
        let params = (payload.dataset != null && payload.teacherId != null) ? '?dataset=' + payload.dataset + '&teacherId=' + payload.teacherId : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetabling/student/timetable' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_TIMETABLING_STUDENT_RESPONSE, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [CREATE_FILE_TIMETABLING_STUDENT_RESULT](context, params) {
        baseMixins.methods.get('/admin/timetabling-student-result/list/excel', '', {params: params, responseType: 'blob'})
            .then(({ data }) => {
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "teacher_student.xlsx");
                document.body.appendChild(link);
                link.click();
            })
            .catch(({ error }) => error);
    },
}

export default {
    state,
    getters,
    mutations,
    actions
}
