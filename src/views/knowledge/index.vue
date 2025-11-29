<template>
  <div class="knowledge-library">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📚 知识点库</span>
        <el-badge v-if="totalKnowledgeCount > 0" :value="totalKnowledgeCount" class="total-badge" type="success" />
      </div>

      <div class="filter-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="queryParams.subjectId" placeholder="选择科目" clearable @change="loadPointList">
              <el-option v-for="subject in subjectList" :key="subject.subjectId" :label="subject.subjectName" :value="subject.subjectId" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="queryParams.difficulty" placeholder="难度" clearable @change="loadPointList">
              <el-option label="简单" :value="1" />
              <el-option label="中等" :value="2" />
              <el-option label="困难" :value="3" />
            </el-select>
          </el-col>
          <el-col :span="10">
            <el-input v-model="queryParams.title" placeholder="搜索知识点标题" clearable @keyup.enter.native="loadPointList">
              <el-button slot="append" icon="el-icon-search" @click="loadPointList" />
            </el-input>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" @click="loadPointList">查询</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Tab标签页导航 -->
      <div class="tab-nav">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="推荐" name="recommend">
            <span slot="label"><i class="el-icon-magic-stick"></i> 智能推荐</span>
          </el-tab-pane>
          <el-tab-pane label="最新" name="latest">
            <span slot="label"><i class="el-icon-time"></i> 最新发布</span>
          </el-tab-pane>
          <el-tab-pane label="热门" name="hot">
            <span slot="label"><i class="el-icon-trophy"></i> 经典榜单</span>
          </el-tab-pane>
          <el-tab-pane name="myArticles">
            <span slot="label" style="display: inline-flex; align-items: center;">
              <i class="el-icon-tickets"></i> 我的文章
              <el-badge v-if="myArticleCount > 0" :value="myArticleCount" class="badge-item" type="primary" />
            </span>
          </el-tab-pane>
          <el-tab-pane label="我的收藏" name="myCollects">
            <span slot="label" style="display: inline-flex; align-items: center;">
              <i class="el-icon-folder"></i> 我的收藏
              <el-badge v-if="myCollectCount > 0" :value="myCollectCount" class="badge-item" type="warning" />
            </span>
          </el-tab-pane>
        </el-tabs>
        
        <div class="tab-actions">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="goPublish">
            发布知识点
          </el-button>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filterParams.subjectId" placeholder="全部科目" clearable size="small" @change="applyFilter">
              <el-option label="全部科目" :value="null"></el-option>
              <el-option v-for="subject in subjectList" :key="subject.subjectId" :label="subject.subjectName" :value="subject.subjectId"></el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="filterParams.difficulty" placeholder="难度" clearable size="small" @change="applyFilter">
              <el-option label="全部难度" :value="null"></el-option>
              <el-option label="简单" :value="1"></el-option>
              <el-option label="中等" :value="2"></el-option>
              <el-option label="困难" :value="3"></el-option>
            </el-select>
          </el-col>
          <el-col :span="5" v-if="activeTab === 'myArticles'">
            <el-select v-model="filterParams.status" placeholder="状态" clearable size="small" @change="applyFilter">
              <el-option label="全部状态" :value="null"></el-option>
              <el-option label="草稿" :value="0"></el-option>
              <el-option label="已发布" :value="1"></el-option>
              <el-option label="已下架" :value="2"></el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="filterParams.orderBy" placeholder="排序" size="small" @change="applyFilter">
              <el-option label="最新发布" value="create_time"></el-option>
              <el-option label="最多浏览" value="view_count"></el-option>
              <el-option label="最多点赞" value="like_count"></el-option>
              <el-option label="最多收藏" value="collect_count"></el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-button size="small" icon="el-icon-refresh" @click="resetFilter">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <div v-loading="loading" class="point-list">
        <div v-if="pointList.length === 0" class="empty-data">
          <el-empty description="暂无知识点"></el-empty>
        </div>

        <div v-for="point in pointList" :key="point.pointId" class="point-item" @click="viewDetail(point)">
          <div class="item-header">
            <div class="header-left">
              <span class="title-text">{{ point.title }}</span>
              <el-tag v-if="point.difficulty" :type="getDifficultyTag(point.difficulty)" size="mini" class="difficulty-tag">
                {{ getDifficultyName(point.difficulty) }}
              </el-tag>
            </div>
            <div class="header-right">
              <el-button v-if="point.authorId === currentUserId" type="success" size="mini" icon="el-icon-edit" @click.stop="handleEdit(point)">编辑</el-button>
              <el-button v-if="point.authorId === currentUserId" type="danger" size="mini" icon="el-icon-delete" @click.stop="handleDelete(point)">删除</el-button>
              <el-button :type="point.isLiked ? 'primary' : ''" size="mini" icon="el-icon-thumb" circle @click.stop="handleLike(point)" />
              <el-button :type="point.isCollected ? 'warning' : ''" size="mini" icon="el-icon-folder" circle @click.stop="handleCollect(point)" />
            </div>
          </div>

          <div class="item-content">
            <p class="summary-text">{{ point.summary }}</p>
          </div>

          <div class="item-footer">
            <div class="footer-left">
              <el-tag size="mini" effect="plain">{{ point.subjectName }}</el-tag>
            </div>
            <div class="footer-right">
              <span class="stat-item"><i class="el-icon-view"></i> {{ point.viewCount }}</span>
              <span class="stat-item"><i class="el-icon-thumb"></i> {{ point.likeCount }}</span>
              <span class="stat-item"><i class="el-icon-folder"></i> {{ point.collectCount }}</span>
              <span class="time"><i class="el-icon-time"></i> {{ formatTime(point.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="handlePageChange" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getSubjectList, getKnowledgePointList, getHotPoints, getLatestPoints, getRecommendPoints, toggleLike, toggleCollect, getMyCollects, deleteKnowledgePoint } from '@/api/knowledge'

export default {
  name: 'KnowledgeLibrary',
  data() {
    return {
      loading: false,
      subjectList: [],
      pointList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      queryParams: { subjectId: null, difficulty: null, title: '' },
      myArticleCount: 0,
      myCollectCount: 0,
      totalKnowledgeCount: 0,
      activeTab: 'recommend',
      filterParams: {
        subjectId: null,
        difficulty: null,
        status: null,
        orderBy: 'create_time'
      }
    }
  },
  created() {
    this.loadSubjects()
    this.loadMyArticleCount()
    this.loadMyCollectCount()
    this.loadTotalKnowledgeCount()
    this.loadDataByTab()
  },
  computed: {
    currentUserId() {
      return this.$store.getters.userId
    }
  },
  methods: {
    loadSubjects() {
      getSubjectList().then(response => {
        this.subjectList = response.data || []
      })
    },
    loadPointList() {
      this.loading = true
      const params = { pageNum: this.currentPage, pageSize: this.pageSize, ...this.queryParams }
      getKnowledgePointList(params).then(response => {
        this.pointList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    handleTabClick(tab) {
      this.currentPage = 1
      this.resetFilter()
      this.loadDataByTab()
    },
    loadDataByTab() {
      switch (this.activeTab) {
        case 'hot':
          this.loadHotPoints()
          break
        case 'latest':
          this.loadLatestPoints()
          break
        case 'recommend':
          this.loadRecommendPoints()
          break
        case 'myArticles':
          this.loadMyArticles()
          break
        case 'myCollects':
          this.loadMyCollects()
          break
        default:
          this.loadRecommendPoints()
      }
    },
    loadHotPoints() {
      this.loading = true
      getHotPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
      }).finally(() => {
        this.loading = false
      })
    },
    loadLatestPoints() {
      this.loading = true
      getLatestPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
      }).finally(() => {
        this.loading = false
      })
    },
    loadRecommendPoints() {
      this.loading = true
      getRecommendPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
      }).finally(() => {
        this.loading = false
      })
    },
    viewDetail(point) {
      this.$router.push({ name: 'knowledgeDetail', params: { pointId: point.pointId } })
    },
    handleLike(point) {
      toggleLike(point.pointId).then(response => {
        this.$message.success(response.msg)
        point.isLiked = response.data
        if (response.data) {
          point.likeCount++
        } else {
          point.likeCount--
        }
      }).catch(() => {
        this.$message.error('操作失败，请先登录')
      })
    },
    handleCollect(point) {
      toggleCollect(point.pointId).then(response => {
        this.$message.success(response.msg)
        point.isCollected = response.data
        if (response.data) {
          point.collectCount++
        } else {
          point.collectCount--
        }
      }).catch(() => {
        this.$message.error('操作失败，请先登录')
      })
    },
    loadMyCollects() {
      if (!this.currentUserId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.loading = true
      getMyCollects().then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
        this.myCollectCount = this.pointList.length
      }).catch(() => {
        this.$message.error('加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    goPublish() {
      this.$router.push({ name: 'knowledgePublish' })
    },
    loadMyArticles() {
      if (!this.currentUserId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.loading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        authorId: this.currentUserId,
        ...this.filterParams
      }
      getKnowledgePointList(params).then(response => {
        this.pointList = response.rows || []
        this.total = response.total || 0
      }).catch(() => {
        this.$message.error('加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    applyFilter() {
      this.currentPage = 1
      this.loadDataByTab()
    },
    resetFilter() {
      this.filterParams = {
        subjectId: null,
        difficulty: null,
        status: null,
        orderBy: 'create_time'
      }
    },
    loadMyArticleCount() {
      const userId = this.$store.getters.userId
      if (!userId) {
        return
      }
      const params = {
        pageNum: 1,
        pageSize: 1,
        authorId: userId
      }
      getKnowledgePointList(params).then(response => {
        this.myArticleCount = response.total || 0
      }).catch(() => {
        // 静默失败
      })
    },
    loadMyCollectCount() {
      const userId = this.$store.getters.userId
      if (!userId) {
        return
      }
      getMyCollects().then(response => {
        this.myCollectCount = response.data ? response.data.length : 0
      }).catch(() => {
        // 静默失败
      })
    },
    loadTotalKnowledgeCount() {
      const params = {
        pageNum: 1,
        pageSize: 1
      }
      getKnowledgePointList(params).then(response => {
        this.totalKnowledgeCount = response.total || 0
      }).catch(() => {
        // 静默失败
      })
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadDataByTab()
    },
    handleEdit(point) {
      this.$router.push({ name: 'knowledgePublish', query: { pointId: point.pointId } })
    },
    handleDelete(point) {
      this.$confirm('确定要删除这个知识点吗？删除后无法恢复！', '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        this.deleteKnowledgePoint(point.pointId)
      }).catch(() => {
        // 用户取消删除
      })
    },
    deleteKnowledgePoint(pointId) {
      deleteKnowledgePoint(pointId).then(() => {
        this.$message.success('删除成功')
        // 重新加载数据
        this.loadDataByTab()
      }).catch(() => {
        this.$message.error('删除失败')
      })
    },
    getDifficultyName(difficulty) {
      const map = { 1: '简单', 2: '中等', 3: '困难' }
      return map[difficulty] || ''
    },
    getDifficultyTag(difficulty) {
      const map = { 1: 'success', 2: 'warning', 3: 'danger' }
      return map[difficulty] || 'info'
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    }
  }
}
</script>

<style scoped>
.knowledge-library {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.filter-bar {
  margin-bottom: 15px;
}
.filter-bar .el-select,
.filter-bar .el-input {
  width: 100%;
}
.tab-nav {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tab-nav .el-tabs {
  flex: 1;
}
.tab-actions {
  margin-left: 20px;
}
.badge-item {
  margin-left: 5px;
}
.total-badge {
  margin-left: 10px;
}
.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.filter-section .el-select {
  width: 100%;
}
.point-list {
  min-height: 400px;
}
.point-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}
.point-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}
.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-right: 10px;
}
.difficulty-tag {
  margin-left: 10px;
}
.header-right {
  display: flex;
  gap: 8px;
}
.item-content {
  margin-bottom: 12px;
}
.summary-text {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}
.footer-left {
  display: flex;
  gap: 8px;
}
.footer-right {
  display: flex;
  gap: 15px;
  align-items: center;
}
.stat-item {
  color: #909399;
}
.stat-item i {
  margin-right: 4px;
}
.time {
  color: #909399;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
.empty-data {
  padding: 60px 0;
}
</style>
