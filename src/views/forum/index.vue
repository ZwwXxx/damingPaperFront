<template>
  <div class="forum-container">
    <!-- 头部搜索栏 -->
    <div class="forum-header">
      <div class="header-content">
        <h1 class="forum-title">💬 交流论坛</h1>
        <div class="header-actions">
          <div class="search-wrapper">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索帖子标题、内容..."
              prefix-icon="el-icon-search"
              class="search-input"
              @keyup.enter="handleSearch"
              clearable
            />
            <el-button type="primary" class="search-btn" @click="handleSearch">
              搜索
            </el-button>
          </div>
          <el-button type="success" class="my-posts-btn" @click="goToMyPosts">
            <i class="el-icon-s-order"></i> 我的帖子
          </el-button>
          <el-button type="primary" class="post-btn" @click="goToPost">
            <i class="el-icon-edit"></i> 发帖
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-content">
        <!-- 分类筛选 -->
        <div class="filter-tabs">
          <span
            v-for="tab in filterTabs"
            :key="tab.value"
            :class="['filter-tab', { active: currentTab === tab.value }]"
            @click="handleTabChange(tab.value)"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </span>
        </div>

        <!-- 排序方式 -->
        <div class="sort-options">
          <span class="sort-label">排序：</span>
          <el-select v-model="sortBy" placeholder="请选择" class="sort-select" @change="handleSortChange">
            <el-option
              v-for="option in sortOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <i :class="option.icon"></i>
              {{ option.label }}
            </el-option>
          </el-select>
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
                @click.stop="handleImageClick(post.images, index)"
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

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="imagePreview.visible"
      :url-list="imagePreview.urls"
      :initial-index="imagePreview.index"
      :on-close="closeImagePreview"
    />
  </div>
</template>

