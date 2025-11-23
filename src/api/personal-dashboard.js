import request from '@/utils/request'

// 获取个人学习概览
export function getOverview() {
  return request({
    url: '/api/personal/dashboard/overview',
    method: 'get'
  })
}

// 获取个人考试趋势
export function getExamTrend(limit = 10, paperName = null) {
  return request({
    url: '/api/personal/dashboard/exam-trend',
    method: 'get',
    params: { limit, paperName }
  })
}

// 获取个人所有考试过的试卷列表
export function getPaperList() {
  return request({
    url: '/api/personal/dashboard/paper-list',
    method: 'get'
  })
}

// 获取个人各科目成绩统计
export function getSubjectScores() {
  return request({
    url: '/api/personal/dashboard/subject-score',
    method: 'get'
  })
}

// 获取个人错题统计
export function getWrongQuestionStat() {
  return request({
    url: '/api/personal/dashboard/wrong-question',
    method: 'get'
  })
}

// 获取个人学习时间分布
export function getStudyTimeDistribution(days = 30) {
  return request({
    url: '/api/personal/dashboard/study-time',
    method: 'get',
    params: { days }
  })
}
