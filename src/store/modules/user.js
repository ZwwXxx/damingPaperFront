import {getToken, removeToken} from "@/utils/auth";
import {getInfo, logout} from "@/api/user";
import {convertAvatarUrl} from "@/utils/oss";
import {DEFAULT_AVATAR} from "@/utils/constants";

const state = {
    token: getToken(),
    id: localStorage.getItem('userId') || '',
    userName: localStorage.getItem('userName') || '',
    nickName: localStorage.getItem('nickName') || '',
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
    SET_USERNAME: (state, userName) => {
        state.userName = userName
        if (userName) {
            localStorage.setItem('userName', userName)
        } else {
            localStorage.removeItem('userName')
        }
    },
    SET_NICKNAME: (state, nickName) => {
        state.nickName = nickName
        if (nickName) {
            localStorage.setItem('nickName', nickName)
        } else {
            localStorage.removeItem('nickName')
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
                    commit('SET_ID', user.userId)  // 存储userId用于权限判断
                    commit('SET_USERNAME', user.userName)  // 存储userName（登录名）
                    commit('SET_NICKNAME', user.nickName || user.userName)  // 存储nickName（显示名）
                    
                    // 处理头像URL：数据库存储的就是完整CDN地址，直接使用
                    const avatarUrl = user.avatar || DEFAULT_AVATAR
                    console.log('[Store] 头像URL:', avatarUrl)
                    commit('SET_AVATAR', avatarUrl)
                    
                    console.log('[Store] ✅ 用户信息已保存:', {
                        id: user.userId,
                        userName: user.userName,
                        nickName: user.nickName,
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
                commit('SET_USERNAME', '')
                commit('SET_NICKNAME', '')
                commit('SET_AVATAR', DEFAULT_AVATAR)  // ✅ 使用默认头像而不是空字符串
                removeToken()
                resolve()
            }).catch(error => {
                // 即使退出接口失败，也要清除本地数据
                commit('SET_TOKEN', '')
                commit('SET_ID', '')
                commit('SET_USERNAME', '')
                commit('SET_NICKNAME', '')
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
    userId: state => state.id,  // userId别名
    userName: state => state.userName,  // 登录名（zww）
    nickName: state => state.nickName,  // 显示名（6666）
}


export default {
    // namespaced: true,
    state,
    mutations,
    actions,
    getters
}
