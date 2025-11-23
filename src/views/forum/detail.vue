<template>
  <div class="forum-detail-container">
    <div v-loading="loading" class="detail-content">
      <!-- 返回按钮 -->
      <el-button class="back-btn" icon="el-icon-back" @click="goBack">
        返回列表
      </el-button>

      <!-- 帖子详情 -->
      <div v-if="post" class="post-detail-card">
        <!-- 帖子头部 -->
        <div class="post-header">
          <div class="user-info">
            <img :src="post.avatar || defaultAvatar" class="user-avatar" />
            <div class="user-details">
              <span class="user-name">{{ post.nickName || post.userName }}</span>
              <span class="post-time">{{ formatTime(post.createTime) }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div v-if="isAuthor" class="post-actions">
            <el-button size="small" icon="el-icon-edit" @click="handleEdit">编辑</el-button>
            <el-button size="small" type="danger" icon="el-icon-delete" @click="handleDelete">删除</el-button>
          </div>
        </div>

        <!-- 帖子标题 -->
        <h1 class="post-title">{{ post.title }}</h1>

        <!-- 帖子内容 -->
        <div class="post-content" v-html="formatContent(post.content)"></div>

        <!-- 帖子图片 -->
        <div v-if="post.images && post.images.length > 0" class="post-images">
          <el-image
            v-for="(img, index) in post.images"
            :key="index"
            :src="img"
            :preview-src-list="post.images"
            class="post-image"
            fit="cover"
          />
        </div>

        <!-- 帖子统计和操作 -->
        <div class="post-footer">
          <div class="post-stats">
            <span class="stat-item">
              <i class="el-icon-view"></i> {{ post.viewCount || 0 }} 浏览
            </span>
            <span class="stat-item">
              <i class="el-icon-chat-line-round"></i> {{ post.commentCount || 0 }} 评论
            </span>
          </div>
          
          <el-button
            :type="post.hasLiked ? 'success' : 'default'"
            :class="['like-btn', { active: post.hasLiked }]"
            @click="handleLike"
          >
            <i class="el-icon-thumb"></i>
            {{ post.hasLiked ? '已点赞' : '点赞' }}
            <span class="like-count">({{ post.likeCount || 0 }})</span>
          </el-button>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          <h2>💬 全部评论 ({{ comments.length }})</h2>
        </div>

        <!-- 发表评论 -->
        <div class="comment-input-box">
          <img :src="currentUserAvatar" class="comment-avatar" />
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="发表你的看法..."
            class="comment-input"
            maxlength="500"
            show-word-limit
          />
        </div>
        <div class="comment-submit">
          <el-button type="primary" :loading="submittingComment" @click="submitComment">
            发表评论
          </el-button>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
            <!-- 评论头部 -->
            <div class="comment-header">
              <img :src="comment.avatar || defaultAvatar" class="comment-avatar" />
              <div class="comment-user-info">
                <span class="comment-user-name">{{ comment.nickName || comment.userName }}</span>
                <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
              </div>
            </div>

            <!-- 评论内容 -->
            <div class="comment-content">{{ comment.content }}</div>

            <!-- 评论操作 -->
            <div class="comment-actions">
              <span
                :class="['comment-like', { active: comment.hasLiked }]"
                @click="handleCommentLike(comment)"
              >
                <i class="el-icon-thumb"></i>
                {{ comment.likeCount || 0 }}
              </span>
              <span class="comment-reply" @click="handleReply(comment)">
                <i class="el-icon-chat-dot-round"></i>
                回复
              </span>
              <span
                v-if="isCommentAuthor(comment)"
                class="comment-delete"
                @click="handleDeleteComment(comment)"
              >
                <i class="el-icon-delete"></i>
                删除
              </span>
            </div>

            <!-- 子评论 -->
            <div v-if="comment.children && comment.children.length > 0" class="sub-comments">
              <div
                v-for="reply in comment.children"
                :key="reply.commentId"
                class="sub-comment-item"
              >
                <div class="sub-comment-header">
                  <img :src="reply.avatar || defaultAvatar" class="sub-comment-avatar" />
                  <div class="sub-comment-user-info">
                    <span class="sub-comment-user-name">{{ reply.nickName || reply.userName }}</span>
                    <span v-if="reply.replyToUserName" class="reply-to">
                      回复 @{{ reply.replyToUserName }}
                    </span>
                  </div>
                </div>
                <div class="sub-comment-content">{{ reply.content }}</div>
                <div class="sub-comment-actions">
                  <span class="sub-comment-time">{{ formatTime(reply.createTime) }}</span>
                  <span
                    :class="['comment-like', { active: reply.hasLiked }]"
                    @click="handleCommentLike(reply)"
                  >
                    <i class="el-icon-thumb"></i>
                    {{ reply.likeCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空评论状态 -->
        <div v-else class="empty-comments">
          <i class="el-icon-chat-line-round"></i>
          <p>还没有评论，快来抢沙发吧~</p>
        </div>
      </div>
    </div>

    <!-- 回复对话框 -->
    <el-dialog
      title="回复评论"
      :visible.sync="replyDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="输入回复内容..."
        maxlength="500"
        show-word-limit
      />
      <span slot="footer">
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingReply" @click="submitReply">
          发表回复
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getPostDetail, getCommentList, addComment, deletePost, deleteComment, togglePostLike, toggleCommentLike } from '@/api/forum'
import { DEFAULT_AVATAR } from '@/utils/constants'
import { convertAvatarUrl } from '@/utils/oss'
import { mapGetters } from 'vuex'

export default {
  name: 'ForumDetail',
  computed: {
    ...mapGetters(['avatar', 'id']),
    currentUserAvatar() {
      return this.avatar || DEFAULT_AVATAR
    },
    isAuthor() {
      return this.post && this.id && this.post.userName === this.id
    }
  },
  data() {
    return {
      loading: false,
      post: null,
      comments: [],
      commentContent: '',
      submittingComment: false,
      replyDialogVisible: false,
      replyContent: '',
      replyToComment: null,
      submittingReply: false,
      defaultAvatar: DEFAULT_AVATAR
    }
  },
  mounted() {
    this.loadPostDetail()
    this.loadComments()
  },
  methods: {
    // 加载帖子详情
    async loadPostDetail() {
      this.loading = true
      try {
        const res = await getPostDetail(this.$route.params.id)
        if (res.code === 200) {
          this.post = res.post
          // 处理头像URL
          if (this.post.avatar) {
            this.post.avatar = await convertAvatarUrl(this.post.avatar)
          } else {
            this.post.avatar = DEFAULT_AVATAR
          }
        } else {
          this.$message.error(res.msg || '加载失败')
          this.goBack()
        }
      } catch (error) {
        console.error('加载帖子详情失败:', error)
        this.$message.error('加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 加载评论列表
    async loadComments() {
      try {
        const res = await getCommentList(this.$route.params.id)
        if (res.code === 200) {
          const comments = res.list || []
          // 处理所有评论的头像URL
          for (const comment of comments) {
            if (comment.avatar) {
              comment.avatar = await convertAvatarUrl(comment.avatar)
            } else {
              comment.avatar = DEFAULT_AVATAR
            }
            // 处理子评论的头像
            if (comment.children && comment.children.length > 0) {
              for (const child of comment.children) {
                if (child.avatar) {
                  child.avatar = await convertAvatarUrl(child.avatar)
                } else {
                  child.avatar = DEFAULT_AVATAR
                }
              }
            }
          }
          this.comments = comments
        }
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    },

    // 发表评论
    async submitComment() {
      if (!this.id) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      if (!this.commentContent.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }

      this.submittingComment = true
      try {
        const res = await addComment({
          postId: this.post.postId,
          content: this.commentContent
        })
        if (res.code === 200) {
          this.$message.success('评论成功')
          this.commentContent = ''
          this.loadComments()
          this.loadPostDetail() // 刷新评论数
        } else {
          this.$message.error(res.msg || '评论失败')
        }
      } catch (error) {
        console.error('评论失败:', error)
        this.$message.error('评论失败，请稍后重试')
      } finally {
        this.submittingComment = false
      }
    },

    // 回复评论
    handleReply(comment) {
      if (!this.id) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.replyToComment = comment
      this.replyContent = ''
      this.replyDialogVisible = true
    },

    // 提交回复
    async submitReply() {
      if (!this.replyContent.trim()) {
        this.$message.warning('请输入回复内容')
        return
      }

      this.submittingReply = true
      try {
        const res = await addComment({
          postId: this.post.postId,
          content: this.replyContent,
          parentId: this.replyToComment.commentId,
          replyToUserId: this.replyToComment.userId,
          replyToUserName: this.replyToComment.userName
        })
        if (res.code === 200) {
          this.$message.success('回复成功')
          this.replyDialogVisible = false
          this.loadComments()
          this.loadPostDetail()
        } else {
          this.$message.error(res.msg || '回复失败')
        }
      } catch (error) {
        console.error('回复失败:', error)
        this.$message.error('回复失败，请稍后重试')
      } finally {
        this.submittingReply = false
      }
    },

    // 点赞帖子
    async handleLike() {
      if (!this.id) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        const res = await togglePostLike(this.post.postId)
        if (res.code === 200) {
          this.post.hasLiked = res.liked
          this.post.likeCount += res.liked ? 1 : -1
          this.$message.success(res.msg)
        }
      } catch (error) {
        console.error('点赞失败:', error)
      }
    },

    // 点赞评论
    async handleCommentLike(comment) {
      if (!this.id) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        const res = await toggleCommentLike(comment.commentId)
        if (res.code === 200) {
          comment.hasLiked = res.liked
          comment.likeCount += res.liked ? 1 : -1
        }
      } catch (error) {
        console.error('点赞失败:', error)
      }
    },

    // 编辑帖子
    handleEdit() {
      this.$router.push(`/forum/post?id=${this.post.postId}`)
    },

    // 删除帖子
    handleDelete() {
      this.$confirm('确定要删除这个帖子吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await deletePost(this.post.postId)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.goBack()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      }).catch(() => {})
    },

    // 删除评论
    handleDeleteComment(comment) {
      this.$confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await deleteComment(comment.commentId)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.loadComments()
          this.loadPostDetail()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      }).catch(() => {})
    },

    // 判断是否是评论作者
    isCommentAuthor(comment) {
      return this.id && comment.userName === this.id
    },

    // 格式化内容（换行转br）
    formatContent(content) {
      if (!content) return ''
      return content.replace(/\n/g, '<br/>')
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      const now = new Date()
      const postTime = new Date(time)
      const diff = now - postTime
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return postTime.toLocaleString()
    },

    // 返回列表
    goBack() {
      this.$router.push('/forum/index')
    }
  }
}
</script>

<style scoped>
.forum-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5f1 100%);
  padding: 20px;
}

.detail-content {
  max-width: 900px;
  margin: 0 auto;
}

/* 返回按钮 */
.back-btn {
  margin-bottom: 20px;
  border-radius: 20px;
}

/* 帖子详情卡片 */
.post-detail-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(26, 200, 154, 0.2);
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 13px;
  color: #999;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.post-content {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 24px;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.post-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  cursor: pointer;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.post-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #999;
}

