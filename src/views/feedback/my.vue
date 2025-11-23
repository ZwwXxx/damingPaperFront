<template>
  <div class="my-feedback">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📋 我的反馈</span>
        <el-button
          style="float: right;"
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="goToSubmit"
        >提交新反馈</el-button>
      </div>

      <!-- 筛选 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" size="small" @change="loadFeedbackList">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button :label="0">待处理</el-radio-button>
          <el-radio-button :label="1">处理中</el-radio-button>
          <el-radio-button :label="2">已处理</el-radio-button>
          <el-radio-button :label="3">已关闭</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 反馈列表 -->
      <div v-loading="loading" class="feedback-list">
        <div v-if="feedbackList.length === 0" class="empty-data">
          <el-empty description="暂无反馈记录">
            <el-button type="primary" @click="goToSubmit">立即反馈</el-button>
          </el-empty>
        </div>

        <div
          v-for="item in feedbackList"
          :key="item.feedbackId"
          class="feedback-item"
          @click="viewDetail(item)"
        >
          <div class="item-header">
            <div class="header-left">
              <el-tag
                :type="getTypeTag(item.feedbackType)"
                size="small"
                class="type-tag"
              >
                {{ getTypeName(item.feedbackType) }}
              </el-tag>
              <span class="title-text">{{ item.feedbackTitle }}</span>
            </div>
            <div class="header-right">
              <el-tag
                :type="getStatusTag(item.status)"
                size="small"
              >
                {{ getStatusName(item.status) }}
              </el-tag>
            </div>
          </div>

          <div class="item-content">
            <p class="content-text">{{ item.feedbackContent }}</p>
          </div>

          <div class="item-footer">
            <span class="time">
              <i class="el-icon-time"></i>
              提交于 {{ formatTime(item.createTime) }}
            </span>
            <span v-if="item.handleTime" class="time">
              <i class="el-icon-check"></i>
              处理于 {{ formatTime(item.handleTime) }}
            </span>
            <div class="actions">
              <el-button
                v-if="item.status === 0"
                type="text"
                size="small"
                icon="el-icon-delete"
                @click.stop="handleDelete(item)"
              >删除</el-button>
              <el-button
                type="text"
                size="small"
                icon="el-icon-view"
                @click.stop="viewDetail(item)"
              >查看详情</el-button>
            </div>
          </div>

          <!-- 回复提示 -->
          <!-- <div v-if="item.replyContent" class="reply-badge">
            <i class="el-icon-message-solid"></i> 已回复
          </div> -->
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
      :title="'反馈详情'"
      :visible.sync="detailVisible"
      width="700px"
      append-to-body
    >
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="反馈类型">
            <el-tag :type="getTypeTag(currentDetail.feedbackType)" size="small">
              {{ getTypeName(currentDetail.feedbackType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTag(currentDetail.status)" size="small">
              {{ getStatusName(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="反馈标题" :span="2">
            {{ currentDetail.feedbackTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="反馈内容" :span="2">
            <div class="content-box">{{ currentDetail.feedbackContent }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="联系方式" :span="2">
            {{ currentDetail.contactInfo || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间" :span="2">
            {{ formatTime(currentDetail.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.handler" label="处理人">
            {{ currentDetail.handler }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.handleTime" label="处理时间">
            {{ formatTime(currentDetail.handleTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 管理员回复 -->
        <div v-if="currentDetail.replyContent" class="reply-section">
          <div class="reply-header">
            <i class="el-icon-chat-dot-round"></i>
            管理员回复
          </div>
          <div class="reply-content">
            {{ currentDetail.replyContent }}
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMyFeedbackList, getFeedbackDetail, deleteFeedback } from '@/api/feedback'

export default {
  name: 'MyFeedback',
  data() {
    return {
      loading: false,
      feedbackList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      filterStatus: '',
      detailVisible: false,
      currentDetail: null
    }
  },
  created() {
    this.loadFeedbackList()
  },
  methods: {
    /** 加载反馈列表 */
    loadFeedbackList() {
      this.loading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize
      }
      
      getMyFeedbackList(params)
        .then(response => {
          let list = response.rows || []
          
          // 前端筛选状态
          if (this.filterStatus !== '') {
            list = list.filter(item => item.status === this.filterStatus)
          }
          
          this.feedbackList = list
          this.total = response.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 查看详情 */
    viewDetail(item) {
      getFeedbackDetail(item.feedbackId)
        .then(response => {
          this.currentDetail = response.data
          this.detailVisible = true
        })
    },
    /** 删除反馈 */
    handleDelete(item) {
      this.$confirm('确定要删除这条反馈吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteFeedback(item.feedbackId)
            .then(() => {
              this.$message.success('删除成功')
              this.loadFeedbackList()
            })
        })
        .catch(() => {})
    },
    /** 分页 */
    handlePageChange(page) {
      this.currentPage = page
      this.loadFeedbackList()
    },
    /** 跳转到提交页面 */
    goToSubmit() {
      this.$router.push('/feedback/submit')
    },
    /** 获取类型名称 */
    getTypeName(type) {
      const map = {
        1: '功能建议',
        2: 'Bug反馈',
        3: '使用问题',
        4: '其他'
      }
      return map[type] || '未知'
    },
    /** 获取类型标签 */
    getTypeTag(type) {
      const map = {
        1: 'success',
        2: 'danger',
        3: 'warning',
        4: 'info'
      }
      return map[type] || 'info'
    },
    /** 获取状态名称 */
    getStatusName(status) {
      const map = {
        0: '待处理',
        1: '处理中',
        2: '已处理',
        3: '已关闭'
      }
      return map[status] || '未知'
    },
    /** 获取状态标签 */
    getStatusTag(status) {
      const map = {
        0: 'warning',
        1: 'primary',
        2: 'success',
        3: 'info'
      }
      return map[status] || 'info'
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
    }
  }
}
</script>

<style scoped>
.my-feedback {
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

.feedback-list {
  min-height: 400px;
}

.feedback-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.feedback-item:hover {
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

.type-tag {
  margin-right: 10px;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
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

.time {
  margin-right: 15px;
}

.actions {
  display: flex;
  gap: 10px;
}

.reply-badge {
  position: absolute;
  top: 10px;
  right: 60px;
  background: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.detail-content {
  padding: 10px 0;
}

.content-box {
  white-space: pre-wrap;
  line-height: 1.6;
}

.reply-section {
  margin-top: 20px;
  padding: 15px;
  background: #f4f4f5;
  border-radius: 4px;
}

.reply-header {
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.reply-content {
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap;
}

.empty-data {
  padding: 60px 0;
}
</style>
