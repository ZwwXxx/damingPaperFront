import router from "@/router";
import store from "@/store"
import {getToken, removeToken} from "@/utils/auth";
import {Message} from 'element-ui'

// 定义白名单
const whiteList = ['/login', '/public'];

router.beforeEach(async (to, from, next) => {
    //     // 判断是否有token,有就重新获取信息设置 store，因为刷新了，没有的话就跳到登录页面
    if (getToken()) {
        // 如果有token了就不允许去往登录页面了，除非退出登录
        if (to.path === '/login') {
            Message.error('登录后只能通过登出，去往登录页面')
            return next('/')
        }
        if (!store.state.user.id || store.state.user.id === '') {
            const res = await store.dispatch('GetInfo')
            console.log(store.state.user.id)
            if (res.code === 200) {
                next()
            } else {
                removeToken()
                next({path: `/login`})
            }
        } else {
            next()
        }
    } else {
        if (whiteList.includes(to.path)) {
            return next()
        }
        Message.error("请先登录")
        next({path: `/login`})
    }
});


