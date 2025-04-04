<!--
*@index
*@author Zww
*@date 2024/10/7 17:40
-->
<template>
  <div class="container">
    <div class="detailItem border-2 relative mb-4 shadow-xl rounded-md" v-for="paperAnswer in  paperAnswerList"
         :key="paperAnswer.paperAnswerId">
      <div class="header p-4 bg-gray-100">{{ paperAnswer.paperName }}</div>
      <div class="detailDesc text-sm p-6 flex">
        <ul>
          <li>
            <p class="leading-8">科目: {{ transfer(paperAnswer.subjectId) }}</p>
          </li>
          <li><p class="leading-8">总分: {{ paperAnswer.paperScore }}</p></li>
          <li><p class="leading-8">得分: {{ paperAnswer.finalScore }}</p></li>
        </ul>
        <ul class="mx-16">
          <li>
            <p class="leading-8">题目数量: {{ paperAnswer.questionCount }}</p>
          </li>
          <li><p class="leading-8">正确题数: {{ paperAnswer.correctCount }}</p></li>
          <li><p class="leading-8">耗时: {{ formatSeconds(paperAnswer.doTime) }} </p></li>
        </ul>
        <ul>
          <li>
            <p class="leading-8">提交时间: {{ paperAnswer.createTime }}</p>
          </li>

          <li class="flex items-center">
            <p class="leading-8">试卷状态：
            </p>
            <el-tag type="success">已完成</el-tag>
          </li>
        </ul>
      </div>
      <div class="checkButton">
        <button
            @click="gotoReview(paperAnswer.paperAnswerId)"
            class="bg-blue-500 absolute right-0 bottom-0 p-3 text-white">查看试卷
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {getPaperAnswerList} from "@/api/paperAnswer";
import {formatSeconds} from "@/utils/time";

export default {
  name: "index",
  props: {},
  components: {},
  data() {
    return {
      paperAnswerList: [],
      queryParam:{
        createUser:this.$store.getters['id']
      }
    }
  },
  created() {
    this.getPaperAnswerList()
  },
  methods: {
    transfer(subjectId) {
      if (subjectId === 1) {
        return "高等数学"
      } else if (subjectId === 2) {
        return "政治"
      } else if (subjectId === 3) {
        return "计算机基础与程序设计"
      }

    },
    formatSeconds(seconds) {
      return formatSeconds(seconds)
    },
    async getPaperAnswerList() {
      const res = await getPaperAnswerList(this.queryParam)
      this.paperAnswerList = res.data
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
