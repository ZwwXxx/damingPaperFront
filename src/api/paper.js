import request from  '@/utils/request'


// 查询试卷列表
export function listPaperBySubjectId(data) {
    return request({
        url: '/quiz/student/paper/list',
        method: 'get',
        params: data,
    })
}
// 查询试卷详细
export function getPaper(paperId) {
    return request({
        url: '/quiz/student/paper/' + paperId,
        method: 'get'
    })
}
