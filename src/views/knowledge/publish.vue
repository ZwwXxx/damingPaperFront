<template>
  <div class="knowledge-publish">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📝 发布知识点</span>
        <div class="header-buttons">
          <el-button size="small" icon="el-icon-back" @click="goBack">返回</el-button>
        </div>
      </div>

      <el-form ref="publishForm" :model="form" :rules="rules" class="publish-form">
        <div class="publish-layout">
          <!-- 左侧：Markdown 编辑器 -->
          <div class="editor-container">
            <div class="editor-wrapper">
              <div class="markdown-editor">
                <div class="editor-toolbar">
                  <div class="toolbar-groups">
                    <!-- 文本格式 -->
                    <el-button-group size="small">
                      <el-button @click="insertMarkdown('**', '**')" title="加粗">
                        <strong>B</strong>
                      </el-button>
                      <el-button @click="insertMarkdown('*', '*')" title="斜体">
                        <em>I</em>
                      </el-button>
                      <el-button @click="insertMarkdown('# ', '')" title="标题">
                        <strong>H</strong>
                      </el-button>
                      <el-button @click="insertMarkdown('~~', '~~')" title="删除线">
                        <span style="text-decoration: line-through;">S</span>
                      </el-button>
                    </el-button-group>

                    <!-- 列表 -->
                    <el-button-group size="small">
                      <el-button @click="insertMarkdown('- ', '')" title="无序列表">
                        <i class="el-icon-menu"></i>
                      </el-button>
                      <el-button @click="insertMarkdown('1. ', '')" title="有序列表">
                        <i class="el-icon-finished"></i>
                      </el-button>
                      <el-button @click="insertMarkdown('- [ ] ', '')" title="任务列表">
                        <i class="el-icon-circle-check"></i>
                      </el-button>
                    </el-button-group>

                    <!-- 引用和代码 -->
                    <el-button-group size="small">
                      <el-button @click="insertMarkdown('> ', '')" title="引用">
                        <i class="el-icon-chat-line-round"></i>
                      </el-button>
                      <el-button @click="insertMarkdown('`', '`')" title="行内代码">
                        <i class="el-icon-collection-tag"></i>
                      </el-button>
                      <el-button @click="insertCodeBlock" title="代码块">
                        <i class="el-icon-document-copy"></i>
                      </el-button>
                    </el-button-group>

                    <!-- 媒体和链接 -->
                    <el-button-group size="small">
                      <el-button @click="insertMarkdown('![图片描述](', ')')" title="图片">
                        <i class="el-icon-picture"></i>
                      </el-button>
                      <el-button @click="insertMarkdown('[链接文字](', ')')" title="链接">
                        <i class="el-icon-link"></i>
                      </el-button>
                      <el-button @click="insertTable" title="表格">
                        <i class="el-icon-s-grid"></i>
                      </el-button>
                    </el-button-group>

                    <!-- 其他 -->
                    <el-button-group size="small">
                      <el-button @click="insertMarkdown('---\n', '')" title="分隔线">
                        <i class="el-icon-minus"></i>
                      </el-button>
                      <el-button @click="insertMarkdown('==', '==')" title="高亮">
                        <i class="el-icon-star-on"></i>
                      </el-button>
                    </el-button-group>
                  </div>
                  
                  <span class="toolbar-tip">实时预览</span>
                </div>

                <!-- 编辑和预览并排显示 -->
                <div class="editor-preview-container">
                  <!-- 编辑区域 -->
                  <div class="editor-area">
                    <div class="area-header">编辑</div>
                    <el-input
                      ref="contentEditor"
                      type="textarea"
                      v-model="form.content"
                      placeholder="请使用 Markdown 语法编写知识点详细内容..."
                      class="markdown-textarea"
                    />
                  </div>

                  <!-- 预览区域 -->
                  <div class="preview-area">
                    <div class="area-header">预览</div>
                    <div class="preview-content" ref="previewContent">
                      <v-md-preview 
                        :text="form.content || '开始输入，实时查看预览效果'"
                        @copy-code-success="handleCopySuccess"
                        class="md-preview-content"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：发布设置 -->
          <div class="settings-container">
            <div class="settings-wrapper">
              <h3 class="settings-title">发布设置</h3>
              
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="form.title"
                  placeholder="请输入知识点标题"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="科目" prop="subjectId">
                <div class="subject-selector">
                  <div class="selected-subjects" v-if="selectedSubjects.length > 0">
                    <el-tag
                      v-for="subject in selectedSubjects"
                      :key="subject.subjectId"
                      :closable="true"
                      @close="removeSubject(subject)"
                      type="primary"
                      class="subject-tag"
                    >
                      {{ subject.subjectName }}
                    </el-tag>
                  </div>
                  
                  <el-dropdown trigger="click" @command="handleSubjectCommand" class="subject-dropdown">
                    <el-button size="small" type="primary" plain>
                      <i class="el-icon-plus"></i>
                      {{ selectedSubjects.length > 0 ? '添加科目' : '选择科目' }}
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <div class="subject-menu">
                        <div class="subject-header">选择科目</div>
                        <div class="subject-options">
                          <el-dropdown-item
                            v-for="subject in availableSubjects"
                            :key="subject.subjectId"
                            :command="`select-${subject.subjectId}`"
                            class="subject-option"
                          >
                            <div class="subject-info">
                              <span class="subject-name">{{ subject.subjectName }}</span>
                              <span class="subject-desc">{{ subject.description || '暂无描述' }}</span>
                            </div>
                          </el-dropdown-item>
                          <div v-if="availableSubjects.length === 0" class="no-subjects">
                            <span>暂无可选科目</span>
                          </div>
                        </div>
                        <el-divider style="margin: 8px 0;"></el-divider>
                        <el-dropdown-item command="create-subject" class="create-subject-item">
                          <i class="el-icon-plus"></i> 新建科目
                        </el-dropdown-item>
                      </div>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </el-form-item>

              <el-form-item label="难度" prop="difficulty">
                <el-select v-model="form.difficulty" placeholder="请选择难度" style="width: 100%">
                  <el-option label="简单" :value="1" />
                  <el-option label="中等" :value="2" />
                  <el-option label="困难" :value="3" />
                </el-select>
              </el-form-item>

              <el-form-item label="摘要" prop="summary">
                <el-input
                  type="textarea"
                  v-model="form.summary"
                  placeholder="请简要描述知识点内容"
                  :rows="6"
                />
              </el-form-item>

              <!-- 提交按钮 -->
              <div class="submit-actions">
                <el-button type="primary" @click="handleSubmit" :loading="submitting" style="width: 100%; margin-bottom: 10px;">
                  <i class="el-icon-upload"></i>
                  发布知识点
                </el-button>
                <el-button @click="handleReset" style="width: 100%;">
                  <i class="el-icon-refresh"></i>
                  重置
                </el-button>
              </div>
            </div>
          </div>
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
import { getSubjects, publishKnowledge, createSubject } from '@/api/knowledge'

