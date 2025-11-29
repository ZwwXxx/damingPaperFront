<template>
  <div class="knowledge-library">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📚 知识点库</span>
      </div>

      <div class="filter-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="queryParams.subjectId" placeholder="选择科目" clearable @change="handleSubjectChange">
              <el-option v-for="subject in subjectList" :key="subject.subjectId" :label="subject.subjectName" :value="subject.subjectId" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="queryParams.chapterId" placeholder="选择章节" clearable :disabled="!queryParams.subjectId" @change="loadPointList">
              <el-option v-for="chapter in chapterList" :key="chapter.chapterId" :label="chapter.chapterName" :value="chapter.chapterId" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input v-model="queryParams.title" placeholder="搜索知识点标题" clearable @keyup.enter.native="loadPointList">
              <el-button slot="append" icon="el-icon-search" @click="loadPointList" />
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="loadPointList">查询</el-button>
          </el-col>
        </el-row>
      </div>

      <div class="quick-nav">
        <div class="nav-left">
          <el-button-group>
            <el-button size="small" @click="loadHotPoints">
              <i class="el-icon-hot-water"></i> 热门推荐
            </el-button>
            <el-button size="small" @click="loadLatestPoints">
              <i class="el-icon-time"></i> 最新发布
            </el-button>
            <el-button size="small" @click="loadRecommendPoints">
              <i class="el-icon-star-off"></i> 精选推荐
            </el-button>
            <el-button size="small" @click="viewMyCollects">
              <i class="el-icon-folder"></i> 我的收藏
            </el-button>
          </el-button-group>
        </div>
        
        <div class="nav-right">
          <el-button type="success" size="small" @click="goPublish">
            <i class="el-icon-edit"></i> 发布知识点
          </el-button>
        </div>
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
              <el-button :type="point.isLiked ? 'danger' : ''" size="mini" icon="el-icon-star-off" circle @click.stop="handleLike(point)" />
              <el-button :type="point.isCollected ? 'warning' : ''" size="mini" icon="el-icon-folder" circle @click.stop="handleCollect(point)" />
            </div>
          </div>

          <div class="item-content">
            <p class="summary-text">{{ point.summary }}</p>
          </div>

          <div class="item-footer">
            <div class="footer-left">
              <el-tag size="mini" effect="plain">{{ point.subjectName }}</el-tag>
              <el-tag size="mini" effect="plain" type="info">{{ point.chapterName }}</el-tag>
            </div>
            <div class="footer-right">
              <span class="stat-item"><i class="el-icon-view"></i> {{ point.viewCount }}</span>
              <span class="stat-item"><i class="el-icon-star-off"></i> {{ point.likeCount }}</span>
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
import { getSubjectList, getChapterTree, getKnowledgePointList, getHotPoints, getLatestPoints, getRecommendPoints, toggleLike, toggleCollect } from '@/api/knowledge'

export default {
  name: 'KnowledgeLibrary',
  data() {
    return {
      loading: false,
      subjectList: [],
      chapterList: [],
      pointList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      queryParams: { subjectId: null, chapterId: null, title: '' }
    }
  },
  created() {
    this.loadSubjects()
    this.loadPointList()
  },
  methods: {
    loadSubjects() {
      getSubjectList().then(response => {
        this.subjectList = response.data || []
      })
    },
    handleSubjectChange(subjectId) {
      this.queryParams.chapterId = null
      this.chapterList = []
      if (subjectId) {
        this.loadChapters(subjectId)
      }
      this.loadPointList()
    },
    loadChapters(subjectId) {
      getChapterTree(subjectId).then(response => {
        this.chapterList = this.flattenTree(response.data || [])
      })
    },
    flattenTree(tree, prefix = '') {
      let result = []
      tree.forEach(node => {
        const label = prefix ? `${prefix} > ${node.chapterName}` : node.chapterName
        result.push({ chapterId: node.chapterId, chapterName: label })
        if (node.children && node.children.length > 0) {
          result = result.concat(this.flattenTree(node.children, label))
        }
      })
      return result
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
    loadHotPoints() {
      this.loading = true
      this.queryParams = { subjectId: null, chapterId: null, title: '' }
      getHotPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
        this.currentPage = 1
      }).finally(() => {
        this.loading = false
      })
    },
    loadLatestPoints() {
      this.loading = true
      this.queryParams = { subjectId: null, chapterId: null, title: '' }
      getLatestPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
        this.currentPage = 1
      }).finally(() => {
        this.loading = false
      })
    },
    loadRecommendPoints() {
      this.loading = true
      this.queryParams = { subjectId: null, chapterId: null, title: '' }
      getRecommendPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
        this.currentPage = 1
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
    viewMyCollects() {
      this.$router.push({ name: 'knowledgeCollects' })
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadPointList()
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
.quick-nav {
  margin-bottom: 20px;
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
