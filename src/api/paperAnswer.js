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
    })
}

// 获取试卷薄弱知识点
export function getWeakKnowledgePoints(paperAnswerId) {
    return request({
        url: `${module}/getPaperReview/${paperAnswerId}/weak-knowledge-points`,
        method: 'get',
    })
}

// 获取题目关联的知识点
export function getQuestionKnowledgePoints(questionId) {
    return request({
        url: `${module}/question/${questionId}/knowledge-points`,
        method: 'get',
    })
}

// 批量获取题目关联的知识点
export function getQuestionsKnowledgePoints(questionIds) {
    return request({
        url: `${module}/questions/knowledge-points`,
        method: 'post',
        data: questionIds
    })
}
