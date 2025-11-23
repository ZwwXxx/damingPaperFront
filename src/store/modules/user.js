import {getToken, removeToken} from "@/utils/auth";
import {getInfo, logout} from "@/api/user";
import {convertAvatarUrl} from "@/utils/oss";

const state = {
    token: getToken(),
    id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('userName') || '',
    avatar: localStorage.getItem('userAvatar') || '',
}
const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_ID: (state, id) => {
        state.id = id
        if (id) {
            localStorage.setItem('userId', id)
        } else {
            localStorage.removeItem('userId')
        }
    },
    SET_NAME: (state, name) => {
        state.name = name
        if (name) {
            localStorage.setItem('userName', name)
        } else {
            localStorage.removeItem('userName')
        }
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
        if (avatar) {
            localStorage.setItem('userAvatar', avatar)
        } else {
            localStorage.removeItem('userAvatar')
        }
    },
}
const actions = {
    GetInfo({commit}) {
        return new Promise((resolve, reject) => {
            getInfo().then(async res => {
                if (res.code === 200) {
                    const user = res.user
                    // mutations中会自动同步到localStorage
                    commit('SET_ID', user.userName)
                    commit('SET_NAME', user.nickName)
                    
                    // 处理头像URL：自动识别OSS私有链接并转为签名URL
                    const avatarUrl = await convertAvatarUrl(user.avatar)
                    commit('SET_AVATAR', avatarUrl)
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
                // mutations中会自动清除localStorage
                commit('SET_TOKEN', '')
                commit('SET_ID', '')
                commit('SET_NAME', '')
                commit('SET_AVATAR', '')
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
