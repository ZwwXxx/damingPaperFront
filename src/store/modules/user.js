import {getToken, removeToken} from "@/utils/auth";
import {getInfo, logout} from "@/api/user";

const state = {
    token: getToken(),
    id: '',
    name: '',
    avatar: '',
}
const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_ID: (state, id) => {
        state.id = id
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    },
}
const actions = {
    GetInfo({commit}) {
        return new Promise((resolve, reject) => {
            getInfo().then(res => {
                if (res.code === 200) {
                    const user = res.user
                    commit('SET_ID', user.userName)
                    commit('SET_NAME', user.nickName)
                    commit('SET_AVATAR', process.env.VUE_APP_BASE_API+user.avatar)
                }
                resolve(res)
            }).catch(error => {
                reject(error)
            })
        })
    },
    LogOut({ commit, state }) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                commit('SET_TOKEN', '')
                removeToken()
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },
}
const getters = {
    avatar: state => state.avatar,
    id: state => state.id,
    name: state => state.name,

}


export default {
    // namespaced: true,
    state,
    mutations,
    actions,
    getters
}
