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
        <el-form-item label="作答时间">
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
        <el-form-item label="错题次数">
          <el-select v-model="filters.sortOrder" placeholder="请选择排序" style="width: 180px" @change="handleSortChange">
            <el-option label="默认" value="default"/>
            <el-option label="次数从高到低" value="desc"/>
            <el-option label="次数从低到高" value="asc"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading">
      <div class="wrong-card bg-white shadow rounded-lg mb-4 p-4"
           v-for="item in wrongList"
           :key="item.answerId">
        <div class="flex justify-between items-center border-b pb-2 mb-3">
          <div>
            <p class="font-semibold text-lg text-gray-800">{{ item.questionTitle || '题目' }}</p>
            <p class="text-xs text-gray-500 mt-1">
              试卷：{{ item.paperName || '-' }} ｜ 科目：{{ transferSubject(item.subjectId) }} ｜ 上次作答：{{ item.createTime || '-' }}
            </p>
            <p class="error-count" v-if="item.wrongCount > 1">
              <span class="label">累计错题次数</span>
              <span class="value">{{ item.wrongCount }}</span>
            </p>
          </div>
          <el-tag type="danger">答错</el-tag>
        </div>
        <div class="options grid md:grid-cols-2 gap-3 mb-3">
          <div v-for="option in item.options" :key="option.prefix"
               :class="['p-3 rounded border',
             isSelected(option.prefix, item.userAnswer) ? 'border-red-400 bg-red-50' : 'border-gray-200']">
            <p class="font-semibold">{{ option.prefix }}. {{ option.content }}</p>
          </div>
        </div>
        <div class="answers flex flex-col md:flex-row md:space-x-6 text-sm text-gray-700">
          <p>我的答案：
            <span class="text-red-500 font-semibold">{{ formatAnswer(item.userAnswer) }}</span>
          </p>
          <p>正确答案：
            <span class="text-green-600 font-semibold">{{ formatCorrectAnswer(item) }}</span>
          </p>
        </div>
        <div class="checkButton">
          <button
              @click="gotoReview(item.latestAnswerId || item.answerId)"
              class="bg-blue-500 absolute right-4 bottom-4 px-4 py-2 text-white rounded">查看试卷
          </button>
        </div>
      </div>
      <el-empty v-if="!loading && !wrongList.length" description="暂时没有错题记录"/>
    </div>
  </div>
</template>

<script>
import {getWrongQuestionList} from "@/api/questionAnswer";
import {optionSubject} from "@/api/subject";

export default {
  name: "wrongRecord",
  data() {
    return {
      wrongList: [],
      loading: false,
      subjectOptions: [],
      subjectMap: {},
      filters: {
        paperName: '',
        subjectId: '',
        dateRange: [],
        sortOrder: 'default'
      },
      queryParam: {
        createUser: this.$store.getters['id']
      }
    }
  },
  created() {
    this.loadSubjects()
    this.getWrongList()
  },
  methods: {
    async loadSubjects() {
      const res = await optionSubject()
      const list = res.data || []
      this.subjectOptions = list
      this.subjectMap = list.reduce((acc, cur) => {
        acc[cur.subjectId] = cur.subjectName
        return acc
      }, {})
    },
    transferSubject(subjectId) {
      return this.subjectMap[subjectId] || '-'
    },
    buildQuery() {
      const params = {
        createUser: this.queryParam.createUser,
        paperName: this.filters.paperName || undefined,
        subjectId: this.filters.subjectId || undefined
      }
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        params.beginTime = this.filters.dateRange[0]
        params.endTime = this.filters.dateRange[1]
      }
      if (this.filters.sortOrder && this.filters.sortOrder !== 'default') {
        params.sortOrder = this.filters.sortOrder
      }
      return params
    },
    applySort(list) {
      const order = this.filters.sortOrder
      if (!Array.isArray(list) || order === 'default') {
        return list
      }
      const sorted = [...list]
      sorted.sort((a, b) => {
        const aCount = Number(a.wrongCount) || 0
        const bCount = Number(b.wrongCount) || 0
        return order === 'asc' ? aCount - bCount : bCount - aCount
      })
      return sorted
    },
    async getWrongList() {
      this.loading = true
      try {
        const res = await getWrongQuestionList(this.buildQuery())
        this.wrongList = this.applySort(res.data || [])
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.getWrongList()
    },
    handleReset() {
      this.filters = {
        paperName: '',
        subjectId: '',
        dateRange: [],
        sortOrder: 'default'
      }
      this.getWrongList()
    },
    handleSortChange() {
      this.wrongList = this.applySort(this.wrongList)
    },
    gotoReview(paperAnswerId) {
      if (!paperAnswerId) {
        return
      }
      this.$router.push({
        path: '/review',
        query: {paperAnswerId}
      })
    },
    isSelected(prefix, answerString) {
      if (!answerString) return false
      return answerString.split(',').includes(prefix)
    },
    formatAnswer(answer) {
      if (!answer) return '-'
      return answer.split(',').join('、')
    },
    formatCorrectAnswer(item) {
      if (item.questionType === 2 && item.correctArray && item.correctArray.length) {
        return item.correctArray.join('、')
      }
      return item.correct || '-'
    }
  }
}
</script>

<style scoped>
.wrong-card {
  border: 1px solid #e5e7eb;
}
.error-count {
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
}
.error-count .label {
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 8px;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
  border: 1px solid #fecaca;
}
.error-count .value {
  background: #dc2626;
  color: #fff;
  padding: 2px 10px;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
  border: 1px solid #dc2626;
}
</style>

