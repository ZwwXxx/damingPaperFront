<template>
  <div class="my-posts-container">
    <div class="header">
      <h2 class="title">
        <i class="el-icon-s-order"></i>
        我的帖子
      </h2>
      <el-button type="primary" icon="el-icon-plus" @click="createPost">
        发布新帖
      </el-button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ totalPosts }}</div>
        <div class="stat-label">全部帖子</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalLikes }}</div>
        <div class="stat-label">获赞总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalComments }}</div>
        <div class="stat-label">评论总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalViews }}</div>
        <div class="stat-label">浏览总数</div>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div v-loading="loading" class="posts-list">
      <div v-if="!loading && postList.length === 0" class="empty-state">
        <i class="el-icon-document-copy"></i>
        <p>还没有发布过帖子</p>
        <el-button type="primary" @click="createPost">立即发帖</el-button>
      </div>

      <div v-for="post in postList" :key="post.postId" class="post-item">
        <!-- 帖子头部 -->
        <div class="post-header">
          <div class="post-info">
            <h3 class="post-title" @click="viewPost(post.postId)">
              <span v-if="post.isTop === 1" class="badge badge-top">置顶</span>
              <span v-if="post.isHot === 1" class="badge badge-hot">热门</span>
              {{ post.title }}
            </h3>
            <div class="post-time">发布于 {{ formatTime(post.createTime) }}</div>
          </div>
          <div class="post-actions">
            <el-button size="small" icon="el-icon-view" @click="viewPost(post.postId)">
              查看
            </el-button>
            <el-button size="small" icon="el-icon-edit" @click="editPost(post.postId)">
              编辑
            </el-button>
            <el-button size="small" type="danger" icon="el-icon-delete" @click="deletePost(post)">
              删除
            </el-button>
          </div>
        </div>

        <!-- 帖子内容预览 -->
        <div class="post-content-preview" v-html="getContentPreview(post.content)"></div>

        <!-- 帖子统计 -->
        <div class="post-stats">
          <span class="stat-item">
            <i class="el-icon-view"></i>
            {{ post.viewCount || 0 }} 浏览
          </span>
          <span class="stat-item">
            <i class="el-icon-thumb"></i>
            {{ post.likeCount || 0 }} 点赞
          </span>
          <span class="stat-item">
            <i class="el-icon-chat-line-round"></i>
            {{ post.commentCount || 0 }} 评论
          </span>
          <span class="stat-item">
            <i class="el-icon-time"></i>
            {{ formatTime(post.updateTime) }} 更新
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPostList, deletePost } from '@/api/forum'
import { mapGetters } from 'vuex'

export default {
  name: 'MyPosts',
  data() {
    return {
      loading: false,
      postList: [],
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalViews: 0
    }
  },
  computed: {
    ...mapGetters(['id'])
  },
  mounted() {
    this.loadMyPosts()
  },
  methods: {
    // 加载我的帖子
    async loadMyPosts() {
      this.loading = true
      try {
        const res = await getPostList({
          userId: this.id,  // 只查询当前用户的帖子
          status: 1
        })
        
        if (res.code === 200) {
          this.postList = res.list || []
          
          // 计算统计数据
          this.totalPosts = this.postList.length
          this.totalLikes = this.postList.reduce((sum, post) => sum + (post.likeCount || 0), 0)
          this.totalComments = this.postList.reduce((sum, post) => sum + (post.commentCount || 0), 0)
          this.totalViews = this.postList.reduce((sum, post) => sum + (post.viewCount || 0), 0)
        }
      } catch (error) {
        console.error('加载帖子列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 获取内容预览（纯文本，最多100字）
    getContentPreview(content) {
      if (!content) return ''
      
      // 移除HTML标签
      const text = content.replace(/<[^>]+>/g, '')
      
      // 截取前100个字符
      return text.length > 100 ? text.substring(0, 100) + '...' : text
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

    // 查看帖子
    viewPost(postId) {
      this.$router.push(`/forum/detail/${postId}`)
    },

    // 编辑帖子
    editPost(postId) {
      this.$router.push(`/forum/post?id=${postId}`)
    },

    // 发布新帖
    createPost() {
      this.$router.push('/forum/post')
    },

    // 删除帖子
    deletePost(post) {
      this.$confirm(`确定要删除帖子"${post.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deletePost(post.postId)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadMyPosts()  // 重新加载列表
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.my-posts-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title i {
  color: #1ac89a;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 帖子列表 */
.posts-list {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 24px;
}

/* 帖子项 */
.post-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-title:hover {
  color: #1ac89a;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-top {
  background: #ff6b6b;
  color: white;
}

.badge-hot {
  background: #feca57;
  color: white;
}

.post-time {
  font-size: 13px;
  color: #999;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.post-content-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  padding-left: 4px;
}

.post-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.stat-item i {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .post-header {
    flex-direction: column;
  }

  .post-actions {
    margin-top: 12px;
    width: 100%;
  }

  .post-actions .el-button {
    flex: 1;
  }
}
</style>
