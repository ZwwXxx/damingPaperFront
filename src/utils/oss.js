import request from '@/utils/request'

/**
 * OSS URL缓存
 * 格式: { objectKey: { url: 'xxx', expireAt: timestamp } }
 */
const urlCache = {}

/**
 * 从OSS URL中提取对象key
 * @param {string} ossUrl - OSS完整URL
 * @returns {string|null} - 对象key或null
 */
function extractObjectKey(ossUrl) {
  if (!ossUrl) return null
  
  // 匹配 https://bucket.endpoint/path/to/file
  const match = ossUrl.match(/https?:\/\/[^/]+\/(.+)/)
  return match ? match[1] : null
}

/**
 * 判断是否是OSS URL
 * @param {string} url 
 * @returns {boolean}
 */
function isOssUrl(url) {
  if (!url) return false
  return url.includes('.aliyuncs.com/')
}

/**
 * 获取OSS对象的临时签名URL
 * @param {string} objectKey - OSS对象key
 * @param {number} expireSeconds - 有效期（秒），默认300秒
 * @returns {Promise<string>} - 签名后的URL
 */
export async function getOssSignedUrl(objectKey, expireSeconds = 300) {
  if (!objectKey) {
    throw new Error('对象key不能为空')
  }
  
  // 检查缓存（提前5秒失效）
  const cached = urlCache[objectKey]
  if (cached && cached.expireAt > Date.now() + 5000) {
    return cached.url
  }
  
  // 调用后端接口获取签名URL
  const res = await request({
    url: '/common/oss/sign',
    method: 'get',
    params: {
      objectName: objectKey,
      expireSeconds: expireSeconds
    }
  })
  
  if (res.code === 200 && res.url) {
    // 缓存签名URL
    urlCache[objectKey] = {
      url: res.url,
      expireAt: Date.now() + (res.expireSeconds || expireSeconds) * 1000
    }
    return res.url
  }
  
  throw new Error('获取签名URL失败')
}

/**
 * 转换头像URL
 * 如果是OSS私有bucket的URL，转换为签名URL
 * @param {string} avatarUrl - 原始头像URL
 * @returns {Promise<string>} - 可访问的URL
 */
export async function convertAvatarUrl(avatarUrl) {
  console.log('[OSS] 开始转换头像URL:', avatarUrl)
  
  if (!avatarUrl) {
    console.log('[OSS] 头像URL为空，返回空字符串')
    return ''
  }
  
  // 如果是OSS URL，需要签名
  if (isOssUrl(avatarUrl)) {
    console.log('[OSS] 检测到OSS URL，准备提取objectKey')
    const objectKey = extractObjectKey(avatarUrl)
    console.log('[OSS] 提取的objectKey:', objectKey)
    
    if (objectKey) {
      try {
        const signedUrl = await getOssSignedUrl(objectKey, 3600) // 头像URL有效期1小时
        console.log('[OSS] 签名URL获取成功:', signedUrl)
        return signedUrl
      } catch (error) {
        console.error('[OSS] 获取头像签名URL失败:', error)
        return avatarUrl // 失败时返回原URL
      }
    }
  }
  
  // 如果不是完整URL，拼接BASE_API
  if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
    const fullUrl = process.env.VUE_APP_BASE_API + avatarUrl
    console.log('[OSS] 拼接BASE_API后的URL:', fullUrl)
    return fullUrl
  }
  
  console.log('[OSS] 直接返回原URL:', avatarUrl)
  return avatarUrl
}
