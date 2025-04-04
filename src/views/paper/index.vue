<!--
*@index
*@author Zww
*@date 2024/10/7 9:05
-->
<template>
  <wrapper size="md" padding="0">
    <!--左侧题目进度-->
    <el-card class="fixed top-20 left-0 w-1/4 ">
      <div class="questType" v-for="(questType,index) in formData.paperQuestionTypeDto" :key=index>
        <p class="mb-2">{{ questType.name }}</p>
        <div class="question-anchor  flex flex-wrap  ">
          <el-tag
              @click="jumpTo(question.itemOrder)"
              v-for="(question, qIndex) in questType.questionDtos" :key="qIndex"
              :type="answer.questionAnswerDtos[question.itemOrder].completed?'success':'plain'"
              style="padding: 0; display: flex; justify-content: center; width:  calc(20% - 10px); height: 30px;margin: 5px"
              class="cursor-pointer ">
            {{ qIndex + 1 }}  <!-- 使用 qIndex 递增标签 -->
          </el-tag>
        </div>
      </div>
    </el-card>
    <!--中间题目内容-->
    <div class="container">
      <div class="questionTypeBody" v-for="(questType,index)  in formData.paperQuestionTypeDto" :key="index">
        <div class="part bg-gray-100 p-4 text-black">
          {{ questType.name }}
        </div>
        <div class="question-item p-4" v-for="(questionItem,index) in questType.questionDtos" :key="index">
          <div class="q-title">

              <span class="break-words w-full">
                <span>
                  <span class="text-red-800 font-bold mr-2" :id="questionItem.itemOrder">{{
                      questionItem.itemOrder + 1
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
    <!--右侧题目介绍，倒计时-->
    <el-card class="fixed top-20 right-0 w-1/4 ">
      <p class="paper-name font-bolder text-xl">
        2024年广东专插本高等数学
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

export default {
  name: "index",
  props: {},
  created() {
    let paperId = this.$route.query.paperId
    if (paperId) {
      this.getPaperById(paperId)
    }
  },
  components: {wrapper},
  data() {
    return {
      timer: undefined,
      remainTime: undefined,
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
  },
  methods: {
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
    },

    async getPaperById(paperId) {
      this.formData = (await getPaper(paperId)).data
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
      const res = await submitAnswer(this.answer)
      if (res.code !== 200) {
        return
      }
      // console.log(res.data)
      // 如果服务器响应成功，经过了响应拦截器处理拿到200数据，不需要再做判断了，直接拿data即可
      this.$alert(`试卷总得分:${res.data}`, '考试结果', {
        confirmButtonText: '查看此次考试详情',
        cancelButtonText: '取消', // 添加取消按钮
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

</style>