export default {
  name: 'KnowledgePublish',
  data() {
    return {
      form: {
        title: '',
        subjectId: null,
        difficulty: null,
        summary: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入知识点标题', trigger: 'blur' },
          { min: 5, max: 100, message: '标题长度应为 5 到 100 个字符', trigger: 'blur' }
        ],
        subjectId: [
          { required: true, message: '请选择科目', trigger: 'change' }
        ],
        difficulty: [
          { required: true, message: '请选择难度等级', trigger: 'change' }
        ],
        summary: [
          { required: true, message: '请输入内容摘要', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入详细内容', trigger: 'blur' },
          { min: 200, message: '详细内容不能少于 200 个字符', trigger: 'blur' }
        ]
      },
      subjectList: [],
      selectedSubjects: [], // 已选择的科目列表
      submitting: false,
      successDialogVisible: false,
      scrollSyncing: false,
      scrollTimeout: null
    }
  },
  computed: {
    // 计算可选择的科目列表（排除已选择的）
    availableSubjects() {
      return this.subjectList.filter(subject => 
        !this.selectedSubjects.find(selected => selected.subjectId === subject.subjectId)
      )
    }
  },
  mounted() {
    this.loadSubjects()
    this.initScrollSync()
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
    },

    // 初始化滚动同步
    initScrollSync() {
      this.$nextTick(() => {
        const editorEl = this.$refs.contentEditor?.$refs?.textarea
        if (editorEl) {
          editorEl.addEventListener('scroll', this.handleEditorScroll)
        }
      })
    },

    // 处理编辑器滚动，同步预览区域
    handleEditorScroll(event) {
      if (this.scrollSyncing) return
      
      clearTimeout(this.scrollTimeout)
      this.scrollTimeout = setTimeout(() => {
        const editor = event.target
        const preview = this.$refs.previewContent
        
        if (editor && preview && !this.scrollSyncing) {
          const scrollPercentage = editor.scrollTop / Math.max(1, editor.scrollHeight - editor.clientHeight)
          const previewScrollTop = scrollPercentage * Math.max(0, preview.scrollHeight - preview.clientHeight)
          
          this.scrollSyncing = true
          preview.scrollTop = previewScrollTop
          
          setTimeout(() => {
            this.scrollSyncing = false
          }, 100)
        }
      }, 16) // 节流到 60fps
    },

    handleCopySuccess() {
      this.$message.success('复制成功')
    },

    // 插入代码块
    insertCodeBlock() {
      const codeBlock = '```javascript\n// 在这里输入代码\nconsole.log("Hello World");\n```\n'
      this.insertTextAtCursor(codeBlock)
    },

    // 插入表格
    insertTable() {
      const table = '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |\n'
      this.insertTextAtCursor(table)
    },

    // 在光标位置插入文本
    insertTextAtCursor(text) {
      const textarea = this.$refs.contentEditor.$refs.textarea
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      this.form.content = this.form.content.substring(0, start) + text + this.form.content.substring(end)
      
      this.$nextTick(() => {
        textarea.focus()
        const newPosition = start + text.length
        textarea.setSelectionRange(newPosition, newPosition)
      })
    },

    // ==================== 科目管理方法 ====================

    // 处理科目下拉菜单命令
    handleSubjectCommand(command) {
      if (command === 'create-subject') {
        this.showCreateSubjectDialog()
      } else if (command.startsWith('select-')) {
        const subjectId = parseInt(command.replace('select-', ''))
        this.selectSubject(subjectId)
      }
    },

    // 选择科目
    selectSubject(subjectId) {
      const subject = this.subjectList.find(s => s.subjectId === subjectId)
      if (subject && !this.selectedSubjects.find(s => s.subjectId === subjectId)) {
        this.selectedSubjects.push(subject)
        // 更新form中的subjectId（取第一个选中的科目作为主科目）
        if (this.selectedSubjects.length === 1) {
          this.form.subjectId = subjectId
        }
      }
    },

    // 移除科目
    removeSubject(subject) {
      const index = this.selectedSubjects.findIndex(s => s.subjectId === subject.subjectId)
      if (index > -1) {
        this.selectedSubjects.splice(index, 1)
        // 如果移除的是主科目，重新设置主科目
        if (this.form.subjectId === subject.subjectId) {
          this.form.subjectId = this.selectedSubjects.length > 0 ? this.selectedSubjects[0].subjectId : null
        }
      }
    },

    // 显示创建科目对话框
    showCreateSubjectDialog() {
      this.$prompt('请输入科目名称', '新建科目', {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/,
        inputErrorMessage: '科目名称长度为1-50个字符'
      }).then(({ value }) => {
        this.createNewSubject(value)
      }).catch(() => {
        // 用户取消
      })
    },

    // 创建新科目
    async createNewSubject(subjectName) {
      try {
        // 这里需要添加创建科目的API调用
        const response = await this.createSubject({
          subjectName: subjectName,
          description: '',
          status: 1
        })
        if (response.code === 200) {
          this.$message.success('创建科目成功')
          // 重新加载科目列表
          await this.loadSubjects()
          // 自动选择新创建的科目
          const newSubject = this.subjectList.find(s => s.subjectName === subjectName)
          if (newSubject) {
            this.selectSubject(newSubject.subjectId)
          }
        } else {
          this.$message.error(response.msg || '创建失败')
        }
      } catch (error) {
        this.$message.error('创建失败：' + error.message)
      }
    },

    // 创建科目API调用
    async createSubject(subjectData) {
      return await createSubject(subjectData)
    }
  },

  beforeDestroy() {
    // 清理事件监听器
    const editorEl = this.$refs.contentEditor?.$refs?.textarea
    if (editorEl) {
      editorEl.removeEventListener('scroll', this.handleEditorScroll)
    }
    clearTimeout(this.scrollTimeout)
  }
}
</script>

