import {getToken, removeToken} from "@/utils/auth";
import {getInfo, logout} from "@/api/user";
import {convertAvatarUrl} from "@/utils/oss";
import {DEFAULT_AVATAR} from "@/utils/constants";

const state = {
    token: getToken(),
    id: localStorage.getItem('userId') || '',
    name: localStorage.getItem('userName') || '',
    avatar: localStorage.getItem('userAvatar') || DEFAULT_AVATAR,
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
                console.log('[Store] GetInfo响应:', res)
                if (res.code === 200) {
                    const user = res.user
                    console.log('[Store] 用户数据:', user)
                    
                    // mutations中会自动同步到localStorage
                    commit('SET_ID', user.userName)
                    commit('SET_NAME', user.nickName || user.userName)
                    
                    // 处理头像URL：自动识别OSS私有链接并转为签名URL，如果没有头像则使用默认头像
                    let avatarUrl = DEFAULT_AVATAR
                    if (user.avatar && user.avatar.trim()) {
                        avatarUrl = await convertAvatarUrl(user.avatar)
                    }
                    console.log('[Store] 最终头像URL:', avatarUrl)
                    commit('SET_AVATAR', avatarUrl)
                    
                    console.log('[Store] ✅ 用户信息已保存:', {
                        id: user.userName,
                        name: user.nickName || user.userName,
                        avatar: avatarUrl
                    })
                }
                resolve(res)
            }).catch(error => {
                console.error('[Store] GetInfo失败:', error)
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
                commit('SET_AVATAR', DEFAULT_AVATAR)  // ✅ 使用默认头像而不是空字符串
                removeToken()
                resolve()
            }).catch(error => {
                // 即使退出接口失败，也要清除本地数据
                commit('SET_TOKEN', '')
                commit('SET_ID', '')
                commit('SET_NAME', '')
                commit('SET_AVATAR', DEFAULT_AVATAR)
                removeToken()
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
