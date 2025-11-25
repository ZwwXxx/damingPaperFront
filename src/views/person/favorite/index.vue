<template>
  <div class="container">
    <div class="filter-card bg-white rounded-lg shadow p-4 mb-6">
      <el-form :model="filters" inline @submit.native.prevent>
        <el-form-item label="试卷名称">
          <el-input v-model="filters.paperName" placeholder="请输入试卷名" clearable style="width: 220px"
                    @keyup.enter.native="handleSearch"/>
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="filters.subjectId" placeholder="请选择科目" clearable style="width: 200px">
            <el-option label="全部" value=""/>
            <el-option
                v-for="subject in subjectOptions"
                :key="subject.subjectId"
                :label="subject.subjectName"
                :value="String(subject.subjectId)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="收藏时间">
          <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              unlink-panels
              style="width: 260px"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading">
      <div class="favorite-card bg-white shadow rounded-lg mb-4 p-4"
           v-for="item in favoriteList"
           :key="item.favoriteId">
        <div class="flex justify-between items-center border-b pb-2 mb-3">
          <div>
            <p class="font-semibold text-lg text-gray-800">
              <span class="question-title-content" v-html="sanitizeHtml(item.questionTitle || '题目')"></span>
            </p>
            <p class="text-xs text-gray-500 mt-1">
              试卷：{{ item.paperName || '-' }} ｜ 科目：{{ transferSubject(item.subjectId) }} ｜ 收藏时间：{{ item.createTime || '-' }}
            </p>
          </div>
          <el-tag type="warning">已收藏</el-tag>
        </div>
        <div class="options grid md:grid-cols-2 gap-3 mb-3" v-if="item.options && item.options.length">
          <div v-for="option in item.options" :key="option.prefix"
               class="p-3 rounded border border-gray-200">
            <p class="font-semibold">{{ option.prefix }}. {{ option.content }}</p>
          </div>
        </div>
        <div class="answers flex flex-col md:flex-row md:space-x-6 text-sm text-gray-700">
          <p>标准答案：
            <span class="text-green-600 font-semibold">{{ formatCorrectAnswer(item) }}</span>
          </p>
        </div>
        <div class="action-row">
          <el-button
              size="mini"
              type="danger"
              plain
              :loading="removingMap[item.questionId]"
              @click="cancelFavorite(item)">
            取消收藏
          </el-button>
          <el-button
              size="mini"
              type="primary"
              @click="gotoReview(item.paperAnswerId)">
            查看试卷
          </el-button>
        </div>
      </div>
      <el-empty v-if="!loading && !favoriteList.length" description="暂无收藏题目"/>
    </div>
  </div>
</template>

<script>
import {getFavoriteDetailList, removeFavorite} from "@/api/questionFavorite";
import {optionSubject} from "@/api/subject";
import DOMPurify from 'dompurify';

export default {
  name: "favoriteRecord",
  data() {
    return {
      favoriteList: [],
      loading: false,
      subjectOptions: [],
      subjectMap: {},
      filters: {
        paperName: '',
        subjectId: '',
        dateRange: []
      },
      removingMap: {}
    }
  },
  created() {
    this.loadSubjects()
    this.getFavoriteList()
  },
  methods: {
    /**
     * 使用DOMPurify清理HTML内容，防止XSS攻击
     */
    sanitizeHtml(html) {
      if (!html) return '';
      if (!/<[^>]+>/.test(html)) {
        return html;
      }
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'img', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target'],
        ALLOW_DATA_ATTR: false
      });
    },
    async loadSubjects() {
      const res = await optionSubject()
      const list = res.data || []
      this.subjectOptions = list
      this.subjectMap = list.reduce((acc, cur) => {
        acc[cur.subjectId] = cur.subjectName
        return acc
      }, {})
    },
    async cancelFavorite(item) {
      if (!item || !item.questionId) {
        return
      }
      try {
        await this.$confirm('确认将该题目从收藏列表中移除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        return
      }
      this.$set(this.removingMap, item.questionId, true)
      try {
        await removeFavorite(item.questionId)
        this.favoriteList = this.favoriteList.filter(fav => fav.questionId !== item.questionId)
        this.$message.success('已取消收藏')
      } finally {
        this.$delete(this.removingMap, item.questionId)
      }
    },
    transferSubject(subjectId) {
      return this.subjectMap[subjectId] || '-'
    },
    buildQuery() {
      const params = {
        paperName: this.filters.paperName || undefined,
        subjectId: this.filters.subjectId || undefined
      }
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        params.beginTime = this.filters.dateRange[0]
        params.endTime = this.filters.dateRange[1]
      }
      return params
    },
    async getFavoriteList() {
      this.loading = true
      try {
        const res = await getFavoriteDetailList(this.buildQuery())
        this.favoriteList = res.data || []
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.getFavoriteList()
    },
    handleReset() {
      this.filters = {
        paperName: '',
        subjectId: '',
        dateRange: []
      }
      this.getFavoriteList()
    },
    formatCorrectAnswer(item) {
      if (item.questionType === 2 && item.correctArray && item.correctArray.length) {
        return item.correctArray.join('、')
      }
      return item.correct || '-'
    },
    gotoReview(paperAnswerId) {
      if (!paperAnswerId) {
        return
      }
      this.$router.push({
        path: '/review',
        query: {paperAnswerId}
      })
    }
  }
}
</script>

<style scoped>
.favorite-card {
  border: 1px solid #e5e7eb;
  position: relative;
  padding-bottom: 60px;
}
.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 富文本题干样式 */
.question-title-content {
  display: inline;
  word-break: break-word;
}

.question-title-content :deep(img) {
  max-width: 200px !important;
  max-height: 200px !important;
  width: auto !important;
  height: auto !important;
  display: inline-block !important;
  margin: 10px 0 !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.question-title-content :deep(img:hover) {
  transform: scale(1.02);
}

/* 确保所有块级元素都内联显示，防止换行 */
.question-title-content :deep(p),
.question-title-content :deep(div),
.question-title-content :deep(h1),
.question-title-content :deep(h2),
.question-title-content :deep(h3),
.question-title-content :deep(h4),
.question-title-content :deep(h5),
.question-title-content :deep(h6) {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
}

.question-title-content :deep(br) {
  display: none !important;
}

.question-title-content :deep(strong) {
  font-weight: bold;
}

.question-title-content :deep(em) {
  font-style: italic;
}

.question-title-content :deep(u) {
  text-decoration: underline;
}

/* 选项富文本样式 */
.option-content {
  display: flex;
  align-items: flex-start;
  word-break: break-word;
}

.option-prefix {
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-text >>> img {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  display: inline-block;
  margin: 5px 0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
  vertical-align: top;
}

.option-text >>> img:hover {
  transform: scale(1.02);
}
</style>


