<!--
*@index
*@author Zww
*@date 2024/10/7 18:25
-->
<template>
  <div>
    <wrapper size="md" padding="0">
      <!--左侧题目进度-->
      <el-card class="fixed top-20 left-0 w-1/4 ">
        <p class="mb-5 text-xl">{{ paperDto.paperName }}</p>
        <div class="text-md mb-5 border-b">
          <p class="leading-8">试卷得分: {{ paperAnswerDto.finalScore }}/{{ paperDto.score }}</p>
          <p class="leading-8">耗时: {{ formatSeconds(paperAnswerDto.doTime) }}</p>
        </div>
        <div v-for="(questionType,index) in paperDto.paperQuestionTypeDto" :key="index">
          <p>{{ questionType.name }}</p>
          <div class="question-anchor  flex flex-wrap  ">
            <el-tag
                @click="jumpTo(question.itemOrder)"
                v-for="(question, qIndex) in questionType.questionDtos" :key="qIndex"
                :type="paperAnswerDto.questionAnswerDtos[question.itemOrder].correct?'success':'danger'"
                style="padding: 0; display: flex; justify-content: center; width:  calc(20% - 10px); height: 30px;margin: 5px"
                class="cursor-pointer"
                :class="{'tag-active': activeQuestionOrder === question.itemOrder}">
              {{ question.itemOrder + 1 }}
            </el-tag>
          </div>
        </div>
      </el-card>
      <div class="container ">
        <div v-for="(questionType,index) in paperDto.paperQuestionTypeDto" :key="index">
          <div class="part bg-gray-100 p-4 text-black">
            {{ questionType.name }}
          </div>
          <div class="question-item p-4" v-for="(question,index) in questionType.questionDtos" :key="index">
            <div class="q-title" :id="question.itemOrder">
              <p>{{ question.itemOrder + 1 }}. {{ question.questionTitle }}( {{ question.score }}分 )</p>
            </div>
            <div class="q-options p-6 flex flex-col ">
              <el-radio-group
                  v-if="question.questionType===1"
                  v-removeAria
                  v-model="paperAnswerDto.questionAnswerDtos[question.itemOrder].content"
                  @change="paperAnswerDto.questionAnswerDtos[question.itemOrder].completed = true">
                <el-radio
                    disabled
                    class="py-2" :label="selection.prefix"
                    v-for="(selection,index) in question.items" :key="index">
                  {{ selection.prefix }}.{{ selection.content }}

                </el-radio>
              </el-radio-group>
              <el-checkbox-group v-model="paperAnswerDto.questionAnswerDtos[question.itemOrder].contentArray"
                                 v-if="question.questionType===2">
                <el-checkbox disabled v-for="(checkBox,index) in question.items" :label="checkBox.prefix" :key="index">
                  {{ checkBox.prefix }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="reviewInfo  p-6 flex flex-col text-sm">
              <div class="answer-row">
                <span class="label">标准答案</span>
                <span class="value" v-if="question.questionType===1">{{ question.correct }}</span>
                <span class="value" v-else>{{ question.correctArray }}</span>
              </div>
              <div class="answer-row">
                <span class="label">你的答案</span>
                <span class="value" v-if="question.questionType===1">{{
                    paperAnswerDto.questionAnswerDtos[question.itemOrder].content
                  }}</span>
                <span class="value" v-else>{{
                    paperAnswerDto.questionAnswerDtos[question.itemOrder].contentArray
                  }}</span>
              </div>
              <div class="answer-row">
                <span class="label">结果</span>
                <el-tag type="success" size="mini"
                        v-if="paperAnswerDto.questionAnswerDtos[question.itemOrder].correct">正确
                </el-tag>
                <el-tag type="danger" size="mini" v-else>错误</el-tag>
              </div>
              <div class="action-row">
                <el-button
                    size="mini"
                    type="primary"
                    plain
                    @click="toggleAnalysis(question.itemOrder)">
                  {{ expandedAnalysis[question.itemOrder] ? '收起解析' : '展开解析' }}
                </el-button>
                <el-button
                    size="mini"
                    plain
                    :type="isFavorite(question.id) ? 'warning' : 'info'"
                    @click="toggleFavorite(question)">
                  {{ isFavorite(question.id) ? '已收藏' : '收藏' }}
                </el-button>
              </div>
              <transition name="fade">
                <div class="analysis-wrap" v-if="expandedAnalysis[question.itemOrder]">
                  <div class="analysis-header">
                    <span class="title">解析</span>
                  </div>
                  <div
                      class="analysis-content"
                      v-if="question.analysis"
                      v-html="question.analysis"
                      :ref="'analysis-' + question.itemOrder"></div>
                  <div class="analysis-empty" v-else>暂无解析</div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>


        <ai :isCollapse="isCollapse" :needCollapse="true"></ai>
        <el-image-viewer
            v-if="imagePreview.visible"
            :url-list="imagePreview.urls"
            :initial-index="imagePreview.index"
            :on-close="closeImagePreview"/>

    </wrapper>
  </div>
</template>

<script>
import wrapper from "@/components/wrapper.vue";
import {getPaperAnswer} from "@/api/paperAnswer";
import {formatSeconds} from "@/utils/time";
import ai from "@/components/ai.vue";
import ElImageViewer from "element-ui/packages/image/src/image-viewer";
import {addFavorite, getFavoriteList, removeFavorite} from "@/api/questionFavorite";

export default {
  name: "index",
  props: {},
  components: {
    wrapper,
    ai,
    ElImageViewer
  },

  mounted() {

  },
  created() {
    this.paperAnswerId = this.$route.query.paperAnswerId
    this.getPaperAnswerItem(this.paperAnswerId)
    this.loadFavoriteQuestionIds()
    // this.getUserInfo()
  },
  beforeDestroy() {
    this.unlockBodyScroll()
    this.removeScrollSpy()
  },

  data() {
    return {
      eventsource: null,
      timer: null,
      //存储输出区域的dom，后续持续滚动到底
      outputElement: null,
      // 是否提前结束
      preStop: false,
      // 是否收缩
      isCollapse: true,
      // 打字机的速度
      speed: 60,
      // 实时滚动到底
      srcollBottom: true,
      //是否禁用按钮
      btnForbidden: false,
      paperDto: {},
      paperAnswerDto: {},
      content: '',
      chatRecord: [
        {
          role: "Zww:", content: "嗨嗨嗨,又见面了老壁灯😚,Zww在线为你解答世间万物"
        },
      ],
      user: {},
      expandedAnalysis: {},
      imagePreview: {
        visible: false,
        urls: [],
        index: 0
      },
      bodyScrollLocked: false,
      originalBodyOverflow: '',
      originalHtmlOverflow: '',
      scrollPosition: 0,
      preventScrollHandler: null,
      activeQuestionOrder: null,
      scrollListener: null,
      paperAnswerId: null,
      favoriteMap: {}
    }
  },

  methods: {
    async getPaperAnswerItem(paperAnswerId) {
      const res = await getPaperAnswer(paperAnswerId)
      this.paperDto = res.data.paperDto
      this.paperAnswerDto = res.data.paperAnswerDto
      this.expandedAnalysis = {}
      this.$nextTick(() => {
        this.bindAllAnalysisImages()
        this.setupScrollSpy()
      })
    },
    async loadFavoriteQuestionIds() {
      if (!this.paperAnswerId) {
        return
      }
      try {
        const res = await getFavoriteList({paperAnswerId: this.paperAnswerId})
        const ids = res.data || []
        const map = {}
        ids.forEach(id => {
          map[id] = true
        })
        this.favoriteMap = map
      } catch (error) {
        console.error('获取收藏列表失败', error)
      }
    },
    isFavorite(questionId) {
      if (!questionId) {
        return false
      }
      return !!this.favoriteMap[questionId]
    },
    async toggleFavorite(question) {
      if (!question || !question.id) {
        return
      }
      const questionId = question.id
      const isFav = this.isFavorite(questionId)
      try {
        if (isFav) {
          await removeFavorite(questionId)
          this.$delete(this.favoriteMap, questionId)
          this.$message.success('已取消收藏')
        } else {
          await addFavorite({
            questionId,
            paperAnswerId: this.paperAnswerId,
            paperId: this.paperDto?.paperId,
            subjectId: question.subjectId || this.paperDto?.subjectId
          })
          this.$set(this.favoriteMap, questionId, true)
          this.$message.success('收藏成功')
        }
      } catch (error) {
        console.error('收藏操作失败', error)
      }
    },
    toggleAnalysis(itemOrder) {
      this.$set(this.expandedAnalysis, itemOrder, !this.expandedAnalysis[itemOrder])
      if (this.expandedAnalysis[itemOrder]) {
        this.$nextTick(() => this.bindAnalysisImages(itemOrder))
      }
    },
    bindAllAnalysisImages() {
      if (!this.paperDto?.paperQuestionTypeDto) return
      this.paperDto.paperQuestionTypeDto.forEach(type => {
        type.questionDtos.forEach(q => this.bindAnalysisImages(q.itemOrder))
      })
    },
    bindAnalysisImages(itemOrder) {
      const ref = this.$refs[`analysis-${itemOrder}`]
      const container = Array.isArray(ref) ? ref[0] : ref
      if (!container) return
      const imgs = container.querySelectorAll('img')
      if (!imgs.length) return
      const urlList = Array.from(imgs).map(img => img.src)
      imgs.forEach((img, index) => {
        img.style.cursor = 'zoom-in'
        img.onclick = () => this.openImagePreview(urlList, index)
      })
    },
    openImagePreview(urls, index) {
      this.imagePreview.urls = urls
      this.imagePreview.index = index
      this.imagePreview.visible = true
      this.lockBodyScroll()
    },
    closeImagePreview() {
      this.imagePreview.visible = false
      this.unlockBodyScroll()
    },
    lockBodyScroll() {
      if (this.bodyScrollLocked) return
      this.bodyScrollLocked = true
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      this.originalBodyOverflow = document.body.style.overflow
      this.originalHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${this.scrollPosition}px`
      document.body.style.width = '100%'
      this.preventScrollHandler = e => e.preventDefault()
      window.addEventListener('wheel', this.preventScrollHandler, { passive: false })
      window.addEventListener('touchmove', this.preventScrollHandler, { passive: false })
    },
    unlockBodyScroll() {
      if (!this.bodyScrollLocked) return
      this.bodyScrollLocked = false
      document.body.style.overflow = this.originalBodyOverflow || ''
      document.documentElement.style.overflow = this.originalHtmlOverflow || ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (this.preventScrollHandler) {
        window.removeEventListener('wheel', this.preventScrollHandler)
        window.removeEventListener('touchmove', this.preventScrollHandler)
        this.preventScrollHandler = null
      }
      window.scrollTo(0, this.scrollPosition || 0)
    },

    setupScrollSpy() {
      this.removeScrollSpy()
      this.$nextTick(() => {
        this.handleScrollSpy()
        this.scrollListener = () => this.handleScrollSpy()
        window.addEventListener('scroll', this.scrollListener, {passive: true})
      })
    },
    removeScrollSpy() {
      if (this.scrollListener) {
        window.removeEventListener('scroll', this.scrollListener)
        this.scrollListener = null
      }
    },
    handleScrollSpy() {
      const titles = Array.from(document.querySelectorAll('.question-item .q-title'))
      if (!titles.length) {
        this.activeQuestionOrder = null
        return
      }
      const offset = 140
      let currentId = titles[0].id
      for (const node of titles) {
        const rect = node.getBoundingClientRect()
        if (rect.top - offset <= 0) {
          currentId = node.id
        } else {
          break
        }
      }
      this.activeQuestionOrder = currentId !== undefined ? Number(currentId) : null
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
    formatSeconds(seconds) {
      return formatSeconds(seconds)
    },

//     getSession() {
//       fetch('http://localhost:8080/api/getSession', {
//         method: 'GET',
//         credentials: 'include' // 确保发送 cookie
//       })
//           .then(response => response.text())
//           .then(data => {
//             console.log(data)
//           })
//           .catch(error => console.error('Error:', error));
//     },
//     setSession() {
//       fetch('http://localhost:8080/api/setSession', {
//         method: 'GET',
//         credentials: 'include' // 确保发送 cookie
//       })
//           .then(response => response.text())
//           .then(data => {
//             this.sessionOutput = data;
//           })
//           .catch(error => console.error('Error:', error));
//     },
//
//     sendChat() {
//       if (this.content.trim() === '') return; // 防止发送空消息
//       this.chatRecord.push(
//           // 初始化用户输入字符串
//           {role: "你:", content: this.content},
//           // 初始化机器人输出字符串
//           {role: "Zww:", content: ""},
//       )
//       fetch('http://localhost:8080/quiz/student/chat/sendMessage', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // 如果需要，可以添加其他头部信息
//         },
//         body: JSON.stringify({content: this.content}), // 发送内容
//         credentials: 'include', // 带上凭证
//       })
//           .then(response => {
//             if (!response.ok) {
//               throw new Error('Network response was not ok');
//             }
//             return response.json();
//           })
//           .then(data => {
//             console.log(data)
//             // 处理服务器响应
//             this.content = ''; // 清空输入框
//           })
//           .catch(error => {
//             console.error('There was a problem with the fetch operation:', error);
//           });
//     },
//     //打开sse会话
//     startSSE() {
//       this.eventsource = new EventSource(`http://localhost:8080/quiz/student/chat/openSse/${this.user.userName}`, {withCredentials: true});
//       this.eventsource.onerror = (event) => {
//         console.error('Error occurred:', event);
//         // 处理错误，例如重新连接或显示错误信息
//       };
//
//       // 定义初始内容
//       // 中转值，后续用打字机慢慢将数组存到真实数组里
//       let buffer = ""
//       // 定时器,打字机效果
//       // let timer;
//       // 当前存储的下标
//       let char_index = 0
//       // 拷贝引用，后续往里填值
//       let ai = this.chatRecord[this.chatRecord.length - 1]
//
//       this.eventsource.onmessage = (event) => {
//         let data = JSON.parse(event.data);
//         console.log("收到一条新消息" + data.result)
//
//         if (data.is_end) {
//           console.log("关闭消息器")
//           console.log("总耗费" + data.usage.total_tokens * 0.00009)
//           this.btnForbidden = false
//           this.eventsource.close();
//         }
//         // 获取新的信息并将其设置到数组
//         buffer += data.result
//         // 这里可以更新 DOM 或执行其他操作
//         if (this.timer == null) {
//           this.timer = setInterval(() => {
//             //这里我们给一个定时器设置异步打字机效果 从0开始一直到内容的长度 依次输出
//             if (char_index < buffer.length) {
//               // 如果从0，从头开始算，没有自增到内容结尾，那么就慢慢一直输出到数组值里
//               ai.content += buffer.charAt(char_index)
//               // 实时滚动条, 实时卷去总高度，这样就能一直在最底下了
//               const output = this.$refs.output;
//               output.scrollTop = output.scrollHeight
//               char_index++
//             } else {
//               // 输出结束后清除定时器，等待下一个流来开启
//               console.log("当前已有流的文本内容已读取完毕，等待下一个流的定时器开始")
//               clearInterval(this.timer)
//               this.eventsource.close()
//               this.clearContext()
//               // 置空，下次判断为空则开启新定时器，
//               // 以免出现流太慢到达而导致char_index提前自增到text.length
//               this.timer = null
//             }
//           }, 1000 / this.speed)
//         }
//       };
//     },
//     test() {
//       console.log("开始")
//       // const test = new EventSource("http://localhost:8080/sse/quiz/student/chat/test", {withCredentials:true});
//       const test = new EventSource("http://localhost:8080/quiz/student/chat/openSse", {withCredentials: true});
//       // const test = new EventSource("http://localhost:8080/api/getSession", {withCredentials: true});
//
//       test.onmessage = (e) => {
//         console.log("收到消息:", e.data); // 处理每条消息
//       };
//
//       test.onerror = (e) => {
//         console.error("发生错误:", e);
//         test.close(); // 可选: 在错误时关闭连接
//       };
//     },

    // openSseRaw() {
    //   console.log("正在发送消息")
    //   // 将当前发送内容记录到聊天记录表，已做渲染
    //   this.chatRecord.push(
    //       // 初始化用户输入字符串
    //       {role: "你:", content: this.content},
    //       // 初始化机器人输出字符串
    //       {role: "Zww:", content: ""},
    //   )
    //   // 拷贝引用，后续往里填值
    //   let ai = this.chatRecord[this.chatRecord.length - 1]
    //   // 初始化获取服务器result的对象，后续用来中转数据，然后才通过打字机填入ai对象也就是数组里进行遍历
    //   let text = ""
    //   this.btnForbidden = true
    //   //记录上下文
    //   const _this = this
    //   //初始化定时器
    //   let timer;
    //   // 是否正在输出 如果是，先不清楚定时器
    //   // 调用服务端的流式接口, 修改为自己的服务器地址和端口号
    //   fetch('http://localhost:8000/eb_stream', {
    //     method: 'post',
    //     headers: {'Content-Type': 'text/plain'},
    //     body: JSON.stringify({'content': this.content})
    //   })
    //       .then(response => {
    //         //提取响应体，response.body 是一个 ReadableStream允许以流的方式读取内容
    //         return response.body;
    //       })
    //       .then(body => {
    //         console.log("响应成功")
    //         // 清空输入框内容
    //         _this.content=""
    //         console.log(`当前打字机速度为每秒${_this.speed}`)
    //         // 响应体传入，从该响应体创建出读取器，逐步读取流里的数据
    //         //  后续所有后端的单独流flush过来的这里都能读取到
    //         const reader = body.getReader();
    //         // 后续利用解码器read到的字符流进行解码
    //         const decoder = new TextDecoder();
    //         // 初始化打字机下标
    //         let char_index = 0
    //
    //         function read() {
    //           // 返回一个promise对象，包含是否读取结束和读取值,每次read一次就拿一次data里的数据
    //           return reader.read().then(({done, value}) => {
    //             console.log("有一个流来了")
    //             if (done) { // 读取完成
    //               // 清空text，进行下一次记录
    //               // outputStream.close(); 关闭后也会传来一个流，done值为真
    //               console.log("已到达最后一个信息流")
    //               // clearInterval(timer); // 清理定时器
    //               // 清空内容，以作下一次输入值，并且提交按钮为false不允许提交直到内容记录完毕
    //               _this.content = ""
    //               // 恢复按钮状态
    //               _this.btnForbidden = false
    //               // 记录耗费多少token
    //
    //               return;
    //             }
    //             // 流式处理时，每个流会拆分为不同的片段，开启stream后不会造成数据错误
    //             // 举个例子 {result:你好} , {result:okok} 如果不加可能会变成
    //             // 举个例子 {result:你好,  } , {result:okok}
    //             // 分成片段后，开启stream会 识别流内容的开始和结束，保证数据完整性
    //             // 不用清空data，每次read读取获取到新流之后会进行覆盖，一个value对应一个信息data
    //             const data = decoder.decode(value, {stream: true});
    //             console.log('Raw JSON data:', data); // 在解析之前打印数据
    //
    //             // 先放到中转器上
    //             text += JSON.parse(data).result;
    //
    //             // 如果有定时器了就不设置了，让他一直跑，根据新的text的长度，一直判断
    //             //  出口我们设置在 出现done值那里，一旦数据流写入完毕出现done值，我们清空定时器
    //             if (timer == null) {
    //               timer = setInterval(() => {
    //                 //这里我们给一个定时器设置异步打字机效果 从0开始一直到内容的长度 依次输出
    //                 if (char_index < text.length) {
    //                   // 如果从0，从头开始算，没有自增到内容结尾，那么就慢慢一直输出到数组值里
    //                   ai.content += text.charAt(char_index)
    //                   char_index++
    //                 }else {
    //                   // 输出结束后清除定时器，等待下一个流来开启
    //                   console.log("当前已有流的文本内容已读取完毕，等待下一个流的定时器开始")
    //                   clearInterval(timer)
    //                   // 置空，下次判断为空则开启新定时器，
    //                   // 以免出现流太慢到达而导致char_index提前自增到text.length
    //                   timer=null
    //                 }
    //               }, 1000 / _this.speed)
    //             }
    //             return read();
    //           });
    //         }
    //
    //         return read();
    //       })
    //       .catch(error => {
    //         console.error('发生错误:', error);
    //       });
    // },


  }
  ,
}
</script>

<style scoped>
.answer-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.answer-row .label {
  width: 80px;
  color: #666;
}
.answer-row .value {
  color: #333;
}
.analysis-wrap {
  margin-top: 12px;
  background: #f8fbff;
  border: 1px solid #d8e7ff;
  border-radius: 6px;
  padding: 12px;
}
.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.analysis-header .title {
  font-weight: 600;
  color: #2f54eb;
}
.analysis-header .sub-tip {
  font-size: 12px;
  color: #9aa4c1;
}
.analysis-empty {
  color: #999;
}
.action-row {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.question-anchor .tag-active {
  box-shadow: 0 0 0 2px #409EFF inset;
  transform: scale(1.02);
}
::v-deep .analysis-content ul {
  list-style: disc;
  margin-left: 20px;
}
::v-deep .analysis-content ol {
  list-style: decimal;
  margin-left: 20px;
}
::v-deep .analysis-content p {
  margin: 4px 0;
}
</style>
