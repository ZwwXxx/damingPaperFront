import request from '@/utils/request'

// 定义全局模块
const module = '/quiz/student/paper/answer'

// 提交答案
export function submitAnswer(data) {
    return request({
        url: `${module}/submitAnswer`,
        method: 'post',
        // params:  queryParams  //使用  @RequestParam("name") String name,接收或者是@PathVariable("前端键值") Integer后端形参名
        data, // 使用@RequestBody接收
    })
}

// 获取答卷列表
export function getPaperAnswerList(query) {
    return request({
        url: `${module}/list`,
        method: 'get',
        params: query  //使用  @RequestParam("name") String name,接收或者是@PathVariable("前端键值") Integer后端形参名
    })
}

// 获取某一次考试记录

export function getPaperAnswer(paperAnswerId) {
    return request({
        url: `${module}/getPaperReview/${paperAnswerId}`,
        method: 'get',
        // params:  queryParams  //使用  @RequestParam("name") String name,接收或者是@PathVariable("前端键值") Integer后端形参名
    })
}
