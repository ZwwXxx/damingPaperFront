<template>
  <div class="knowledge-publish">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📝 发布知识点</span>
        <div class="header-buttons">
          <el-button size="small" icon="el-icon-back" @click="goBack">返回</el-button>
        </div>
      </div>

      <el-form ref="publishForm" :model="form" :rules="rules" label-width="100px" class="publish-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <h3 class="section-title">📋 基础信息</h3>
          
          <el-form-item label="知识点标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入知识点标题（建议简洁明了）"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="科目" prop="subjectId">
            <el-select v-model="form.subjectId" placeholder="请选择科目" @change="handleSubjectChange">
              <el-option
                v-for="subject in subjectList"
                :key="subject.subjectId"
                :label="subject.subjectName"
                :value="subject.subjectId"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="章节" prop="chapterId">
            <el-select
              v-model="form.chapterId"
              placeholder="请选择章节"
              :disabled="!form.subjectId"
            >
              <el-option
                v-for="chapter in chapterList"
                :key="chapter.chapterId"
                :label="chapter.chapterName"
                :value="chapter.chapterId"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="难度等级" prop="difficulty">
            <el-select v-model="form.difficulty" placeholder="请选择难度等级">
              <el-option label="入门" value="1" />
              <el-option label="初级" value="2" />
              <el-option label="中级" value="3" />
              <el-option label="高级" value="4" />
              <el-option label="专家" value="5" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 内容摘要 -->
        <div class="form-section">
          <h3 class="section-title">📝 内容摘要</h3>
          <el-form-item label="摘要" prop="summary">
            <el-input
              type="textarea"
              v-model="form.summary"
              placeholder="请简要描述知识点内容（100-300字）"
              :rows="4"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- Markdown 内容编辑器 -->
        <div class="form-section">
          <h3 class="section-title">📖 详细内容</h3>
          <el-form-item label="详细内容" prop="content">
            <div class="markdown-editor">
              <div class="editor-toolbar">
                <el-button-group size="small">
                  <el-button @click="insertMarkdown('**', '**')" title="加粗">
                    <i class="el-icon-bold"></i>
                  </el-button>
                  <el-button @click="insertMarkdown('*', '*')" title="斜体">
                    <i class="el-icon-italic"></i>
                  </el-button>
                  <el-button @click="insertMarkdown('`', '`')" title="行内代码">
                    <i class="el-icon-collection-tag"></i>
                  </el-button>
                  <el-button @click="insertMarkdown('```\n', '\n```')" title="代码块">
                    <i class="el-icon-document-copy"></i>
                  </el-button>
                  <el-button @click="insertMarkdown('> ', '')" title="引用">
                    <i class="el-icon-chat-line-round"></i>
                  </el-button>
                  <el-button @click="insertMarkdown('- ', '')" title="列表">
                    <i class="el-icon-menu"></i>
                  </el-button>
                  <el-button @click="insertMarkdown('[链接文字](', ')')" title="链接">
                    <i class="el-icon-link"></i>
                  </el-button>
                </el-button-group>
                
                <div class="editor-tabs">
                  <span 
                    :class="['tab-item', { active: activeTab === 'edit' }]"
                    @click="activeTab = 'edit'"
                  >
                    编辑
                  </span>
                  <span 
                    :class="['tab-item', { active: activeTab === 'preview' }]"
                    @click="activeTab = 'preview'"
                  >
                    预览
                  </span>
                </div>
              </div>

              <!-- 编辑区域 -->
              <div v-show="activeTab === 'edit'" class="editor-area">
                <el-input
                  ref="contentEditor"
                  type="textarea"
                  v-model="form.content"
                  placeholder="请使用 Markdown 语法编写知识点详细内容..."
                  :rows="20"
                  class="markdown-textarea"
                />
              </div>

              <!-- 预览区域 -->
              <div v-show="activeTab === 'preview'" class="preview-area">
                <div class="markdown-body" v-html="renderedContent"></div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 示例代码（可选） -->
        <div class="form-section">
          <h3 class="section-title">💻 示例代码（可选）</h3>
          <el-form-item label="示例代码">
            <el-input
              type="textarea"
              v-model="form.example"
              placeholder="请提供相关的示例代码..."
              :rows="8"
              class="code-textarea"
            />
          </el-form-item>
        </div>

        <!-- 注意事项（可选） -->
        <div class="form-section">
          <h3 class="section-title">⚠️ 注意事项（可选）</h3>
          <el-form-item label="注意事项">
            <el-input
              type="textarea"
              v-model="form.note"
              placeholder="请说明使用时需要注意的事项..."
              :rows="4"
            />
          </el-form-item>
        </div>

        <!-- 参考链接（可选） -->
        <div class="form-section">
          <h3 class="section-title">🔗 参考链接（可选）</h3>
          <el-form-item label="参考链接">
            <el-input
              type="textarea"
              v-model="form.reference"
              placeholder="请提供相关的参考资料链接..."
              :rows="3"
            />
          </el-form-item>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            <i class="el-icon-upload"></i>
            发布知识点
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 发布成功提示 -->
    <el-dialog
      title="发布成功"
      :visible.sync="successDialogVisible"
      width="400px"
      :show-close="false"
    >
      <div style="text-align: center;">
        <i class="el-icon-success" style="font-size: 48px; color: #67C23A; margin-bottom: 20px;"></i>
        <p>知识点发布成功！</p>
        <p>您的知识点已提交审核，管理员审核通过后即可在知识点库中查看。</p>
      </div>
      <div slot="footer" style="text-align: center;">
        <el-button type="primary" @click="goToKnowledgeList">查看知识点库</el-button>
        <el-button @click="continuePublish">继续发布</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { publishKnowledge, getSubjects, getChaptersBySubject } from '@/api/knowledge'
