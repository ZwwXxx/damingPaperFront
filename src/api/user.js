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
/**
 * 更新用户信息（JSON格式）
 * 使用步骤：
 * 1. 如需更新头像，先调用 uploadFile() 上传到OSS
 * 2. 获取返回的URL后调用本接口
 * 
 * @param data { nickName: string, avatar?: string }
 */
export function updateInfo(data){
    return request({
        url: '/quiz/student/user/updateInfo',
        method: 'put',
        data
        // 使用JSON格式，不需要设置headers
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
/**
 * 上传文件到OSS（通用上传接口）
 * @param formData FormData对象，包含file字段
 * @returns {url, fileName, newFileName, originalFilename}
 */
export function uploadFile(formData) {
    return request({
        url: '/common/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}
