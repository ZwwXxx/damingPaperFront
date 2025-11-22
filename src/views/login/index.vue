<!--
*@index
*@author niemengshi
*@date 2024/10/16 10:09
-->
<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <!-- 浮动几何图形 -->
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
      <div class="floating-shape shape-5"></div>
      
      <!-- 粒子光点 -->
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
      <div class="particle particle-6"></div>
      <div class="particle particle-7"></div>
      <div class="particle particle-8"></div>
      
      <!-- 粒子连线画布 -->
      <canvas id="particleCanvas" class="particle-canvas"></canvas>
      
      <!-- 扫描线 -->
      <div class="scan-line"></div>
    </div>
    
    <!-- 登录卡片容器 -->
    <div class="login-card">
      
      <!-- 左侧：微信扫码登录 -->
      <div class="qr-section">
        <div class="qr-content">
          <div class="icon-wrapper">
            <i class="el-icon-mobile-phone"></i>
          </div>
          <h3 class="qr-title">微信扫码登录</h3>
          <p class="qr-desc">使用微信扫一扫 快速安全登录</p>
          
          <!-- 二维码区域 -->
          <div class="qr-code-box">
            <div class="qr-loading">
              <i class="el-icon-loading"></i>
              <p>二维码加载中...</p>
            </div>
          </div>
          
          <p class="qr-hint">打开微信扫描二维码</p>
        </div>
      </div>

      <!-- 右侧：账号登录 -->
      <div class="form-section">
        <!-- 标题 -->
        <div class="form-header">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">刷题系统 · 让学习更高效</p>
        </div>

        <!-- Tab切换 -->
        <div class="tab-wrapper">
          <div 
            @click="activeTab = 'code'"
            :class="['tab-item', { 'tab-active': activeTab === 'code' }]">
            <span>验证码登录</span>
          </div>
          <div 
            @click="activeTab = 'password'"
            :class="['tab-item', { 'tab-active': activeTab === 'password' }]">
            <span>密码登录</span>
          </div>
          <div class="tab-slider" :style="sliderStyle"></div>
        </div>

        <!-- 表单区域 -->
        <form @submit.prevent="handleSubmit" class="form-content">
          <!-- 验证码登录 -->
          <transition name="fade" mode="out-in">
            <div v-if="activeTab === 'code'" key="code" class="form-group">
              <div class="input-group">
                <label class="input-label">手机号</label>
                <el-input 
                  v-model="formData.phone" 
                  placeholder="请输入手机号"
                  prefix-icon="el-icon-mobile-phone"
                  size="large"
                  class="harmony-input">
                </el-input>
              </div>
              <div class="input-group">
                <label class="input-label">验证码</label>
                <div class="code-input-wrapper">
                  <el-input 
                    v-model="formData.code" 
                    placeholder="请输入验证码"
                    prefix-icon="el-icon-message"
                    size="large"
                    class="harmony-input">
                  </el-input>
                  <button 
                    type="button"
                    class="code-btn"
                    :disabled="countdown > 0"
                    @click="sendCode">
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 密码登录 -->
            <div v-else key="password" class="form-group">
              <div class="input-group">
                <label class="input-label">用户名</label>
                <el-input 
                  v-model="formData.userName" 
                  placeholder="请输入用户名"
                  prefix-icon="el-icon-user"
                  size="large"
                  class="harmony-input">
                </el-input>
              </div>
              <div class="input-group">
                <label class="input-label">密码</label>
                <el-input 
                  v-model="formData.password" 
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="el-icon-lock"
                  size="large"
                  show-password
                  class="harmony-input">
                </el-input>
              </div>
            </div>
          </transition>

          <!-- 记住我 & 忘记密码 -->
          <div class="form-options">
            <el-checkbox v-model="rememberMe" class="harmony-checkbox">记住我</el-checkbox>
            <a href="#" class="forgot-link">忘记密码？</a>
          </div>

          <!-- 登录按钮 -->
          <button type="submit" class="login-btn">
            <span>立即登录</span>
          </button>
        </form>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？
          <a href="#" @click.prevent="goToRegister">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login, registry} from "@/api/user";
import {setToken} from "@/utils/auth";

