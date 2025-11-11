/**
 * 生成一个稳定的乱序列表，并缓存到 localStorage，确保同一次考试刷新后顺序一致。
 * key 建议包含试卷ID和题目版本号。
 */
export function getOrCreateShuffledOrder(key, size) {
  if (!size || size <= 0) {
    return []
  }
  try {
    const cache = window.localStorage.getItem(key)
    if (cache) {
      const parsed = JSON.parse(cache)
      if (Array.isArray(parsed) && parsed.length === size) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('read shuffle cache failed', e)
  }

  const order = Array.from({ length: size }, (_, idx) => idx)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = order[i]
    order[i] = order[j]
    order[j] = temp
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(order))
  } catch (e) {
    console.warn('write shuffle cache failed', e)
  }
  return order
}

export function clearShuffledOrder(key) {
  try {
    window.localStorage.removeItem(key)
  } catch (e) {
    console.warn('clear shuffle cache failed', e)
  }
}