<style scoped>
.knowledge-publish {
  padding: 20px;
  max-width: 1400px;
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
  padding: 0;
}

.publish-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.editor-container {
  flex: 1;
  min-width: 0;
}

.editor-wrapper {
  background: #fff;
  border-radius: 8px;
}

.settings-container {
  width: 350px;
  flex-shrink: 0;
}

.settings-wrapper {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.settings-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.settings-wrapper .el-form-item {
  margin-bottom: 20px;
}

.settings-wrapper >>> .el-form-item__label {
  font-weight: 600;
  color: #606266;
  padding: 0 0 8px 0;
  line-height: 20px;
  display: block;
  text-align: left;
  width: 100%;
}

.settings-wrapper >>> .el-form-item__content {
  margin-left: 0 !important;
}

.submit-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
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
  padding: 8px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-groups {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-groups .el-button-group {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.toolbar-groups .el-button {
  height: 32px;
  min-width: 32px;
  padding: 6px 8px;
  font-size: 14px;
  border: none;
  background: #fff;
  color: #606266;
  transition: all 0.2s;
}

.toolbar-groups .el-button:hover {
  background: #ecf5ff;
  color: #409eff;
}

.toolbar-groups .el-button:focus {
  background: #409eff;
  color: #fff;
}

.toolbar-groups .el-button strong,
.toolbar-groups .el-button em {
  font-style: normal;
  font-weight: bold;
}

.toolbar-tip {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  white-space: nowrap;
}

.editor-preview-container {
  display: flex;
  height: calc(100vh - 250px);
  border-top: 1px solid #dcdfe6;
}

.editor-area,
.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-area {
  border-right: 1px solid #dcdfe6;
}

.area-header {
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.markdown-textarea {
  border: none;
  border-radius: 0;
}

.markdown-textarea {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-textarea >>> .el-textarea__inner {
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
  height: 100% !important;
  padding: 15px;
}

.markdown-textarea >>> .el-textarea__inner::-webkit-scrollbar {
  width: 8px;
}

.markdown-textarea >>> .el-textarea__inner::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
}

.markdown-textarea >>> .el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fff;
}

.preview-content::-webkit-scrollbar {
  width: 8px;
}

.preview-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
}

.preview-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.md-preview-content {
  padding: 0;
  background: transparent;
}

/* 为v-md-preview组件的列表强制添加样式 */
.md-preview-content >>> ul {
  padding-left: 20px !important;
  margin: 15px 0 !important;
}

.md-preview-content >>> ol {
  padding-left: 20px !important;
  margin: 15px 0 !important;
}

.md-preview-content >>> li {
  margin: 8px 0 !important;
  list-style-type: disc !important;
  display: list-item !important;
}

.md-preview-content >>> ol li {
  list-style-type: decimal !important;
}

.md-preview-content >>> ul ul li {
  list-style-type: circle !important;
}

.md-preview-content >>> ul ul ul li {
  list-style-type: square !important;
}

.code-textarea >>> .el-textarea__inner {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .publish-layout {
    flex-direction: column;
  }
  
  .settings-container {
    width: 100%;
  }
  
  .settings-wrapper {
    position: relative;
    top: 0;
    max-height: none;
  }
  
  .editor-preview-container {
    flex-direction: column;
    height: auto;
  }
  
  .editor-area {
    border-right: none;
    border-bottom: 1px solid #dcdfe6;
    min-height: 300px;
  }
  
  .preview-area {
    min-height: 300px;
  }
  
  .toolbar-groups {
    gap: 6px;
  }
  
  .toolbar-groups .el-button {
    min-width: 28px;
    height: 28px;
    padding: 4px 6px;
    font-size: 12px;
  }
  
  .toolbar-tip {
    display: none;
  }
}

/* CSDN风格的科目选择器样式 */
.subject-selector {
  min-height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  transition: border-color 0.2s;
}

.subject-selector:hover {
  border-color: #c0c4cc;
}

.subject-selector:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.selected-subjects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-right: 8px;
}

.subject-tag {
  margin: 0;
  font-size: 13px;
  height: 24px;
  line-height: 22px;
  padding: 0 8px;
  background: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.subject-tag .el-tag__close {
  color: #409eff;
  font-size: 12px;
}

.subject-tag .el-tag__close:hover {
  color: #fff;
  background: #409eff;
}

.subject-dropdown .el-button {
  height: 28px;
  padding: 4px 8px;
  font-size: 13px;
  border: 1px dashed #d9d9d9;
  color: #666;
}

.subject-dropdown .el-button:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 科目下拉菜单样式 */
.subject-menu {
  padding: 8px 0;
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
}

.subject-header {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 4px;
}

.subject-options {
  max-height: 300px;
  overflow-y: auto;
}

.subject-option {
  padding: 0 !important;
}

.subject-info {
  padding: 10px 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subject-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.subject-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.no-subjects {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.create-subject-item {
  color: #409eff !important;
  font-weight: 500;
  background: #f8f9ff !important;
}

.create-subject-item:hover {
  background-color: #ecf5ff !important;
}

.create-subject-item i {
  margin-right: 6px;
  font-size: 12px;
}
</style>
