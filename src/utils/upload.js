/**
 * 上传工具函数
 * 统一的文件上传限制和验证
 */

import { compressAccurately } from 'image-conversion'

// 最大文件大小：5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// 允许的图片类型
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp'
]

// 允许的图片扩展名
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg', 
  '.png',
  '.gif',
  '.webp',
  '.bmp'
]

/**
 * 格式化文件大小
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的大小字符串
 */
export function formatFileSize(size) {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + 'MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
  }
}

/**
 * 验证文件大小
 * @param {File} file 文件对象
 * @returns {boolean} 是否通过验证
 */
export function validateFileSize(file) {
  return file.size <= MAX_FILE_SIZE
}

/**
 * 验证文件类型（通过MIME类型）
 * @param {File} file 文件对象
 * @returns {boolean} 是否通过验证
 */
export function validateImageType(file) {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
}

/**
 * 验证文件扩展名
 * @param {string} fileName 文件名
 * @returns {boolean} 是否通过验证
 */
export function validateImageExtension(fileName) {
  if (!fileName) return false
  const extension = fileName.toLowerCase()
  return ALLOWED_IMAGE_EXTENSIONS.some(ext => extension.endsWith(ext))
}

/**
 * 完整的文件验证
 * @param {File} file 文件对象
 * @returns {object} 验证结果 {valid: boolean, message: string}
 */
export function validateUploadFile(file) {
  // 1. 检查文件是否存在
  if (!file) {
    return { valid: false, message: '请选择文件' }
  }
  
  // 2. 检查文件大小
  if (!validateFileSize(file)) {
    return { 
      valid: false, 
      message: `文件大小不能超过5MB，当前大小：${formatFileSize(file.size)}` 
    }
  }
  
  // 3. 检查文件类型
  if (!validateImageType(file)) {
    return { 
      valid: false, 
      message: `只允许上传图片文件，当前类型：${file.type || '未知'}` 
    }
  }
  
  // 4. 检查文件扩展名（额外保障）
  if (!validateImageExtension(file.name)) {
    return { 
      valid: false, 
      message: `不支持的文件格式，只允许：${ALLOWED_IMAGE_EXTENSIONS.join(', ')}` 
    }
  }
  
  return { valid: true, message: '验证通过' }
}

/** 超过此大小才触发压缩（500KB） */
const COMPRESS_THRESHOLD = 500 * 1024
/** 压缩目标大小（KB），约 1MB */
const COMPRESS_TARGET_KB = 1024

/**
 * 静默压缩图片：超过阈值的图片自动压缩到约 1MB，用户无感知
 * @param {File} file 图片文件
 * @returns {Promise<File>} 压缩后的文件（或原文件）
 */
export async function compressImageIfNeeded(file) {
  if (!file || !file.type.startsWith('image/')) {
    return file
  }
  if (file.size <= COMPRESS_THRESHOLD) {
    return file
  }
  try {
    const blob = await compressAccurately(file, {
      size: COMPRESS_TARGET_KB,
      accuracy: 0.9,
      type: file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    })
    return new File([blob], file.name, { type: blob.type, lastModified: Date.now() })
  } catch (e) {
    console.warn('图片压缩失败，使用原图', e)
    return file
  }
}

/**
 * el-upload 的 before-upload 回调函数
 * @param {File} file 文件对象
 * @returns {boolean} 是否允许上传
 */
export function beforeUpload(file) {
  const result = validateUploadFile(file)
  if (!result.valid) {
    // 使用Element UI的消息提示
    if (typeof this.$message !== 'undefined') {
      this.$message.error(result.message)
    } else {
      alert(result.message)
    }
    return false
  }
  return true
}

/**
 * 生成 el-upload 配置对象
 * @param {object} options 额外配置
 * @returns {object} el-upload 配置
 */
export function getUploadConfig(options = {}) {
  const defaultConfig = {
    action: '/api/common/upload',
    headers: {
      'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
    },
    accept: ALLOWED_IMAGE_EXTENSIONS.join(','),
    beforeUpload: beforeUpload,
    showFileList: false,
    ...options
  }
  
  return defaultConfig
}

/**
 * 批量文件验证
 * @param {FileList|File[]} files 文件列表
 * @returns {object} 验证结果 {valid: boolean, message: string, validFiles: File[]}
 */
export function validateMultipleFiles(files) {
  const validFiles = []
  const errors = []
  
  Array.from(files).forEach((file, index) => {
    const result = validateUploadFile(file)
    if (result.valid) {
      validFiles.push(file)
    } else {
      errors.push(`文件${index + 1}(${file.name}): ${result.message}`)
    }
  })
  
  if (errors.length > 0) {
    return {
      valid: false,
      message: errors.join('\n'),
      validFiles
    }
  }
  
  return {
    valid: true,
    message: '所有文件验证通过',
    validFiles
  }
}
