<template>
  <div class="w-full">
    <!-- 顶部导航栏 start -->

    <nav class="bg-gray-800 h-16 fixed w-full z-10  ">
      <div class="container mx-auto h-full flex justify-between items-center p-4">
        <div class="text-white text-lg font-semibold cursor-pointer" @click="goToUrl('/home')">Daming Paper</div>
        <div class="hidden md:flex space-x-4 flex items-center">
          <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white ">首页</a>
          <a href="#" @click="goToUrl('/ai')" class="block text-gray-300 hover:text-white ">AI</a>
          <a href="#" @click="goToUrl('/person/info')" class="block text-gray-300 hover:text-white ">个人</a>
          <a href="#">
            <div @click="goToUrl('/person/info')">
              <img :src="avatar" alt="" style="width: 50px;height: 50px;border-radius: 100%">
            </div>
          </a>
          <a href="#" class="text-white">
            {{ name }}
          </a>
          <a href="#">
            <el-button @click="logout" style="height: 40px;">
              退出登录
            </el-button>
          </a>
        </div>
        <div class="md:hidden">
          <button @click="toggleMenu" class="text-white bg-gray-500 p-1 rounded-md focus:outline-none text-2xl "
                  id="hamburger-button">
            &#9776; <!-- 汉堡图标 -->
          </button>
        </div>
      </div>
    </nav>
    <transition name="fade">
      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" id="mobile-menu"
           class="md:hidden bg-gray-800 absolute top-16 left-0 w-full z-30 ">
        <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white p-4">首页</a>
        <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white p-4">关于</a>
        <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white p-4">服务</a>
        <a href="#" @click="goToUrl('/person/info')" class="block text-gray-300 hover:text-white p-4">个人</a>
        <a href="#" @click="goToUrl('/ai')" class="block text-gray-300 hover:text-white p-4">AI</a>
      </div>
    </transition>
    <!-- 顶部导航栏 end -->

    <!-- 中间主体 start -->
    <main class=" bg-gray-200 pt-20 p-4 ">
      <!-- 这里可以添加页面内容 -->
      <!--<keep-alive>-->
      <router-view></router-view>
      <!--</keep-alive>-->
      <!-- 防止路由标签，动态切换 -->
    </main>

    <!-- 底部footer页脚 start -->
    <footer>

    </footer>
    <!-- 底部footer页脚 end -->
  </div>
</template>

<script>
// 简单的 JavaScript 来切换移动菜单的显示状态

import {mapGetters} from "vuex";

export default {
  name: 'DamingFrontIndex',

  computed: {
    ...mapGetters([
      'avatar', 'name'
    ]),
  },
  mounted() {
    // 添加全局点击事件监听器
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    // 移除全局点击事件监听器
    document.removeEventListener('click', this.handleClickOutside);
  },
  data() {
    return {
      isMenuOpen: false,
    };
  },

  methods: {
    async logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.href = '/';
      })
    },
    goToUrl(url) {
      // 同时我们在点击menu菜单跳转时要收缩下拉框
      this.isMenuOpen = false; // 收缩菜单
      if (url === this.$route.path || !url) {
        return
      }
      this.$router.push(url);
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen; // 切换菜单状态
    },
    handleClickOutside(event) {
      const menu = this.$el.querySelector('#mobile-menu');
      const hamburgerButton = this.$el.querySelector('#hamburger-button');
      // 只在点击菜单外部时收缩菜单
      // 原理为，监听点击事件传入事件对象，判断这个事件对象在不在我们要求的范围内，如果为!不在则真，那么就收缩
      // contains前类似于白名单，我们还需把汉堡包按钮加入白名单，不在汉堡包div里面的点击才会收缩
      if (menu && !menu.contains(event.target) && !hamburgerButton.contains(event.target) && this.isMenuOpen) {
        this.isMenuOpen = false; // 收缩菜单
      }
    },
  },
};
</script>
<style scoped>
/* 添加过渡效果的样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease; /* 过渡效果 */
}

.fade-enter, .fade-leave-to /* .fade-leave-active 在 Vue 2 中使用 */
{
  opacity: 0; /* 初始透明度 */
  transform: translateY(-20px); /* 向上移动 */
}
</style>
