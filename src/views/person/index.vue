<!--
*@index
*@author Zww
*@date 2024/10/7 15:25
-->
<template>
  <wrapper padding="0" class="flex" style="min-height: calc(100vh - 100px)">
    <el-card class="w-1/4 ">
      <div class="header flex justify-center font-bold mb-5">
        个人中心
      </div>
      <ul>
        <li>
          <a
              @click="swtichContent('/person/info')"
              :class="['flex p-3 px-4 rounded-2xl items-baseline cursor-pointer', isActive('/person/info') ? 'bg-blue-500 text-white' : '']"
          >
            <i class="fa fa-book mr-4"></i>
            <span>个人信息</span>
          </a>
        </li>
        <li>
          <a
              @click="swtichContent('/person/record')"
              :class="['flex p-3 px-4 rounded-2xl items-baseline cursor-pointer', isActive('/person/record') ? ' bg-blue-500 text-white' : '']">
            <i class="fa fa-book mr-4"></i>
            <span>考试记录</span>
          </a>
        </li>
        <li>
          <a
              @click="swtichContent('/person/wrong')"
              :class="['flex p-3 px-4 rounded-2xl items-baseline cursor-pointer', isActive('/person/wrong') ? ' bg-blue-500 text-white' : '']">
            <i class="fa fa-times mr-4"></i>
            <span>错题记录</span>
          </a>
        </li>
        <li>
          <a
              @click="swtichContent('/person/favorite')"
              :class="['flex p-3 px-4 rounded-2xl items-baseline cursor-pointer', isActive('/person/favorite') ? ' bg-blue-500 text-white' : '']">
            <i class="fa fa-star mr-4"></i>
            <span>收藏题目</span>
          </a>
        </li>
        <li>
          <a
              @click="swtichContent('/person/posts')"
              :class="['flex p-3 px-4 rounded-2xl items-baseline cursor-pointer', isActive('/person/posts') ? ' bg-blue-500 text-white' : '']">
            <i class="fa fa-commenting mr-4"></i>
            <span>我的帖子</span>
          </a>
        </li>
        <li>
          <a
              @click="swtichContent('/person/dashboard')"
              :class="['flex p-3 px-4 rounded-2xl items-baseline cursor-pointer', isActive('/person/dashboard') ? ' bg-blue-500 text-white' : '']">
            <i class="fa fa-bar-chart mr-4"></i>
            <span>学习报表</span>
          </a>
        </li>
      </ul>
    </el-card>
    <div class="personInfo p-10 w-3/4">
      <router-view></router-view>
    </div>

  </wrapper>
</template>

<script>
import Wrapper from "@/components/wrapper.vue";

export default {
  name: "index",
  props: {},
  components: {Wrapper},
  data() {
    return {}
  },
  methods: {
    isActive(path) {
      return this.$route.path === path; // 判断当前路由是否匹配
    },
    // 切换展示内容
    swtichContent(path) {
      if (this.$route.path === path) {
        return
      }
      this.$router.push({
        path,
        // path:'/paper',
        // query: {examId}
      })
    }
  },
}
</script>

<style scoped>

</style>
