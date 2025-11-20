<!--
*@index
*@author Zww
*@date 2024/10/7 17:40
-->
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading">
      <div
          class="detailItem border relative mb-4 shadow rounded-md bg-white"
          v-for="paperAnswer in paperAnswerList"
          :key="paperAnswer.paperAnswerId">
        <div class="header p-4 bg-gray-100 flex justify-between items-center">
          <span class="font-semibold text-lg text-gray-800">{{ paperAnswer.paperName }}</span>
          <el-tag size="mini" type="success">已完成</el-tag>
        </div>
        <div class="detailDesc text-sm p-6 flex flex-wrap">
          <ul class="mr-8">
            <li><p class="leading-8">科目: {{ transfer(paperAnswer.subjectId) }}</p></li>
            <li><p class="leading-8">题目数量: {{ paperAnswer.questionCount }}</p></li>
            <li><p class="leading-8">提交时间: {{ paperAnswer.createTime }}</p></li>
          </ul>
          <ul class="mr-8">
            <li><p class="leading-8">总分: {{ paperAnswer.paperScore }}</p></li>
            <li><p class="leading-8">得分: {{ paperAnswer.finalScore }}</p></li>
            <li><p class="leading-8">正确题数: {{ paperAnswer.correctCount }}</p></li>
          </ul>
          <ul>
            <li><p class="leading-8">耗时: {{ formatSeconds(paperAnswer.doTime) }}</p></li>
          </ul>
        </div>
        <div class="checkButton">
          <button
              @click="gotoReview(paperAnswer.paperAnswerId)"
              class="bg-blue-500 absolute right-4 bottom-4 px-4 py-2 text-white rounded">查看试卷
          </button>
        </div>
      </div>
      <el-empty v-if="!loading && !paperAnswerList.length" description="暂无考试记录"/>
    </div>
  </div>
</template>

<script>
import {getPaperAnswerList} from "@/api/paperAnswer";
import {formatSeconds} from "@/utils/time";
import {optionSubject} from "@/api/subject";

export default {
  name: "index",
  props: {},
  components: {},
  data() {
    return {
      paperAnswerList: [],
      loading: false,
      subjectMap:{},
      subjectOptions: [],
      filters:{
        paperName:'',
        subjectId:'',
        dateRange: []
      },
      queryParam:{
        createUser:this.$store.getters['id']
      }
    }
  },
  created() {
    this.loadSubjects();
    this.getPaperAnswerList()
  },
  methods: {
    async loadSubjects() {
      const res = await optionSubject()
      const list = res.data || []
      this.subjectMap = list.reduce((acc, cur) => {
        acc[cur.subjectId] = cur.subjectName
        return acc
      }, {})
      this.subjectOptions = list
    },
    transfer(subjectId) {
      return this.subjectMap[subjectId] || '-'
    },
    formatSeconds(seconds) {
      return formatSeconds(seconds)
    },
    buildQueryParams() {
      const params = {
        createUser: this.queryParam.createUser
      }
      if (this.filters.paperName) {
        params.paperName = this.filters.paperName
      }
      if (this.filters.subjectId) {
        params.subjectId = this.filters.subjectId
      }
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        params.beginTime = this.filters.dateRange[0]
        params.endTime = this.filters.dateRange[1]
      }
      return params
    },
    async getPaperAnswerList() {
      this.loading = true
      try {
        const res = await getPaperAnswerList(this.buildQueryParams())
        this.paperAnswerList = res.data || []
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.getPaperAnswerList()
    },
    handleReset() {
      this.filters = {
        paperName: '',
        subjectId: '',
        dateRange: []
      }
      this.getPaperAnswerList()
    },
    gotoReview(paperAnswerId) {
      this.$router.push({
        // path:`/review/${examId}`
        path: '/review',
        query: {paperAnswerId: paperAnswerId}
      })
    }
  },
}
</script>

<style scoped>

</style>