<script>
import { getPostList } from '@/api/forum'
import { DEFAULT_AVATAR } from '@/utils/constants'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: 'ForumIndex',
  components: {
    ElImageViewer
  },
  data() {
    return {
      loading: false,
      searchKeyword: '',
      postList: [],
      defaultAvatar: DEFAULT_AVATAR,
      // 筛选标签
      currentTab: 'all',
      filterTabs: [
        { label: '全部', value: 'all', icon: 'el-icon-tickets' },
        { label: '热门', value: 'hot', icon: 'el-icon-star-on' }
      ],
      // 排序方式
      sortBy: 'latest',
      sortOptions: [
        { label: '最新', value: 'latest', icon: 'el-icon-time' },
        { label: '最热', value: 'hot', icon: 'el-icon-热门' },
        { label: '点赞数', value: 'like', icon: 'el-icon-thumb' },
        { label: '评论数', value: 'comment', icon: 'el-icon-chat-line-round' },
        { label: '浏览量', value: 'view', icon: 'el-icon-view' }
      ],
      imagePreview: {
        visible: false,
        urls: [],
        index: 0
      },
      bodyScrollLocked: false,
      originalBodyOverflow: '',
      originalHtmlOverflow: '',
      scrollPosition: 0,
      preventScrollHandler: null
    }
  },
  mounted() {
    this.loadPostList()
  },
  beforeDestroy() {
    this.unlockBodyScroll()
  },
  methods: {
    // 加载帖子列表
    async loadPostList() {
      this.loading = true
      try {
        // 构建查询参数
        const params = {
          title: this.searchKeyword || undefined,
          status: 1
        }

        // 根据当前标签过滤
        if (this.currentTab === 'hot') {
          params.isHot = 1
        }

        const res = await getPostList(params)
        if (res.code === 200) {
          let list = res.list || []
          
          // 处理头像URL（后端已返回完整CDN地址，直接使用）
          for (const post of list) {
            if (!post.avatar) {
              post.avatar = DEFAULT_AVATAR
            }
          }

          // 前端排序（根据选择的排序方式）
          list = this.sortPostList(list)
          
          this.postList = list
        }
      } catch (error) {
        console.error('加载帖子列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 排序帖子列表（置顶帖子始终排在最前面）
    sortPostList(list) {
      const sorted = [...list]
      
      // 先按选定的排序方式排序
      switch (this.sortBy) {
        case 'latest':
          // 按创建时间降序
          sorted.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
          break
        case 'hot':
          // 综合热度（点赞*2 + 评论*3 + 浏览/10）
          sorted.sort((a, b) => {
            const hotA = (a.likeCount || 0) * 2 + (a.commentCount || 0) * 3 + (a.viewCount || 0) / 10
            const hotB = (b.likeCount || 0) * 2 + (b.commentCount || 0) * 3 + (b.viewCount || 0) / 10
            return hotB - hotA
          })
          break
        case 'like':
          // 按点赞数降序
          sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          break
        case 'comment':
          // 按评论数降序
          sorted.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
          break
        case 'view':
          // 按浏览量降序
          sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          break
      }
      
      // 再按置顶状态排序，置顶帖子始终在最前面
      sorted.sort((a, b) => {
        // isTop: 1=置顶, 0/null=不置顶
        const aTop = a.isTop === 1 ? 1 : 0
        const bTop = b.isTop === 1 ? 1 : 0
        return bTop - aTop // 降序，置顶在前
      })
      
      return sorted
    },
    
    // 搜索
    handleSearch() {
      this.loadPostList()
    },

    // 切换筛选标签
    handleTabChange(tab) {
      this.currentTab = tab
      this.loadPostList()
    },

    // 排序方式变化
    handleSortChange() {
      // 重新排序当前列表
      this.postList = this.sortPostList(this.postList)
    },
    
    // 跳转到发帖页面
    goToPost() {
      this.$router.push('/forum/post')
    },

    // 跳转到我的帖子
    goToMyPosts() {
      this.$router.push('/person/posts')
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
    },

    // 处理图片点击
    handleImageClick(images, index) {
      if (!images || !images.length) return
      this.openImagePreview(images, index)
    },

    // 打开图片预览
    openImagePreview(urls, index) {
      this.imagePreview = {
        visible: true,
        urls,
        index
      }
      this.lockBodyScroll()
    },

    // 关闭图片预览
    closeImagePreview() {
      this.imagePreview.visible = false
      this.unlockBodyScroll()
    },

    // 锁定页面滚动
    lockBodyScroll() {
      if (this.bodyScrollLocked) return
      this.bodyScrollLocked = true
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      this.originalBodyOverflow = document.body.style.overflow
      this.originalHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${this.scrollPosition}px`
      document.body.style.width = '100%'
      this.preventScrollHandler = e => e.preventDefault()
      window.addEventListener('wheel', this.preventScrollHandler, { passive: false })
      window.addEventListener('touchmove', this.preventScrollHandler, { passive: false })
    },

    // 解锁页面滚动
    unlockBodyScroll() {
      if (!this.bodyScrollLocked) return
      this.bodyScrollLocked = false
      document.body.style.overflow = this.originalBodyOverflow || ''
      document.documentElement.style.overflow = this.originalHtmlOverflow || ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (this.preventScrollHandler) {
        window.removeEventListener('wheel', this.preventScrollHandler)
        window.removeEventListener('touchmove', this.preventScrollHandler)
        this.preventScrollHandler = null
      }
      window.scrollTo(0, this.scrollPosition || 0)
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
  align-items: center;
}

.search-wrapper {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 600px;
}

.search-input {
  flex: 1;
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

.search-btn {
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  background: white;
  color: #1ac89a;
  border: none;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: #f0fdf9;
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

.my-posts-btn {
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  background: white;
  color: #67c23a;
  border: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.my-posts-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: #f0f9ff;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.filter-tab i {
  font-size: 14px;
}

.filter-tab:hover {
  color: #1ac89a;
  background: rgba(26, 200, 154, 0.1);
}

.filter-tab.active {
  color: white;
  background: linear-gradient(135deg, #1ac89a 0%, #16a085 100%);
  box-shadow: 0 2px 8px rgba(26, 200, 154, 0.3);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.sort-select {
  width: 140px;
}

.sort-select >>> .el-input__inner {
  height: 36px;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.sort-select >>> .el-input__inner:focus {
  border-color: #1ac89a;
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
  cursor: zoom-in;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-image:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
    gap: 8px;
  }

  .search-wrapper {
    max-width: 100%;
    width: 100%;
  }
  
  .search-input {
    max-width: 100%;
  }

  .search-btn {
    padding: 0 24px;
  }

  .post-btn {
    width: 100%;
  }

  .filter-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .filter-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .filter-tab {
    white-space: nowrap;
  }

  .sort-options {
    width: 100%;
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
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
