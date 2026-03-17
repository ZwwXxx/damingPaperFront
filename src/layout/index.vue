<template>
  <div class="w-full">
    <!-- 当 showLoginAnimation 为 false 时，才渲染导航栏 / 主体 / 公告 -->
    <div v-if="!showLoginAnimation">
      <!-- 顶部导航栏 start -->
      <nav class="bg-gray-800 h-16 fixed w-full z-10 nav-bar" :class="{ 'nav-hidden': isNavHidden }">
        <div class="container mx-auto h-full flex justify-between items-center p-4">
          <div class="text-white text-lg font-semibold cursor-pointer" @click="goToUrl('/home')">Daming Paper</div>
          <div class="hidden md:flex space-x-4 items-center">
            <a
              href="#"
              @click="goToUrl('/home')"
              class="block px-3 py-2"
              :class="navLinkClass('/home')"
            >首页</a>
            <a
              href="#"
              @click="goToUrl('/practice')"
              class="block px-3 py-2"
              :class="navLinkClass('/practice')"
            >专练</a>
            <a href="#" @click="goToUrl('/forum/index')" class="block text-gray-300 hover:text-white px-3 py-2">论坛</a>
            <a href="#" @click="goToUrl('/knowledge')" class="block text-gray-300 hover:text-white px-3 py-2">知识库</a>
            <a href="#" @click="goToUrl('/notice/list')" class="block text-gray-300 hover:text-white px-3 py-2 relative">
              公告
              <span v-if="hasUnreadNotice" class="notice-dot"></span>
            </a>
            <a href="#" @click="goToUrl('/feedback/submit')" class="block text-gray-300 hover:text-white px-3 py-2">反馈</a>
            <a href="#" @click="goToUrl('/ai')" class="block text-gray-300 hover:text-white px-3 py-2">AI</a>
            <a href="#" @click="goToUrl('/contact')" class="block text-gray-300 hover:text-white px-3 py-2">联系</a>
            <el-dropdown trigger="hover" @command="handleUserCommand">
              <span class="avatar-wrapper block px-3 py-2 cursor-pointer text-gray-300 hover:text-white">
                <img :src="avatar" alt="avatar" class="avatar-img">
                <i class="el-icon-arrow-down ml-1"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="feedback">我的反馈</el-dropdown-item>
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
             class="md:hidden bg-gray-800 absolute left-0 w-full z-30"
             :class="{ 'mobile-menu-hidden': isNavHidden }"
             :style="{ top: isNavHidden ? '0' : '64px' }">
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
          <a href="#" @click="goToUrl('/practice')" class="block text-gray-300 hover:text-white p-4">专练</a>
          <a href="#" @click="goToUrl('/forum/index')" class="block text-gray-300 hover:text-white p-4">论坛</a>
          <a href="#" @click="goToUrl('/knowledge')" class="block text-gray-300 hover:text-white p-4">知识库</a>
          <a href="#" @click="goToUrl('/notice/list')" class="block text-gray-300 hover:text-white p-4 relative">
            公告
            <span v-if="hasUnreadNotice" class="notice-dot"></span>
          </a>
          <a href="#" @click="goToUrl('/feedback/submit')" class="block text-gray-300 hover:text-white p-4">反馈</a>
          <a href="#" @click="goToUrl('/ai')" class="block text-gray-300 hover:text-white p-4">AI</a>
          <a href="#" @click="goToUrl('/contact')" class="block text-gray-300 hover:text-white p-4">联系</a>
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
    
      <!-- 可爱公告弹窗 -->
      <transition name="notice-bounce">
        <div v-if="noticeDialogVisible" class="notice-dialog-overlay" @click.self="closeNoticeDialog">
          <div class="notice-dialog-container">
            <!-- 装饰元素 -->
            <div class="notice-decoration">
              <div class="decoration-star star-1">⭐</div>
              <div class="decoration-star star-2">✨</div>
              <div class="decoration-star star-3">💫</div>
              <div class="decoration-circle circle-1"></div>
              <div class="decoration-circle circle-2"></div>
            </div>
            
            <!-- 关闭按钮 -->
            <button class="notice-close-btn" @click="closeNoticeDialog">
              <i class="el-icon-close"></i>
            </button>
            
            <!-- 弹窗内容 -->
            <div class="notice-dialog-content">
              <!-- 标题区域 -->
              <div class="notice-header">
                <div class="notice-icon-wrapper">
                  <span class="notice-icon">📢</span>
                </div>
                <h3 class="notice-title">最新公告</h3>
                <p class="notice-subtitle">重要消息，请及时查看哦~</p>
              </div>
              
              <!-- 公告内容 -->
              <div class="notice-body" v-if="latestNotice">
                <div class="notice-item-card">
                  <div class="notice-item-header">
                    <el-tag :type="getNoticeTypeTag(latestNotice.noticeType)" size="small" class="notice-type-tag">
                      {{ getNoticeTypeName(latestNotice.noticeType) }}
                    </el-tag>
                    <span class="notice-time">
                      <i class="el-icon-time"></i>
                      {{ formatNoticeTime(latestNotice.publishTime) }}
                    </span>
                  </div>
                  <h4 class="notice-item-title">{{ latestNotice.noticeTitle }}</h4>
                  <p class="notice-item-content">{{ getNoticePreview(latestNotice.noticeContent) }}</p>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="notice-footer">
                <el-button size="medium" @click="closeNoticeDialog">稍后查看</el-button>
                <el-button type="primary" size="medium" @click="viewNoticeDetail">立即查看</el-button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Lottie登录动画（单独挂在根节点下，避免首页闪烁） -->
    <LottieAnimation 
      :show="showLoginAnimation" 
      @complete="handleAnimationComplete"
    />
  </div>
