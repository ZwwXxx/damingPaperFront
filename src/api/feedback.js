import request from '@/utils/request'

/**
 * 查询我的反馈列表
 */
export function getMyFeedbackList(params) {
  return request({
    url: '/student/feedback/my',
    method: 'get',
    params
  })
}

/**
 * 查询反馈详情
 */
export function getFeedbackDetail(feedbackId) {
  return request({
    url: `/student/feedback/${feedbackId}`,
    method: 'get'
  })
}

/**
 * 提交反馈
 */
export function submitFeedback(data) {
  return request({
    url: '/student/feedback',
    method: 'post',
    data
  })
}

/**
 * 删除反馈
 */
export function deleteFeedback(feedbackId) {
  return request({
    url: `/student/feedback/${feedbackId}`,
    method: 'delete'
  })
}
