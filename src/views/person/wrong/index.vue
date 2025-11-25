<template>
  <div class="container">
    <div class="filter-card bg-white rounded-lg shadow p-4 mb-6">
      <el-form :model="filters" inline @submit.native.prevent>
        <el-form-item label="试卷名称">
          <el-input v-model="filters.paperName" placeholder="请输入试卷名" clearable style="width: 220px"
                    @keyup.enter.native="handleSearch"/>
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="filters.subjectId" placeholder="请选择科目" clearable style="width: 200px">
            <el-option label="全部" value=""/>
            <el-option
                v-for="subject in subjectOptions"
                :key="subject.subjectId"
                :label="subject.subjectName"
                :value="String(subject.subjectId)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="作答时间">
          <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              unlink-panels
              style="width: 260px"/>
        </el-form-item>
        <el-form-item label="错题次数">
          <el-select v-model="filters.sortOrder" placeholder="请选择排序" style="width: 180px" @change="handleSortChange">
            <el-option label="默认" value="default"/>
            <el-option label="次数从高到低" value="desc"/>
            <el-option label="次数从低到高" value="asc"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading">
      <div class="wrong-card bg-white shadow rounded-lg mb-4 p-4"
           v-for="item in wrongList"
           :key="item.answerId">
        <div class="flex justify-between items-center border-b pb-2 mb-3">
          <div>
            <p class="font-semibold text-lg text-gray-800">
              <span class="question-title-content" v-html="sanitizeHtml(item.questionTitle || '题目')"></span>
            </p>
            <p class="text-xs text-gray-500 mt-1">
              试卷：{{ item.paperName || '-' }} ｜ 科目：{{ transferSubject(item.subjectId) }} ｜ 上次作答：{{ item.createTime || '-' }}
            </p>
            <p class="error-count" v-if="item.wrongCount > 1">
              <span class="label">累计错题次数</span>
              <span class="value">{{ item.wrongCount }}</span>
            </p>
          </div>
          <el-tag type="danger">答错</el-tag>
        </div>
        <div class="options grid md:grid-cols-2 gap-3 mb-3">
          <div v-for="option in item.options" :key="option.prefix"
               :class="['p-3 rounded border',
             isSelected(option.prefix, item.userAnswer) ? 'border-red-400 bg-red-50' : 'border-gray-200']">
            <p class="font-semibold">{{ option.prefix }}. {{ option.content }}</p>
          </div>
        </div>
        <div class="answers flex flex-col md:flex-row md:space-x-6 text-sm text-gray-700">
          <div class="answer-item">
            <span class="answer-label">我的答案：</span>
            <div 
              v-if="isRichTextAnswer(item.userAnswer)"
              class="rich-answer text-red-500 font-semibold"
              v-html="item.userAnswer"
              @click="handleAnswerImageClick($event, item.userAnswer)">
            </div>
            <span v-else class="text-red-500 font-semibold">{{ formatAnswer(item.userAnswer) }}</span>
          </div>
          <div class="answer-item">
            <span class="answer-label">正确答案：</span>
            <div 
              v-if="isRichTextAnswer(item.correct)"
              class="rich-answer text-green-600 font-semibold"
              v-html="item.correct"
              @click="handleAnswerImageClick($event, item.correct)">
            </div>
            <span v-else class="text-green-600 font-semibold">{{ formatCorrectAnswer(item) }}</span>
          </div>
        </div>
        <!-- <div class="checkButton">
          <button
              @click="gotoReview(item.latestAnswerId || item.answerId)"
              class="bg-blue-500 absolute right-4 bottom-4 px-4 py-2 text-white rounded">查看试卷
          </button>
        </div> -->
      </div>
      <el-empty v-if="!loading && !wrongList.length" description="暂时没有错题记录"/>
    </div>
    
    <!-- 图片预览 -->
    <el-image-viewer
      v-if="imagePreview.visible"
      :url-list="imagePreview.urls"
      :initial-index="imagePreview.index"
      :on-close="closeImagePreview"
    />
  </div>
</template>

<script>
import {getWrongQuestionList} from "@/api/questionAnswer";
import {optionSubject} from "@/api/subject";
import ElImageViewer from "element-ui/packages/image/src/image-viewer";
import DOMPurify from 'dompurify';

