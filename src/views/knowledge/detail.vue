<template>
  <div class="knowledge-detail">
    <el-card v-loading="loading" class="box-card">
      <!-- 返回按钮 -->
      <div class="back-btn">
        <el-button size="small" icon="el-icon-back" @click="goBack">返回列表</el-button>
      </div>

      <el-row class="detail-layout" v-if="pointDetail">
        <!-- 左侧主内容区域 -->
        <el-col :xs="24" :sm="18">
      <div class="detail-content">
        <!-- 标题区域 -->
        <div class="detail-header">
          <h1 class="title">{{ pointDetail.title }}</h1>
          <div class="meta-info">
            <el-tag size="small">{{ pointDetail.subjectName }}</el-tag>
            <el-tag
              v-if="pointDetail.difficulty"
              size="small"
              :type="getDifficultyTag(pointDetail.difficulty)"
            >
              {{ getDifficultyName(pointDetail.difficulty) }}
            </el-tag>
            <span class="time">
              <i class="el-icon-time"></i>
              {{ formatTime(pointDetail.createTime) }}
            </span>
          </div>
        </div>

        <el-divider></el-divider>

        <!-- 知识点内容 -->
        <div class="content-section">
          <div class="content-box" v-html="formatContent(pointDetail.content)"></div>
        </div>

        <!-- 示例代码 -->
        <div v-if="pointDetail.example" class="example-section">
          <h3 class="section-title">💡 示例</h3>
          <div class="example-box">
            <pre><code>{{ pointDetail.example }}</code></pre>
          </div>
        </div>

        <!-- 注意事项 -->
        <div v-if="pointDetail.note" class="note-section">
          <h3 class="section-title">⚠️ 注意事项</h3>
          <div class="note-box" v-html="formatContent(pointDetail.note)"></div>
        </div>

        <!-- 参考链接 -->
        <div v-if="pointDetail.reference" class="reference-section">
          <h3 class="section-title">🔗 参考链接</h3>
          <div class="reference-box" v-html="formatContent(pointDetail.reference)"></div>
        </div>

        <el-divider></el-divider>

        <!-- 统计和操作区域 -->
        <div class="action-section">
          <div class="stats">
            <span class="stat-item">
              <i class="el-icon-view"></i> 浏览 {{ pointDetail.viewCount }}
            </span>
            <span class="stat-item">
              <i class="el-icon-thumb"></i> 点赞 {{ pointDetail.likeCount }}
            </span>
            <span class="stat-item">
              <i class="el-icon-folder"></i> 收藏 {{ pointDetail.collectCount }}
            </span>
            <span class="stat-item">
              <i class="el-icon-chat-line-round"></i> 评论 {{ totalCommentCount }}
            </span>
          </div>
          <div class="actions">
            <el-button
              v-if="pointDetail.authorId === currentUserId"
              type="success"
              icon="el-icon-edit"
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button
              :type="pointDetail.isLiked ? 'primary' : 'default'"
              :icon="pointDetail.isLiked ? 'el-icon-thumb' : 'el-icon-thumb'"
              @click="handleLike"
            >
              {{ pointDetail.isLiked ? '已点赞' : '点赞' }}
            </el-button>
            <el-dropdown trigger="click" @command="handleFolderCommand" @visible-change="onCollectDropdownChange">
              <el-button
                :type="pointDetail.isCollected ? 'warning' : 'default'"
                :icon="pointDetail.isCollected ? 'el-icon-folder-checked' : 'el-icon-folder'"
              >
                {{ pointDetail.isCollected ? '已收藏' : '收藏' }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <div class="collect-folder-menu">
                  <div class="folder-header">选择收藏夹</div>
                  <div v-if="userFolders.length === 0" class="no-folders">
                    <span>还没有收藏夹</span>
                  </div>
                  <div v-else>
                    <el-dropdown-item
                      v-for="folder in userFolders"
                      :key="folder.folderId"
                      :command="`collect-${folder.folderId}`"
                      class="folder-item"
                    >
                      <div class="folder-info">
                        <span class="folder-name">
                          <i class="el-icon-folder" v-if="folder.isDefault"></i>
                          <i class="el-icon-folder-opened" v-else></i>
                          {{ folder.folderName }}
                        </span>
                        <span class="folder-count">{{ folder.collectCount }}</span>
                      </div>
                    </el-dropdown-item>
                  </div>
                  <el-divider style="margin: 8px 0;"></el-divider>
                  <el-dropdown-item command="create-folder" class="create-folder-item">
                    <i class="el-icon-plus"></i> 新建收藏夹
                  </el-dropdown-item>
                </div>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>

        <el-divider></el-divider>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <h3 class="section-title">💬 讨论交流 ({{ totalCommentCount }})</h3>
          </div>

          <!-- 发表评论 -->
          <div class="comment-input-section">
            <div class="comment-input-box">
              <img :src="currentUserAvatar" class="comment-avatar" />
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="3"
                placeholder="分享你的学习心得或疑问..."
                class="comment-input"
                maxlength="500"
                show-word-limit
              />
            </div>
            <div class="comment-submit">
              <el-button 
                type="primary" 
                :loading="submittingComment" 
                @click="submitComment"
                size="medium"
              >
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div v-if="comments.length > 0" class="comments-list">
            <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
              <!-- 评论头部 -->
              <div class="comment-header">
                <img :src="comment.avatar || defaultAvatar" class="comment-avatar" />
                <div class="comment-user-info">
                  <span class="comment-user-name">
                    {{ comment.nickName || comment.userName }}
                    <span v-if="isCommentAuthor(comment)" class="author-badge">（你）</span>
                  </span>
                  <span class="comment-time">{{ formatRelativeTime(comment.createTime) }}</span>
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
                  v-for="reply in getVisibleReplies(comment)"
                  :key="reply.commentId"
                  class="sub-comment-item"
                >
                  <div class="sub-comment-header">
                    <img :src="reply.avatar || defaultAvatar" class="sub-comment-avatar" />
                    <div class="sub-comment-user-info">
                      <span class="sub-comment-user-name">
                        {{ reply.nickName || reply.userName }}
                        <span v-if="isCommentAuthor(reply)" class="author-badge">（你）</span>
                      </span>
                      <span v-if="shouldShowReplyTo(reply, comment)" class="reply-to">
                        回复 @{{ reply.replyToNickName || reply.replyToUserName }}
                      </span>
                    </div>
                  </div>
                  <div class="sub-comment-content">{{ reply.content }}</div>
                  <div class="sub-comment-actions">
                    <span class="sub-comment-time">{{ formatRelativeTime(reply.createTime) }}</span>
                    <span
                      :class="['comment-like', { active: reply.hasLiked }]"
                      @click="handleCommentLike(reply)"
                    >
                      <i class="el-icon-thumb"></i>
                      {{ reply.likeCount || 0 }}
                    </span>
                    <span class="comment-reply" @click="handleReply(reply, comment)">
                      <i class="el-icon-chat-dot-round"></i>
                      回复
                    </span>
                    <span
                      v-if="isCommentAuthor(reply)"
                      class="comment-delete"
                      @click="handleDeleteComment(reply)"
                    >
                      <i class="el-icon-delete"></i>
                      删除
                    </span>
                  </div>
                </div>
                
                <!-- 展开/收起按钮 -->
                <div v-if="comment.children.length > 2" class="sub-comments-toggle">
                  <span @click="toggleReplies(comment.commentId)" class="toggle-btn">
                    <template v-if="expandedComments[comment.commentId]">
                      <i class="el-icon-arrow-up"></i>
                      收起回复
                    </template>
                    <template v-else>
                      <i class="el-icon-arrow-down"></i>
                      展开更多回复 ({{ comment.children.length - 2 }}条)
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空评论状态 -->
          <div v-else class="empty-comments">
            <i class="el-icon-chat-line-round"></i>
            <p>还没有评论，来发表第一条评论吧~</p>
          </div>
        </div>
      </div>
        </el-col>

        <!-- 右侧目录区域 -->
        <el-col :xs="0" :sm="6">
          <div class="directory-wrapper">
            <div class="directory" ref="directory" :style="fixedCata">
              <div class="directory-title">文章目录</div>
              <div class="directory-items">
                <ul class="catalog-list" v-show="titles.length > 0">
                  <li v-for="(anchor, index) in titles" :key="index" v-show="shouldShowTitle(index)">
                    <div class="title-wrapper" :style="{ paddingLeft: anchor.indent * 15 + 'px' }">
                      <!-- 有子标题的展开项 -->
                      <div v-if="hasChildren(index)" class="expandable-title" @click="toggleExpand(index)">
                        <span class="expand-icon" :class="{ 'expanded': expandedTitles.has(index) }">▼</span>
                        <span class="title-text" @click.stop="handleAnchorClick(anchor)">{{ anchor.title }}</span>
                      </div>
                      <!-- 普通标题 -->
                      <a v-else @click="handleAnchorClick(anchor)" :id="anchor.id" class="normal-title">
                        <span v-if="anchor.level > 1" class="child-icon">•</span>
                        {{ anchor.title }}
                      </a>
                    </div>
                  </li>
                </ul>
                <div v-show="titles.length === 0" class="no-catalog">暂无目录</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="imagePreview.visible"
      :url-list="imagePreview.urls"
      :initial-index="imagePreview.index"
      :on-close="closeImagePreview"
    />

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
import {
  getKnowledgePointBase,
  getKnowledgePointContent,
  toggleLike,
  toggleCollect,
  getKnowledgeComments,
  addKnowledgeComment,
  deleteKnowledgeComment,
  toggleCommentLike,
  getUserFolders,
  collectToFolder,
  createFolder
} from '@/api/knowledge'
import { marked } from 'marked'
import { mapGetters } from 'vuex'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: 'KnowledgeDetail',
  computed: {
    ...mapGetters(['avatar', 'id']),
    currentUserAvatar() {
      return this.avatar || '/default-avatar.png'
    },
    currentUserId() {
      return this.$store.getters.userId || this.id
    },
    // 计算总评论数（一级评论 + 所有二级评论）
    totalCommentCount() {
      if (!this.comments || this.comments.length === 0) {
        return 0
      }
      let total = this.comments.length // 一级评论数
      this.comments.forEach(comment => {
        if (comment.children && comment.children.length > 0) {
          total += comment.children.length // 加上二级评论数
        }
      })
      return total
    }
  },
  data() {
    return {
      loading: false,
      pointDetail: null,
      titles: [], // 目录标题列表
      titlesDoms: [], // 目录对应的 DOM 元素
      expandedTitles: new Set(), // 展开的标题索引
      fixedCata: {
        width: ''
      },
      scrollHandler: null,
      // 评论相关数据
      comments: [],
      commentContent: '',
      submittingComment: false,
      replyDialogVisible: false,
      replyContent: '',
      replyToComment: null,
      parentComment: null,
      submittingReply: false,
      defaultAvatar: '/default-avatar.png',
      expandedComments: {}, // 存储每个评论的展开状态
      // 收藏夹相关数据
      userFolders: [], // 用户的收藏夹列表
      createFolderDialog: false,
      newFolder: {
        folderName: '',
        description: '',
        isPublic: 0
      },
      // 图片预览相关数据
      imagePreview: {
        visible: false,
        urls: [],
        index: 0
      },
      // 记录滚动位置
      scrollTop: undefined
    }
  },
  created() {
    // 支持两种方式传参：params.pointId 或 query.id
    const pointId = this.$route.params.pointId || this.$route.query.id
    console.log('知识点ID:', pointId, 'params:', this.$route.params, 'query:', this.$route.query)
    if (pointId) {
      this.loadDetail(pointId)
    } else {
      console.error('未获取到知识点ID')
    }
  },
  mounted() {
    // 监听滚动事件，实现目录高亮和固定定位
    this.scrollHandler = this.debounce(this.handleScroll, 0)
    window.addEventListener('scroll', this.scrollHandler)
    window.addEventListener('resize', this.resizeCate)
    
    // 初始化图片预览功能
    this.initImagePreview()
  },
  methods: {
    /** 加载详情 - 优化的分步查询方案 */
    async loadDetail(pointId) {
      this.loading = true
      
      try {
        // 方案1: 如果从列表页传入了基础数据，直接使用
        if (this.$route.params.baseData) {
          this.pointDetail = { ...this.$route.params.baseData }
          console.log('使用列表传入的基础数据')
        } 
        // 方案2: 直接访问详情页，先获取基础信息
        else {
          console.log('直接访问详情页，获取基础信息')
          const baseResponse = await getKnowledgePointBase(pointId)
          this.pointDetail = baseResponse.data
        }
        
        // 异步加载内容详情（大字段）- 该接口会同时触发后端增加浏览量
        const contentResponse = await getKnowledgePointContent(pointId)
        
        // 前端组装完整数据，并同步展示 +1 后的浏览量
        this.pointDetail = {
          ...this.pointDetail,
          content: contentResponse.data.content,
          contentHtml: contentResponse.data.contentHtml,
          auditRemark: contentResponse.data.auditRemark,
          viewCount: (this.pointDetail.viewCount || 0) + 1
        }
        
        console.log('详情数据加载完成', this.pointDetail)
        
      } catch (error) {
        console.error('加载失败:', error)
        this.$message.error('加载失败')
        this.$router.back()
      } finally {
        this.loading = false
        // 等待 DOM 渲染后生成目录和绑定图片事件
        this.$nextTick(() => {
          this.getTitles()
          // 内容渲染完成后重新绑定图片预览事件
          this.bindImageClickEvents()
        })
        // 加载评论
        this.loadComments()
      }
    },
    /** 点赞 */
    handleLike() {
      toggleLike(this.pointDetail.pointId)
        .then(response => {
          this.$message.success(response.msg)
          this.pointDetail.isLiked = response.data
          if (response.data) {
            this.pointDetail.likeCount++
          } else {
            this.pointDetail.likeCount--
          }
        })
        .catch(() => {
          this.$message.error('操作失败，请先登录')
        })
    },
    /** 编辑 */
    handleEdit() {
      this.$router.push({ name: 'knowledgePublish', query: { pointId: this.pointDetail.pointId } })
    },
    /** 收藏（使用默认收藏夹） */
    handleCollect() {
      toggleCollect(this.pointDetail.pointId)
        .then(response => {
          this.$message.success(response.msg)
          this.pointDetail.isCollected = response.data
          if (response.data) {
            this.pointDetail.collectCount++
          } else {
            this.pointDetail.collectCount--
          }
          // 重新加载收藏夹列表以更新数量
          this.loadUserFolders()
        })
        .catch(() => {
          this.$message.error('操作失败，请先登录')
        })
    },

    /** 收藏夹下拉菜单显隐事件 */
    onCollectDropdownChange(visible) {
      if (visible) {
        this.loadUserFolders()
      }
    },

    /** 加载用户收藏夹列表 */
    async loadUserFolders() {
      try {
        const response = await getUserFolders()
        if (response.code === 200) {
          this.userFolders = response.data
        }
      } catch (error) {
        console.error('获取收藏夹失败:', error)
      }
    },

    /** 处理收藏夹菜单命令 */
    handleFolderCommand(command) {
      if (command === 'create-folder') {
        this.showCreateFolderDialog()
      } else if (command.startsWith('collect-')) {
        const folderId = command.replace('collect-', '')
        this.collectToSpecificFolder(parseInt(folderId))
      }
    },

    /** 收藏到指定收藏夹 */
    collectToSpecificFolder(folderId) {
      collectToFolder(this.pointDetail.pointId, folderId)
        .then(response => {
          this.$message.success(response.msg)
          this.pointDetail.isCollected = response.data
          if (response.data) {
            this.pointDetail.collectCount++
          } else {
            this.pointDetail.collectCount--
          }
          // 重新加载收藏夹列表以更新数量
          this.loadUserFolders()
        })
        .catch(() => {
          this.$message.error('操作失败，请先登录')
        })
    },

    /** 显示创建收藏夹对话框 */
    showCreateFolderDialog() {
      this.$prompt('请输入收藏夹名称', '创建收藏夹', {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/,
        inputErrorMessage: '收藏夹名称长度为1-50个字符'
      }).then(({ value }) => {
        this.createNewFolder(value)
      }).catch(() => {
        // 用户取消
      })
    },

    /** 创建新收藏夹 */
    async createNewFolder(folderName) {
      try {
        const response = await createFolder({
          folderName: folderName,
          description: '',
          isPublic: 0
        })
        if (response.code === 200) {
          this.$message.success('创建收藏夹成功')
          this.loadUserFolders()
        } else {
          this.$message.error(response.msg || '创建失败')
        }
      } catch (error) {
        this.$message.error('创建失败：' + error.message)
      }
    },
    /** 返回 */
    goBack() {
      const fromTab = this.$route.params.fromTab
      this.$router.push({
        path: '/knowledge',
        query: fromTab ? { tab: fromTab } : {}
      })
    },
    /** 获取难度名称 */
    getDifficultyName(difficulty) {
      const map = {
        1: '简单',
        2: '中等',
        3: '困难'
      }
      return map[difficulty] || ''
    },
    /** 获取难度标签 */
    getDifficultyTag(difficulty) {
      const map = {
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return map[difficulty] || 'info'
    },
    /** 格式化时间 */
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    /** 格式化内容（Markdown渲染） */
    formatContent(content) {
      if (!content) return ''
      try {
        let html = marked(content)
        // 处理图片标签，添加预览功能
        html = html.replace(/<img\s+([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*?)>/gi, (match, beforeSrc, src, afterSrc) => {
          // 提取alt属性
          const altMatch = match.match(/alt\s*=\s*["']([^"']*?)["']/i)
          const alt = altMatch ? altMatch[1] : ''
          
          return `<img src="${src}" alt="${alt}" class="content-image" data-preview="${src}" style="max-width: 100%; cursor: pointer; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); margin: 16px 0; display: block; transition: all 0.3s ease;" />`
        })
        return html
      } catch (error) {
        console.error('Markdown渲染失败:', error)
        return content.replace(/\n/g, '<br>')
      }
    },
    /** 提取标题生成目录 */
    getTitles() {
      this.$nextTick(() => {
        const contentBox = this.$el.querySelector('.content-box')
        if (!contentBox) return

        const anchors = contentBox.querySelectorAll('h1,h2,h3,h4,h5,h6')
        
        // 给标题设置id
        anchors.forEach((item, index) => {
          item.setAttribute('id', 'header-' + index)
        })
        
        // 存储 DOM 元素供滚动监听使用
        this.titlesDoms = Array.from(anchors)
        
        // 过滤空标题
        const titles = Array.from(anchors).filter(title => title.innerText.trim() !== '')
        if (!titles.length) {
          this.titles = []
          return
        }
        
        // 提取不同级别的标签
        const hTags = Array.from(new Set(titles.map(title => title.tagName))).sort()
        
        this.titles = titles.map((el, index) => ({
          id: 'header-' + index,
          title: el.innerText,
          level: Number(el.nodeName.substring(1, 2)),
          indent: hTags.indexOf(el.tagName)
        }))
      })
    },
    /** 判断是否有子标题 */
    hasChildren(index) {
      const currentLevel = this.titles[index].level
      for (let i = index + 1; i < this.titles.length; i++) {
        const nextLevel = this.titles[i].level
        if (nextLevel > currentLevel) {
          return true
        }
        if (nextLevel <= currentLevel) {
          break
        }
      }
      return false
    },
    /** 切换展开/收缩状态 */
    toggleExpand(index) {
      if (this.expandedTitles.has(index)) {
        this.expandedTitles.delete(index)
      } else {
        this.expandedTitles.add(index)
      }
      this.$forceUpdate()
    },
    /** 判断标题是否应该显示 */
    shouldShowTitle(index) {
      const currentTitle = this.titles[index]
      const currentLevel = currentTitle.level
      
      // 顶级标题始终显示
      if (currentLevel === 1) {
        return true
      }
      
      // 查找父级标题
      for (let i = index - 1; i >= 0; i--) {
        const parentTitle = this.titles[i]
        const parentLevel = parentTitle.level
        
        // 找到直接父级
        if (parentLevel < currentLevel) {
          return this.expandedTitles.has(i)
        }
      }
      
      return true
    },
    /** 展开所有父级标题 */
    expandParentTitles(index) {
      const currentTitle = this.titles[index]
      const currentLevel = currentTitle.level
      
      for (let i = index - 1; i >= 0; i--) {
        const parentTitle = this.titles[i]
        const parentLevel = parentTitle.level
        
        if (parentLevel < currentLevel) {
          this.expandedTitles.add(i)
          this.expandParentTitles(i)
          break
        }
      }
    },
    /** 查找可见的父级标题 */
    findVisibleParent(index) {
      const currentTitle = this.titles[index]
      const currentLevel = currentTitle.level
      
      if (this.shouldShowTitle(index)) {
        return index
      }
      
      for (let i = index - 1; i >= 0; i--) {
        const parentTitle = this.titles[i]
        const parentLevel = parentTitle.level
        
        if (parentLevel < currentLevel) {
          return this.findVisibleParent(i)
        }
      }
      
      return index
    },
    /** 点击目录锚点跳转 */
    handleAnchorClick(anchor) {
      const clickedIndex = this.titles.findIndex(title => title.id === anchor.id)
      
      if (clickedIndex !== -1) {
        // 展开所有父级标题
        this.expandParentTitles(clickedIndex)
        
        // 如果有子标题也展开
        if (this.hasChildren(clickedIndex)) {
          this.expandedTitles.add(clickedIndex)
        }
        
        this.$forceUpdate()
      }
      
      // 滚动到目标位置 - 精确定位到标题
      const heading = document.getElementById(anchor.id)
      if (heading) {
        // 使用 getBoundingClientRect 获取精确位置
        const rect = heading.getBoundingClientRect()
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
        
        // 计算目标滚动位置，使用固定偏移量，避免导航栏状态变化影响
        const targetScrollTop = currentScrollTop + rect.top
        const navOffset = 100 // 使用固定偏移量，适应导航栏隐藏和显示两种状态
        const finalScrollTop = targetScrollTop - navOffset
        
        window.scrollTo({
          top: Math.max(0, finalScrollTop), // 确保不会滚动到负数位置
          behavior: 'smooth'
        })
      }
    },
    /** 高亮目录项 */
    highlight(header) {
      // 清除所有高亮
      document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'))
      
      const headerIndex = this.titles.findIndex(title => title.id === header.id)
      if (headerIndex === -1) return
      
      const titleWrappers = document.querySelectorAll('.title-wrapper')
      if (titleWrappers[headerIndex]) {
        const titleElement = titleWrappers[headerIndex].querySelector('.expandable-title, .normal-title')
        if (titleElement) {
          titleElement.classList.add('highlight')
          this.scrollDirectoryToHighlight(titleElement)
        }
      }
    },
    /** 滚动目录到高亮位置 */
    scrollDirectoryToHighlight(targetElement) {
      const directoryItems = document.querySelector('.directory-items')
      if (!directoryItems || !targetElement) {
        return
      }
      
      const targetOffsetTop = targetElement.offsetTop
      const containerScrollTop = directoryItems.scrollTop
      const containerHeight = directoryItems.clientHeight
      const targetRelativeTop = targetOffsetTop - containerScrollTop
      
      if (targetRelativeTop < 0 || targetRelativeTop > containerHeight - targetElement.offsetHeight) {
        const scrollTo = targetOffsetTop - containerHeight / 2 + targetElement.offsetHeight / 2
        directoryItems.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        })
      }
    },
    /** 处理滚动事件 */
    handleScroll() {
      if (!this.titlesDoms.length) return
      
      const rects = Array.from(this.titlesDoms).map(titleDom => {
        return titleDom.getBoundingClientRect()
      })
      
      const range = 200
      const titleCheckHeight = 100 // 使用固定阈值，适应导航栏各种状态
      let targetTitleIndex = -1
      
      for (let i = 0; i < this.titlesDoms.length; i++) {
        const rect = rects[i]
        
        // 标题在视口内且距顶部小于范围值
        if (rect.top >= titleCheckHeight && rect.top <= range) {
          targetTitleIndex = i
          break
        }
        
        // 当前标题在视口上方，下一个标题在视口下方
        if (rect.top < titleCheckHeight && rects[i + 1] && rects[i + 1].top > document.documentElement.clientHeight) {
          targetTitleIndex = i
          break
        }
      }
      
      // 高亮目标标题
      if (targetTitleIndex !== -1) {
        const visibleTitleIndex = this.findVisibleParent(targetTitleIndex)
        const visibleTitleDom = this.titlesDoms[visibleTitleIndex]
        this.highlight(visibleTitleDom)
      }
      
      // 固定目录 - 参考主流网站设计，滚动一定距离后立即固定
      if (!this.$refs.directory) return
      
      const toTop = document.documentElement.scrollTop || document.body.scrollTop
      
      // 提前触发固定定位，避免出现间隙
      // 当滚动到目录原始位置附近时就触发，实现无缝过渡
      if (toTop > 50) {
        this.$refs.directory.classList.add('directory-fixed')
        this.fixedCata.width = this.$refs.directory.parentElement.clientWidth + 'px'
      } else {
        this.$refs.directory.classList.remove('directory-fixed')
      }
    },
    /** 防抖函数 */
    debounce(fn, delay = 100) {
      let timer = null
      return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          fn.apply(this, args)
        }, delay)
      }
    },
    /** 调整目录宽度 */
    resizeCate() {
      if (this.$refs.directory) {
        this.fixedCata.width = this.$refs.directory.parentElement.clientWidth + 'px'
      }
    },
    
    /** 加载评论列表 */
    async loadComments() {
      if (!this.pointDetail?.pointId) return
      
      try {
        const res = await getKnowledgeComments(this.pointDetail.pointId)
        if (res.code === 200) {
          const comments = res.data || []
          // 处理所有评论的头像URL
          for (const comment of comments) {
            if (!comment.avatar) {
              comment.avatar = this.defaultAvatar
            }
            // 处理子评论的头像
            if (comment.children && comment.children.length > 0) {
              for (const child of comment.children) {
                if (!child.avatar) {
                  child.avatar = this.defaultAvatar
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

    /** 发表评论 */
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
        const res = await addKnowledgeComment({
          pointId: this.pointDetail.pointId,
          content: this.commentContent
        })
        if (res.code === 200) {
          this.$message.success('评论成功')
          this.commentContent = ''
          this.loadComments()
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

    /** 回复评论 */
    handleReply(comment, parentComment = null) {
      if (!this.id) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.replyToComment = comment
      this.parentComment = parentComment
      this.replyContent = ''
      this.replyDialogVisible = true
    },

    /** 提交回复 */
    async submitReply() {
      if (!this.replyContent.trim()) {
        this.$message.warning('请输入回复内容')
        return
      }

      this.submittingReply = true
      try {
        const parentId = this.parentComment 
          ? this.parentComment.commentId 
          : this.replyToComment.commentId
        
        const replyToUserName = this.replyToComment.userName || this.replyToComment.nickName || '未知用户'
        const replyToNickName = this.replyToComment.nickName || this.replyToComment.userName
        
        const res = await addKnowledgeComment({
          pointId: this.pointDetail.pointId,
          content: this.replyContent,
          parentId: parentId,
          replyToUserId: this.replyToComment.userId,
          replyToUserName: replyToUserName,
          replyToNickName: replyToNickName,
          replyToCommentId: this.replyToComment.commentId // 添加被回复的评论ID
        })
        if (res.code === 200) {
          this.$message.success('回复成功')
          this.replyDialogVisible = false
          this.replyToComment = null
          this.parentComment = null
          this.loadComments()
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

    /** 点赞评论 */
    async handleCommentLike(comment) {
      if (!this.id) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        const res = await toggleCommentLike(comment.commentId)
        if (res.code === 200) {
          comment.hasLiked = res.data
          comment.likeCount += res.data ? 1 : -1
        }
      } catch (error) {
        console.error('点赞失败:', error)
      }
    },

    /** 删除评论 */
    handleDeleteComment(comment) {
      this.$confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteKnowledgeComment(comment.commentId)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadComments()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }).catch(() => {})
    },

    /** 判断是否是评论作者 */
    isCommentAuthor(comment) {
      return this.id && comment.userId && String(comment.userId) === String(this.id)
    },

    /** 获取可见的子评论列表 */
    getVisibleReplies(comment) {
      if (!comment.children || comment.children.length === 0) {
        return []
      }
      if (this.expandedComments[comment.commentId] || comment.children.length <= 2) {
        return comment.children
      }
      return comment.children.slice(0, 2)
    },

    /** 切换子评论展开/收起状态 */
    toggleReplies(commentId) {
      this.$set(this.expandedComments, commentId, !this.expandedComments[commentId])
    },

    /** 判断是否需要显示"回复@xxx" */
    shouldShowReplyTo(reply, parentComment) {
      // 如果没有回复目标信息，不显示
      if (!reply.replyToUserName && !reply.replyToNickName) {
        return false
      }
      
      // 新的精确判断逻辑：
      // 如果replyToCommentId等于parentComment.commentId，说明是直接回复一级评论
      // 否则，说明是回复子评论，需要显示"回复@xxx"
      
      if (reply.replyToCommentId && parentComment.commentId &&
          String(reply.replyToCommentId) === String(parentComment.commentId)) {
        // 直接回复一级评论，不显示"回复@xxx"
        return false
      }
      
      // 其他所有情况都显示"回复@xxx"，包括：
      // 1. 回复其他人的评论
      // 2. 回复楼主的子评论
      // 3. replyToCommentId为空或不匹配的情况
      return true
    },

    /** 格式化相对时间 */
    formatRelativeTime(time) {
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
    
    /** 初始化图片预览功能 */
    initImagePreview() {
      this.$nextTick(() => {
        this.bindImageClickEvents()
      })
    },
    
    /** 绑定图片点击事件 */
    bindImageClickEvents() {
      // 移除之前的事件监听
      document.removeEventListener('click', this.handleImageClick)
      // 添加新的事件监听
      document.addEventListener('click', this.handleImageClick)
    },
    
    /** 处理图片点击事件 */
    handleImageClick(event) {
      const target = event.target
      if (target.tagName === 'IMG' && target.hasAttribute('data-preview')) {
        event.preventDefault()
        event.stopPropagation()
        
        // 获取所有可预览的图片
        const allImages = Array.from(document.querySelectorAll('img[data-preview]'))
        const urls = allImages.map(img => img.getAttribute('data-preview'))
        const currentIndex = allImages.indexOf(target)
        
        this.showImagePreview(urls, currentIndex)
      }
    },
    
    /** 显示图片预览 */
    showImagePreview(urls, index = 0) {
      this.imagePreview = {
        visible: true,
        urls: urls,
        index: index
      }
      // 阻止背景页面滚动
      this.preventBodyScroll()
    },
    
    /** 关闭图片预览 */
    closeImagePreview() {
      this.imagePreview.visible = false
      // 恢复背景页面滚动
      this.restoreBodyScroll()
    },
    
    /** 阻止body滚动 */
    preventBodyScroll() {
      // 记录当前滚动位置
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      // 设置body样式阻止滚动
      document.body.style.cssText += `
        position: fixed;
        top: -${this.scrollTop}px;
        width: 100%;
        height: 100vh;
        overflow: hidden;
      `
    },
    
    /** 恢复body滚动 */
    restoreBodyScroll() {
      // 恢复body样式
      document.body.style.cssText = document.body.style.cssText
        .replace(/position:\s*fixed;?/gi, '')
        .replace(/top:\s*-?\d+px;?/gi, '')
        .replace(/width:\s*100%;?/gi, '')
        .replace(/height:\s*100vh;?/gi, '')
        .replace(/overflow:\s*hidden;?/gi, '')
      
      // 恢复滚动位置
      if (this.scrollTop !== undefined) {
        window.scrollTo(0, this.scrollTop)
        this.scrollTop = undefined
      }
    }
  },
  
  beforeDestroy() {
    // 清理滚动事件监听
    window.removeEventListener('scroll', this.scrollHandler)
    window.removeEventListener('resize', this.resizeCate)
    // 清理图片点击事件监听
    document.removeEventListener('click', this.handleImageClick)
    // 确保恢复页面滚动
    this.restoreBodyScroll()
  },
  
  components: {
    ElImageViewer
  }
}
</script>

<style scoped>
.knowledge-detail {
  padding: 20px;
  max-width: none;
  margin: 0;
  background: #f8f9fa;
}

.box-card {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

.back-btn {
  margin-bottom: 20px;
  padding: 10px 0;
}

.detail-content {
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.detail-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 15px 0;
}

.meta-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #909399;
}

.summary-section,
.content-section,
.example-section,
.note-section,
.reference-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.summary-text {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin: 0;
}

.content-box {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
}

/* 确保列表样式显示 - 多重选择器确保优先级 */
.knowledge-detail .content-section ul,
.content-section ul,
.content-box ul {
  list-style: disc !important;
  list-style-type: disc !important;
  padding-left: 30px !important;
  margin: 10px 0 !important;
}

.knowledge-detail .content-section ol,
.content-section ol,
.content-box ol {
  list-style: decimal !important;
  list-style-type: decimal !important;
  padding-left: 30px !important;
  margin: 10px 0 !important;
}

.knowledge-detail .content-section li,
.content-section li,
.content-box li {
  display: list-item !important;
  margin: 5px 0 !important;
  list-style: inherit !important;
}

/* Markdown样式 */
.content-box >>> h1,
.content-box >>> h2,
.content-box >>> h3,
.content-box >>> h4,
.content-box >>> h5,
.content-box >>> h6 {
  font-weight: bold;
  color: #303133;
  margin: 20px 0 10px;
  line-height: 1.4;
}

.content-box >>> h1 {
  font-size: 28px;
  border-bottom: 2px solid #ebeef5;
  padding-bottom: 10px;
}

.content-box >>> h2 {
  font-size: 24px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.content-box >>> h3 {
  font-size: 20px;
}

.content-box >>> h4 {
  font-size: 18px;
}

.content-box >>> h5,
.content-box >>> h6 {
  font-size: 16px;
}

.content-box >>> p {
  margin: 10px 0;
}

.content-box ::v-deep ul,
.content-box ::v-deep ol {
  padding-left: 30px;
  margin: 10px 0;
  list-style-position: outside;
}

.content-box ::v-deep ul {
  list-style-type: disc !important;
}

.content-box ::v-deep ol {
  list-style-type: decimal !important;
}

.content-box ::v-deep li {
  margin: 5px 0;
  display: list-item !important;
  list-style: inherit !important;
}

.content-box >>> code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #e83e8c;
}

.content-box >>> pre {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  margin: 15px 0;
}

.content-box >>> pre code {
  background: transparent;
  padding: 0;
  color: #303133;
}

.content-box >>> blockquote {
  border-left: 4px solid #409eff;
  padding-left: 15px;
  margin: 15px 0;
  color: #606266;
  background: #f5f7fa;
  padding: 10px 15px;
}

.content-box >>> table {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}

.content-box >>> table th,
.content-box >>> table td {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  text-align: left;
}

.content-box >>> table th {
  background: #f5f7fa;
  font-weight: bold;
}

.content-box >>> a {
  color: #409eff;
  text-decoration: none;
}

.content-box >>> a:hover {
  text-decoration: underline;
}

.example-box {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
}

.example-box pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.example-box code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #303133;
}

.note-box {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 15px;
  color: #856404;
  line-height: 1.8;
}

.note-box >>> h1,
.note-box >>> h2,
.note-box >>> h3,
.note-box >>> h4,
.note-box >>> h5,
.note-box >>> h6 {
  color: #856404;
  font-weight: bold;
  margin: 10px 0;
}

.note-box >>> ul,
.note-box >>> ol {
  padding-left: 30px;
  margin: 10px 0;
}

.note-box >>> code {
  background: #ffeaa7;
  padding: 2px 6px;
  border-radius: 3px;
  color: #856404;
}

.reference-box {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.reference-box >>> ul,
.reference-box >>> ol {
  padding-left: 30px;
  margin: 10px 0;
}

.reference-box >>> a {
  color: #409eff;
  text-decoration: none;
}

.reference-box >>> a:hover {
  text-decoration: underline;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  font-size: 14px;
  color: #606266;
}

.stat-item i {
  margin-right: 5px;
  color: #909399;
}

.actions {
  display: flex;
  gap: 10px;
}

/* 目录样式 */
.detail-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  gap: 25px;
}

.directory-wrapper {
  margin-left: 20px;
}

.directory {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  border: 1px solid #e4e7ed;
}

.directory-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
  text-align: center;
}

.directory-items {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.directory-items::-webkit-scrollbar {
  width: 8px;
}

.directory-items::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 4px;
}

.directory-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.2s;
}

.directory-items::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.catalog-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.catalog-list li {
  margin: 4px 0;
}

.title-wrapper {
  display: block;
}

/* 可展开标题样式 */
.expandable-title {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  border-radius: 4px;
}

.expandable-title:hover {
  background: #f5f7fa;
  color: #409eff;
}

.title-text {
  flex: 1;
  cursor: pointer;
  color: inherit;
  font-size: 14px;
}

/* 普通标题样式 */
.normal-title {
  display: block;
  padding: 8px 10px;
  color: #606266;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.normal-title:hover {
  background: #f5f7fa;
  color: #409eff;
}

/* 高亮样式 */
.highlight {
  color: #409eff !important;
  font-weight: bold;
  background: #ecf5ff !important;
}

/* 展开/收缩图标样式 */
.expand-icon {
  margin-right: 6px;
  font-size: 10px;
  color: #909399;
  transition: transform 0.2s;
  display: inline-block;
  user-select: none;
  min-width: 14px;
  text-align: center;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.expandable-title:hover .expand-icon {
  color: #409eff;
}

/* 子标题符号 */
.child-icon {
  margin-right: 6px;
  font-size: 12px;
  color: #c0c4cc;
}

/* 暂无目录提示 */
.no-catalog {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 14px;
}

/* 固定定位样式 */
.directory-fixed {
  position: fixed;
  top: 130px;
  z-index: 100;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
  border: 1px solid #e4e7ed;
  transition: none; /* 禁用过渡动画，避免位置跳动 */
}

/* 评论区样式 */
.comments-section {
  margin-top: 30px;
}

.comments-header .section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 0;
  border-left: none;
}

.comment-input-section {
  margin-bottom: 30px;
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
  border: 2px solid rgba(64, 158, 255, 0.2);
  flex-shrink: 0;
  object-fit: cover;
}

.comment-input {
  flex: 1;
}

.comment-input /deep/ .el-textarea__inner {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px !important;
}

.comment-input /deep/ .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.comment-input /deep/ .el-input__count {
  background: transparent;
  right: 8px;
  bottom: 8px;
}

.comment-submit {
  text-align: right;
  margin-top: 12px;
}

.comment-submit .el-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
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

.author-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.3);
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
  color: #409eff;
}

.comment-delete:hover {
  color: #ff6b6b;
}

.comment-like.active {
  color: #409eff;
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
  border: 2px solid rgba(64, 158, 255, 0.2);
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
  color: #409eff;
}

.sub-comment-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 8px 40px;
}

.sub-comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 40px;
}

