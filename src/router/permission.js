/**
 * 前端路由权限守卫
 * 
 * 功能说明：
 * 1. 允许访问首页（不需要登录）
 * 2. 访问需要登录的页面时，未登录则重定向到登录页
 * 3. 登录页路径携带redirect参数，用于登录成功后返回原页面
 * 4. WebSocket请求二维码时携带redirect参数
 */

import router from './index'
import store from '@/store'

// 白名单：不需要登录就可以访问的页面
const whiteList = [
  '/',           // 首页
  '/login',      // 登录页
  '/register',   // 注册页
  '/about'       // 关于页
]

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 获取token
  const token = store.getters.token || localStorage.getItem('token')
  
  console.log('路由守卫 - to:', to.path, 'token:', !!token)
  
  if (token) {
    // 已登录
    if (to.path === '/login') {
      // 如果已登录，访问登录页则重定向到首页
      next({ path: '/' })
    } else {
      // 正常访问
      next()
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接放行
      next()
    } else {
      // 不在白名单中，重定向到登录页，并携带当前路径
      console.log('未登录，重定向到登录页，原路径:', to.fullPath)
      next({
        path: '/login',
        query: {
          redirect: to.fullPath  // 保存目标路径
        }
      })
    }
  }
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 设置页面标题
  document.title = to.meta.title || '刷题系统'
  
  // 从登录页跳转出来时，触发公告检查事件
  if (from && from.path === '/login' && to.path !== '/login') {
    const token = store.getters.token || localStorage.getItem('token')
    if (token) {
      console.log('[路由守卫] 登录成功，准备触发公告检查')
      // 使用事件总线通知layout组件检查公告
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('check-notice', { detail: { from: 'login' } }))
      }, 1000)
    }
  }
})

export default router
