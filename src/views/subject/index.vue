<script>
import wrapper from '@/components/wrapper.vue';
import {listPaperBySubjectId} from "@/api/paper";

export default {
  name: "index",
  components: {
    wrapper
  },
  created() {
    this.formData.subjectId = this.$route.params.subjectId
    this.getList();
  },
  data() {
    return {
      selectedType: 'realExam', // 默认选择的类型
      selectedYear: 'all', // 默认选择的年份
      formData:{
      paperType: 1,//默认试卷类型
      subjectId: undefined,//默认科目id
      },
      paperList: []
    };
  },
  methods: {
    /** 查询试卷列表 */
    getList() {
      listPaperBySubjectId(this.formData).then(res => {
        this.paperList = res.rows;
      })
      // listPaper(this.queryParams).then(response => {
      //   this.paperList = response.rows;
      //   this.total = response.total;
      // });
    },
    goBack() {
      this.$router.go(-1); // 返回上一个路由
    },
    fetchData(type) {
      if (this.formData.paperType !== type) { // 仅在选择不同类型时发送请求
        this.formData.paperType = type; // 设置当前选择的类型
        this.queryData(); // 发送查询请求
      }
    },
    fetchYearData(year) {
      if (this.selectedYear !== year) { // 仅在选择不同年份时发送请求
        this.selectedYear = year; // 设置当前选择的年份
        this.queryData(); // 发送查询请求
      }
    },
    queryData() {
      this.getList()
      // 这里是发送查询请求的逻辑，使用 selectedType 和 selectedYear
      // console.log(`查询请求发送: 类型 - ${this.selectedType}, 年份 - ${this.selectedYear}`);
      // 例如，使用 axios 发送请求
      // axios.get(`/api/data?type=${this.selectedType}&year=${this.selectedYear}`)
      //   .then(response => {
      //     // 处理响应数据
      //   });
    },
    isActiveType(type) {
      return this.formData.paperType === type; // 判断当前类型是否激活
    },
    isActiveYear(year) {
      return this.selectedYear === year; // 判断当前年份是否激活
    },
    gotoTest(paperId) {
      console.log(111)
      if (this.$route.params === paperId) {
        return
      }
      this.$router.push({
        name: 'paper',
        query: {paperId}
        // path:'/paper',
        // query: {examId}
      })
    }
  }
}
</script>

<template>
  <wrapper>
    <!--返回上一个页面按钮-->
    <div
        @click="goBack"
        class="absolute -top-3 -left-6 w-16 h-10 flex items-center justify-center bg-gradient-to-r text-white   rounded-md shadow-md bg-indigo-700  hover:bg-yellow-200 hover:text-red-500   ease duration-200 cursor-pointer">
      <i class="fa fa-arrow-left text-2xl  "></i>
    </div>
    <div class="type mb-4">
      <ul class="category flex space-x-2">
        <li>
          <a
              @click.prevent="fetchData(1)"
              :class="['block p-2 cursor-pointer rounded-md', isActiveType(1) ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"
          >
            真题
          </a>
        </li>
        <li>
          <a
              @click.prevent="fetchData(2)"
              :class="['block p-2 cursor-pointer rounded-md', isActiveType(2) ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"
          >
            模拟题
          </a>
        </li>
      </ul>
    </div>

    <!--<div class="year mb-4">-->
    <!--  <ul class="category flex space-x-2">-->
    <!--    <li>-->
    <!--      <a-->
    <!--          @click.prevent="fetchYearData('all')"-->
    <!--          :class="['block p-2 cursor-pointer rounded-md', isActiveYear('all') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"-->
    <!--      >-->
    <!--        全部-->
    <!--      </a>-->
    <!--    </li>-->
    <!--    <li>-->
    <!--      <a-->
    <!--          @click.prevent="fetchYearData('2024')"-->
    <!--          :class="['block p-2 cursor-pointer rounded-md', isActiveYear('2024') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"-->
    <!--      >-->
    <!--        2024-->
    <!--      </a>-->
    <!--    </li>-->
    <!--    <li>-->
    <!--      <a-->
    <!--          @click.prevent="fetchYearData('2023')"-->
    <!--          :class="['block p-2 cursor-pointer rounded-md', isActiveYear('2023') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"-->
    <!--      >-->
    <!--        2023-->
    <!--      </a>-->
    <!--    </li>-->
    <!--  </ul>-->
    <!--</div>-->
    <!--内容展示-->
    <div class="examList">
      <ul>
        <li class="flex p-4 justify-between items-center border-2 mb-2" v-for="paper in paperList" :key="paper.paperId">
          <div class="flex">
             <span class="icon p-2 flex items-center">
            <i class="fa fa-edit"></i>
          </span>
            <div class="ml-2">
              <p>
                {{ paper.paperId }}
              </p>
              <p class="text-sm flex space-x-6 mt-2">
                <span>试题数量:{{paper.questionCount}}</span>
                <span>观看人数:6666</span>
              </p>
            </div>
          </div>
          <div @click="gotoTest(paper.paperId)" class="start bg-blue-500 text-white p-4 cursor-pointer">开始答题</div>
        </li>
      </ul>
    </div>
  </wrapper>
</template>

<style scoped>

</style>