import { marked } from 'marked'

export default {
  name: 'KnowledgePublish',
  data() {
    return {
      form: {
        title: '',
        subjectId: null,
        chapterId: null,
        difficulty: '',
        summary: '',
        content: '',
        example: '',
        note: '',
        reference: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入知识点标题', trigger: 'blur' },
          { min: 5, max: 100, message: '标题长度应为 5 到 100 个字符', trigger: 'blur' }
        ],
        subjectId: [
          { required: true, message: '请选择科目', trigger: 'change' }
        ],
        chapterId: [
          { required: true, message: '请选择章节', trigger: 'change' }
        ],
        difficulty: [
          { required: true, message: '请选择难度等级', trigger: 'change' }
        ],
        summary: [
          { required: true, message: '请输入内容摘要', trigger: 'blur' },
          { min: 100, max: 300, message: '摘要长度应为 100 到 300 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入详细内容', trigger: 'blur' },
          { min: 200, message: '详细内容不能少于 200 个字符', trigger: 'blur' }
        ]
      },
      subjectList: [],
      chapterList: [],
      activeTab: 'edit',
      submitting: false,
      successDialogVisible: false
    }
  },
  computed: {
    renderedContent() {
      return this.form.content ? marked(this.form.content) : '<p class="empty-preview">暂无内容预览</p>'
    }
  },
  mounted() {
    this.loadSubjects()
  },
  methods: {
    async loadSubjects() {
      try {
        const res = await getSubjects()
        if (res.code === 200) {
          this.subjectList = res.data
        }
      } catch (error) {
        console.error('获取科目列表失败:', error)
      }
    },

    async handleSubjectChange(subjectId) {
      this.form.chapterId = null
      this.chapterList = []
      
      if (subjectId) {
        try {
          const res = await getChaptersBySubject(subjectId)
          if (res.code === 200) {
            this.chapterList = res.data
          }
        } catch (error) {
          console.error('获取章节列表失败:', error)
        }
      }
    },

    insertMarkdown(prefix, suffix) {
      const textarea = this.$refs.contentEditor.$refs.textarea
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = this.form.content.substring(start, end)
      const newText = prefix + selectedText + suffix
      
      this.form.content = this.form.content.substring(0, start) + newText + this.form.content.substring(end)
      
      this.$nextTick(() => {
        textarea.focus()
        const newPosition = start + prefix.length + selectedText.length
        textarea.setSelectionRange(newPosition, newPosition)
      })
    },

    handleSubmit() {
      this.$refs.publishForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            const res = await publishKnowledge(this.form)
            if (res.code === 200) {
              this.successDialogVisible = true
            } else {
              this.$message.error(res.msg || '发布失败')
            }
          } catch (error) {
            console.error('发布失败:', error)
            this.$message.error('发布失败，请重试')
          } finally {
            this.submitting = false
          }
        }
      })
    },

    handleReset() {
      this.$refs.publishForm.resetFields()
      this.chapterList = []
    },

    goBack() {
      this.$router.go(-1)
    },

    goToKnowledgeList() {
      this.successDialogVisible = false
      this.$router.push('/knowledge')
    },

    continuePublish() {
      this.successDialogVisible = false
      this.handleReset()
    }
  }
}
</script>

<style scoped>
.knowledge-publish {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.box-card {
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.clearfix {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.publish-form {
  padding: 20px 0;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.markdown-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.editor-tabs {
  display: flex;
}

.tab-item {
  padding: 5px 15px;
  margin-left: 10px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #606266;
}

.tab-item.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.editor-area,
.preview-area {
  min-height: 400px;
}

.markdown-textarea {
  border: none;
  border-radius: 0;
}

.markdown-textarea >>> .el-textarea__inner {
  border: none;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
}

.preview-area {
  padding: 15px;
}

.markdown-body {
  line-height: 1.8;
  color: #333;
}

.markdown-body >>> h1,
.markdown-body >>> h2,
.markdown-body >>> h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: bold;
}

.markdown-body >>> h1 {
  font-size: 24px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.markdown-body >>> h2 {
  font-size: 20px;
}

.markdown-body >>> h3 {
  font-size: 18px;
}

.markdown-body >>> p {
  margin: 15px 0;
}

.markdown-body >>> pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.markdown-body >>> code {
  background: #f6f8fa;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 85%;
}

.markdown-body >>> blockquote {
  border-left: 4px solid #dfe2e5;
  padding: 0 16px;
  color: #6a737d;
  margin: 15px 0;
}

.empty-preview {
  color: #c0c4cc;
  text-align: center;
  padding: 50px 0;
  font-style: italic;
}

.code-textarea >>> .el-textarea__inner {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

.form-actions {
  text-align: center;
  padding: 30px 0;
  border-top: 1px solid #e4e7ed;
  margin-top: 30px;
}

.form-actions .el-button {
  margin: 0 10px;
  padding: 12px 30px;
  font-size: 16px;
}
</style>
