/**
 * OSS工具类 - 超级简化版本
 * 现在所有图片都直接存储完整CDN地址，无需任何处理
 */

/**
 * 转换头像URL - 超级简化版本
 * 数据库直接存储完整CDN地址，无需任何处理
 * @param {string} avatarUrl - 完整的CDN地址
 * @returns {string} - 直接返回
 */
export function convertAvatarUrl(avatarUrl) {
  return avatarUrl || ''
}