</template>

<script>
// 简单的 JavaScript 来切换移动菜单的显示状态

import {mapGetters} from "vuex";
import { getLatestNotices, markNoticeAsRead } from "@/api/notice";
import LottieAnimation from "@/components/LottieAnimation.vue";

export default {
  name: 'DamingFrontIndex',
  components: {
    LottieAnimation
  },
  computed: {
    ...mapGetters([
      'avatar', 'name', 'token'
    ]),
  },
  mounted() {
    // 添加全局点击事件监听器
    document.addEventListener('click', this.handleClickOutside);
    // 添加滚动事件监听器
    this.scrollHandler = this.throttle(this.handleScroll, 16); // 约60fps
    window.addEventListener('scroll', this.scrollHandler);
    
    // 检查是否需要显示登录动画（强制3秒）
    this.checkLoginAnimation();
    
    // 页面加载时检查未读公告（延迟执行，确保页面渲染完成）
    if (this.token && this.$route.path !== '/login') {
      // 延迟检查，确保页面完全加载
      setTimeout(() => {
        this.checkUnreadNotice();
      }, 1200);
    }
    
    // 监听自定义事件：登录成功后检查公告
    window.addEventListener('check-notice', this.handleCheckNoticeEvent);
  },
  beforeDestroy() {
    // 移除全局点击事件监听器
    document.removeEventListener('click', this.handleClickOutside);
    // 移除滚动事件监听器
    window.removeEventListener('scroll', this.scrollHandler);
    // 移除自定义事件监听器
    window.removeEventListener('check-notice', this.handleCheckNoticeEvent);
    // 清除定时器
    if (this.checkNoticeTimer) {
      clearTimeout(this.checkNoticeTimer);
    }
  },
  watch: {
    // 监听路由变化，页面切换时也检查公告
    '$route': {
      handler(to, from) {
        // 从登录页跳转出来时，延迟检查
        if (from && from.path === '/login' && to.path !== '/login' && this.token) {
          console.log('[公告检查] 从登录页跳转，准备检查公告');
          setTimeout(() => {
            this.checkUnreadNotice();
          }, 1500);
        }
        // 其他页面切换时也检查（但延迟更短，避免频繁请求）
        else if (to.path !== '/login' && this.token && from && from.path !== to.path) {
          // 使用防抖，避免频繁检查
          if (this.checkNoticeTimer) {
            clearTimeout(this.checkNoticeTimer);
          }
          this.checkNoticeTimer = setTimeout(() => {
            this.checkUnreadNotice();
          }, 800);
        }
      },
      immediate: false
    }
  },
  data() {
    return {
      isMenuOpen: false,
      isNavHidden: false, // 导航栏是否隐藏
      lastScrollTop: 0, // 上次滚动位置
      scrollThreshold: 10, // 滚动阈值，避免小幅度滚动触发
      scrollHandler: null,
      hasUnreadNotice: false, // 是否有未读公告
      noticeDialogVisible: false, // 公告弹窗是否显示
      latestNotice: null, // 最新公告
      checkingNotice: false, // 是否正在检查公告（防止重复请求）
      checkNoticeTimer: null, // 检查公告的定时器
      lastCheckTime: null, // 上次检查的时间戳
      // 初始化时就根据 sessionStorage 判断是否需要显示登录动画，
      // 避免首帧先渲染首页再切换到动画造成闪屏
      showLoginAnimation: sessionStorage.getItem('showLoginAnimation') === 'true' && !!this.$store && !!this.$store.getters && !!this.$store.getters.token,
      // 登录 Lottie 动画的兜底定时器，防止异常情况下动画一直不结束
      loginAnimationTimer: null
    };
  },

  methods: {
    navLinkClass(path) {
      const isActive = this.$route && this.$route.path === path;
      return isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white';
    },
    async logout() {
      this.$confirm('确定要退出登录吗？', '退出确认', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          this.$message.success('退出成功')
          // 退出后跳转到登录页
          this.$router.push('/login')
        }).catch(() => {
          // 即使退出失败，也跳转到登录页
          this.$router.push('/login')
        })
      }).catch(() => {
      });
    },
    handleUserCommand(command) {
      if (command === 'profile') {
        this.goToUrl('/person/info');
      } else if (command === 'feedback') {
        this.goToUrl('/feedback/my');
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
    /** 处理页面滚动 */
    handleScroll() {
      // 如果移动端菜单展开，不处理导航栏隐藏
      if (this.isMenuOpen) {
        return;
      }
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 在顶部时总是显示导航栏
      if (scrollTop <= 100) {
        this.isNavHidden = false;
        this.lastScrollTop = scrollTop;
        return;
      }
      
      // 计算滚动差值
      const scrollDiff = Math.abs(scrollTop - this.lastScrollTop);
      
      // 只有滚动超过阈值才处理
      if (scrollDiff < this.scrollThreshold) {
        return;
      }
      
      // 向下滚动隐藏导航栏
      if (scrollTop > this.lastScrollTop && !this.isNavHidden) {
        this.isNavHidden = true;
        // 同时关闭移动端菜单（如果打开的话）
        if (this.isMenuOpen) {
          this.isMenuOpen = false;
        }
      }
      // 向上滚动显示导航栏
      else if (scrollTop < this.lastScrollTop && this.isNavHidden) {
        this.isNavHidden = false;
      }
      
      this.lastScrollTop = scrollTop;
    },
    /** 节流函数 - 控制函数执行频率 */
    throttle(func, limit) {
      let lastFunc;
      let lastRan;
      return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
          func.apply(context, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function() {
            if ((Date.now() - lastRan) >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    },
    /** 检查未读公告 */
    async checkUnreadNotice() {
      // 防止重复请求（但允许在3秒后重新检查）
      if (this.checkingNotice) {
        const now = Date.now();
        if (this.lastCheckTime && (now - this.lastCheckTime) < 3000) {
          console.log('[公告检查] 正在检查中，跳过本次请求');
          return;
        }
      }
      
      // 未登录不检查
      if (!this.token) {
        console.log('[公告检查] 未登录，跳过检查');
        return;
      }
      
      // 在登录页不检查
      if (this.$route.path === '/login') {
        console.log('[公告检查] 在登录页，跳过检查');
        return;
      }
      
      this.checkingNotice = true;
      this.lastCheckTime = Date.now();
      
      try {
        console.log('[公告检查] ========== 开始检查未读公告 ==========');
        console.log('[公告检查] Token:', this.token ? '存在' : '不存在');
        console.log('[公告检查] 当前路由:', this.$route.path);
        
        const res = await getLatestNotices();
        console.log('[公告检查] API响应:', res);
        
        if (res.code === 200 && res.data) {
          const data = res.data;
          const notices = data.notices || [];
          const unreadNoticeIds = data.unreadNoticeIds || [];
          const hasUnread = data.hasUnread || false;
          
          console.log('[公告检查] 公告列表:', notices);
          console.log('[公告检查] 未读公告ID列表:', unreadNoticeIds);
          console.log('[公告检查] 是否有未读:', hasUnread);
          
          if (notices.length > 0 && hasUnread && unreadNoticeIds.length > 0) {
            // 取第一个未读公告显示
            const latestUnreadNoticeId = unreadNoticeIds[0];
            const latestNotice = notices.find(n => n.noticeId === latestUnreadNoticeId) || notices[0];
            
            console.log('[公告检查] ✅ 找到未读公告，准备显示弹窗');
            console.log('[公告检查] 最新未读公告:', latestNotice);
            
            this.latestNotice = latestNotice;
            this.hasUnreadNotice = true;
            
            // 延迟800ms弹出，让页面先加载完成
            setTimeout(() => {
              console.log('[公告检查] 🎉 显示公告弹窗');
              this.noticeDialogVisible = true;
            }, 800);
          } else {
            console.log('[公告检查] 没有未读公告');
            this.hasUnreadNotice = hasUnread;
          }
        } else {
          console.log('[公告检查] 没有公告数据，code:', res.code, 'data:', res.data);
          this.hasUnreadNotice = false;
        }
      } catch (error) {
        console.error('[公告检查] ❌ 检查失败:', error);
        console.error('[公告检查] 错误详情:', error.response || error.message);
        this.hasUnreadNotice = false;
      } finally {
        this.checkingNotice = false;
        console.log('[公告检查] ========== 检查完成 ==========');
      }
    },
    /** 关闭公告弹窗 */
    async closeNoticeDialog() {
      this.noticeDialogVisible = false;
      // 标记为已读
      if (this.latestNotice && this.latestNotice.noticeId) {
        try {
          await markNoticeAsRead(this.latestNotice.noticeId);
          console.log('[公告检查] 已标记公告为已读:', this.latestNotice.noticeId);
          // 更新红点状态
          this.hasUnreadNotice = false;
        } catch (error) {
          console.error('[公告检查] 标记已读失败:', error);
        }
      }
    },
    /** 查看公告详情 */
    viewNoticeDetail() {
      this.closeNoticeDialog();
      this.$router.push({
        path: '/notice/list',
        query: { noticeId: this.latestNotice?.noticeId }
      });
    },
    /** 获取公告类型标签 */
    getNoticeTypeTag(type) {
      const typeMap = {
        1: 'info',    // 通知
        2: 'warning', // 公告
        3: 'success'  // 活动
      };
      return typeMap[type] || 'info';
    },
    /** 获取公告类型名称 */
    getNoticeTypeName(type) {
      const typeMap = {
        1: '通知',
        2: '公告',
        3: '活动'
      };
      return typeMap[type] || '通知';
    },
    /** 格式化公告时间 */
    formatNoticeTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60));
          return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
        }
        return `${hours}小时前`;
      } else if (days === 1) {
        return '昨天';
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      }
    },
    /** 获取公告预览（截取前100字） */
    getNoticePreview(content) {
      if (!content) return '';
      const plainText = content.replace(/<[^>]+>/g, '').trim();
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    },
    /** 处理检查公告的自定义事件 */
    handleCheckNoticeEvent(event) {
      console.log('[公告检查] 收到检查公告事件:', event.detail);
      if (this.token && this.$route.path !== '/login') {
        // 延迟检查，确保页面已完全加载
        setTimeout(() => {
          this.checkUnreadNotice();
        }, 1500);
      }
    },
    /** 检查是否需要显示登录动画（挂载后处理计时和清理） */
    checkLoginAnimation() {
      if (!this.showLoginAnimation) {
        return;
      }
      // 已经根据 data 初始值决定显示动画，这里只负责计时和清除标记
      sessionStorage.removeItem('showLoginAnimation');
      // 不再用固定 3 秒强制关闭，而是：
      // 1）优先等待 Lottie 组件触发 complete 事件（见 handleAnimationComplete）
      // 2）同时设置一个兜底超时时间，防止 complete 异常未触发导致页面一直黑屏
      if (this.loginAnimationTimer) {
        clearTimeout(this.loginAnimationTimer);
      }
      this.loginAnimationTimer = setTimeout(() => {
        this.showLoginAnimation = false;
        this.loginAnimationTimer = null;
      }, 8000); // 根据动画总时长可以再微调
    },
    /** 动画完成后的处理 */
    handleAnimationComplete() {
      // Lottie 播放完整一次后触发，优先用它来关闭动画
      if (!this.showLoginAnimation) {
        return;
      }
      if (this.loginAnimationTimer) {
        clearTimeout(this.loginAnimationTimer);
        this.loginAnimationTimer = null;
      }
      this.showLoginAnimation = false;
    }
  },
};
</script>
<style scoped>
/* 导航栏滚动隐藏动画 */
.nav-bar {
  transition: transform 0.1s ease-in-out;
}

