<template>
  <div class="forum-post-container">
    <div class="post-content">
      <!-- 返回按钮 -->
      <el-button class="back-btn" icon="el-icon-back" @click="goBack">
        返回列表
      </el-button>

      <!-- 发帖表单 -->
      <div class="post-form-card">
        <h1 class="form-title">
          <i class="el-icon-edit"></i>
          {{ isEdit ? '编辑帖子' : '发布新帖' }}
        </h1>

        <el-form ref="postForm" :model="formData" :rules="formRules" label-width="80px">
          <!-- 帖子标题 -->
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="请输入帖子标题（不超过100字）"
              maxlength="100"
              show-word-limit
              class="title-input"
            />
          </el-form-item>

          <!-- 帖子内容 -->
          <el-form-item label="内容" prop="content">
            <el-input
              v-model="formData.content"
              type="textarea"
              :rows="12"
              placeholder="请输入帖子内容（支持换行）"
              maxlength="5000"
              show-word-limit
              class="content-input"
            />
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="图片">
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="fileList"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
              :limit="9"
              accept="image/*"
            >
              <i class="el-icon-plus"></i>
              <div slot="tip" class="upload-tip">
                建议上传jpg/png图片，单张不超过5MB，最多9张
              </div>
            </el-upload>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <div class="form-actions">
              <el-button @click="goBack">取消</el-button>
              <el-button type="primary" :loading="submitting" @click="handleSubmit">
                {{ isEdit ? '保存修改' : '发布帖子' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog :visible.sync="previewVisible" append-to-body>
      <img :src="previewImage" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
import { addPost, updatePost, getPostDetail } from '@/api/forum'
import { uploadFile } from '@/api/user'

export default {
  name: 'ForumPost',
  data() {
    return {
      isEdit: false,
      postId: null,
      submitting: false,
      formData: {
        title: '',
        content: '',
        images: []
      },
      formRules: {
        title: [
          { required: true, message: '请输入帖子标题', trigger: 'blur' },
          { min: 5, max: 100, message: '标题长度为5-100个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入帖子内容', trigger: 'blur' },
          { min: 10, max: 5000, message: '内容长度为10-5000个字符', trigger: 'blur' }
        ]
      },
      fileList: [],
      previewVisible: false,
      previewImage: ''
    }
  },
  mounted() {
    // 检查是否是编辑模式
    if (this.$route.query.id) {
      this.isEdit = true
      this.postId = this.$route.query.id
      this.loadPostData()
    }
  },
  methods: {
    // 加载帖子数据（编辑模式）
    async loadPostData() {
      try {
        const res = await getPostDetail(this.postId)
        if (res.code === 200) {
          this.formData.title = res.post.title
          this.formData.content = res.post.content
          this.formData.images = res.post.images || []
          
          // 设置文件列表
          this.fileList = (res.post.images || []).map((url, index) => ({
            uid: index,
            name: `image-${index}`,
            status: 'success',
            url: url
          }))
        }
      } catch (error) {
        console.error('加载帖子数据失败:', error)
        this.$message.error('加载失败')
        this.goBack()
      }
    },

    // 上传前校验
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB！')
        return false
      }
      return true
    },

    // 自定义上传
    async handleUpload(options) {
      const { file, onSuccess, onError } = options
      
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await uploadFile(formData)
        if (res.code === 200) {
          // 上传成功，添加到图片列表
          this.formData.images.push(res.url)
          onSuccess(res)
          this.$message.success('上传成功')
        } else {
          onError(new Error(res.msg || '上传失败'))
          this.$message.error(res.msg || '上传失败')
        }
      } catch (error) {
        console.error('上传失败:', error)
        onError(error)
        this.$message.error('上传失败，请稍后重试')
      }
    },

    // 移除图片
    handleRemove(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.formData.images.splice(index, 1)
      }
    },

    // 预览图片
    handlePreview(file) {
      this.previewImage = file.url
      this.previewVisible = true
    },

    // 提交表单
    handleSubmit() {
      this.$refs.postForm.validate(async (valid) => {
        if (!valid) {
          return false
        }

        this.submitting = true
        try {
          let res
          if (this.isEdit) {
            // 编辑帖子
            res = await updatePost(this.postId, {
              title: this.formData.title,
              content: this.formData.content,
              images: this.formData.images
            })
          } else {
            // 发布新帖
            res = await addPost({
              title: this.formData.title,
              content: this.formData.content,
              images: this.formData.images
            })
          }

          if (res.code === 200) {
            this.$message.success(this.isEdit ? '修改成功' : '发布成功')
            this.$router.push('/forum/index')
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } catch (error) {
          console.error('提交失败:', error)
          this.$message.error('操作失败，请稍后重试')
        } finally {
          this.submitting = false
        }
      })
    },

    // 返回列表
    goBack() {
      this.$router.push('/forum/index')
    }
  }
}
</script>

<style scoped>
.forum-post-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5f1 100%);
  padding: 20px;
}

.post-content {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
  border-radius: 20px;
}

/* 表单卡片 */
.post-form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 32px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-title i {
  font-size: 28px;
  color: #1ac89a;
}

/* 标题输入框 */
.title-input >>> .el-input__inner {
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.title-input >>> .el-input__inner:focus {
  border-color: #1ac89a;
  box-shadow: 0 0 0 2px rgba(26, 200, 154, 0.1);
}

/* 内容输入框 */
.content-input >>> .el-textarea__inner {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  font-size: 15px;
  line-height: 1.8;
  padding: 16px;
  transition: all 0.3s ease;
}

.content-input >>> .el-textarea__inner:focus {
  border-color: #1ac89a;
  box-shadow: 0 0 0 2px rgba(26, 200, 154, 0.1);
}

/* 图片上传 */
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.post-form-card >>> .el-upload--picture-card {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 1px dashed #d9d9d9;
  transition: all 0.3s ease;
}

.post-form-card >>> .el-upload--picture-card:hover {
  border-color: #1ac89a;
}

.post-form-card >>> .el-upload-list--picture-card .el-upload-list__item {
  width: 120px;
  height: 120px;
  border-radius: 12px;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-actions .el-button {
  min-width: 120px;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.form-actions .el-button--primary {
  background: linear-gradient(135deg, #1ac89a 0%, #16a085 100%);
  border: none;
}

.form-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(26, 200, 154, 0.3);
}

/* 表单项样式 */
.post-form-card >>> .el-form-item__label {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.post-form-card >>> .el-form-item {
  margin-bottom: 28px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-form-card {
    padding: 20px;
  }

  .form-title {
    font-size: 20px;
  }

  .post-form-card >>> .el-upload--picture-card {
    width: 100px;
    height: 100px;
  }

  .post-form-card >>> .el-upload-list--picture-card .el-upload-list__item {
    width: 100px;
    height: 100px;
  }
}
</style>
