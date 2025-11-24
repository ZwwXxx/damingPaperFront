import VueRouter from 'vue-router'
import layout from "@/layout/index.vue";

const routes = [
    {
        path: '/',
        component: layout,
        redirect: '/home',
        children: [
            {
                path: '/home',
                name: 'home',
                component: () => import('@/views/home/index.vue'),
            },
            {
                path: '/subject/:subjectId',
                name: 'subject',
                component: () => import('@/views/subject/index.vue'),
            },
            {
                path: '/paper/:paperId',
                name: 'paper',
                component: () => import('@/views/paper/index.vue'),
            },
            {
                path: '/person',
                name: 'person',
                redirect: '/person/info',
                component: () => import('@/views/person/index.vue'),
                children: [
                    {
                        path: 'info',
                        name: 'info',
                        component: () => import('@/views/person/info/index.vue'),
                    },
                    {
                        path: 'record',
                        name: 'record',
                        component: () => import('@/views/person/record/index.vue'),
                    },
                    {
                        path: 'wrong',
                        name: 'wrong',
                        component: () => import('@/views/person/wrong/index.vue'),
                    },
                    {
                        path: 'favorite',
                        name: 'favorite',
                        component: () => import('@/views/person/favorite/index.vue'),
                    },
                    {
                        path: 'posts',
                        name: 'posts',
                        component: () => import('@/views/person/posts/index.vue'),
                    },
                    {
                        path: 'dashboard',
                        name: 'dashboard',
                        component: () => import('@/views/dashboard/personal.vue'),
                    }
                ]
            },
            {
                path: '/review',
                name: 'review',
                component: () => import('@/views/review/index.vue'),
            },
            {
                path: '/ai',
                name: 'ai',
                component: () => import('@/components/ai.vue'),
            },
            {
                path: '/notice/list',
                name: 'noticeList',
                component: () => import('@/views/notice/list.vue'),
            },
            {
                path: '/feedback/submit',
                name: 'feedbackSubmit',
                component: () => import('@/views/feedback/submit.vue'),
            },
            {
                path: '/feedback/my',
                name: 'feedbackMy',
                component: () => import('@/views/feedback/my.vue'),
            },
            {
                path: '/forum/index',
                name: 'forumIndex',
                component: () => import('@/views/forum/index.vue'),
            },
            {
                path: '/forum/detail/:id',
                name: 'forumDetail',
                component: () => import('@/views/forum/detail.vue'),
            },
            {
                path: '/forum/post',
                name: 'forumPost',
                component: () => import('@/views/forum/post.vue'),
            }

        ],
    },
    {
        path: '/login',
        name: 'login',
        meta: {requireToken: false},
        component: () => import('@/views/login/index.vue')
    }
]

export default new VueRouter({
    // mode: 'history',
    routes,
    // scrollBehavior
})
