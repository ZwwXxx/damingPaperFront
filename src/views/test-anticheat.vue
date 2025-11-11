<!--
测试防作弊功能的简单页面
-->
<template>
  <div class="test-container">
    <h2>防作弊功能测试页面</h2>
    
    <div class="control-panel">
      <el-button 
        @click="toggleAntiCheat" 
        :type="antiCheatActive ? 'danger' : 'primary'">
        {{ antiCheatActive ? '关闭防作弊' : '启用防作弊' }}
      </el-button>
      
      <el-button @click="testFullscreen">测试全屏</el-button>
      <el-button @click="testDevTools">测试开发者工具检测</el-button>
    </div>
    
    <div class="status-panel">
      <h3>当前状态</h3>
      <p>防作弊模式: <span :class="antiCheatActive ? 'active' : 'inactive'">
        {{ antiCheatActive ? '已启用' : '未启用' }}
      </span></p>
      <p>全屏状态: <span :class="isFullscreen() ? 'active' : 'inactive'">
        {{ isFullscreen() ? '全屏' : '非全屏' }}
      </span></p>
      <p>开发者工具: <span :class="devToolsDetected ? 'danger' : 'safe'">
        {{ devToolsDetected ? '已检测到' : '未检测到' }}
      </span></p>
    </div>
    
    <div class="test-content">
      <h3>测试说明</h3>
      <ul>
        <li>点击"启用防作弊"后，系统会自动进入全屏模式</li>
        <li>尝试按F11或Esc退出全屏，观察警告提示</li>
        <li>按F12打开开发者工具，观察检测结果</li>
        <li>右键点击页面，观察是否被阻止</li>
        <li>尝试复制粘贴操作，观察是否被阻止</li>
      </ul>
    </div>
    
    <!--全屏提示-->
    <div v-if="antiCheatActive && !isFullscreen()" class="fullscreen-hint">
      <i class="el-icon-full-screen"></i> 请保持全屏模式
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestAntiCheat',
  data() {
    return {
      antiCheatActive: false,
      // 开发者工具检测相关
      devToolsCheckTimer: null,
      devToolsDetected: false,
      // 浏览器环境检测
      browserEnvironmentTimer: null,
      // 安全事件句柄
      securityHandlers: {},
      securityWarningCooldown: false,
      securityWarningTimer: null
    }
  },
  beforeDestroy() {
    this.disableAntiCheatFeatures()
  },
  methods: {
    toggleAntiCheat() {
      if (this.antiCheatActive) {
        this.disableAntiCheatFeatures()
      } else {
        this.enableAntiCheatFeatures()
      }
    },
    
    enableAntiCheatFeatures() {
      if (this.antiCheatActive) return
      
      // 绑定安全事件
      this.bindSecurityEvents()
      // 启用全屏强制和检测
      this.enforceFullscreen()
      this.startFullscreenMonitoring()
      // 启用开发者工具检测
      this.startDevToolsDetection()
      // 启用浏览器环境检测
      this.startBrowserEnvironmentDetection()
      
      this.antiCheatActive = true
      this.$message.success('防作弊模式已启用')
    },
    
    disableAntiCheatFeatures() {
      if (!this.antiCheatActive) return
      
      // 解除安全事件监听
      this.unbindSecurityEvents()
      // 停止全屏监控
      this.stopFullscreenMonitoring()
      // 停止开发者工具检测
      this.stopDevToolsDetection()
      // 停止浏览器环境检测
      this.stopBrowserEnvironmentDetection()
      
      if (this.securityWarningTimer) {
        clearTimeout(this.securityWarningTimer)
      }
      
      this.fullscreenWarningCount = 0
      this.devToolsDetected = false
      this.antiCheatActive = false
      this.$message.info('防作弊模式已关闭')
    },
    
    testFullscreen() {
      if (this.isFullscreen()) {
        document.exitFullscreen()
      } else {
        this.enforceFullscreen()
      }
    },
    
    testDevTools() {
      this.$message.info('请按F12打开开发者工具进行测试')
    },
    
    // ==================== 安全事件绑定 ====================
    bindSecurityEvents() {
      this.securityHandlers = {
        contextmenu: (event) => this.handleForbiddenEvent(event, '考试期间禁用右键操作'),
        copy: (event) => this.handleForbiddenEvent(event, '考试期间禁用复制内容'),
        keydown: (event) => this.handleKeydown(event),
      }
      document.addEventListener('contextmenu', this.securityHandlers.contextmenu)
      document.addEventListener('copy', this.securityHandlers.copy)
      document.addEventListener('keydown', this.securityHandlers.keydown)
    },
    
    unbindSecurityEvents() {
      if (!this.securityHandlers) return
      document.removeEventListener('contextmenu', this.securityHandlers.contextmenu)
      document.removeEventListener('copy', this.securityHandlers.copy)
      document.removeEventListener('keydown', this.securityHandlers.keydown)
    },
    
    handleForbiddenEvent(event, message) {
      if (!this.antiCheatActive) return
      event.preventDefault()
      this.showSecurityWarning(message)
    },
    
    handleKeydown(event) {
      if (!this.antiCheatActive) return
      const key = event.key.toLowerCase()
      const blockedCtrlKeys = ['c', 'v', 'x', 'a', 's', 'p', 'r', 'f']
      const isBlockedCtrlCombo = (event.ctrlKey || event.metaKey) && blockedCtrlKeys.includes(key)
      const isDevToolsCombo = ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c', 'u'].includes(key))
      
      if (event.key === 'F12' || isBlockedCtrlCombo || isDevToolsCombo) {
        event.preventDefault()
        this.showSecurityWarning('考试期间禁用快捷键操作')
      }
    },
    
    showSecurityWarning(message) {
      if (!this.antiCheatActive) return
      if (this.securityWarningCooldown) return
      
      this.securityWarningCooldown = true
      this.$message.warning(message)
      this.securityWarningTimer = setTimeout(() => {
        this.securityWarningCooldown = false
      }, 1500)
    },
    
    // ==================== 全屏相关方法 ====================
    enforceFullscreen() {
      if (!document.fullscreenElement) {
        const enterFullscreen = () => {
          if (document.documentElement.requestFullscreen) {
            return document.documentElement.requestFullscreen()
          } else if (document.documentElement.webkitRequestFullscreen) {
            return document.documentElement.webkitRequestFullscreen()
          } else if (document.documentElement.msRequestFullscreen) {
            return document.documentElement.msRequestFullscreen()
          }
        }
        
        enterFullscreen().catch(() => {
          this.$message({
            message: '请手动进入全屏模式，按F11或点击浏览器全屏按钮',
            type: 'warning',
            duration: 5000
          })
        })
      }
    },
    
    startFullscreenMonitoring() {
      const fullscreenChangeEvents = [
        'fullscreenchange',
        'webkitfullscreenchange', 
        'mozfullscreenchange',
        'MSFullscreenChange'
      ]
      
      fullscreenChangeEvents.forEach(event => {
        document.addEventListener(event, this.handleFullscreenChange)
      })
      
      this.fullscreenCheckTimer = setInterval(() => {
        this.checkFullscreenStatus()
      }, 2000)
    },
    
    stopFullscreenMonitoring() {
      const fullscreenChangeEvents = [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange', 
        'MSFullscreenChange'
      ]
      
      fullscreenChangeEvents.forEach(event => {
        document.removeEventListener(event, this.handleFullscreenChange)
      })
      
      if (this.fullscreenCheckTimer) {
        clearInterval(this.fullscreenCheckTimer)
        this.fullscreenCheckTimer = null
      }
    },
    
    handleFullscreenChange() {
      if (!this.isFullscreen()) {
        this.handleExitFullscreen()
      }
    },
    
    checkFullscreenStatus() {
      if (!this.isFullscreen()) {
        this.handleExitFullscreen()
      }
    },
    
    isFullscreen() {
      return !!(document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement ||
                document.msFullscreenElement)
    },
    
    handleExitFullscreen() {
      if (!this.antiCheatActive) return
      
      this.fullscreenWarningCount++
      
      if (this.fullscreenWarningCount <= this.fullscreenWarningLimit) {
        const remainingWarnings = this.fullscreenWarningLimit - this.fullscreenWarningCount + 1
        
        this.$confirm(
          `检测到退出全屏模式！这是第${this.fullscreenWarningCount}次警告，还有${remainingWarnings}次机会。`,
          '全屏模式警告',
          {
            confirmButtonText: '重新进入全屏',
            cancelButtonText: '继续测试',
            type: 'warning'
          }
        ).then(() => {
          this.enforceFullscreen()
        })
      } else {
        this.$alert('超过全屏警告次数限制！', '测试结束', {
          confirmButtonText: '确定',
          type: 'error'
        })
      }
    },
    
    // ==================== 开发者工具检测 ====================
    startDevToolsDetection() {
      this.devToolsCheckTimer = setInterval(() => {
        this.detectDevTools()
      }, 1000)
    },
    
    stopDevToolsDetection() {
      if (this.devToolsCheckTimer) {
        clearInterval(this.devToolsCheckTimer)
        this.devToolsCheckTimer = null
      }
    },
    
    detectDevTools() {
      if (!this.antiCheatActive) return
      
      const threshold = 160
      let devToolsOpen = false
      
      // 检测窗口尺寸差异
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        devToolsOpen = true
      }
      
      if (devToolsOpen && !this.devToolsDetected) {
        this.devToolsDetected = true
        this.handleDevToolsDetection()
      } else if (!devToolsOpen) {
        this.devToolsDetected = false
      }
    },
    
    handleDevToolsDetection() {
      this.$message.error('检测到开发者工具已打开！')
    },
    
    // ==================== 浏览器环境检测 ====================
    startBrowserEnvironmentDetection() {
      this.browserEnvironmentTimer = setInterval(() => {
        this.checkBrowserEnvironment()
      }, 5000)
    },
    
    stopBrowserEnvironmentDetection() {
      if (this.browserEnvironmentTimer) {
        clearInterval(this.browserEnvironmentTimer)
        this.browserEnvironmentTimer = null
      }
    },
    
    checkBrowserEnvironment() {
      if (!this.antiCheatActive) return
      
      // 检测自动化工具
      if (navigator.webdriver) {
        this.$message.warning('检测到自动化工具')
      }
    }
  }
}
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.control-panel {
  margin: 20px 0;
}

.control-panel .el-button {
  margin-right: 10px;
}

.status-panel {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.active {
  color: #67c23a;
  font-weight: bold;
}

.inactive {
  color: #909399;
}

.danger {
  color: #f56c6c;
  font-weight: bold;
}

.safe {
  color: #67c23a;
}

.test-content {
  margin: 20px 0;
}

.test-content ul {
  padding-left: 20px;
}

.test-content li {
  margin: 8px 0;
  line-height: 1.5;
}

/* 全屏提示样式 */
.fullscreen-hint {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
</style>
