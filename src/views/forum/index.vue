<template>
  <div class="forum-container">
    <!-- 头部搜索栏 -->
    <div class="forum-header">
      <div class="header-content">
        <h1 class="forum-title">💬 交流论坛</h1>
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索帖子..."
            prefix-icon="el-icon-search"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" class="post-btn" @click="goToPost">
            <i class="el-icon-edit"></i> 发帖
          </el-button>
        </div>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="forum-content">
      <div v-loading="loading" class="post-list">
        <!-- 空状态 -->
        <div v-if="!loading && postList.length === 0" class="empty-state">
          <i class="el-icon-document-copy"></i>
          <p>还没有帖子，快来发布第一个吧！</p>
        </div>

        <!-- 帖子卡片 -->
        <div
          v-for="post in postList"
          :key="post.postId"
          class="post-card"
          @click="goToDetail(post.postId)"
        >
          <!-- 置顶标签 -->
          <div v-if="post.isTop === 1" class="top-badge">
            <i class="el-icon-top"></i> 置顶
          </div>

          <!-- 热门标签 -->
          <div v-if="post.isHot === 1" class="hot-badge">
            <i class="el-icon-star-on"></i> 热门
          </div>

          <!-- 用户信息 -->
          <div class="post-header">
            <div class="user-info">
              <img :src="post.avatar || defaultAvatar" class="user-avatar" />
              <div class="user-details">
                <span class="user-name">{{ post.nickName || post.userName }}</span>
                <span class="post-time">{{ formatTime(post.createTime) }}</span>
              </div>
            </div>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content">
            <h2 class="post-title">{{ post.title }}</h2>
            <p class="post-text">{{ truncateText(post.content, 120) }}</p>
            
            <!-- 图片预览 -->
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img
                v-for="(img, index) in post.images.slice(0, 3)"
                :key="index"
                :src="img"
                class="post-image"
              />
              <div v-if="post.images.length > 3" class="more-images">
                +{{ post.images.length - 3 }}
              </div>
            </div>
          </div>

          <!-- 帖子统计 -->
          <div class="post-stats">
            <div class="stat-item">
              <i class="el-icon-view"></i>
              <span>{{ post.viewCount || 0 }}</span>
            </div>
            <div class="stat-item" :class="{ active: post.hasLiked }">
              <i class="el-icon-thumb"></i>
              <span>{{ post.likeCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-chat-line-round"></i>
              <span>{{ post.commentCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPostList } from '@/api/forum'
import { DEFAULT_AVATAR } from '@/utils/constants'
import { convertAvatarUrl } from '@/utils/oss'

export default {
  name: 'ForumIndex',
  data() {
    return {
      loading: false,
      searchKeyword: '',
      postList: [],
      defaultAvatar: DEFAULT_AVATAR
    }
  },
  mounted() {
    this.loadPostList()
  },
  methods: {
    // 加载帖子列表
    async loadPostList() {
      this.loading = true
      try {
        const res = await getPostList({
          title: this.searchKeyword || undefined,
          status: 1
        })
        if (res.code === 200) {
          const list = res.list || []
          // 处理头像URL（转换OSS签名URL）
          for (const post of list) {
            if (post.avatar) {
              post.avatar = await convertAvatarUrl(post.avatar)
            } else {
              post.avatar = DEFAULT_AVATAR
            }
          }
          this.postList = list
        }
      } catch (error) {
        console.error('加载帖子列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    // 搜索
    handleSearch() {
      this.loadPostList()
    },
    
    // 跳转到发帖页面
    goToPost() {
      this.$router.push('/forum/post')
    },
    
    // 跳转到帖子详情
    goToDetail(postId) {
      this.$router.push(`/forum/detail/${postId}`)
    },
    
    // 截断文本
    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
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
      
      return postTime.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.forum-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5f1 100%);
  padding-bottom: 40px;
}

/* 头部搜索栏 */
.forum-header {
  background: linear-gradient(135deg, #1ac89a 0%, #16a085 100%);
  padding: 30px 20px;
  box-shadow: 0 4px 12px rgba(26, 200, 154, 0.2);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.forum-title {
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  max-width: 500px;
}

.search-input >>> .el-input__inner {
  height: 48px;
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  padding-left: 45px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input >>> .el-input__inner:focus {
  background: white;
  box-shadow: 0 4px 16px rgba(26, 200, 154, 0.3);
}

.post-btn {
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  background: white;
  color: #1ac89a;
  border: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: #f0fdf9;
}

/* 内容区域 */
.forum-content {
  max-width: 1200px;
  margin: 30px auto 0;
  padding: 0 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 帖子卡片 */
.post-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #1ac89a 0%, #16a085 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(26, 200, 154, 0.15);
}

.post-card:hover::before {
  opacity: 1;
}

/* 标签 */
.top-badge,
.hot-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.top-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.hot-badge {
  background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%);
  color: white;
  right: 16px;
}

.top-badge + .hot-badge {
  right: 90px;
}

/* 用户信息 */
.post-header {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid rgba(26, 200, 154, 0.2);
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 13px;
  color: #999;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 16px;
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-text {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  word-break: break-word;
}

/* 图片预览 */
.post-images {
  display: flex;
  gap: 8px;
  position: relative;
}

.post-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

.more-images {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 帖子统计 */
.post-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #999;
  transition: all 0.3s ease;
}

.stat-item i {
  font-size: 16px;
}

.stat-item.active {
  color: #1ac89a;
}

.stat-item:hover {
  color: #1ac89a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .forum-title {
    font-size: 24px;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .post-card {
    padding: 16px;
  }
  
  .post-title {
    font-size: 18px;
  }
  
  .post-images {
    flex-wrap: wrap;
  }
  
  .post-image {
    width: calc(33.333% - 6px);
    height: 100px;
  }
}
</style>