.stat-item i {
  font-size: 16px;
}

.like-btn {
  border-radius: 20px;
  padding: 8px 24px;
  transition: all 0.3s ease;
}

.like-btn.active {
  background: linear-gradient(135deg, #1ac89a 0%, #16a085 100%);
  color: white;
  border-color: #1ac89a;
}

.like-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 200, 154, 0.3);
}

/* 评论区 */
.comments-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.comments-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
}

.comment-input-box {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(26, 200, 154, 0.2);
  flex-shrink: 0;
  object-fit: cover;
}

.comment-input >>> .el-textarea__inner {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.comment-input >>> .el-textarea__inner:focus {
  border-color: #1ac89a;
  box-shadow: 0 0 0 2px rgba(26, 200, 154, 0.1);
}

.comment-submit {
  text-align: right;
  margin-bottom: 32px;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-user-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 52px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 20px;
  margin-left: 52px;
}

.comment-like,
.comment-reply,
.comment-delete {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s ease;
}

.comment-like:hover,
.comment-reply:hover {
  color: #1ac89a;
}

.comment-delete:hover {
  color: #ff6b6b;
}

.comment-like.active {
  color: #1ac89a;
}

/* 子评论 */
.sub-comments {
  margin: 16px 0 0 52px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.sub-comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #e8e8e8;
}

.sub-comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.sub-comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.sub-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(26, 200, 154, 0.2);
  object-fit: cover;
}

.sub-comment-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-comment-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.reply-to {
  font-size: 13px;
  color: #1ac89a;
}

.sub-comment-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 8px 40px;
}

.sub-comment-actions {
  display: flex;
  justify-content: space-between;
  margin-left: 40px;
}

.sub-comment-time {
  font-size: 12px;
  color: #999;
}

/* 空评论状态 */
.empty-comments {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-comments i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 12px;
}

.empty-comments p {
  font-size: 15px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-detail-card {
    padding: 20px;
  }
  
  .post-title {
    font-size: 22px;
  }
  
  .post-content {
    font-size: 15px;
  }
  
  .comments-section {
    padding: 16px;
  }
  
  .comment-content,
  .sub-comment-content {
    margin-left: 0;
  }
  
  .comment-actions {
    margin-left: 0;
  }
  
  .sub-comments {
    margin-left: 0;
  }
}
</style>
