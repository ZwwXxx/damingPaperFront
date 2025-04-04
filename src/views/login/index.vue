<!--
*@index
*@author niemengshi
*@date 2024/10/16 10:09
-->
<template>
  <!--大盒子-->
  <div class=" min-h-screen flex items-center justify-center transition-all duration-1000"
       :class="isLogin?'bg-gray-500':'bg-green-800'">
    <!--中间部分-->
    <div class=" w-96 h-96 rounded-2xl shadow-2xl p-10 transition-all "
         :class="isLogin?'bg-gray-200':'bg-green-900'"
    >
      <div
          :class="isLogin?'text-gray-600':'text-gray-300'"
          class="header  font-bold text-3xl text-center mb-10"
      >
        <span v-if="isLogin">登录</span>
        <span v-else>注册</span>
      </div>

      <!--表单区域-->
      <form @submit.prevent="handleSubmit" class="form-wrapper flex flex-col items-center ">
        <input
            v-model="formData.userName"
            class="w-full p-3 mb-4 rounded-xl shadow-lg  transition-all"
            required
            placeholder="请输入用户名"
        />
        <input
            v-model="formData.password"
            class="w-full p-3 mb-4 rounded-xl shadow-lg  transition-all"
            required
            type="password"
            placeholder="请输入密码"
        />
        <button
            :class="isLogin?' bg-indigo-900':' bg-red-900'"
            class="w-full text-center rounded-md p-3 text-gray-200 mt-4 shadow-lg">
          <span v-if="isLogin">登录</span>
          <span v-else>注册</span>
        </button>
      </form>
      <div class="mt-4 text-sm">
        <span class="mr-4"
              :class="isLogin?'text-gray-800':'text-gray-300'"
        >
          <span v-if="isLogin">没有账号?</span>
        <span v-else>已有账号?</span>
        </span>

        <span
            :class="isLogin?['hover:text-red-800','text-blue-800']:['hover:text-blue-400','text-red-700']"
            class="font-bold cursor-pointer  transition-all" @click="changeType"  >
          <span v-if="isLogin">注册</span>
          <span v-else>登录</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { login, registry} from "@/api/user";
import {setToken} from "@/utils/auth";

export default {
  name: "index",
  props: {},
  components: {},
  data() {
    return {
      formData: {
        userName: '',
        password: '',
      },
      //判断是登录还是注册
      isLogin: true
    }
  },
  methods: {
    async handleSubmit() {
      if (this.isLogin) {
        const res = await login(this.formData)
        if (res.code === 200) {
          console.log('登录成功!')
          this.$message.success("登录成功")
          // cookies设置token
          setToken(res.token)
          // store设置token ,info在每次跳转路由时给守卫拦截并发送，达成刷新页面检测cookies 的token重新加载状态store
          this.$store.commit("SET_TOKEN", res.token)
          // 跳转首页
          this.$router.push({path:'/'})
        }
        else{
          this.$message.error("登录失败")
        }
      } else {
        const res = await registry(this.formData)
        if (res.code === 200) {
          console.log('注册成功')
        }
      }
    },
    changeType() {
      this.isLogin = !this.isLogin
    }
  },
}
</script>

<style scoped>


</style>
