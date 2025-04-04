import Vue from 'vue'
import App from './App.vue'
// 路由引入
import VueRouter from 'vue-router'
import router from '@/router'

Vue.use(VueRouter)
import '@/permission'
// 引入store
import store from "@/store";







// 引入markdown渲染为html
// import VMdPreview from '@kangc/v-md-editor/lib/preview';
// import '@kangc/v-md-editor/lib/style/base-editor.css';
// import '@kangc/v-md-editor/lib/style/preview.css';
// // github主题
// import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
// import '@kangc/v-md-editor/lib/theme/style/github.css'
// import hljs from 'highlight.js'
// VMdPreview.use(githubTheme,{
//   Hljs: hljs
// })


import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/style/preview.css';
// vuepressTheme主题
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import Prism from 'prismjs';
VMdPreview.use(vuepressTheme,{
    Prism
})
// 按钮复制
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';
VMdPreview.use(createCopyCodePlugin());
// 行号
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
VMdPreview.use(createLineNumbertPlugin());
// //数学公式
// import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
// VMdPreview.use(createKatexPlugin());
// // 流程图
// import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/cdn';
// import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css';
// VMdPreview.use(createMermaidPlugin());


Vue.use(VMdPreview)

// 取消aria hidden提示

import removeAria from "@/directive/removeAria";
//全局注册
Vue.directive("removeAria", removeAria);


// 引入bootstrap
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap/dist/js/bootstrap.js'
// tailwind引入
import '@/assets/tailwind.css'
// 引入 Font Awesome CSS
import 'font-awesome/css/font-awesome.min.css';


//引入element ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// ElementUI.Dialog.props.lockScroll.default = false;
Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
    render: (h) => h(App),
    router,
    store
}).$mount('#app')
