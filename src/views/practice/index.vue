<template>
  <wrapper>
    <div class="practice-page">
      <div class="header-card bg-white p-6 rounded-lg shadow mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xl font-semibold">专练</div>
            <div class="text-sm text-gray-500 mt-1">
              按章节选择一个栏目开始专项练习（栏目是否展示由后台配置决定）
            </div>
          </div>
          <el-button icon="el-icon-back" size="small" @click="goBack">返回</el-button>
        </div>
      </div>

      <div v-loading="loading">
        <div v-if="columns.length">
          <el-collapse v-model="activeGroups" class="group-collapse">
            <el-collapse-item
              v-for="g in groupedColumns"
              :key="g.key"
              :name="g.key"
            >
              <template slot="title">
                <span class="group-title">{{ g.groupName }}</span>
                <span class="group-count">（{{ g.items.length }}）</span>
              </template>

              <div class="columns-list">
                <div
                  v-for="col in g.items"
                  :key="col.columnId"
                  class="column-row"
                  @click="startPractice(col)"
                >
                  <div class="column-main">
                    <div class="column-title">{{ col.columnName }}</div>
                    <div v-if="col.description" class="column-desc">{{ col.description }}</div>
                  </div>
                  <div class="column-right">
                    <i class="el-icon-arrow-right column-arrow"></i>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-empty v-else description="暂无可用的专项刷题栏目" />
      </div>
    </div>
  </wrapper>
</template>

<script>
import wrapper from '@/components/wrapper.vue'
import { listPracticeColumns, getPracticePaperId } from '@/api/practice'

export default {
  name: 'PracticeIndex',
  components: { wrapper },
  data() {
    return {
      loading: false,
      columns: [],
      activeGroups: [],
      startingMap: {},
      lastRefreshAt: 0
    }
  },
  computed: {
    groupedColumns() {
      const list = Array.isArray(this.columns) ? this.columns : []
      const buckets = new Map()

      for (const col of list) {
        const groupName = (col && col.groupName) ? String(col.groupName).trim() : ''
        const safeGroupName = groupName || '其他'
        const groupSort = (col && col.groupSort != null) ? Number(col.groupSort) : 0
        const key = `${groupSort}__${safeGroupName}`
        if (!buckets.has(key)) {
          buckets.set(key, { key, groupName: safeGroupName, groupSort, items: [] })
        }
        buckets.get(key).items.push(col)
      }

      return Array.from(buckets.values()).sort((a, b) => {
        if (b.groupSort !== a.groupSort) return b.groupSort - a.groupSort
        return a.groupName.localeCompare(b.groupName, 'zh-Hans-CN')
      })
    }
  },
  created() {
    this.loadColumns()
  },
  mounted() {
    window.addEventListener('focus', this.handleWindowFocus)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  activated() {
    // 如果该页面被 keep-alive 缓存，重新激活时也要刷新，避免跨标签新增后看不到
    this.refreshColumnsIfNeeded(true)
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.handleWindowFocus)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },
  methods: {
    goBack() {
      this.$router.push('/home')
    },
    handleWindowFocus() {
      this.refreshColumnsIfNeeded(false)
    },
    handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.refreshColumnsIfNeeded(false)
      }
    },
    refreshColumnsIfNeeded(force) {
      const now = Date.now()
      // 简单节流：避免短时间内重复请求
      if (!force && now - (this.lastRefreshAt || 0) < 1200) return
      if (this.loading) return
      this.lastRefreshAt = now
      this.loadColumns()
    },
    async loadColumns() {
      this.loading = true
      try {
        const res = await listPracticeColumns({})
        this.columns = (res && res.data) || []
        // 默认全部展开（按当前分组结果）
        this.activeGroups = this.groupedColumns.map(x => x.key)
      } finally {
        this.loading = false
      }
    },
    async startPractice(col) {
      if (!col || !col.columnId) return
      this.$set(this.startingMap, col.columnId, true)
      try {
        const res = await getPracticePaperId(col.columnId)
        const paperId = res && res.data && res.data.paperId
        if (!paperId) {
          this.$message.error('未获取到试卷ID')
          return
        }
        this.$router.push({ name: 'paper', params: { paperId: String(paperId) } })
      } catch (e) {
        this.$message.error('开始练习失败')
      } finally {
        this.$delete(this.startingMap, col.columnId)
      }
    }
  }
}
</script>

<style scoped>
.practice-page {
  padding: 0;
}
.group-collapse {
  background: transparent;
}
.group-collapse ::v-deep .el-collapse-item__header {
  height: auto;
  line-height: 1.2;
  padding: 14px 16px;
  margin-bottom: 10px;
  background: #f6f9ff;
  border: 1px solid #e6efff;
  border-radius: 10px;
  color: #1f2d3d;
  font-weight: 800;
  position: relative;
}
.group-collapse ::v-deep .el-collapse-item__header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 6px;
  background: #4f7cff;
}
.group-collapse ::v-deep .el-collapse-item__wrap {
  border: none;
  background: transparent;
}
.group-collapse ::v-deep .el-collapse-item__content {
  padding: 0 2px 14px 2px;
}
.group-title {
  font-weight: 900;
  color: #1f2d3d;
}
.group-count {
  margin-left: 10px;
  font-size: 12px;
  color: #4f7cff;
  background: rgba(79, 124, 255, 0.10);
  border: 1px solid rgba(79, 124, 255, 0.22);
  padding: 2px 8px;
  border-radius: 999px;
}
.columns-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 14px; /* 二级缩进：强化层级 */
  position: relative;
}
.columns-list::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: #e9edf7;
  border-radius: 2px;
}
.column-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  border: 1px solid #eef2fb;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.15s ease;
}
.column-row:hover {
  border-color: #dbe6ff;
  background: #fbfdff;
  transform: translateY(-1px);
}
.column-main {
  flex: 1;
  min-width: 0;
}
.column-title {
  font-size: 15px;
  font-weight: 800;
  color: #24324a;
}
.column-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}
.column-right {
  display: flex;
  align-items: center;
  margin-left: 8px;
}
.column-arrow {
  font-size: 18px;
  color: #c0c4cc;
}
</style>

