import request from  '@/utils/request'

export function login(data){
    return request({
        url: '/quiz/student/user/login',
        method: 'post',
        data
    })
}
export function registry(data){
    return request({
        url: '/quiz/student/user/registry',
        method: 'post',
        data
    })
}

export function getInfo(){
    return request({
        url: '/quiz/student/user/getInfo',
        method: 'get',
    })
}
export function updateInfo(data){
    return request({
        url: '/quiz/student/user/updateInfo',
        method: 'put',
        data,
        headers: {
            'Content-Type': 'multipart/form-data' // 可选，axios 通常会自动处理
        }
    })
}
// 退出方法
export function logout() {
    return request({
        url: '/logout',
        method: 'post'
    })
}


export function resetPwd(data){
    return request({
        url: '/quiz/student/user/resetPwd',
        method: 'put',
        data
    })
}
// 用户头像上传
export function uploadAvatar(data) {
    return request({
        url: '/system/user/profile/avatar',
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: data
    })
}
