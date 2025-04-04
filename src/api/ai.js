import request from  '@/utils/request'
export function chat(data){
    return request({
        url: '/quiz/student/chat',
        method: 'post',
        data
    })
}

export function clearRecord(){
    return request({
        url: '/quiz/student/chat/clear-context',
        method: 'delete',
    })
}


export function stopStream(){
    return request({
        url: '/quiz/student/chat/stopStream',
        method: 'delete',
    })
}
