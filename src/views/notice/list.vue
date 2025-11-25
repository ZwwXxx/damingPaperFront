<template>
  <div class="notice-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📢 系统公告</span>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterType" size="small" @change="loadNoticeList">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button :label="1">通知</el-radio-button>
          <el-radio-button :label="2">公告</el-radio-button>
          <el-radio-button :label="3">活动</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 公告列表 -->
      <div v-loading="loading" class="notice-list-content">
        <div v-if="noticeList.length === 0" class="empty-data">
          <el-empty description="暂无公告"></el-empty>
        </div>

        <div
          v-for="item in noticeList"
          :key="item.noticeId"
          class="notice-item"
          :class="{ 'is-top': item.isTop === 1 }"
          @click="viewDetail(item)"
        >
          <!-- 置顶标记 -->
          <div v-if="item.isTop === 1" class="top-badge">
            <i class="el-icon-top"></i> 置顶
          </div>

          <div class="item-header">
            <div class="header-left">
              <el-tag
                :type="getTypeTag(item.noticeType)"
                size="small"
                class="type-tag"
              >
                {{ getTypeName(item.noticeType) }}
              </el-tag>
              <span class="title-text">{{ item.noticeTitle }}</span>
              <span class="view-count" style="margin-left: 15px;">
                <i class="el-icon-view"></i> {{ item.viewCount }}
              </span>
            </div>
          </div>

          <div class="item-content">
            <p class="content-text">{{ item.noticeContent }}</p>
          </div>

          <div class="item-footer">
            <span class="time">
              <i class="el-icon-time"></i>
              {{ formatTime(item.publishTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      :title="currentDetail.noticeTitle"
      :visible.sync="detailVisible"
      width="700px"
      append-to-body
    >
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-header">
          <el-tag :type="getTypeTag(currentDetail.noticeType)" size="small">
            {{ getTypeName(currentDetail.noticeType) }}
          </el-tag>
          <span class="publish-time">
            <i class="el-icon-time"></i>
            {{ formatTime(currentDetail.publishTime) }}
          </span>
          <span class="view-count">
            <i class="el-icon-view"></i>
            {{ currentDetail.viewCount }} 次浏览
          </span>
        </div>
        
        <el-divider></el-divider>
        
        <div class="detail-body">
          <div class="content-box" v-html="formatContent(currentDetail.noticeContent)"></div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getNoticeList, getNoticeDetail } from '@/api/notice'

export default {
  name: 'NoticeList',
  data() {
    return {
      loading: false,
      noticeList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      filterType: '',
      detailVisible: false,
      currentDetail: {}
    }
  },
  created() {
    this.loadNoticeList()
  },
  methods: {
    /** 加载公告列表 */
    loadNoticeList() {
      this.loading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        noticeType: this.filterType || undefined
      }
      
      getNoticeList(params)
        .then(response => {
          this.noticeList = response.rows || []
          this.total = response.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 查看详情 */
    viewDetail(item) {
      getNoticeDetail(item.noticeId)
        .then(response => {
          this.currentDetail = response.data
          this.detailVisible = true
        })
    },
    /** 分页 */
    handlePageChange(page) {
      this.currentPage = page
      this.loadNoticeList()
    },
    /** 获取类型名称 */
    getTypeName(type) {
      const map = {
        1: '通知',
        2: '公告',
        3: '活动'
      }
      return map[type] || '未知'
    },
    /** 获取类型标签 */
    getTypeTag(type) {
      const map = {
        1: 'info',
        2: 'primary',
        3: 'warning'
      }
      return map[type] || 'info'
    },
    /** 格式化时间 */
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    /** 格式化内容（换行转换） */
    formatContent(content) {
      if (!content) return ''
      return content.replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
.notice-list {
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
  margin-bottom: 20px;
}

.notice-list-content {
  min-height: 400px;
}

.notice-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.notice-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.notice-item.is-top {
  background: #fef0f0;
  border-color: #f56c6c;
}

.top-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f56c6c;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(245, 108, 108, 0.3);
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
  padding-right: 80px;
}

.type-tag {
  margin-right: 10px;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.view-count {
  color: #909399;
  font-size: 12px;
}

.item-content {
  margin-bottom: 12px;
}

.content-text {
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

.pagination {
  margin-top: 20px;
  text-align: center;
}

.detail-content {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #909399;
  font-size: 14px;
}

.detail-body {
  padding: 20px 0;
}

.content-box {
  line-height: 1.8;
  color: #606266;
  font-size: 15px;
}

.empty-data {
  padding: 60px 0;
}
</style>
