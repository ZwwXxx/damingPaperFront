import request from '@/utils/request'

// ==================== 帖子相关 ====================

/**
 * 查询帖子列表
 * @param query 查询条件
 */
export function getPostList(query) {
    return request({
        url: '/quiz/forum/posts',
        method: 'get',
        params: query
    })
}

/**
 * 根据ID查询帖子详情
 * @param postId 帖子ID
 */
export function getPostDetail(postId) {
    return request({
        url: `/quiz/forum/posts/${postId}`,
        method: 'get'
    })
}

/**
 * 新增帖子
 * @param data 帖子数据
 */
export function addPost(data) {
    return request({
        url: '/quiz/forum/posts',
        method: 'post',
        data
    })
}

/**
 * 更新帖子
 * @param postId 帖子ID
 * @param data 帖子数据
 */
export function updatePost(postId, data) {
    return request({
        url: `/quiz/forum/posts/${postId}`,
        method: 'put',
        data
    })
}

/**
 * 删除帖子
 * @param postId 帖子ID
 */
export function deletePost(postId) {
    return request({
        url: `/quiz/forum/posts/${postId}`,
        method: 'delete'
    })
}

// ==================== 评论相关 ====================

/**
 * 查询帖子的评论列表
 * @param postId 帖子ID
 */
export function getCommentList(postId) {
    return request({
        url: `/quiz/forum/posts/${postId}/comments`,
        method: 'get'
    })
}

/**
 * 新增评论
 * @param data 评论数据
 */
export function addComment(data) {
    return request({
        url: '/quiz/forum/comments',
        method: 'post',
        data
    })
}

/**
 * 删除评论
 * @param commentId 评论ID
 */
export function deleteComment(commentId) {
    return request({
        url: `/quiz/forum/comments/${commentId}`,
        method: 'delete'
    })
}

// ==================== 点赞相关 ====================

/**
 * 点赞/取消点赞帖子
 * @param postId 帖子ID
 */
export function togglePostLike(postId) {
    return request({
        url: `/quiz/forum/posts/${postId}/like`,
        method: 'post'
    })
}

/**
 * 点赞/取消点赞评论
 * @param commentId 评论ID
 */
export function toggleCommentLike(commentId) {
    return request({
        url: `/quiz/forum/comments/${commentId}/like`,
        method: 'post'
    })
}
