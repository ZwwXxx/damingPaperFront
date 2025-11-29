<template>
  <div class="knowledge-collects">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">⭐ 我的收藏</span>
      </div>

      <!-- 知识点列表 -->
      <div v-loading="loading" class="collect-list">
        <div v-if="collectList.length === 0" class="empty-data">
          <el-empty description="还没有收藏任何知识点">
            <el-button type="primary" @click="goToLibrary">去逛逛</el-button>
          </el-empty>
        </div>

        <div
          v-for="point in collectList"
          :key="point.pointId"
          class="collect-item"
          @click="viewDetail(point)"
        >
          <div class="item-header">
            <div class="header-left">
              <span class="title-text">{{ point.title }}</span>
              <el-tag
                v-if="point.difficulty"
                :type="getDifficultyTag(point.difficulty)"
                size="mini"
                class="difficulty-tag"
              >
                {{ getDifficultyName(point.difficulty) }}
              </el-tag>
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-thumb"
                circle
                title="点赞"
                @click.stop="handleLike(point)"
              />
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-folder-checked"
                circle
                title="取消收藏"
                @click.stop="handleCollect(point)"
              />
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
              <span class="stat-item">
                <i class="el-icon-view"></i> {{ point.viewCount }}
              </span>
              <span class="stat-item">
                <i class="el-icon-thumb"></i> {{ point.likeCount }}
              </span>
              <span class="stat-item">
                <i class="el-icon-folder"></i> {{ point.collectCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getMyCollects,
  toggleLike,
  toggleCollect
} from '@/api/knowledge'

export default {
  name: 'KnowledgeCollects',
  data() {
    return {
      loading: false,
      collectList: []
    }
  },
  created() {
    this.loadCollects()
  },
  methods: {
    /** 加载收藏列表 */
    loadCollects() {
      this.loading = true
      getMyCollects()
        .then(response => {
          this.collectList = response.data || []
        })
        .catch(() => {
          this.$message.error('加载失败，请先登录')
          this.$router.push({ name: 'login' })
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 查看详情 */
    viewDetail(point) {
      this.$router.push({
        name: 'knowledgeDetail',
        params: { pointId: point.pointId }
      })
    },
    /** 点赞 */
    handleLike(point) {
      toggleLike(point.pointId)
        .then(response => {
          this.$message.success(response.msg)
          point.isLiked = response.data
          if (response.data) {
            point.likeCount++
          } else {
            point.likeCount--
          }
        })
        .catch(() => {
          this.$message.error('操作失败')
        })
    },
    /** 收藏 */
    handleCollect(point) {
      this.$confirm('确定取消收藏吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        toggleCollect(point.pointId)
          .then(response => {
            this.$message.success('已取消收藏')
            // 从列表中移除
            const index = this.collectList.findIndex(item => item.pointId === point.pointId)
            if (index > -1) {
              this.collectList.splice(index, 1)
            }
          })
          .catch(() => {
            this.$message.error('操作失败')
          })
      }).catch(() => {})
    },
    /** 去知识点库 */
    goToLibrary() {
      this.$router.push({ name: 'knowledgeLibrary' })
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
    }
  }
}
</script>

<style scoped>
.knowledge-collects {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.collect-list {
  min-height: 400px;
}

.collect-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
}

.collect-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #409eff;
  transform: translateY(-2px);
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
}

.stat-item {
  color: #909399;
}

.stat-item i {
  margin-right: 4px;
}

.empty-data {
  padding: 60px 0;
}
</style>
