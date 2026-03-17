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
      startingMap: {}
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
  methods: {
    goBack() {
      this.$router.push('/home')
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
.group-title {
  font-weight: 700;
  color: #303133;
}
.group-count {
  margin-left: 6px;
  font-size: 12px;
  color: #909399;
}
.columns-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.column-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}
.column-row:last-child {
  border-bottom: none;
}
.column-main {
  flex: 1;
  min-width: 0;
}
.column-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}
.column-desc {
  margin-top: 8px;
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

