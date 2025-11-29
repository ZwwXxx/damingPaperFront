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
 * 查询知识点详情（已完全废弃，请勿使用）
 * @deprecated 已删除！请使用 getKnowledgePointBase + getKnowledgePointContent 分步查询
 * @param {Number} pointId 知识点ID
 */
export function getKnowledgePointDetail(pointId) {
  console.error('getKnowledgePointDetail已废弃！请使用分步查询：getKnowledgePointBase + getKnowledgePointContent')
  throw new Error('该API已废弃，请使用分步查询方案')
}

/**
 * 获取单个知识点基础信息 - 复用列表查询
 * @param {Number} pointId 知识点ID
 */
export function getKnowledgePointBase(pointId) {
  return getKnowledgePointList({ pointId: pointId, status: 1 })
    .then(response => {
      if (response.rows && response.rows.length > 0) {
        return { ...response, data: response.rows[0] }
      }
      throw new Error('知识点不存在')
    })
}

/**
 * 获取知识点内容详情（大字段内容）
 * @param {Number} pointId 知识点ID
 */
export function getKnowledgePointContent(pointId) {
  return request({
    url: `/student/knowledge/point/${pointId}/content`,
    method: 'get'
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
 * @param {Object} params 查询参数，包含folderId等
 */
export function getMyCollects(params = {}) {
  return request({
    url: '/student/knowledge/my/collects',
    method: 'get',
    params
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
 * 创建新科目
 * @param {Object} data 科目数据
 */
export function createSubject(data) {
  return request({
    url: '/student/knowledge/subject',
    method: 'post',
    data
  })
}

/**
 * 获取知识点详情（用于编辑）
 * @param {Number} pointId 知识点ID
 */
export function getKnowledgeDetail(pointId) {
  return request({
    url: `/student/knowledge/point/${pointId}/edit`,
    method: 'get'
  })
}

/**
 * 更新知识点
 * @param {Number} pointId 知识点ID
 * @param {Object} data 知识点数据
 */
export function updateKnowledge(pointId, data) {
  return request({
    url: `/student/knowledge/point/${pointId}`,
    method: 'put',
    data
  })
}

// ==================== 收藏夹管理接口 ====================

/**
 * 获取用户的收藏夹列表
 */
export function getUserFolders() {
  return request({
    url: '/student/knowledge/folders',
    method: 'get'
  })
}

/**
 * 创建新收藏夹
 * @param {Object} data 收藏夹数据
 */
export function createFolder(data) {
  return request({
    url: '/student/knowledge/folder',
    method: 'post',
    data
  })
}

/**
 * 修改收藏夹
 * @param {Object} data 收藏夹数据
 */
export function updateFolder(data) {
  return request({
    url: '/student/knowledge/folder/update',
    method: 'post',
    data
  })
}

/**
 * 删除收藏夹
 * @param {Number} folderId 收藏夹ID
 */
export function deleteFolder(folderId) {
  return request({
    url: `/student/knowledge/folder/${folderId}`,
    method: 'delete'
  })
}

/**
 * 删除知识点
 * @param {Number} pointId 知识点ID
 */
export function deleteKnowledgePoint(pointId) {
  return request({
    url: `/student/knowledge/point/${pointId}`,
    method: 'delete'
  })
}

/**
 * 收藏知识点到指定收藏夹
 * @param {Number} pointId 知识点ID
 * @param {Number} folderId 收藏夹ID
 */
export function collectToFolder(pointId, folderId) {
  return request({
    url: `/student/knowledge/collect/${pointId}/folder/${folderId}`,
    method: 'post'
  })
}