.sub-comment-time {
  font-size: 12px;
  color: #999;
  margin-right: 4px;
}

/* 子评论展开/收起按钮 */
.sub-comments-toggle {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  text-align: center;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 16px;
  transition: all 0.3s ease;
  user-select: none;
}

.toggle-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #0066cc;
}

.toggle-btn i {
  font-size: 12px;
  transition: transform 0.3s ease;
}

/* 空评论状态 */
.empty-comments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px dashed #e1e3e9;
}

.empty-comments i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 12px;
  display: block;
}

.empty-comments p {
  font-size: 14px;
  margin: 0;
  color: #909399;
}

@media (max-width: 768px) {
  .detail-content {
    margin-right: 0;
  }
  
  .action-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .stats {
    width: 100%;
    justify-content: space-around;
  }

  .actions {
    width: 100%;
  }

  .actions button {
    flex: 1;
  }
  
  .directory-wrapper {
    display: none;
  }
  
  .comment-content {
    margin-left: 0;
  }
  
  .comment-actions {
    margin-left: 0;
  }
  
  .sub-comments {
    margin-left: 0;
  }
  
  .comment-input-box {
    gap: 8px;
  }
  
  .comment-avatar {
    width: 36px;
    height: 36px;
  }
  
  .sub-comment-avatar {
    width: 28px;
    height: 28px;
  }
}

/* 收藏夹菜单样式 */
.collect-folder-menu {
  padding: 8px 0;
  min-width: 200px;
}

.folder-header {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 4px;
}

.no-folders {
  padding: 16px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.folder-item {
  padding: 0 !important;
}

.folder-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  width: 100%;
}

.folder-name {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #303133;
}

.folder-name i {
  margin-right: 6px;
  color: #606266;
}

.folder-count {
  font-size: 12px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 20px;
  text-align: center;
}

.create-folder-item {
  color: #409eff !important;
  font-weight: 500;
}

.create-folder-item:hover {
  background-color: #ecf5ff !important;
}

/* 图片预览样式 */
.content-box >>> .content-image {
  max-width: 100%;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 16px 0;
  display: block;
  transition: all 0.3s ease;
}

.content-box >>> .content-image:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* 图片加载状态 */
.content-box >>> .content-image[src=""] {
  background: #f5f7fa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-box >>> .content-image[src=""]:after {
  content: "加载中...";
  color: #909399;
  font-size: 14px;
}
</style>
