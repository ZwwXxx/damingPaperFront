// 创建axios实例，自定义配置
import axios from 'axios'
import {getToken} from '@/utils/auth'
// import errorCode from '@/utils/errorCode'
// import { MessageBox } from 'element-ui'
const axiosInstance = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分,
    // 用户在api文件引入该axiosInstance会往里传入一个配置对象，包含方法，参数 ，地址（基础地址会拼在前面），然后经过请求拦截器，然后发送请求
    // baseUrl指向代理服务器前缀，后续会自动去除
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 1000000000,
});

//设置请求拦截器,形参为上面设置的config
axiosInstance.interceptors.request.use(config => {
    // 如果isToken 为假标识不是token请求，则为notoken为真，如果没有标识不是token请求那就为token请求， notoken为假，设置token
    const noToken = (config.headers || {}).isToken === false
    // 如果有token和是身份认证请求则给header增加token属性
    if (getToken() && !noToken) {
        config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
        // config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6IjI5ZmI0ODA0LWY4YTYtNGE2OC1hOGMyLWRlODQ2NTIzNDgyNiJ9.zjEU-5SDExvIJVaIaOfPfMe66DvGIoa4ilQxtmZXNk57dEzVzFQdX_7ZZficIOHMWkJp1jRV2F-XyLgAMq7ItA'
        // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
})


//设置响应拦截器，根据错误码提示，和解剖data出来
axiosInstance.interceptors.response.use((res => {
    return res.data
    //获取状态，默认200
    // const code = res.data.code || 200
    // 设置提示信息，目前已知401为没有token认证，根据状态码，要不然就根据自定义的msg
    // const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 如果是401，则说明登录过期，提示一下然后跳转登录页面
    // if (code === 401) {
    //     MessageBox.confirm(`登录状态已过期，您可以继续留在该页面，或者重新登录,错误信息为${msg}`, '系统提示', {
    //         confirmButtonText: '重新登录',
    //         cancelButtonText: '取消',
    //         type: 'warning'
    //     }).then(() => {
    //         location.href = '/index';
    //     })
    //     // isRelogin.show = false;
    //     // store.dispatch('LogOut').then(() => {
    //     //     location.href = '/index';
    //     // })
    // }
    // else {
    //     return res.data
    // }
}))
export default axiosInstance
