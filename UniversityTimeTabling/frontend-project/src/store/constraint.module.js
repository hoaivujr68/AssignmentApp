import {
    CREATE_CUSTOM_CONSTRAINT, CREATE_REQUIRED_CONSTRAINT,
    FETCH_CONSTRAINTS, UPDATE_CUSTOM_CONSTRAINT, UPDATE_REQUIRED_CONSTRAINT,
} from "./action.type";
import { SUCCESS } from "@/common/config"
import baseMixins from "../components/mixins/base"
import {SET_CONSTRAINTS} from "@/store/mutation.type";

const state = {
    constraints: [],
}

const getters = {
    constraints(state) {
        return state.constraints
    },
}

const mutations = {
    [SET_CONSTRAINTS] (state, payload) {
        state.constraints = payload
    },
}

const actions = {
    [FETCH_CONSTRAINTS] (context, params) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.getWithBigInt('/constraint/search', '', {params})
            if (response && response.data && response.status === SUCCESS) {
                context.commit(SET_CONSTRAINTS, response.data)
                resolve(response.data)
            } else {
                resolve(null)
            }
        })
    },
    [CREATE_CUSTOM_CONSTRAINT](context, payload) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.post('/constraint/custom/create', payload)
            resolve(response)
        })
    },
    [UPDATE_CUSTOM_CONSTRAINT](context, payload) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.post('/constraint/custom/update', payload)
            resolve(response)
        })
    },
    [CREATE_REQUIRED_CONSTRAINT](context, payload) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.post('/constraint/required/create', payload)
            resolve(response)
        })
    },
    [UPDATE_REQUIRED_CONSTRAINT](context, payload) {
        return new Promise(async resolve => {
            let response = await baseMixins.methods.post('/constraint/required/update', payload)
            resolve(response)
        })
    },
}
export default {
    state,
    getters,
    mutations,
    actions
}
