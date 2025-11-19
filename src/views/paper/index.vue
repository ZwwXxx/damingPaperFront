<!--
*@index
*@author Zww
*@date 2024/10/7 9:05
-->
<template>
  <wrapper size="md" padding="0">
    <!--左侧题目进度-->
    <el-card class="fixed top-20 left-0 w-1/4 ">
      <template v-if="!antiCheatActive">
        <div class="questType" v-for="(questType,index) in formData.paperQuestionTypeDto" :key=index>
          <p class="mb-2">{{ questType.name }}</p>
        <div class="question-anchor  flex flex-wrap  ">
          <el-tag
              @click="handleQuestionAnchorClick(question.itemOrder)"
              v-for="(question, qIndex) in questType.questionDtos" :key="qIndex"
              :type="getQuestionTagType(question.itemOrder)"
              style="padding: 0; display: flex; justify-content: center; width:  calc(20% - 10px); height: 30px;margin: 5px"
              :class="['cursor-pointer', {'current-question': antiCheatActive && question.itemOrder === currentQuestionOrder}]">
            {{ getDisplayNumberByOrder(question.itemOrder) }}
          </el-tag>
        </div>
      </div>
      </template>
      <template v-else>
        <div class="questType">
          <p class="mb-2">题目列表</p>
          <div class="question-anchor flex flex-wrap">
            <el-tag
                v-for="(question, qIndex) in orderedQuestions"
                :key="question.itemOrder"
                :type="getQuestionTagType(question.itemOrder, qIndex)"
                @click="handleQuestionAnchorClick(question.itemOrder, qIndex)"
                style="padding: 0; display: flex; justify-content: center; width: calc(20% - 10px); height: 30px;margin: 5px"
                :class="['cursor-pointer', {'current-question': antiCheatActive && qIndex === currentQuestionIndex}]">
              {{ qIndex + 1 }}
            </el-tag>
          </div>
        </div>
      </template>
    </el-card>
    <!--中间题目内容-->
    <div class="container" v-if="!antiCheatActive">
      <div class="questionTypeBody" v-for="(questType,index)  in formData.paperQuestionTypeDto" :key="index">
        <div class="part bg-gray-100 p-4 text-black">
          {{ questType.name }}
        </div>
        <div class="question-item p-4" v-for="(questionItem,index) in questType.questionDtos" :key="index">
          <div class="q-title">

              <span class="break-words w-full">
                <span>
                  <span class="text-red-800 font-bold mr-2" :id="questionItem.itemOrder">{{ 
                      getQuestionDisplayNumber(questionItem)
                    }}.</span>{{
                    questionItem.questionTitle
                  }}
                </span>
                <span class="font-bold text-red-600">
                    ({{
                    questionItem.score
                  }}分)
                </span>
              </span>

          </div>


          <div class="q-options p-6 flex flex-col ">
            <!--只要选了，就把该题目的完成状态为true-->
            <el-radio-group
                v-if="questionItem.questionType===1"
                v-removeAria
                v-model="answer.questionAnswerDtos[questionItem.itemOrder].content"
                @change="answer.questionAnswerDtos[questionItem.itemOrder].completed = true">
              <el-radio class="py-2" :label="selection.prefix"
                        v-for="(selection,index) in questionItem.items" :key="index">
                {{ selection.prefix }}.{{ selection.content }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-model="answer.questionAnswerDtos[questionItem.itemOrder].contentArray"
                               v-if="questionItem.questionType===2"
                               @change="updateCompletedStatus(questionItem.itemOrder)"
            >
              <el-checkbox v-for="(checkBox,index) in questionItem.items" :label="checkBox.prefix" :key="index">
                {{ checkBox.prefix }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>
    <div class="container" v-else>
      <div class="questionTypeBody" v-if="currentQuestion">
        <div class="part bg-gray-100 p-4 text-black">
          {{ currentQuestion.questTypeName }}
        </div>
        <div class="question-item p-4">
          <div class="q-title">
              <span class="break-words w-full">
                <span>
                  <span class="text-red-800 font-bold mr-2" :id="currentQuestion.itemOrder">{{ 
                      getQuestionDisplayNumber(currentQuestion)
                    }}.</span>{{
                    currentQuestion.questionTitle
                  }}
                </span>
                <span class="font-bold text-red-600">
                    ({{
                    currentQuestion.score
                  }}分)
                </span>
              </span>
          </div>
          <div class="q-options p-6 flex flex-col ">
            <el-radio-group
                v-if="currentQuestion.questionType===1"
                v-removeAria
                v-model="answer.questionAnswerDtos[currentQuestion.itemOrder].content"
                @change="answer.questionAnswerDtos[currentQuestion.itemOrder].completed = true">
              <el-radio class="py-2" :label="selection.prefix"
                        v-for="(selection,index) in currentQuestion.items" :key="index">
                {{ selection.prefix }}.{{ selection.content }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-model="answer.questionAnswerDtos[currentQuestion.itemOrder].contentArray"
                               v-if="currentQuestion.questionType===2"
                               @change="updateCompletedStatus(currentQuestion.itemOrder)"
            >
              <el-checkbox v-for="(checkBox,index) in currentQuestion.items" :label="checkBox.prefix" :key="index">
                {{ checkBox.prefix }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="question-navigation flex justify-between items-center p-4">
          <el-button
              @click="goToPrevQuestion"
              :disabled="currentQuestionIndex === 0"
          >
            上一题
          </el-button>
          <span>第 {{ currentQuestionIndex + 1 }} / {{ orderedQuestions.length }} 题</span>
          <el-button
              type="primary"
              @click="goToNextQuestion"
              :disabled="currentQuestionIndex === orderedQuestions.length - 1"
          >
            下一题
          </el-button>
        </div>
      </div>
    </div>

    <!--右侧题目介绍，倒计时-->
    <el-card class="fixed top-20 right-0 w-1/4 ">
      <p class="paper-name font-bolder text-xl">
        {{ formData.paperName || '试卷详情' }}
      </p>
      <div class="desc py-4 text-md leading-8  ">
        <p class="">试卷总分: {{ formData.score }}</p>
        <p class="">考试时长: {{ formData.suggestTime }}分钟</p>
      </div>
      <div class="desc py-4 text-sm leading-8 border-t-2 flex flex-col items-center">
        <p class="text-lg">剩余时间</p>
        <p class="font-bold text-2xl text-red-500">{{ formatSeconds(remainTime) }}</p>
      </div>
      <div class="desc py-4 text-sm leading-8 border-t-2 flex flex-col items-center">
        <button
            @click="submit"
            class="bg-red-700 text-white px-10 py-1 rounded-md">提交
        </button>
      </div>
    </el-card>
  </wrapper>
</template>

<script>
  import wrapper from "@/components/wrapper.vue";
  import {getPaper} from "@/api/paper";
  import {submitAnswer} from "@/api/paperAnswer";
  import {formatSeconds} from "@/utils/time"
  import {getOrCreateShuffledOrder, clearShuffledOrder} from "@/utils/shuffle";

export default {
  name: "index",
  props: {},
  mounted() {
    this.syncAntiCheatState()
  },
  created() {
    const paramsId = this.$route.params.paperId
    const queryId = this.$route.query.paperId
    const paperId = paramsId || queryId
    if (paperId) {
      this.getPaperById(paperId)
    } else {
      this.$router.replace({path: '/home'})
    }
  },
  components: {wrapper},
  data() {
    return {
      timer: undefined,
      remainTime: undefined,
      cutScreenCount: 0,
      cutScreenLimit: 3,
      cutScreenCooldown: false,
      cutScreenCooldownTimer: null,
      // 记录安全事件句柄及提示节流
      securityHandlers: {},
      securityWarningCooldown: false,
      securityWarningTimer: null,
      // 控制是否启用防作弊（后续由试卷配置覆盖）
      antiCheatEnabled: true,
      antiCheatActive: false,
      orderedQuestions: [],
      questionIndexByOrder: {},
      currentQuestionIndex: 0,
      // 开发者工具检测相关
      devToolsCheckTimer: null,
      devToolsDetected: false,
      // 浏览器环境检测
      browserEnvironmentTimer: null,
      radio: '',
      formData: {},
      //试卷的回答,包含耗时和 该回答记录的id，和回答的所有问题集合
      answer: {
        doTime: 0,
        paperId: 1,
        // 所有回答的题目,完成状态，答案content，多选的contentArray存放多个答案，题序itemOrder,题目iD
        questionAnswerDtos: [
          // {
          //   completed: true,
          //   content: "B",
          //   itemOrder: 1,
          //   contentArray: ["A", "C"],
          //   questionId: 4
          // },
        ]
      },
      answerList: [
        {
          id: null, content: '', contentArray: []
        }
      ]
    }
  },
  // 组件销毁时清空定时器
  beforeDestroy() {
    window.clearInterval(this.timer)
    this.disableAntiCheatFeatures()
  },
  beforeRouteLeave(to, from, next) {
    this.resetShuffleCache()
    next()
  },
  watch: {
    antiCheatEnabled() {
      this.syncAntiCheatState()
    }
  },
  computed: {
    currentQuestion() {
      return this.orderedQuestions[this.currentQuestionIndex] || null
    },
    currentQuestionOrder() {
      return this.currentQuestion ? this.currentQuestion.itemOrder : -1
    }
  },
  methods: {
    syncAntiCheatState() {
      if (this.antiCheatEnabled) {
        this.enableAntiCheatFeatures()
      } else {
        this.disableAntiCheatFeatures()
      }
    },
    enableAntiCheatFeatures() {
      if (this.antiCheatActive) return
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
      window.addEventListener('blur', this.handleWindowBlur)
      // 进入考试页立即绑定各类安全事件，阻断复制/右键/快捷键
      this.bindSecurityEvents()
      // 启用开发者工具检测
      this.startDevToolsDetection()
      // 启用浏览器环境检测
      this.startBrowserEnvironmentDetection()
      this.currentQuestionIndex = 0
      this.ensureCurrentQuestionInRange()
      this.antiCheatActive = true
    },
    disableAntiCheatFeatures() {
      if (!this.antiCheatActive) return
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      window.removeEventListener('blur', this.handleWindowBlur)
      if (this.cutScreenCooldownTimer) {
        clearTimeout(this.cutScreenCooldownTimer)
      }
      // 离开页面时解除安全事件监听
      this.unbindSecurityEvents()
      // 停止开发者工具检测
      this.stopDevToolsDetection()
      // 停止浏览器环境检测
      this.stopBrowserEnvironmentDetection()
      if (this.securityWarningTimer) {
        clearTimeout(this.securityWarningTimer)
      }
      this.cutScreenCount = 0
      this.cutScreenCooldown = false
      this.securityWarningCooldown = false
      this.fullscreenWarningCount = 0
      this.devToolsDetected = false
      this.antiCheatActive = false
    },
    ensureCurrentQuestionInRange() {
      if (!this.orderedQuestions.length) {
        this.currentQuestionIndex = 0
        return
      }
      if (this.currentQuestionIndex >= this.orderedQuestions.length) {
        this.currentQuestionIndex = this.orderedQuestions.length - 1
      }
    },
    bindSecurityEvents() {
      this.securityHandlers = {
        // 禁用右键、复制
        contextmenu: (event) => this.handleForbiddenEvent(event, '考试期间禁用右键操作'),
        copy: (event) => this.handleForbiddenEvent(event, '考试期间禁用复制内容'),
        // 阻止敏感快捷键触发
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
      if (this.securityWarningCooldown) {
        return
      }
      this.securityWarningCooldown = true
      this.$message.warning(message)
      this.securityWarningTimer = setTimeout(() => {
        this.securityWarningCooldown = false
      }, 1500)
    },
    handleVisibilityChange() {
      if (document.hidden) {
        this.handleCutScreen('检测到切换到其他标签页')
      }
    },
    handleWindowBlur() {
      // blur 触发时 document.hidden 尚未一定为 true，通过事件来源限制重复统计
      if (!document.hidden) {
        this.handleCutScreen('检测到切换到其他窗口')
      }
    },
    handleCutScreen(reason) {
      if (!this.antiCheatActive) return
      if (this.cutScreenCooldown) {
        return
      }
      this.cutScreenCooldown = true
      this.cutScreenCooldownTimer = setTimeout(() => {
        this.cutScreenCooldown = false
      }, 2000)
      this.cutScreenCount++
      const remain = this.cutScreenLimit - this.cutScreenCount
      const message = remain > 0
          ? `${reason}，还有${remain}次机会，请保持考试页面在前台。`
          : `${reason}，切屏次数已达上限，系统将自动交卷。`
      this.$message.warning(message)
      if (this.cutScreenCount >= this.cutScreenLimit) {
        this.$alert('多次检测到切屏行为，考试已结束，系统将自动提交试卷。', '警告', {
          confirmButtonText: '知道了',
          showClose: false, // 禁用右上角关闭按钮
          callback: () => {
            this.sendSubmitAnswerRequest()
          }
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

      // 方法1: 检测窗口尺寸差异
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        devToolsOpen = true
      }

      // 方法2: 检测console对象
      let consoleOpened = false
      const devtools = {
        toString: function() {
          consoleOpened = true
          return ''
        }
      }
      console.log('%c', devtools)

      if (consoleOpened) {
        devToolsOpen = true
      }

      // 方法3: 检测性能异常（替代debugger检测）
      let start = performance.now()
      // 执行一个简单的计算任务
      for (let i = 0; i < 1000; i++) {
        Math.random()
      }
      let end = performance.now()

      // 如果执行时间异常长，可能是在调试状态
      if (end - start > 50) {
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
      this.$alert(
        '检测到开发者工具已打开！这违反了考试规定，系统将自动提交试卷。',
        '安全警告',
        {
          confirmButtonText: '确定',
          showClose: false,
          callback: () => {
            this.sendSubmitAnswerRequest()
          }
        }
      )
    },
    // ==================== 浏览器环境检测 ====================
    startBrowserEnvironmentDetection() {
      this.checkBrowserEnvironment()
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

      // 检测常见的作弊插件或扩展
      this.detectSuspiciousExtensions()

  

      // 检测自动化工具
      this.detectAutomationTools()
    },
    detectSuspiciousExtensions() {
      // 检测DOM中是否有插件注入的元素
      const suspiciousSelectors = [
        '[class*="tampermonkey"]',
        '[class*="greasemonkey"]',
        '[class*="violentmonkey"]',
        '[id*="extension"]',
        '[class*="adblock"]'
      ]

      suspiciousSelectors.forEach(selector => {
        if (document.querySelector(selector)) {
          this.reportSuspiciousActivity('检测到可疑浏览器扩展')
        }
      })

      // 检测是否有异常的全局变量
      const suspiciousGlobals = [
        'webdriver',
        'callPhantom',
        '_phantom',
        'phantom'
      ]

      suspiciousGlobals.forEach(global => {
        if (window[global]) {
          this.reportSuspiciousActivity('检测到自动化工具特征')
        }
      })
    },
   
    detectAutomationTools() {
      // 检测Selenium等自动化工具
      if (navigator.webdriver) {
        this.reportSuspiciousActivity('检测到自动化工具')
        return
      }

      // 检测异常的用户代理
      const userAgent = navigator.userAgent.toLowerCase()
      const suspiciousUA = [
        'phantomjs',
        'selenium',
        'webdriver',
        'robot',
        'spider',
        'crawler'
      ]

      suspiciousUA.forEach(ua => {
        if (userAgent.includes(ua)) {
          this.reportSuspiciousActivity('检测到可疑用户代理')
        }
      })
    },
    reportSuspiciousActivity(activity) {
      console.warn('可疑活动:', activity)

      // 记录到后端
      // this.logSecurityEvent(activity)

      this.$message.warning(`安全检测: ${activity}`)

      // 累计可疑活动，达到阈值后采取行动
      this.cutScreenCount++
      if (this.cutScreenCount >= this.cutScreenLimit) {
        this.$alert(
          `检测到多次可疑活动: ${activity}。系统将自动提交试卷。`,
          '安全警告',
          {
            confirmButtonText: '确定',
            showClose: false,
            callback: () => {
              this.sendSubmitAnswerRequest()
            }
          }
        )
      }
    },
    jumpTo(itemOrder) {
      const target = document.getElementById(itemOrder);
      if (target) {
        // 求得距离顶部的值，加上卷去的值
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY - 80  // 减去导航条高度
        window.scrollTo({top: absoluteTop, behavior: 'smooth'});
      } else {
        console.log('目标元素未找到');
      }
    },

    updateCompletedStatus(itemOrder) {
      const contentArray = this.answer.questionAnswerDtos[itemOrder].contentArray;
      this.answer.questionAnswerDtos[itemOrder].completed = contentArray.length > 0;
    },
    // 格式化日期为时分秒
    formatSeconds(remainTime) {
      return formatSeconds(remainTime)
    },
    timeReduce() {
      // 开启一个定时器，循环执行判断时间
      this.timer = setInterval(() => {
        // 如果小于等于0那么自动提交
        if (this.remainTime <= 0) {
          this.sendSubmitAnswerRequest();
        } else {
          // 不小于0，那就耗时++， 剩余时间--
          this.answer.doTime++
          this.remainTime--
        }
      }, 1000)
    },
    initRemainTime() {
      // 转为秒，然后自减方便一点
      this.remainTime = this.formData.suggestTime * 60
    },
    // 根据总题目，遍历出数组的每一个键，外层键为下标，设置N个题型，内部遍历出每一个下初始化答案数组，后续往里塞值传到后端
    initAnswer() {
      this.answer.paperId = this.formData.paperId
      let paperQuestionTypeList = this.formData.paperQuestionTypeDto
      for (let tIndex in paperQuestionTypeList) {
        let questionArray = paperQuestionTypeList[tIndex].questionDtos
        for (let qIndex in questionArray) {
          let question = questionArray[qIndex]
          this.answer.questionAnswerDtos.push({
            questionId: question.id,
            content: null,//后续radio勾选后录入
            contentArray: [],//同上
            completed: false,//同上
            itemOrder: question.itemOrder
          })
        }
      }
      this.buildQuestionCache()
    },
    buildQuestionCache() {
      let questionList = []
      const indexMap = {}
      const typeList = this.formData.paperQuestionTypeDto || []
      typeList.forEach((type) => {
        (type.questionDtos || []).forEach((question) => {
          questionList.push({
            ...question,
            questTypeName: type.name
          })
        })
      })
      questionList.sort((a, b) => a.itemOrder - b.itemOrder)
      const orderedList = this.antiCheatEnabled
          ? this.applyPersistedShuffle(questionList)
          : questionList
      orderedList.forEach((question, index) => {
        question.displayOrder = index
        indexMap[question.itemOrder] = index
      })
      this.orderedQuestions = orderedList
      this.questionIndexByOrder = indexMap
      this.currentQuestionIndex = 0
      this.ensureCurrentQuestionInRange()
    },
    applyPersistedShuffle(list) {
      const arr = list.slice()
      const key = this.getShuffleCacheKey()
      const order = getOrCreateShuffledOrder(key, arr.length)
      const shuffled = order.map(idx => arr[idx]).filter(Boolean)
      return shuffled.length === arr.length ? shuffled : arr
    },
    resetShuffleCache() {
      if (this.antiCheatEnabled) {
        clearShuffledOrder(this.getShuffleCacheKey())
      }
    },
    getShuffleCacheKey() {
      const paperId = this.formData.paperId || this.$route.params.paperId || 'unknown'
      const version = this.formData.updateTime || this.formData.paperInfoId || 'v1'
      return `paper_shuffle_${paperId}_${version}`
    },
    getQuestionDisplayNumber(question) {
      if (!question) {
        return ''
      }
      if (this.antiCheatEnabled && typeof question.displayOrder === 'number') {
        return question.displayOrder + 1
      }
      return (question.itemOrder || 0) + 1
    },
    getDisplayNumberByOrder(itemOrder) {
      const index = this.questionIndexByOrder[itemOrder]
      if (this.antiCheatEnabled && typeof index === 'number') {
        return index + 1
      }
      return (itemOrder || 0) + 1
    },
    goToPrevQuestion() {
      if (this.currentQuestionIndex <= 0) return
      this.currentQuestionIndex--
      window.scrollTo({top: 0, behavior: 'smooth'})
    },
    goToNextQuestion() {
      if (this.currentQuestionIndex >= this.orderedQuestions.length - 1) return
      this.currentQuestionIndex++
      window.scrollTo({top: 0, behavior: 'smooth'})
    },
    getQuestionTagType(itemOrder, displayIndex) {
      if (this.antiCheatActive) {
        const isCurrent = typeof displayIndex === 'number'
            ? displayIndex === this.currentQuestionIndex
            : itemOrder === this.currentQuestionOrder
        if (isCurrent) {
          return 'primary'
        }
      } else if (itemOrder === this.currentQuestionOrder) {
        return 'primary'
      }
      return this.answer.questionAnswerDtos[itemOrder].completed ? 'success' : 'plain'
    },
    handleQuestionAnchorClick(itemOrder, displayIndex) {
      if (this.antiCheatActive) {
        const targetIndex = typeof displayIndex === 'number'
            ? displayIndex
            : this.questionIndexByOrder[itemOrder]
        if (typeof targetIndex === 'number') {
          this.currentQuestionIndex = targetIndex
          window.scrollTo({top: 0, behavior: 'smooth'})
        }
      } else {
        this.jumpTo(itemOrder)
      }
    },

    async getPaperById(paperId) {
      this.formData = (await getPaper(paperId)).data
      // 后端下发试卷时若带有开关字段，则以其为准
      if (Object.prototype.hasOwnProperty.call(this.formData, 'enableAntiCheat')) {
        this.antiCheatEnabled = !!this.formData.enableAntiCheat
      }
      this.initAnswer()
      //初始化时间为毫秒调用格式化时间戳工具
      this.initRemainTime()
      // 时间开始倒计时
      this.timeReduce()
    },
    //提交试卷弹框确认信息
    submit() {

      this.$confirm('不需要再检查一下吗亲~', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.$message({
        //   type: 'success',
        //   message: '提交成功!'
        // });
        this.sendSubmitAnswerRequest();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消提交'
        });
      });
    },
    //点击确认提交答案的请求方法
    async sendSubmitAnswerRequest() {
      window.clearInterval(this.timer)
      this.resetShuffleCache()
      const res = await submitAnswer(this.answer)
      if (res.code !== 200) {
        return
      }
      // console.log(res.data)
      // 如果服务器响应成功，经过了响应拦截器处理拿到200数据，不需要再做判断了，直接拿data即可
      this.$alert(`试卷总得分:${res.data}`, '考试结果', {
        confirmButtonText: '查看此次考试详情',
        cancelButtonText: '取消', // 添加取消按钮
        showClose: false, // 禁用右上角关闭按钮
        callback: action => {
          if (action === 'confirm') {
            // 用户点击了确认按钮
            // 在这里可以添加跳转到考试详情的代码
            this.$router.push({
              path: '/person/record',
              // query: {examId}
            })
          } else if (action === 'cancel') {
            // 用户点击了取消按钮
            this.$message({
              type: 'info',
              message: '您已取消查看考试详情。'
            });
          }
        }
      });
    }
  },
}
</script>

<style scoped>
/* 当前题目的特殊高亮样式 */
.current-question {
  border: 2px solid #409EFF !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3) !important;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* 防止在非防作弊模式下应用样式 */
.current-question:not(.el-tag--primary) {
  border: none !important;
  box-shadow: none !important;
  transform: none;
}



/* 安全警告样式 */
.security-warning {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.95);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  z-index: 10000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
</style>
