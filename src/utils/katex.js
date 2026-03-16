/**
 * 前台数学公式渲染（与后台 MarkdownEditor 行为一致）
 * 将 HTML 中的 $...$ 和 $$...$$ 替换为 KaTeX 渲染结果
 */
import katex from 'katex'

/**
 * 在已有 HTML 中渲染行内、块级数学公式
 * @param {string} html - 已渲染的 HTML（如 marked 输出）
 * @returns {string} 替换公式后的 HTML
 */
export function renderMathInHtml(html) {
  if (!html || typeof html !== 'string') return html
  try {
    // 1. 块级公式 $$...$$
    let out = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try {
        const cleanFormula = formula.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, '').trim()
        const rendered = katex.renderToString(cleanFormula, {
          displayMode: true,
          throwOnError: false
        })
        return `<div class="katex-block">${rendered}</div>`
      } catch (e) {
        console.error('KaTeX 块级公式渲染失败:', e)
        return match
      }
    })
    // 2. 行内公式 $...$（避免匹配 $$）
    out = out.replace(/([^$<]|^)\$([^$\n<]+?)\$([^$>]|$)/g, (match, before, formula, after) => {
      if (formula.includes('<') || formula.includes('>') || formula.includes('&')) return match
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false
        })
        return `${before || ''}<span class="katex-inline">${rendered}</span>${after || ''}`
      } catch (e) {
        console.error('KaTeX 行内公式渲染失败:', e)
        return match
      }
    })
    return out
  } catch (e) {
    console.error('renderMathInHtml 失败:', e)
    return html
  }
}

/** DOMPurify 允许的 KaTeX 相关标签（与后台一致） */
export const KATEX_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'img', 'a', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr',
  'math', 'annotation', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'mfrac', 'msup', 'msub', 'munderover', 'mover', 'munder',
  'mtable', 'mtr', 'mtd', 'mtext', 'mspace', 'menclose', 'merror', 'mfenced', 'mpadded', 'mphantom', 'mroot', 'mstyle', 'mmultiscripts'
]

/** DOMPurify 允许的 KaTeX 相关属性 */
export const KATEX_ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'data-preview', 'data-*', 'aria-*', 'role', 'id']