export default {
  name: "wrongRecord",
  components: {
    ElImageViewer
  },
  data() {
    return {
      wrongList: [],
      loading: false,
      subjectOptions: [],
      subjectMap: {},
      filters: {
        paperName: '',
        subjectId: '',
        dateRange: [],
        sortOrder: 'default'
      },
      queryParam: {
        createUser: this.$store.getters['id']
      },
      imagePreview: {
        visible: false,
        urls: [],
        index: 0
      }
    }
  },
  created() {
    this.loadSubjects()
    this.getWrongList()
  },
  methods: {
    /**
     * 使用DOMPurify清理HTML内容，防止XSS攻击
     */
    sanitizeHtml(html) {
      if (!html) return '';
      if (!/<[^>]+>/.test(html)) {
        return html;
      }
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'img', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target'],
        ALLOW_DATA_ATTR: false
      });
    },
    async loadSubjects() {
      const res = await optionSubject()
      const list = res.data || []
      this.subjectOptions = list
      this.subjectMap = list.reduce((acc, cur) => {
        acc[cur.subjectId] = cur.subjectName
        return acc
      }, {})
    },
    transferSubject(subjectId) {
      return this.subjectMap[subjectId] || '-'
    },
    buildQuery() {
      const params = {
        createUser: this.queryParam.createUser,
        paperName: this.filters.paperName || undefined,
        subjectId: this.filters.subjectId || undefined
      }
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        params.beginTime = this.filters.dateRange[0]
        params.endTime = this.filters.dateRange[1]
      }
      if (this.filters.sortOrder && this.filters.sortOrder !== 'default') {
        params.sortOrder = this.filters.sortOrder
      }
      return params
    },
    applySort(list) {
      const order = this.filters.sortOrder
      if (!Array.isArray(list) || order === 'default') {
        return list
      }
      const sorted = [...list]
      sorted.sort((a, b) => {
        const aCount = Number(a.wrongCount) || 0
        const bCount = Number(b.wrongCount) || 0
        return order === 'asc' ? aCount - bCount : bCount - aCount
      })
      return sorted
    },
    async getWrongList() {
      this.loading = true
      try {
        const res = await getWrongQuestionList(this.buildQuery())
        this.wrongList = this.applySort(res.data || [])
        // 绑定题干图片预览事件
        this.bindQuestionImagePreview()
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.getWrongList()
    },
    handleReset() {
      this.filters = {
        paperName: '',
        subjectId: '',
        dateRange: [],
        sortOrder: 'default'
      }
      this.getWrongList()
    },
    handleSortChange() {
      this.wrongList = this.applySort(this.wrongList)
    },
    gotoReview(paperAnswerId) {
      if (!paperAnswerId) {
        return
      }
      this.$router.push({
        path: '/review',
        query: {paperAnswerId}
      })
    },
    isSelected(prefix, answerString) {
      if (!answerString) return false
      return answerString.split(',').includes(prefix)
    },
    formatAnswer(answer) {
      if (!answer) return '-'
      return answer.split(',').join('、')
    },
    formatCorrectAnswer(item) {
      if (item.questionType === 2 && item.correctArray && item.correctArray.length) {
        return item.correctArray.join('、')
      }
      return item.correct || '-'
    },
    // 判断是否为富文本答案（包含HTML标签）
    isRichTextAnswer(answer) {
      if (!answer || typeof answer !== 'string') return false
      return /<[^>]+>/g.test(answer)
    },
    // 处理答案中的图片点击
    handleAnswerImageClick(event, htmlContent) {
      const target = event.target
      if (target && target.tagName === 'IMG') {
        event.preventDefault()
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        const images = Array.from(tempDiv.querySelectorAll('img'))
        const urls = images.map(img => img.getAttribute('src')).filter(Boolean)
        if (urls.length > 0) {
          const index = Math.max(images.findIndex(img => img.getAttribute('src') === target.getAttribute('src')), 0)
          this.openImagePreview(urls, index)
        }
      }
    },
    // 打开图片预览
    openImagePreview(urls, index) {
      this.imagePreview = {
        visible: true,
        urls: urls,
        index: index
      }
    },
    // 关闭图片预览
    closeImagePreview() {
      this.imagePreview.visible = false
      this.imagePreview.urls = []
      this.imagePreview.index = 0
    },
    // 绑定题干图片预览事件
    bindQuestionImagePreview() {
      this.$nextTick(() => {
        const questionTitleElements = document.querySelectorAll('.question-title-content');
        questionTitleElements.forEach(element => {
          const images = element.querySelectorAll('img');
          images.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.onclick = (e) => {
              e.preventDefault();
              const allImages = Array.from(element.querySelectorAll('img'));
              const urls = allImages.map(image => image.getAttribute('src')).filter(Boolean);
              if (urls.length > 0) {
                const clickedIndex = allImages.indexOf(img);
                this.openImagePreview(urls, clickedIndex >= 0 ? clickedIndex : 0);
              }
            };
          });
        });
      });
    }
  }
}
</script>

<style scoped>
.wrong-card {
  border: 1px solid #e5e7eb;
}
.error-count {
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
}
.error-count .label {
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 8px;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
  border: 1px solid #fecaca;
}
.error-count .value {
  background: #dc2626;
  color: #fff;
  padding: 2px 10px;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
  border: 1px solid #dc2626;
}

/* 答案富文本样式 */
.answer-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.answer-label {
  flex-shrink: 0;
  margin-right: 8px;
}

.rich-answer {
  flex: 1;
}

/* 限制富文本答案中的图片大小 */
.rich-answer >>> img {
  max-width: 200px;
  max-height: 200px;
  height: auto;
  width: auto;
  cursor: zoom-in;
  display: inline-block;
  transition: transform 0.2s ease;
  margin: 4px 0;
}

.rich-answer >>> img:hover {
  transform: scale(1.05);
}

.rich-answer >>> p {
  margin: 4px 0;
}

/* 富文本题干样式 */
.question-title-content {
  display: inline;
  word-break: break-word;
}

.question-title-content >>> img {
  max-width: 200px !important;
  max-height: 200px !important;
  width: auto !important;
  height: auto !important;
  display: inline-block !important;
  margin: 10px 0 !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.question-title-content >>> img:hover {
  transform: scale(1.02);
}

/* 确保所有块级元素都内联显示，防止换行 */
.question-title-content >>> p,
.question-title-content >>> div,
.question-title-content >>> h1,
.question-title-content >>> h2,
.question-title-content >>> h3,
.question-title-content >>> h4,
.question-title-content >>> h5,
.question-title-content >>> h6 {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
}

.question-title-content >>> br {
  display: none !important;
}

.question-title-content >>> strong {
  font-weight: bold;
}

.question-title-content >>> em {
  font-style: italic;
}

.question-title-content >>> u {
  text-decoration: underline;
}

/* 选项富文本样式 */
.option-content {
  display: flex;
  align-items: flex-start;
  word-break: break-word;
}

.option-prefix {
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-text >>> img {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  display: inline-block;
  margin: 5px 0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
  vertical-align: top;
}

.option-text >>> img:hover {
  transform: scale(1.02);
}
</style>

