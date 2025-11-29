import request from '@/utils/request'

/**
 * 查询科目列表
 */
export function getSubjectList() {
  return request({
    url: '/student/knowledge/subjects',
    method: 'get'
  })
}

/**
 * 查询章节树
 * @param {Number} subjectId 科目ID
 */
export function getChapterTree(subjectId) {
  return request({
    url: `/student/knowledge/chapters/${subjectId}`,
    method: 'get'
  })
}

/**
 * 查询知识点列表（分页）
 * @param {Object} params 查询参数
 */
export function getKnowledgePointList(params) {
  return request({
    url: '/student/knowledge/points',
    method: 'get',
    params
  })
}

/**
 * 查询知识点详情
 * @param {Number} pointId 知识点ID
 */
export function getKnowledgePointDetail(pointId) {
  return request({
    url: `/student/knowledge/point/${pointId}`,
    method: 'get'
  })
}

/**
 * 获取热门知识点
 * @param {Number} limit 数量限制
 */
export function getHotPoints(limit = 10) {
  return request({
    url: '/student/knowledge/point/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取最新知识点
 * @param {Number} limit 数量限制
 */
export function getLatestPoints(limit = 10) {
  return request({
    url: '/student/knowledge/point/latest',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取推荐知识点
 * @param {Number} limit 数量限制
 */
export function getRecommendPoints(limit = 10) {
  return request({
    url: '/student/knowledge/point/recommend',
    method: 'get',
    params: { limit }
  })
}

/**
 * 点赞/取消点赞
 * @param {Number} pointId 知识点ID
 */
export function toggleLike(pointId) {
  return request({
    url: `/student/knowledge/like/${pointId}`,
    method: 'post'
  })
}

/**
 * 收藏/取消收藏
 * @param {Number} pointId 知识点ID
 */
export function toggleCollect(pointId) {
  return request({
    url: `/student/knowledge/collect/${pointId}`,
    method: 'post'
  })
}

/**
 * 获取我的收藏列表
 */
export function getMyCollects() {
  return request({
    url: '/student/knowledge/my/collects',
    method: 'get'
  })
}

/**
 * 获取知识点评论列表
 * @param {Number} pointId 知识点ID
 */
export function getKnowledgeComments(pointId) {
  return request({
    url: `/student/knowledge/comments/${pointId}`,
    method: 'get'
  })
}

/**
 * 添加知识点评论
 * @param {Object} data 评论数据
 */
export function addKnowledgeComment(data) {
  return request({
    url: '/student/knowledge/comment',
    method: 'post',
    data
  })
}

/**
 * 删除知识点评论
 * @param {Number} commentId 评论ID
 */
export function deleteKnowledgeComment(commentId) {
  return request({
    url: `/student/knowledge/comment/${commentId}`,
    method: 'delete'
  })
}

/**
 * 点赞/取消点赞评论
 * @param {Number} commentId 评论ID
 */
export function toggleCommentLike(commentId) {
  return request({
    url: `/student/knowledge/comment/like/${commentId}`,
    method: 'post'
  })
}

/**
 * 发布知识点
 * @param {Object} data 知识点数据
 */
export function publishKnowledge(data) {
  return request({
    url: '/student/knowledge/publish',
    method: 'post',
    data
  })
}

/**
 * 获取科目列表（用于发布）
 */
export function getSubjects() {
  return request({
    url: '/student/knowledge/subjects',
    method: 'get'
  })
}

/**
 * 根据科目获取章节列表
 * @param {Number} subjectId 科目ID
 */
export function getChaptersBySubject(subjectId) {
  return request({
    url: `/student/knowledge/chapters/${subjectId}`,
    method: 'get'
  })
}
