import {
    SET_CLASSES_BY_TEACHER,
    SET_EVALUATE_RESPONSE,
    SET_INPUT_DATA, SET_TIMETABLING_RESPONSE,
    SET_TIMETABLING_TEACHER_STATUS
} from "@/store/mutation.type";
import {SUCCESS} from "@/common/config"
import baseMixins from "../components/mixins/base"
import {
    CREATE_FILE_TIMETABLING_TEACHER, CREATE_FILE_TIMETABLING_TEACHER_RESULT,
    FETCH_CLASSES_BY_TEACHER,
    FETCH_EVALUATE_RESPONSE, FETCH_TIMETABLING_RESPONSE,
    INPUT_DATA,
    TIMETABLING_TEACHER,
    TIMETABLING_TEACHER_STATUS
} from "@/store/action.type";

const state = {
    inputData: null,
    timetablingTeacherStatus: null,
    classesByTeacher: [],
    evaluateResponse: [],
    timetablingResponse: [],
}

const getters = {
    inputData(state) {
        return state.inputData
    },
    timetablingTeacherStatus(state) {
        return state.timetablingTeacherStatus
    },
    classesByTeacher(state) {
        return state.classesByTeacher
    },
    evaluateResponse(state) {
        return state.evaluateResponse
    },
    timetablingResponse(state) {
        return state.timetablingResponse
    }
}

const mutations = {
    [SET_INPUT_DATA] (state, payload) {
        state.inputData = payload
    },
    [SET_TIMETABLING_TEACHER_STATUS] (state, payload) {
        state.timetablingTeacherStatus = payload
    },
    [SET_CLASSES_BY_TEACHER] (state, payload) {
        state.classesByTeacher = payload
    },
    [SET_EVALUATE_RESPONSE] (state, payload) {
        state.evaluateResponse = payload
    },
    [SET_TIMETABLING_RESPONSE] (state, payload) {
        state.timetablingResponse = payload
    }
}

const actions = {
    [INPUT_DATA] (context, payload) {
        return new Promise(async resolve => {
            let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
            let response = await baseMixins.methods.getWithBigInt('/timetabling-teacher/input-data' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_INPUT_DATA, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [TIMETABLING_TEACHER_STATUS] (context, payload) {
        return new Promise(async resolve => {
            let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
            let response = await baseMixins.methods.getWithBigInt('/timetabling/teacher/status' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_TIMETABLING_TEACHER_STATUS, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [TIMETABLING_TEACHER](context, payload) {
        let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.post('/timetabling/teacher' + params, null)
            resolve(response)
        })
    },
    [FETCH_CLASSES_BY_TEACHER] (context, params) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetable/teacher', '', {params})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_CLASSES_BY_TEACHER, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [CREATE_FILE_TIMETABLING_TEACHER](context, params) {
        baseMixins.methods.get('/admin/timetabling-teacher/list/excel', '', {params: params, responseType: 'blob'})
            .then(({ data }) => {
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "class_timetabling.xlsx");
                document.body.appendChild(link);
                link.click();
            })
            .catch(({ error }) => error);
    },
    [FETCH_EVALUATE_RESPONSE] (context, payload) {
        let params = payload.dataset != null ? '?dataset=' + payload.dataset : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetabling/teacher/evaluate' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_EVALUATE_RESPONSE, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [FETCH_TIMETABLING_RESPONSE] (context, payload) {
        let params = (payload.dataset != null && payload.teacherId != null) ? '?dataset=' + payload.dataset + '&teacherId=' + payload.teacherId : ''
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/timetabling/teacher/timetable' + params, '', {})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_TIMETABLING_RESPONSE, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [CREATE_FILE_TIMETABLING_TEACHER_RESULT](context, params) {
        baseMixins.methods.get('/admin/timetabling-teacher-result/list/excel', '', {params: params, responseType: 'blob'})
            .then(({ data }) => {
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "teacher_timetable.xlsx");
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
