<template>
  <wrapper>
    <!--头部介绍-->
    <div class=" text-center text-2xl font-bold p-4">科目</div>
    <ul class="category flex space-x-2 " v-if="subjectList.length">
      <li v-for="subject in subjectList" :key="subject.subjectId">
        <a
          @click.prevent="navigateTo(subject.subjectId)"
          :class="['rounded block p-2 cursor-pointer',
            isActive(subject.subjectId) ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"
        >
          {{ subject.subjectName }}
        </a>
      </li>
    </ul>
    <div v-else class="text-center text-gray-500 py-6">暂无可用科目</div>
  </wrapper>
</template>

<script>
// import {  } from "";
import wrapper from "@/components/wrapper.vue";
import {optionSubject} from "@/api/subject";

export default {
  name: 'Home',
  components: {wrapper},
  data() {
    return {
      subjectList: []
    };
  },


  methods: {
    async fetchSubjects() {
      const res = await optionSubject();
      this.subjectList = res.data || [];
    },
    navigateTo(subjectId) {
      if (String(this.$route.params.subjectId || '') === String(subjectId)) {
        return
      }
      this.$router.push({
        name: 'subject',
        params: {subjectId}
        // path:'/articleDetail',
        // query: {articleId}
      }) // 使用 Vue Router 进行路由跳转
    },
    isActive(subjectId) {
      return String(this.$route.params.subjectId || '') === String(subjectId);
    }
  },
  created() {
    this.fetchSubjects();
  }
};
</script>
<style>

</style>
