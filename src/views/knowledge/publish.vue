<template>
  <div class="knowledge-publish">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">📝 {{ isEdit ? '编辑知识点' : '发布知识点' }}</span>
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
                <div class="editor-toolbar" :class="{ 'fullscreen-toolbar': isFullscreen }">
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
                      <el-button @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏编辑'">
                        <i :class="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"></i>
                      </el-button>
                    </el-button-group>
                  </div>
                  
                  <span class="toolbar-tip">实时预览</span>
                </div>

                <!-- 编辑和预览并排显示 -->
                <div class="editor-preview-container" :class="{ 'fullscreen-mode': isFullscreen }">
                  <!-- 编辑区域 -->
                  <div class="editor-area" :class="{ 'fullscreen-editor': isFullscreen }">
                    <div class="area-header">
                      编辑
                      <div v-if="isFullscreen" class="fullscreen-actions">
                        <el-button size="mini" type="text" @click="toggleFullscreen">
                          <i class="el-icon-copy-document"></i> 退出全屏
                        </el-button>
                      </div>
                    </div>
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

          <!-- 右侧：发布设置 + 附件管理 -->
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
                <div class="subject-tag-selector">
                  <!-- 科目标签展示区域 -->
                  <div class="subject-tags-container">
                    <div class="tags-grid">
                      <el-tag
                        v-for="subject in subjectList"
                        :key="subject.subjectId"
                        :type="isSubjectSelected(subject.subjectId) ? 'primary' : 'info'"
                        :effect="isSubjectSelected(subject.subjectId) ? 'dark' : 'plain'"
                        class="subject-tag-item"
                        @click="toggleSubject(subject)"
                      >
                        <i v-if="isSubjectSelected(subject.subjectId)" class="el-icon-check"></i>
                        {{ subject.subjectName }}
                      </el-tag>
                    </div>
                    
                    <!-- 新建科目按钮 -->
                    <el-button
                      type="primary"
                      size="mini"
                      plain
                      icon="el-icon-plus"
                      class="add-subject-btn"
                      @click="showCreateSubjectDialog"
                    >
                      新建科目
                    </el-button>
                  </div>
                  
                  <!-- 已选科目提示 -->
                  <div v-if="selectedSubjects.length > 0" class="selected-info">
                    已选择 {{ selectedSubjects.length }} 个科目
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="难度（选填）" prop="difficulty">
                <el-select v-model="form.difficulty" placeholder="选填，可不选" clearable style="width: 100%">
                  <el-option label="简单" :value="1" />
                  <el-option label="中等" :value="2" />
                  <el-option label="困难" :value="3" />
                </el-select>
              </el-form-item>

              <el-form-item label="摘要">
                <el-input
                  type="textarea"
                  v-model="form.summary"
                  placeholder="不填则自动从内容开头提取摘要"
                  :rows="6"
                />
              </el-form-item>

              <!-- 附件管理 -->
              <div class="attachment-section" v-if="isEdit">
                <h4 class="attachment-title">辅助理解附件</h4>
                <p class="attachment-desc">可以为当前知识点上传 HTML 动画或视频讲解，便于题目跳转后辅助理解。</p>
                <el-upload
                  class="attachment-uploader"
                  :show-file-list="false"
                  :http-request="handleAttachmentUpload"
                  :before-upload="beforeAttachmentUpload"
                action="#"
                >
                  <el-button size="mini" icon="el-icon-upload">上传附件（HTML / 视频）</el-button>
                </el-upload>
                <el-table
                  v-if="attachments && attachments.length"
                  :data="attachments"
                  size="mini"
                  border
                  style="margin-top: 8px;"
                  :height="220"
                >
                  <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
                  <el-table-column prop="fileType" label="类型" width="80" align="center">
                    <template slot-scope="scope">
                      <el-tag size="mini" v-if="scope.row.fileType === 'html'">HTML</el-tag>
                      <el-tag size="mini" type="success" v-else-if="scope.row.fileType === 'video'">视频</el-tag>
                      <el-tag size="mini" type="info" v-else>{{ scope.row.fileType || '-' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="fileSize" label="大小" width="80" align="center">
                    <template slot-scope="scope">
                      {{ formatFileSize(scope.row.fileSize) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="sortOrder" label="排序" width="90" align="center">
                    <template slot-scope="scope">
                      <el-input-number
                        v-model="scope.row.sortOrder"
                        size="mini"
                        :min="0"
                        :max="999"
                        @change="onAttachmentSortChange(scope.row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" size="mini" @click="previewAttachment(scope.row)">预览</el-button>
                      <el-button type="text" size="mini" style="color: #F56C6C" @click="removeAttachment(scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-else description="暂无附件" :image-size="60" />
              </div>

              <!-- 提交按钮 -->
              <div class="submit-actions">
                <el-button type="primary" @click="handleSubmit" :loading="submitting" style="width: 100%; margin-bottom: 10px;">
                  <i :class="isEdit ? 'el-icon-check' : 'el-icon-upload'"></i>
                  {{ isEdit ? '更新知识点' : '发布知识点' }}
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
        <p>您的知识点已发布，可直接在知识点库中查看。</p>
      </div>
      <div slot="footer" style="text-align: center;">
        <el-button type="primary" @click="goToKnowledgeList">查看知识点库</el-button>
        <el-button @click="continuePublish">继续发布</el-button>
      </div>
    </el-dialog>

    <!-- 附件预览弹窗（在当前页面内展示 HTML / 视频） -->
    <el-dialog
      title="附件预览"
      :visible.sync="attachmentPreviewVisible"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div v-if="currentAttachment">
        <!-- HTML 附件：使用 iframe 内嵌展示 -->
        <div v-if="currentAttachment.fileType === 'html'" style="height: 70vh;">
          <iframe
            v-if="currentAttachmentHtml"
            :srcdoc="currentAttachmentHtml"
            style="width: 100%; height: 100%; border: none;"
            sandbox="allow-same-origin allow-scripts"
          />
          <el-empty v-else description="附件地址不存在或无效" />
        </div>

        <!-- 视频附件：使用 video 标签播放 -->
        <div v-else-if="currentAttachment.fileType === 'video'" style="text-align: center;">
          <video
            v-if="currentAttachment.fileUrl"
            :src="currentAttachment.fileUrl"
            style="max-width: 100%; max-height: 70vh;"
            controls
            controlsList="nodownload"
          >
            您的浏览器不支持视频播放，请尝试更换浏览器。
          </video>
          <el-empty v-else description="附件地址不存在或无效" />
        </div>

        <!-- 其他类型：给出下载/新开提示 -->
        <div v-else>
          <p>当前仅对 HTML / 视频 类型做内嵌预览。</p>
          <p>
            文件名：{{ currentAttachment.fileName || '-' }}，
            类型：{{ currentAttachment.fileType || '未知' }}
          </p>
          <el-button
            v-if="currentAttachment.fileUrl"
            type="primary"
            size="mini"
            @click="openAttachmentInNewTab"
          >
            在新标签页中打开
          </el-button>
        </div>
      </div>
      <div v-else>
        <el-empty description="暂无可预览的附件" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSubjects,
  publishKnowledge,
  createSubject,
  getKnowledgeDetail,
  updateKnowledge,
  getKnowledgeAttachments,
  uploadKnowledgeAttachment,
  updateKnowledgeAttachment,
  deleteKnowledgeAttachment,
  getKnowledgeAttachmentPreviewUrl,
  getKnowledgeAttachmentPreviewHtml
} from '@/api/knowledge'
import { formatFileSize as formatSizeUtil } from '@/utils/upload'

export default {
  name: 'KnowledgePublish',
  data() {
    return {
      isEdit: false,
      editId: null,
      fromPage: 'knowledge', // 来源页面，默认为知识库
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
          { min: 1, max: 100, message: '标题长度应为 1 到 100 个字符', trigger: 'blur' }
        ],
        subjectId: [
          { required: true, message: '请选择科目', trigger: 'change' }
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
      scrollTimeout: null,
      isFullscreen: false,
      attachments: [],
      // 附件预览
      attachmentPreviewVisible: false,
      currentAttachment: null,
      currentAttachmentHtml: ''
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
    this.checkEditMode()
    this.addKeyboardListeners()
  },
  methods: {
    checkEditMode() {
      const pointId = this.$route.query.pointId
      const from = this.$route.query.from
      
      if (pointId) {
        this.isEdit = true
        this.editId = pointId
        this.fromPage = from || 'knowledge'
        this.loadKnowledgeDetail(pointId)
        this.loadAttachments(pointId)
      }
    },
    async loadKnowledgeDetail(pointId) {
      try {
        const res = await getKnowledgeDetail(pointId)
        if (res.code === 200 && res.data) {
          const data = res.data
          this.form = {
            title: data.title || '',
            subjectId: data.subjectId || null,
            difficulty: data.difficulty || null,
            summary: data.summary || '',
            content: data.content || ''
          }
          
          // 如果有科目信息，同步到 selectedSubjects
          if (data.subjectId) {
            const subject = this.subjectList.find(s => s.subjectId === data.subjectId)
            if (subject && !this.isSubjectSelected(data.subjectId)) {
              this.selectedSubjects = [subject]
            }
          }
        }
      } catch (error) {
        console.error('获取知识点详情失败:', error)
        this.$message.error('获取知识点详情失败')
      }
    },
    async loadAttachments(pointId) {
      try {
        const res = await getKnowledgeAttachments(pointId)
        if (res.code === 200) {
          this.attachments = res.data || []
        }
      } catch (e) {
        console.error('获取附件失败', e)
      }
    },
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
    // 判断科目是否已选中
    isSubjectSelected(subjectId) {
      return this.selectedSubjects.some(s => s.subjectId === subjectId)
    },
    
    // 切换科目选择状态
    toggleSubject(subject) {
      const index = this.selectedSubjects.findIndex(s => s.subjectId === subject.subjectId)
      if (index > -1) {
        // 已选中，取消选中
        this.selectedSubjects.splice(index, 1)
      } else {
        // 未选中，添加选中
        this.selectedSubjects.push(subject)
      }
      
      // 更新表单的 subjectId 字段（取第一个选中的科目）
      this.form.subjectId = this.selectedSubjects.length > 0 ? this.selectedSubjects[0].subjectId : null
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

    // ==================== 附件管理 ====================
    formatFileSize(size) {
      return formatSizeUtil(size || 0)
    },
    beforeAttachmentUpload(file) {
      const isHtml = /\.html?$/i.test(file.name)
      const isVideo = file.type.startsWith('video/')
      if (!isHtml && !isVideo) {
        this.$message.error('只允许上传 HTML 或 视频 文件')
        return false
      }
      const sizeMB = file.size / 1024 / 1024
      if (isHtml && sizeMB > 5) {
        this.$message.error('HTML 文件不能超过 5MB')
        return false
      }
      if (isVideo && sizeMB > 200) {
        this.$message.error('视频文件不能超过 200MB')
        return false
      }
      return true
    },
    async handleAttachmentUpload(option) {
      if (!this.editId) {
        this.$message.error('请先保存知识点后再上传附件')
        option.onError()
        return
      }
      try {
        const res = await uploadKnowledgeAttachment(this.editId, option.file, this.attachments.length)
        if (res.code === 200) {
          this.$message.success('上传成功')
          await this.loadAttachments(this.editId)
          option.onSuccess(res, option.file)
        } else {
          this.$message.error(res.msg || '上传失败')
          option.onError()
        }
      } catch (e) {
        console.error('上传附件失败', e)
        this.$message.error('上传失败，请重试')
        option.onError(e)
      }
    },
    async onAttachmentSortChange(row) {
      try {
        await updateKnowledgeAttachment(row.attachmentId, {
          sortOrder: row.sortOrder
        })
      } catch (e) {
        console.error('更新附件排序失败', e)
      }
    },
    async removeAttachment(row) {
      try {
        await this.$confirm(`确认删除附件「${row.fileName}」吗？`, '提示', {
          type: 'warning'
        })
        const res = await deleteKnowledgeAttachment(row.attachmentId)
        if (res.code === 200) {
          this.$message.success('删除成功')
          await this.loadAttachments(this.editId)
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (e) {
        if (e !== 'cancel') {
          console.error('删除附件失败', e)
        }
      }
    },
    async previewAttachment(row) {
      if (!row || !row.attachmentId) {
        this.$message.warning('附件信息不完整')
        return
      }
      let previewUrl = row.previewUrl || row.fileUrl
      this.currentAttachmentHtml = ''

      // HTML：直接走后端代理预览接口，彻底规避 OSS x-oss-force-download
      if (row.fileType === 'html') {
        try {
          const html = await getKnowledgeAttachmentPreviewHtml(row.attachmentId)
          if (typeof html === 'string' && html.trim()) {
            this.currentAttachmentHtml = html
          } else {
            this.$message.error('获取HTML预览内容失败')
            return
          }
        } catch (e) {
          this.$message.error('获取HTML预览内容失败，请重试')
          return
        }
        previewUrl = ''
      } else {
        // 非HTML：仍优先使用后端返回的 previewUrl（签名URL inline），失败再退化到 fileUrl
        try {
          const res = await getKnowledgeAttachmentPreviewUrl(row.attachmentId, 600)
          if (res && res.code === 200 && res.previewUrl) {
            previewUrl = res.previewUrl
          } else if (res && res.code === 200 && res.data && res.data.previewUrl) {
            previewUrl = res.data.previewUrl
          }
        } catch (e) {
          // ignore
        }
      }

      this.currentAttachment = { ...row, previewUrl, fileUrl: previewUrl }
      this.attachmentPreviewVisible = true
    },
    openAttachmentInNewTab() {
      if (this.currentAttachment && this.currentAttachment.fileUrl) {
        window.open(this.currentAttachment.fileUrl, '_blank')
      }
    },

    handleSubmit() {
      this.$refs.publishForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            let res
            if (this.isEdit) {
              res = await updateKnowledge(this.editId, this.form)
            } else {
              res = await publishKnowledge(this.form)
            }
            
            if (res.code === 200) {
              if (this.isEdit) {
                this.$message.success('更新成功')
                // 更新成功后保持在当前编辑页（不返回列表）
                await this.loadKnowledgeDetail(this.editId)
                await this.loadAttachments(this.editId)
              } else {
                this.successDialogVisible = true
              }
            } else {
              this.$message.error(res.msg || (this.isEdit ? '更新失败' : '发布失败'))
            }
          } catch (error) {
            console.error('操作失败:', error)
            this.$message.error((this.isEdit ? '更新失败' : '发布失败') + '，请重试')
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
      this.goBackToSource()
    },
    
    goBackToSource() {
      if (this.fromPage === 'myArticles') {
        this.$router.push({ path: '/knowledge', query: { tab: 'myArticles' } })
      } else {
        this.$router.push('/knowledge')
      }
    },

    goToKnowledgeList() {
      this.successDialogVisible = false
      this.$router.push('/knowledge')
    },

    continuePublish() {
      this.successDialogVisible = false
      // 发布成功后继续发布：保留科目，方便同一科目连续创建
      const keepSubjectId = this.form.subjectId
      const keepSelectedSubjects = Array.isArray(this.selectedSubjects) ? [...this.selectedSubjects] : []

      this.handleReset()

      // 恢复科目选择（resetFields 会把 subjectId 和 selectedSubjects 一并清空）
      this.form.subjectId = keepSubjectId || null
      this.selectedSubjects = keepSelectedSubjects
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
        const res = await createSubject({ subjectName })
        if (res.code === 200) {
          this.$message.success('科目创建成功')
          // 重新加载科目列表
          await this.loadSubjects()
          // 自动选中新创建的科目
          const newSubject = this.subjectList.find(s => s.subjectName === subjectName)
          if (newSubject) {
            this.toggleSubject(newSubject)
          }
        } else {
          this.$message.error(res.msg || '科目创建失败')
        }
      } catch (error) {
        console.error('创建科目失败:', error)
        this.$message.error('创建科目失败，请重试')
      }
    },

    // 切换全屏模式
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      
      if (this.isFullscreen) {
        // 进入全屏时禁用body滚动
        document.body.style.overflow = 'hidden'
      } else {
        // 退出全屏时恢复body滚动
        document.body.style.overflow = ''
      }
      
      this.$nextTick(() => {
        const textarea = this.$refs.contentEditor?.$refs?.textarea
        if (textarea) {
          textarea.focus()
        }
      })
    },

    // 添加键盘监听器
    addKeyboardListeners() {
      document.addEventListener('keydown', this.handleKeydown)
    },

    // 处理键盘事件
    handleKeydown(event) {
      // Esc 键退出全屏
      if (event.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen()
        event.preventDefault()
      }
      // F11 切换全屏
      if (event.key === 'F11') {
        this.toggleFullscreen()
        event.preventDefault()
      }
    }
  },

  beforeDestroy() {
    // 清理事件监听器
    const editorEl = this.$refs.contentEditor?.$refs?.textarea
    if (editorEl) {
      editorEl.removeEventListener('scroll', this.handleEditorScroll)
    }
    clearTimeout(this.scrollTimeout)
    document.removeEventListener('keydown', this.handleKeydown)
    // 恢复body滚动
    document.body.style.overflow = ''
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
  width: 100%;
  box-sizing: border-box;
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
  width: 460px;
  flex-shrink: 0;
}

.settings-wrapper {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px 20px 16px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.settings-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

/* 表单项间距优化 */
.settings-wrapper .el-form-item {
  margin-bottom: 24px;
}

.settings-wrapper .el-form-item:last-of-type {
  margin-bottom: 16px;
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

.attachment-section {
  margin-top: 8px;
}

.attachment-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.attachment-desc {
  margin: 4px 0 10px;
  font-size: 12px;
  color: #909399;
}

.attachment-uploader {
  margin-bottom: 6px;
}

.attachment-uploader .el-button {
  width: 100%;
}

.attachment-section .el-table {
  font-size: 12px;
}

.attachment-section .el-table th,
.attachment-section .el-table td {
  padding: 4px 6px;
}

.submit-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: #fff;
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

.editor-toolbar.fullscreen-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: #f8f9fa;
  border-bottom: none;
  box-shadow: none;
}

.editor-preview-container {
  display: flex;
  min-height: 520px;
  border-top: 1px solid #dcdfe6;
}

.editor-preview-container.fullscreen-mode {
  position: fixed;
  top: 47px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  height: calc(100vh - 47px);
  background: #fff;
  border-top: none;
  overflow: hidden;
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

.editor-area.fullscreen-editor {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fullscreen-actions {
  display: flex;
  align-items: center;
}

.fullscreen-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
  color: #909399;
}

.fullscreen-actions .el-button:hover {
  color: #409eff;
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

/* 标签式科目选择器样式 */
.subject-tag-selector {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.subject-tags-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 16px;
  background: #fafbfc;
  min-height: 80px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.subject-tag-item {
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 !important;
  height: auto;
  line-height: 1.4;
  font-size: 13px;
  border-radius: 16px;
  padding: 6px 12px;
  user-select: none;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border: 1px solid transparent;
  max-width: calc(100% - 16px);
  box-sizing: border-box;
  flex-shrink: 0;
}

.subject-tag-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.25);
}

.subject-tag-item .el-icon-check {
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
}

.add-subject-btn {
  height: auto;
  padding: 6px 12px;
  border-radius: 16px;
  border-style: dashed;
  font-size: 13px;
}

.selected-info {
  margin-top: 12px;
  padding: 8px;
  font-size: 12px;
  color: #606266;
  text-align: center;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(64, 158, 255, 0.2);
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