.nav-bar.nav-hidden {
  transform: translateY(-100%);
}

/* 移动端菜单样式调整 */
#mobile-menu {
  transition: top 0.3s ease-in-out;
}

.mobile-menu-hidden {
  top: 0 !important;
}

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

/* 公告红点标识 */
.notice-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  border: 2px solid #2d3748;
  animation: notice-pulse 2s infinite;
}

@keyframes notice-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

/* 公告弹窗样式 */
.notice-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.notice-dialog-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: notice-dialog-enter 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes notice-dialog-enter {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.notice-bounce-enter-active {
  animation: notice-bounce-in 0.6s;
}

.notice-bounce-leave-active {
  animation: notice-bounce-out 0.4s;
}

@keyframes notice-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes notice-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

/* 装饰元素 */
.notice-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.decoration-star {
  position: absolute;
  font-size: 24px;
  animation: star-float 3s ease-in-out infinite;
}

.star-1 {
  top: 20px;
  left: 30px;
  animation-delay: 0s;
}

.star-2 {
  top: 40px;
  right: 40px;
  animation-delay: 1s;
}

.star-3 {
  bottom: 60px;
  left: 50px;
  animation-delay: 2s;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: circle-float 4s ease-in-out infinite;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: -40px;
  right: -40px;
  animation-delay: 0.5s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  bottom: -30px;
  left: -30px;
  animation-delay: 1.5s;
}

@keyframes star-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 1;
  }
}

@keyframes circle-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(10px, -10px) scale(1.1);
    opacity: 0.5;
  }
}

/* 关闭按钮 */
.notice-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.notice-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg) scale(1.1);
}

/* 弹窗内容 */
.notice-dialog-content {
  position: relative;
  z-index: 1;
  background: white;
  margin: 4px;
  border-radius: 20px;
  padding: 32px;
}

.notice-header {
  text-align: center;
  margin-bottom: 24px;
}

.notice-icon-wrapper {
  margin-bottom: 12px;
}

.notice-icon {
  font-size: 64px;
  display: inline-block;
  animation: icon-bounce 2s ease-in-out infinite;
}

@keyframes icon-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.notice-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.notice-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.notice-body {
  margin-bottom: 24px;
}

.notice-item-card {
  background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.notice-item-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.notice-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.notice-type-tag {
  font-weight: 500;
}

.notice-time {
  font-size: 12px;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-item-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.notice-item-content {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.notice-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.notice-footer .el-button {
  border-radius: 12px;
  padding: 10px 24px;
  font-weight: 500;
}
</style>