export default {
  name: "index",
  data() {
    return {
      // 当前激活的tab：password-密码登录, code-验证码登录
      activeTab: 'code',
      // 表单数据
      formData: {
        userName: '',
        password: '',
        phone: '',
        code: ''
      },
      // 记住我
      rememberMe: false,
      // 验证码倒计时
      countdown: 0,
      // 倒计时定时器
      timer: null
    }
  },
  computed: {
    // 计算tab滑块位置
    sliderStyle() {
      return {
        transform: this.activeTab === 'code' ? 'translateX(0)' : 'translateX(100%)'
      }
    }
  },
  methods: {
    // 提交登录
    async handleSubmit() {
      if (this.activeTab === 'password') {
        // 密码登录
        await this.loginByPassword()
      } else {
        // 验证码登录
        await this.loginByCode()
      }
    },
    
    // 密码登录
    async loginByPassword() {
      if (!this.formData.userName || !this.formData.password) {
        this.$message.warning('请输入用户名和密码')
        return
      }
      
      const res = await login({
        userName: this.formData.userName,
        password: this.formData.password
      })
      
      if (res.code === 200) {
        this.$message.success("登录成功")
        setToken(res.token)
        this.$store.commit("SET_TOKEN", res.token)
        this.$router.push({path:'/'})
      } else {
        this.$message.error(res.msg || "登录失败")
      }
    },
    
    // 验证码登录（预留接口）
    async loginByCode() {
      if (!this.formData.phone || !this.formData.code) {
        this.$message.warning('请输入手机号和验证码')
        return
      }
      
      // TODO: 调用验证码登录接口
      this.$message.info('验证码登录功能开发中...')
    },
    
    // 发送验证码
    async sendCode() {
      if (!this.formData.phone) {
        this.$message.warning('请输入手机号')
        return
      }
      
      // 手机号格式验证
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.formData.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      
      // TODO: 调用发送验证码接口
      this.$message.success('验证码已发送')
      
      // 开始倒计时
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },
    
    // 跳转到注册页面
    goToRegister() {
      this.$message.info('注册功能开发中...')
      // TODO: 跳转到注册页面或打开注册对话框
    }
  },
  
  mounted() {
    // 初始化粒子连线效果
    this.initParticleCanvas()
    
    // 添加鼠标移动监听
    this.handleMouseMove = (e) => {
      const shapes = document.querySelectorAll('.floating-shape')
      const particles = document.querySelectorAll('.particle')
      const mouseX = e.clientX
      const mouseY = e.clientY
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      // 几何图形跟随鼠标（反向移动，营造视差效果）
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.05
        const x = (mouseX - centerX) * speed
        const y = (mouseY - centerY) * speed
        shape.style.transform = `translate(${-x}px, ${-y}px)`
      })
      
      // 粒子跟随鼠标（正向移动，更快速）
      particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.1
        const x = (mouseX - centerX) * speed
        const y = (mouseY - centerY) * speed
        const scale = 1 + Math.abs(speed) * 0.5
        particle.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
      })
    }
    
    // 添加鼠标点击波纹效果
    this.handleClick = (e) => {
      const ripple = document.createElement('div')
      ripple.className = 'click-ripple'
      ripple.style.left = e.clientX + 'px'
      ripple.style.top = e.clientY + 'px'
      document.querySelector('.login-container').appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, 1000)
    }
    
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('click', this.handleClick)
    
    // 添加卡片3D倾斜效果
    const card = document.querySelector('.login-card')
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 20
      const rotateY = (centerX - x) / 20
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    })
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'
    })
  },
  
  methods: {
    // 粒子连线效果
    initParticleCanvas() {
      const canvas = document.getElementById('particleCanvas')
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      const drawLines = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const particles = document.querySelectorAll('.particle')
        const positions = []
        
        particles.forEach(particle => {
          const rect = particle.getBoundingClientRect()
          positions.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          })
        })
        
        // 绘制连线
        for (let i = 0; i < positions.length; i++) {
          for (let j = i + 1; j < positions.length; j++) {
            const dx = positions[i].x - positions[j].x
            const dy = positions[i].y - positions[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 300) {
              const opacity = (1 - distance / 300) * 0.3
              ctx.strokeStyle = `rgba(26, 200, 154, ${opacity})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(positions[i].x, positions[i].y)
              ctx.lineTo(positions[j].x, positions[j].y)
              ctx.stroke()
            }
          }
        }
      }
      
      // 每帧更新
      const animate = () => {
        drawLines()
        requestAnimationFrame(animate)
      }
      
      animate()
      
      // 窗口大小变化时重绘
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      })
    },
  
  },
  
  beforeDestroy() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
    // 移除事件监听
    if (this.handleMouseMove) {
      window.removeEventListener('mousemove', this.handleMouseMove)
    }
    if (this.handleClick) {
      window.removeEventListener('click', this.handleClick)
    }
  }
}
</script>

<style scoped>
/* 科技极简风格登录页面 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
}

/* 背景装饰容器 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 粒子连线画布 */
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 扫描线 */
.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(26, 200, 154, 0.8) 50%, 
    transparent 100%);
  box-shadow: 0 0 10px rgba(26, 200, 154, 0.8);
  animation: scan 8s linear infinite;
  pointer-events: none;
  z-index: 2;
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* 背景网格效果 */
.bg-decoration::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(34, 230, 168, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 230, 168, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

.bg-decoration::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  top: -300px;
  right: -300px;
  background: radial-gradient(circle, rgba(34, 230, 168, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 8s ease-in-out infinite;
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 浮动几何图形 */
.floating-shape {
  position: absolute;
  border: 2px solid rgba(26, 200, 154, 0.15);
  background: rgba(26, 200, 154, 0.03);
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease-out;
  pointer-events: none;
  animation: gentleRotate 20s linear infinite;
}

/* 几何图形微旋转 */
@keyframes gentleRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.shape-1 {
  width: 150px;
  height: 150px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  top: 10%;
  left: 8%;
}

.shape-2 {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  top: 60%;
  left: 15%;
}

.shape-3 {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  top: 20%;
  right: 12%;
}

.shape-4 {
  width: 80px;
  height: 80px;
  border-radius: 50% 0;
  bottom: 15%;
  right: 20%;
}

.shape-5 {
  width: 60px;
  height: 60px;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  bottom: 25%;
  left: 25%;
}

/* 粒子光点 */
.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(26, 200, 154, 0.8);
  box-shadow: 0 0 15px rgba(26, 200, 154, 1);
  transition: all 0.15s ease-out;
  pointer-events: none;
  opacity: 0.8;
  animation: particlePulse 3s ease-in-out infinite;
}

/* 粒子呼吸动画 */
@keyframes particlePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(26, 200, 154, 1);
  }
  50% {
    transform: scale(1.5);
    box-shadow: 0 0 25px rgba(26, 200, 154, 1);
  }
}

.particle-1 { top: 15%; left: 20%; animation-delay: 0s; }
.particle-2 { top: 25%; left: 80%; animation-delay: 0.4s; }
.particle-3 { top: 45%; left: 10%; animation-delay: 0.8s; }
.particle-4 { top: 55%; left: 85%; animation-delay: 1.2s; }
.particle-5 { top: 70%; left: 30%; animation-delay: 1.6s; }
.particle-6 { top: 80%; left: 75%; animation-delay: 2.0s; }
.particle-7 { top: 35%; left: 50%; animation-delay: 2.4s; }
.particle-8 { top: 65%; left: 60%; animation-delay: 2.8s; }

/* 浮动动画 */
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -20px) rotate(120deg); }
  66% { transform: translate(-20px, 30px) rotate(240deg); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, 40px) scale(1.2); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0) rotate(45deg); }
  33% { transform: translate(-25px, 35px) rotate(135deg); }
  66% { transform: translate(35px, -25px) rotate(225deg); }
}

@keyframes float4 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, -30px) rotate(180deg); }
}

@keyframes float5 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, 20px) rotate(90deg); }
  50% { transform: translate(-20px, 20px) rotate(180deg); }
  75% { transform: translate(-20px, -20px) rotate(270deg); }
}

/* 闪烁动画 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

/* 点击波纹效果 */
.click-ripple {
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26, 200, 154, 0.6) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: ripple 1s ease-out;
  pointer-events: none;
  z-index: 9999;
}

@keyframes ripple {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

/* 登录卡片 */
.login-card {
  width: 920px;
  height: 580px;
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(26, 200, 154, 0.15);
  box-shadow: 
    0 8px 32px rgba(26, 200, 154, 0.2),
    0 0 60px rgba(26, 200, 154, 0.15);
  display: flex;
  overflow: hidden;
  position: relative;
  animation: slideUp 0.6s ease-out, breathe 4s ease-in-out infinite;
  transition: transform 0.3s ease-out;
  transform-style: preserve-3d;
}

/* 呼吸发光动画 */
@keyframes breathe {
  0%, 100% {
    box-shadow: 
      0 8px 32px rgba(26, 200, 154, 0.2),
      0 0 60px rgba(26, 200, 154, 0.15);
  }
  50% {
    box-shadow: 
      0 8px 32px rgba(26, 200, 154, 0.4),
      0 0 80px rgba(26, 200, 154, 0.3);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧二维码区域 */
.qr-section {
  width: 38%;
  background: linear-gradient(135deg, #1ac89a 0%, #15a878 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 100px rgba(26, 200, 154, 0.3);
}

.qr-section::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.03) 50%, transparent 55%);
  background-size: 40px 40px;
  animation: scan 3s linear infinite;
}

@keyframes scan {
  from { transform: translateX(-40px); }
  to { transform: translateX(40px); }
}

.qr-content {
  text-align: center;
  color: white;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 16px auto 24px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.icon-wrapper:hover {
  transform: scale(1.1) rotate(5deg);
}

.qr-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.qr-desc {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 30px;
  line-height: 1.5;
  white-space: nowrap;
}

.qr-code-box {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 0 40px rgba(26, 200, 154, 0.4);
}

.qr-loading {
  text-align: center;
  color: rgba(34, 230, 168, 0.5);
}

.qr-loading i {
  font-size: 36px;
  margin-bottom: 8px;
  display: block;
  color: #1ac89a;
  filter: drop-shadow(0 0 8px rgba(26, 200, 154, 0.5));
}

.qr-loading p {
  font-size: 12px;
  color: #666;
}

.qr-hint {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  background: rgba(10, 40, 30, 0.6);
}

.form-header {
  margin-bottom: 40px;
}

.form-title {
  font-size: 32px;
  font-weight: 700;
  color: #1ac89a;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
  text-shadow: 0 0 30px rgba(26, 200, 154, 0.4);
}

.form-subtitle {
  font-size: 14px;
  color: rgba(34, 230, 168, 0.7);
}

/* Tab切换 */
.tab-wrapper {
  display: flex;
  position: relative;
  margin-bottom: 32px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 3px;
  border: 1px solid rgba(34, 230, 168, 0.08);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  font-weight: 500;
  color: rgba(34, 230, 168, 0.6);
  font-size: 15px;
}

.tab-item span {
  position: relative;
  z-index: 2;
}

.tab-active {
  color: #0a0a0a;
}

.tab-slider {
  position: absolute;
  height: calc(100% - 6px);
  width: calc(50% - 3px);
  background: linear-gradient(135deg, #1ac89a 0%, #15a878 100%);
  border-radius: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 20px rgba(26, 200, 154, 0.4),
    0 0 40px rgba(26, 200, 154, 0.2);
  top: 3px;
  left: 3px;
}

/* 表单内容 */
.form-content {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 13px;
  color: rgba(34, 230, 168, 0.85);
  margin-bottom: 8px;
  font-weight: 500;
}

/* 输入框样式 */
.harmony-input >>> .el-input__inner {
  height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(26, 200, 154, 0.15);
  background: rgba(0, 0, 0, 0.3);
  color: #1ac89a;
  transition: all 0.3s ease;
  font-size: 14px;
  padding-left: 45px;
}

.harmony-input >>> .el-input__inner:focus {
  border-color: #1ac89a;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 
    0 0 0 3px rgba(26, 200, 154, 0.08),
    0 0 20px rgba(26, 200, 154, 0.2);
}

.harmony-input >>> .el-input__inner::placeholder {
  color: rgba(34, 230, 168, 0.4);
}

.harmony-input >>> .el-input__prefix {
  color: rgba(34, 230, 168, 0.6);
}

.code-input-wrapper {
  display: flex;
  gap: 12px;
}

.code-btn {
  min-width: 110px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1ac89a 0%, #15a878 100%);
  color: #0a0a0a;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(26, 200, 154, 0.3);
}

.code-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(26, 200, 154, 0.4),
    0 0 30px rgba(26, 200, 154, 0.3);
}

.code-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  font-size: 13px;
}

.harmony-checkbox >>> .el-checkbox__label {
  color: rgba(34, 230, 168, 0.75);
}

.harmony-checkbox >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1ac89a;
  border-color: #1ac89a;
  box-shadow: 0 0 10px rgba(26, 200, 154, 0.5);
}

.harmony-checkbox >>> .el-checkbox__inner {
  border-color: rgba(26, 200, 154, 0.25);
  background-color: rgba(0, 0, 0, 0.3);
}

.harmony-checkbox >>> .el-checkbox__inner:hover {
  border-color: #1ac89a;
}

.forgot-link {
  color: rgba(34, 230, 168, 0.75);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #1ac89a;
  text-shadow: 0 0 10px rgba(26, 200, 154, 0.5);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1ac89a 0%, #15a878 100%);
  color: #0a0a0a;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.4s ease;
  box-shadow: 
    0 0 30px rgba(26, 200, 154, 0.4),
    0 0 50px rgba(26, 200, 154, 0.2);
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 0 40px rgba(26, 200, 154, 0.6),
    0 0 60px rgba(26, 200, 154, 0.3);
}

.login-btn:active {
  transform: translateY(-1px);
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: rgba(34, 230, 168, 0.6);
}

.register-link a {
  color: #1ac89a;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #22e6a8;
  text-shadow: 0 0 15px rgba(26, 200, 154, 0.6);
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 响应式 */
@media (max-width: 1024px) {
  .login-card {
    width: 90%;
    max-width: 800px;
  }
}
</style>
