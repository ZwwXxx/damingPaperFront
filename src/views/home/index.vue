<template>
  <wrapper>
    <!--头部介绍-->
    <div class=" text-center text-2xl font-bold p-4">科目</div>
    <ul class="category flex space-x-2 ">
      <li><a
          @click.prevent="navigateTo(1)"
          :class="[' rounded', isActive('/math') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"
          class="block p-2   cursor-pointer rounded-md ">高等数学</a></li>
      <li><a
          @click.prevent="navigateTo(2)"
          :class="[' rounded', isActive('/math') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"
          class="block p-2   cursor-pointer rounded-md ">政治</a></li>
      <li><a
          @click.prevent="navigateTo(3)"
          :class="[' rounded', isActive('/math') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-red-500']"
          class="block p-2   cursor-pointer rounded-md ">计算机基础与程序设计</a></li>
    </ul>
  </wrapper>
</template>

<script>
// import {  } from "";
import wrapper from "@/components/wrapper.vue";

export default {
  name: 'Home',
  components: {wrapper},
  data() {
    return {};
  },


  methods: {
    navigateTo(subjectId) {
      if (this.$route.path === subjectId) {
        return
      }
      this.$router.push({
        name: 'subject',
        params: {subjectId}
        // path:'/articleDetail',
        // query: {articleId}
      }) // 使用 Vue Router 进行路由跳转
    },
    isActive(path) {
      return this.$route.path === path; // 判断当前路由是否匹配
    }
  },
};
</script>
<style>

</style>
