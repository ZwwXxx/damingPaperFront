<template>
  <wrapper>
    <div class="search-panel bg-white p-6 rounded-lg shadow mb-6">
      <div class="text-xl font-semibold mb-4">快速查找试卷</div>
      <el-form inline @submit.native.prevent>
        <el-form-item>
          <el-input
            v-model="searchForm.paperName"
            placeholder="请输入试卷名称"
            clearable
            @keyup.enter.native="handleSearch"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="searchForm.subjectId"
            placeholder="选择科目"
            clearable
            style="width: 200px"
          >
            <el-option label="全部科目" value="" />
            <el-option
              v-for="subject in subjectList"
              :key="subject.subjectId"
              :label="subject.subjectName"
              :value="String(subject.subjectId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="searchForm.paperType"
            placeholder="试卷类型"
            clearable
            style="width: 180px"
          >
            <el-option label="全部试卷" value="" />
            <el-option label="真题" value="1" />
            <el-option label="模拟题" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="quick-filter mt-4" v-if="subjectList.length">
        <span class="text-gray-500 mr-3">快捷分类：</span>
        <el-tag
          v-for="subject in subjectList"
          :key="subject.subjectId"
          class="mr-2 mb-2 cursor-pointer"
          :type="searchForm.subjectId === String(subject.subjectId) ? 'primary' : 'info'"
          @click="applySubject(subject.subjectId)"
        >
          {{ subject.subjectName }}
        </el-tag>
      </div>
    </div>

    <div class="paper-list" v-loading="loading">
      <div v-if="paperList.length">
        <div
          class="paper-card border rounded-lg p-4 mb-4 shadow-sm flex justify-between items-center hover:shadow-md transition"
          v-for="paper in paperList"
          :key="paper.paperId"
        >
          <div>
            <p class="text-lg font-semibold text-gray-800">{{ paper.paperName || ('试卷 ' + paper.paperId) }}</p>
            <div class="text-sm text-gray-500 mt-2 space-x-4">
              <span>题目数量：{{ paper.questionCount || '-' }}</span>
              <span>总分：{{ paper.score || '-' }}</span>
              <span v-if="paper.suggestTime">考试时长：{{ paper.suggestTime }} 分钟</span>
            </div>
            <div class="text-sm text-gray-500 mt-2 flex items-center space-x-2">
              <el-tag :type="getPaperStatusTag(paper).type" size="mini">{{ getPaperStatusTag(paper).text }}</el-tag>
              <span v-if="getPaperStatusTag(paper).desc">{{ getPaperStatusTag(paper).desc }}</span>
            </div>
          </div>
          <div class="actions flex items-center space-x-2">
            <el-button
              type="primary"
              @click="handleGotoPaper(paper)">
              开始答题
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="未找到符合条件的试卷" />
    </div>
  </wrapper>
</template>

<script>
// import {  } from "";
import wrapper from "@/components/wrapper.vue";
import {optionSubject} from "@/api/subject";
import {listPaperBySubjectId} from "@/api/paper";

export default {
  name: 'Home',
  components: {wrapper},
  data() {
    return {
      subjectList: [],
      searchForm: {
        paperName: '',
        subjectId: '',
        paperType: ''
      },
      paperList: [],
      loading: false
    };
  },


  methods: {
    async fetchSubjects() {
      const res = await optionSubject();
      this.subjectList = res.data || [];
    },
    async loadPapers() {
      this.loading = true;
      const params = {
        paperName: this.searchForm.paperName || undefined,
        subjectId: this.searchForm.subjectId || undefined,
        paperType: this.searchForm.paperType || undefined
      };
      try {
        const res = await listPaperBySubjectId(params);
        this.paperList = res.rows || [];
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.loadPapers();
    },
    handleReset() {
      this.searchForm = {
        paperName: '',
        subjectId: '',
        paperType: ''
      };
      this.loadPapers();
    },
    applySubject(subjectId) {
      this.searchForm.subjectId = String(subjectId);
      this.loadPapers();
    },
    // 获取试卷状态（仅用于显示标签）
    getPaperStatusTag(paper) {
      const {start, end} = this.getPaperTimeRange(paper);
      const now = Date.now();
      if (start && now < start) {
        return {
          text: '未开始',
          type: 'info',
          desc: `开始时间：${this.formatDateTime(start)}`
        };
      }
      if (end && now > end) {
        return {
          text: '已截止',
          type: 'danger',
          desc: `截止时间：${this.formatDateTime(end)}`
        };
      }
      const descParts = [];
      if (start) {
        descParts.push(`开始：${this.formatDateTime(start)}`);
      }
      if (end) {
        descParts.push(`截止：${this.formatDateTime(end)}`);
      }
      return {
        text: '进行中',
        type: 'success',
        desc: descParts.join(' / ')
      };
    },
    // 检查试卷时间窗口（点击时调用）
    checkPaperTimeWindow(paper) {
      const {start, end} = this.getPaperTimeRange(paper);
      const now = Date.now();
      
      // 未开始
      if (start && now < start) {
        return {
          canEnter: false,
          message: `考试未开始，开始时间：${this.formatDateTime(start)}`
        };
      }
      
      // 已截止
      if (end && now > end) {
        return {
          canEnter: false,
          message: `考试已截止，截止时间：${this.formatDateTime(end)}`
        };
      }
      
      // 可以进入
      return {
        canEnter: true,
        message: ''
      };
    },
    getPaperTimeRange(paper = {}) {
      const start = this.parseDate(
          paper.startTime || paper.beginTime || paper.openTime || paper.publishTime);
      const end = this.parseDate(
          paper.endTime || paper.closeTime || paper.deadlineTime || paper.deadline);
      return {start, end};
    },
    parseDate(value) {
      if (!value) return null;
      const ts = Date.parse(value);
      if (!Number.isNaN(ts)) {
        return ts;
      }
      const normalized = String(value).replace(/-/g, '/');
      const ts2 = Date.parse(normalized);
      return Number.isNaN(ts2) ? null : ts2;
    },
    formatDateTime(ts) {
      if (!ts) return '';
      const date = new Date(ts);
      const pad = n => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },
    handleGotoPaper(paper) {
      // 点击时实时检查时间窗口
      const check = this.checkPaperTimeWindow(paper);
      if (!check.canEnter) {
        this.$message.warning(check.message);
        return;
      }
      // 时间验证通过，跳转到答题页面
      this.gotoPaper(paper.paperId);
    },
    gotoPaper(paperId) {
      if (!paperId) {
        return;
      }
      this.$router.push({
        name: 'paper',
        params: {paperId: String(paperId)}
      });
    }
  },
  created() {
    this.fetchSubjects();
    this.loadPapers();
  }
};
</script>
<style>

</style>
