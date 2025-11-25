import request from '@/utils/request'

/**
 * 查询公告列表（前台）
 */
export function getNoticeList(params) {
  return request({
    url: '/student/notice/list',
    method: 'get',
    params
  })
}

/**
 * 查询公告详情
 */
export function getNoticeDetail(noticeId) {
  return request({
    url: `/student/notice/${noticeId}`,
    method: 'get'
  })
}

/**
 * 获取最新公告（首页展示）
 */
export function getLatestNotices() {
  return request({
    url: '/student/notice/latest',
    method: 'get'
  })
}
