<template>
  <div class="w-full">
    <!-- 顶部导航栏 start -->

    <nav class="bg-gray-800 h-16 fixed w-full z-10  ">
      <div class="container mx-auto h-full flex justify-between items-center p-4">
        <div class="text-white text-lg font-semibold cursor-pointer" @click="goToUrl('/home')">Daming Paper</div>
        <div class="hidden md:flex space-x-4 items-center">
          <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white px-3 py-2">首页</a>
          <a href="#" @click="goToUrl('/ai')" class="block text-gray-300 hover:text-white px-3 py-2">AI</a>
          <el-dropdown trigger="hover" @command="handleUserCommand">
            <span class="avatar-wrapper block px-3 py-2 cursor-pointer text-gray-300 hover:text-white">
              <img :src="avatar" alt="avatar" class="avatar-img">
              <i class="el-icon-arrow-down ml-1"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
        <div class="flex items-center p-4 border-b border-gray-700">
          <img
            :src="avatar"
            alt="avatar"
            class="w-12 h-12 rounded-full border border-gray-600 cursor-pointer"
            @click="goToUrl('/person/info')"
          >
          <div class="ml-3 flex-1 text-white">
            <p class="font-semibold">{{ name || '个人中心' }}</p>
            <p class="text-xs text-gray-300">点击头像进入个人资料</p>
          </div>
          <el-button type="primary" size="mini" @click="goToUrl('/person/info')">进入</el-button>
        </div>
        <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white p-4">首页</a>
        <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white p-4">关于</a>
        <a href="#" @click="goToUrl('/home')" class="block text-gray-300 hover:text-white p-4">服务</a>
        <a href="#" @click="goToUrl('/ai')" class="block text-gray-300 hover:text-white p-4">AI</a>
        <div class="p-4 border-t border-gray-700">
          <el-button type="danger" size="small" class="w-full" @click="logout">退出登录</el-button>
        </div>
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
      this.$confirm('确定要退出登录吗？', '退出确认', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/';
        })
      }).catch(() => {
      });
    },
    handleUserCommand(command) {
      if (command === 'profile') {
        this.goToUrl('/person/info');
      } else if (command === 'logout') {
        this.logout();
      }
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

/* 导航链接区域样式 */
nav a {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

nav .container {
  padding: 0 1rem;
  height: 100%;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
}

.avatar-img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
}
</style>
