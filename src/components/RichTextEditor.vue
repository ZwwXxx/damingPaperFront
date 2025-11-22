<template>
    <div class="rich-text-editor">
        <el-upload :action="uploadUrl" :before-upload="handleBeforeUpload" :on-success="handleUploadSuccess"
            :on-error="handleUploadError" name="file" :show-file-list="false" :headers="headers" style="display: none"
            ref="upload" v-if="type === 'url'">
        </el-upload>
        <div class="editor-wrapper">
            <div class="editor" ref="editor" :style="styles"></div>
            <div v-if="isUploading" class="editor-loading">
                <i class="el-icon-loading"></i>
                <span>图片上传中...</span>
            </div>
        </div>
        <el-image-viewer
            v-if="imagePreview.visible"
            :url-list="imagePreview.urls"
            :initial-index="imagePreview.index"
            :on-close="closeImagePreview"/>
    </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { getToken } from '@/utils/auth'
import { getOssSign } from '@/api/common'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
    name: 'RichTextEditor',
    props: {
        value: {
            type: String,
            default: ''
        },
        height: {
            type: Number,
            default: null
        },
        minHeight: {
            type: Number,
            default: 200
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        fileSize: {
            type: Number,
            default: 5
        },
        type: {
            type: String,
            default: 'url'
        },
        placeholder: {
            type: String,
            default: '请输入内容'
        }
    },
    data() {
        return {
            uploadUrl: process.env.VUE_APP_BASE_API + '/common/upload',
            headers: {
                Authorization: 'Bearer ' + getToken()
            },
            Quill: null,
            currentValue: '',
            options: {
                theme: 'snow',
                bounds: document.body,
                debug: 'warn',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ indent: '-1' }, { indent: '+1' }],
                        [{ size: ['small', false, 'large', 'huge'] }],
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        ['clean'],
                        ['link', 'image', 'video']
                    ]
                },
                placeholder: '请输入内容',
                readOnly: false
            },
            imagePreview: {
                visible: false,
                urls: [],
                index: 0
            },
            isUploading: false,
            imageUrlCache: {},
            bodyScrollLocked: false,
            scrollPosition: 0,
            originalBodyOverflow: '',
            originalHtmlOverflow: '',
            preventScrollHandler: null,
            imageClickHandler: null
        }
    },
    components: {
        ElImageViewer
    },
    computed: {
        styles() {
            const style = {}
            if (this.minHeight) {
                style.minHeight = `${this.minHeight}px`
            }
            if (this.height) {
                style.height = `${this.height}px`
            }
            return style
        }
    },
    watch: {
        value: {
            handler(val) {
                if (val !== this.currentValue) {
                    this.currentValue = val === null ? '' : val
                    if (this.Quill) {
                        this.Quill.pasteHTML(this.currentValue)
                        this.$nextTick(() => this.prepareEditorImages())
                    }
                }
            },
            immediate: true
        }
    },
    mounted() {
        this.options.placeholder = this.placeholder
        this.options.readOnly = this.readOnly
        this.init()
    },
    beforeDestroy() {
        this.Quill = null
        this.removeImagePreviewEvents()
        this.unlockBodyScroll()
    },
    methods: {
        init() {
            const editor = this.$refs.editor
            this.Quill = new Quill(editor, this.options)
            if (this.type === 'url') {
                const toolbar = this.Quill.getModule('toolbar')
                toolbar.addHandler('image', (value) => {
                    if (value) {
                        this.$refs.upload.$children[0].$refs.input.click()
                    } else {
                        this.Quill.format('image', false)
                    }
                })
            }
            this.Quill.pasteHTML(this.currentValue)
            this.$nextTick(() => this.prepareEditorImages())
            this.Quill.on('text-change', () => {
                const html = this.buildOutputHtml()
                const text = this.Quill.getText()
                this.currentValue = html
                this.$emit('input', html)
                this.$emit('on-change', { html, text, quill: this.Quill })
            })
            this.Quill.on('text-change', (delta, oldDelta, source) => {
                this.$emit('on-text-change', delta, oldDelta, source)
            })
            this.Quill.on('selection-change', (range, oldRange, source) => {
                this.$emit('on-selection-change', range, oldRange, source)
            })
            this.Quill.on('editor-change', (eventName, ...args) => {
                this.$emit('on-editor-change', eventName, ...args)
            })
            this.bindImagePreviewEvents()
        },
        handleBeforeUpload(file) {
            const allowTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg']
            if (!allowTypes.includes(file.type)) {
                this.$message.error('图片格式错误')
                return false
            }
            if (this.fileSize) {
                const isLtLimit = file.size / 1024 / 1024 < this.fileSize
                if (!isLtLimit) {
                    this.$message.error(`上传文件大小不能超过 ${this.fileSize} MB`)
                    return false
                }
            }
            this.isUploading = true
            return true
        },
        async handleUploadSuccess(res) {
            this.isUploading = false
            if (res.code !== 200) {
                this.$message.error('图片插入失败')
                return
            }
            const quill = this.Quill
            const selection = quill.getSelection && quill.getSelection()
            const length = selection ? selection.index : quill.getLength()
            const { objectName, displayUrl } = await this.resolveUploadResult(res)
            const insertUrl = displayUrl || (objectName ? this.buildLocalUrl(objectName) : '')
            if (!insertUrl) {
                this.$message.error('图片插入失败')
                return
            }
            quill.insertEmbed(length, 'image', insertUrl)
            quill.setSelection(length + 1)
            this.markInsertedImage(length, objectName, insertUrl)
        },
        async resolveUploadResult(res) {
            let objectName = res.fileName || (res.data && res.data.fileName) || res.newFileName
            objectName = this.normalizeOssKey(objectName)
            let displayUrl = ''
            if (objectName) {
                displayUrl = await this.getSignedImageUrl(objectName)
            }
            if (!displayUrl) {
                displayUrl = res.url || (res.data && res.data.url) || ''
            }
            if (!displayUrl && objectName) {
                displayUrl = this.buildLocalUrl(objectName)
            }
            return {
                objectName,
                displayUrl
            }
        },
        buildLocalUrl(path) {
            if (!path) {
                return ''
            }
            const base = process.env.VUE_APP_BASE_API || ''
            const normalizedPath = path.startsWith('/') ? path : `/${path}`
            if (!base) {
                return normalizedPath
            }
            if (base.endsWith('/')) {
                return `${base.replace(/\/+$/, '')}${normalizedPath}`
            }
            return `${base}${normalizedPath}`
        },
        handleUploadError() {
            this.isUploading = false
            this.$message.error('图片插入失败')
        },
        markInsertedImage(index, objectName, displayUrl) {
            if (!this.Quill) {
                return
            }
            this.$nextTick(() => {
                const leafTuple = this.Quill.getLeaf(index)
                const leaf = leafTuple && leafTuple[0]
                const node = leaf && leaf.domNode
                if (!node || node.tagName !== 'IMG') {
                    return
                }
                if (objectName) {
                    node.setAttribute('data-oss-key', objectName)
                    node.setAttribute('data-src', objectName)
                }
                if (displayUrl) {
                    node.setAttribute('src', displayUrl)
                }
            })
        },
        buildOutputHtml() {
            const editorRoot = this.Quill && this.Quill.root
            if (!editorRoot) {
                return ''
            }
            const clone = editorRoot.cloneNode(true)
            const images = clone.querySelectorAll('img')
            images.forEach(img => this.sanitizeImageNode(img))
            return clone.innerHTML
        },
        sanitizeImageNode(img) {
            if (!img) {
                return
            }
            const ossKey = this.getImageOssKey(img)
            if (ossKey) {
                img.setAttribute('src', ossKey)
                img.setAttribute('data-oss-key', ossKey)
                img.setAttribute('data-src', ossKey)
                return
            }
            const src = img.getAttribute('src') || ''
            if (this.isSignedOssUrl(src)) {
                img.setAttribute('src', src.split('?')[0])
            }
        },
        async prepareEditorImages() {
            if (!this.Quill || !this.Quill.root) {
                return
            }
            const images = Array.from(this.Quill.root.querySelectorAll('img'))
            if (!images.length) {
                return
            }
            await Promise.all(images.map(img => this.prepareImageNode(img)))
        },
        async prepareImageNode(img) {
            if (!img) {
                return
            }
            const ossKey = this.getImageOssKey(img)
            if (!ossKey) {
                return
            }
            img.setAttribute('data-oss-key', ossKey)
            img.setAttribute('data-src', ossKey)
            const signedUrl = await this.getSignedImageUrl(ossKey)
            const finalSrc = signedUrl || this.buildLocalUrl(ossKey) || ossKey
            if (finalSrc) {
                img.setAttribute('src', finalSrc)
            }
        },
        getImageOssKey(img) {
            if (!img) {
                return ''
            }
            const attrValue = img.getAttribute('data-oss-key') || img.getAttribute('data-src')
            if (attrValue) {
                return this.normalizeOssKey(attrValue)
            }
            const src = img.getAttribute('src') || ''
            return this.extractOssKeyFromSource(src)
        },
        normalizeOssKey(value) {
            if (!value) {
                return ''
            }
            return value.replace(/^\/+/, '').trim()
        },
        extractOssKeyFromSource(src) {
            if (!src) {
                return ''
            }
            const trimmed = src.trim()
            if (!trimmed || /^data:/i.test(trimmed)) {
                return ''
            }
            const [withoutHash] = trimmed.split('#')
            const [withoutQuery] = withoutHash.split('?')
            if (/^https?:\/\//i.test(withoutQuery)) {
                try {
                    const url = new URL(trimmed)
                    const host = url.hostname || ''
                    if (!this.isLikelyOssHost(host) && !this.isSignedOssUrl(trimmed)) {
                        return ''
                    }
                    return url.pathname.replace(/^\/+/, '')
                } catch (error) {
                    return ''
                }
            }
            const base = (process.env.VUE_APP_BASE_API || '').replace(/\/$/, '')
            let normalized = withoutQuery
            if (base && normalized.startsWith(base)) {
                normalized = normalized.slice(base.length)
            }
            return normalized.replace(/^\/+/, '')
        },
        isLikelyOssHost(host) {
            if (!host) {
                return false
            }
            return /aliyuncs\.com/i.test(host) || host.indexOf('oss-') !== -1
        },
        isSignedOssUrl(value) {
            if (!value) {
                return false
            }
            return /[?&](OSSAccessKeyId|Signature|Expires)=/i.test(value)
        },
        async getSignedImageUrl(objectName) {
            const ossKey = this.normalizeOssKey(objectName)
            if (!ossKey) {
                return ''
            }
            const cache = this.imageUrlCache[ossKey]
            const now = Date.now()
            if (cache && cache.expireAt > now) {
                return cache.url
            }
            try {
                const signRes = await getOssSign({ objectName: ossKey })
                const signedUrl = signRes.url || (signRes.data && signRes.data.url)
                if (signedUrl) {
                    const expireSeconds = signRes.expireSeconds || (signRes.data && signRes.data.expireSeconds) || 300
                    this.imageUrlCache[ossKey] = {
                        url: signedUrl,
                        expireAt: now + expireSeconds * 1000 - 5000
                    }
                    return signedUrl
                }
            } catch (error) {
                console.warn('获取签名地址失败', error)
            }
            return ''
        },
        bindImagePreviewEvents() {
            if (!this.Quill || !this.Quill.root) {
                return
            }
            this.removeImagePreviewEvents()
            this.imageClickHandler = (event) => {
                const target = event.target || event.srcElement
                if (!target || target.tagName !== 'IMG') {
                    return
                }
                event.preventDefault()
                const images = Array.from(this.Quill.root.querySelectorAll('img'))
                const urls = images.map(img => img.getAttribute('src')).filter(Boolean)
                if (!urls.length) {
                    return
                }
                const index = Math.max(images.indexOf(target), 0)
                this.openImagePreview(urls, index)
            }
            this.Quill.root.addEventListener('click', this.imageClickHandler)
        },
        removeImagePreviewEvents() {
            if (this.Quill && this.Quill.root && this.imageClickHandler) {
                this.Quill.root.removeEventListener('click', this.imageClickHandler)
                this.imageClickHandler = null
            }
        },
        openImagePreview(urls, index) {
            this.imagePreview = {
                visible: true,
                urls,
                index
            }
            this.lockBodyScroll()
        },
        closeImagePreview() {
            this.imagePreview.visible = false
            this.unlockBodyScroll()
        },
        lockBodyScroll() {
            if (this.bodyScrollLocked) return
            this.bodyScrollLocked = true
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
            this.originalBodyOverflow = document.body.style.overflow
            this.originalHtmlOverflow = document.documentElement.style.overflow
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.top = `-${this.scrollPosition}px`
            document.body.style.width = '100%'
            this.preventScrollHandler = e => e.preventDefault()
            window.addEventListener('wheel', this.preventScrollHandler, { passive: false })
            window.addEventListener('touchmove', this.preventScrollHandler, { passive: false })
        },
        unlockBodyScroll() {
            if (!this.bodyScrollLocked) return
            this.bodyScrollLocked = false
            document.body.style.overflow = this.originalBodyOverflow || ''
            document.documentElement.style.overflow = this.originalHtmlOverflow || ''
            document.body.style.position = ''
            document.body.style.top = ''
            document.body.style.width = ''
            if (this.preventScrollHandler) {
                window.removeEventListener('wheel', this.preventScrollHandler)
                window.removeEventListener('touchmove', this.preventScrollHandler)
                this.preventScrollHandler = null
            }
            window.scrollTo(0, this.scrollPosition || 0)
        }
    }
}
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}
.editor-wrapper {
  position: relative;
}
.editor-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.75);
  z-index: 10;
  font-size: 14px;
  color: #606266;
  pointer-events: none;
}
.editor-loading i {
  font-size: 20px;
  margin-right: 8px;
}
:deep(.ql-editor img) {
  max-width: 320px;
  max-height: 320px;
  height: auto;
  width: auto;
  cursor: zoom-in;
  display: inline-block;
}
:deep(.editor),
:deep(.ql-toolbar) {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
:deep(.ql-toolbar) {
  border-radius: 6px 6px 0 0;
}
:deep(.ql-container) {
  border-radius: 0 0 6px 6px;
  min-height: 220px;
  width: 100%;
  box-sizing: border-box;
}
:deep(.ql-editor) {
  min-height: 220px;
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
}
:deep(.ql-editor::before) {
  left: 16px;
  right: 16px;
  width: auto;
}
:deep(.ql-editor p) {
  min-height: 20px;
}
</style>
