<template>
    <div class="rich-text-editor">
        <el-upload :action="uploadUrl" :before-upload="handleBeforeUpload" :on-success="handleUploadSuccess"
            :on-error="handleUploadError" name="file" :show-file-list="false" :headers="headers" style="display: none"
            ref="upload" v-if="type === 'url'">
        </el-upload>
        <div class="editor" ref="editor" :style="styles"></div>
    </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { getToken } from '@/utils/auth'

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
            }
        }
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
            this.Quill.on('text-change', () => {
                const html = this.$refs.editor.children[0].innerHTML
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
            return true
        },
        handleUploadSuccess(res) {
            if (res.code === 200) {
                const quill = this.Quill
                const length = quill.getSelection().index
                quill.insertEmbed(length, 'image', process.env.VUE_APP_BASE_API + res.fileName)
                quill.setSelection(length + 1)
            } else {
                this.$message.error('图片插入失败')
            }
        },
        handleUploadError() {
            this.$message.error('图片插入失败')
        }
    }
}
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
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
