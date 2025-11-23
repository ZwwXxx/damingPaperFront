<template>
  <div class="feedback-submit">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📝 意见反馈</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goToMyFeedback"
        >查看我的反馈</el-button>
      </div>

      <el-form
        ref="feedbackForm"
        :model="feedbackForm"
        :rules="rules"
        label-width="100px"
        class="feedback-form"
      >
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-radio-group v-model="feedbackForm.feedbackType">
            <el-radio :label="1">💡 功能建议</el-radio>
            <el-radio :label="2">🐛 Bug反馈</el-radio>
            <el-radio :label="3">❓ 使用问题</el-radio>
            <el-radio :label="4">📌 其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="反馈标题" prop="feedbackTitle">
          <el-input
            v-model="feedbackForm.feedbackTitle"
            placeholder="请简要描述您的问题或建议"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="详细描述" prop="feedbackContent">
          <el-input
            v-model="feedbackForm.feedbackContent"
            type="textarea"
            :rows="8"
            placeholder="请详细描述您遇到的问题或建议，我们会尽快处理并回复您"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系方式" prop="contactInfo">
          <el-input
            v-model="feedbackForm.contactInfo"
            placeholder="请留下您的手机号或邮箱（选填）"
            maxlength="200"
          >
            <template slot="prepend">
              <i class="el-icon-phone-outline"></i>
            </template>
          </el-input>
          <div class="tip">留下联系方式可以让我们更好地与您沟通</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitFeedback" :loading="submitting">
            提交反馈
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提示信息 -->
    <el-card class="tips-card">
      <div slot="header">
        <i class="el-icon-info"></i> 温馨提示
      </div>
      <div class="tips-content">
        <p>• 我们会认真对待每一条反馈，并在1-3个工作日内给予回复</p>
        <p>• 提交后可在"我的反馈"中查看处理进度和回复</p>
        <p>• 如有紧急问题，请联系客服：400-xxx-xxxx</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { submitFeedback } from '@/api/feedback'

export default {
  name: 'FeedbackSubmit',
  data() {
    return {
      feedbackForm: {
        feedbackType: 1,
        feedbackTitle: '',
        feedbackContent: '',
        contactInfo: ''
      },
      rules: {
        feedbackType: [
          { required: true, message: '请选择反馈类型', trigger: 'change' }
        ],
        feedbackTitle: [
          { required: true, message: '请输入反馈标题', trigger: 'blur' },
          { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
        ],
        feedbackContent: [
          { required: true, message: '请输入详细描述', trigger: 'blur' },
          { min: 10, max: 1000, message: '长度在 10 到 1000 个字符', trigger: 'blur' }
        ]
      },
      submitting: false
    }
  },
  methods: {
    /** 提交反馈 */
    submitFeedback() {
      this.$refs.feedbackForm.validate(valid => {
        if (valid) {
          this.submitting = true
          submitFeedback(this.feedbackForm)
            .then(response => {
              this.$message.success('反馈提交成功！感谢您的宝贵意见')
              this.resetForm()
              // 3秒后跳转到我的反馈页面
              setTimeout(() => {
                this.goToMyFeedback()
              }, 1500)
            })
            .finally(() => {
              this.submitting = false
            })
        }
      })
    },
    /** 重置表单 */
    resetForm() {
      this.feedbackForm = {
        feedbackType: 1,
        feedbackTitle: '',
        feedbackContent: '',
        contactInfo: ''
      }
      this.$refs.feedbackForm.resetFields()
    },
    /** 跳转到我的反馈页面 */
    goToMyFeedback() {
      this.$router.push('/feedback/my')
    }
  }
}
</script>

<style scoped>
.feedback-submit {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.box-card {
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.feedback-form {
  margin-top: 20px;
}

.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.tips-card {
  background: #f9fafc;
}

.tips-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
}

.tips-content p {
  margin: 8px 0;
}
</style>
