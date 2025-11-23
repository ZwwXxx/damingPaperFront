<!--
*@index
*@author Zww
*@date 2024/10/7 15:12
-->
<template>

  <ul class="w-f">
    <li class="flex justify-center ">
      <!--action为上传地址，我们#号关闭，后续自定义上传-->
      <!--show-file-list 不关上传会跳一个上传当前图片的弹窗-->
      <el-upload
          :http-request="requestUpload"
          action="#"
          :before-upload="beforeAvatarUpload"
          :show-file-list="false"

      >
        <img :src="options.img"
             class="cursor-pointer"
             style="width: 120px;height: 120px; border-radius: 100%;box-shadow: 1px 1px 10px black ;border: 4px white solid">
      </el-upload>
    </li>
    <!--<li class="flex my-4">-->
    <!--  <label class="mr-4 text-right" style="width: 88px;">用户名: </label>-->
    <!--  <span>{{ user.userName }}</span>-->
    <!--</li>-->
    <!--<li class="flex">-->
    <!--  <label class="mr-4 text-right" style="width: 88px;">昵称: </label>-->
    <!--  &lt;!&ndash;<span>Zww</span>&ndash;&gt;-->
    <!--  <el-input v-model="user.nickName"></el-input>-->
    <!--</li>-->
    <el-form label-width="80px" :rules="rules" :model="form" ref="form" class="mt-8">
      <el-form-item label="用户名">
        <el-input v-model="form.userName" disabled></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="form.nickName"></el-input>
      </el-form-item>
      <el-button style="float: right;margin-top: 10px" type="primary" @click="handleSubmit">确认修改</el-button>
    </el-form>
  </ul>

</template>

<script>
// import Wrapper from "@/components/wrapper.vue";
import store from "@/store";
import { updateInfo, uploadFile } from "@/api/user";
import { convertAvatarUrl } from "@/utils/oss";
import { DEFAULT_AVATAR } from "@/utils/constants";

export default {
  name: "index",
  async created() {
    // 先获取最新的用户信息
    await this.loadUserInfo()
  },
  props: {},
  // components: {Wrapper},
  data() {
    return {
      // 是否显示cropper
      form: {
        userName:this.$store.state.user.id,
        nickName:this.$store.state.user.name,
      },
      rules: {
        nickName: [{required: true, message: '请输入昵称', trigger: 'blur'}]
      },
      //后续想搞裁剪再来
      options: {
        img: ''  // 在created中异步加载签名URL
      },
      blob: '' //file文件 二进制
    }
  },
  methods: {
    /**
     * 加载用户信息并初始化头像
     */
    async loadUserInfo() {
      try {
        // 先获取最新的用户信息
        await store.dispatch('GetInfo')
        
        // 更新表单数据
        this.form.userName = store.getters.id
        this.form.nickName = store.getters.name
        
        // 获取头像URL（已经在store中转换为签名URL）
        const avatarUrl = store.getters.avatar
        console.log('加载的头像URL:', avatarUrl)
        
        if (avatarUrl) {
          this.options.img = avatarUrl
        } else {
          // 没有头像时使用默认头像
          this.options.img = DEFAULT_AVATAR
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        this.options.img = DEFAULT_AVATAR
      }
    },
    // 覆盖默认的上传行为
    requestUpload() {
    },
    //上传预处理，先将file文件转为数据 URL（Data URL）。数据 URL 是一种以特定格式编码的 URL，它允许在 URL 中直接嵌入小型文件（如图像、音频和文本）。
    // 基本格式为——data:[<mediatype>][;base64],<data>
    /**
     * data:：指示这是一个数据 URL。
     * <mediatype>：可选，指定数据的 MIME 类型，例如 image/png、image/jpeg 等。如果省略，默认为 text/plain;charset=utf-8。
     * ;base64：可选，指示数据是以 Base64 编码的。如果数据是文本（如小型文本或 JSON），则不需要这个部分。
     * <data>：实际的数据部分，通常是以 Base64 编码的字符串。
     */
    beforeAvatarUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.$message.error("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      } else {
        const imageConversion = require("image-conversion");
        console.log('压缩前'+(file.size / 1024)+"K");
        imageConversion.compressAccurately(file, 100).then(res => {
          console.log('压缩后'+(res.size / 1024)+"K");
          const reader = new FileReader();
          reader.readAsDataURL(res);
          reader.onload = () => {
            this.blob = res
            this.options.img = reader.result;
            this.options.filename = file.name;
          };
        })
      }
    },
    async handleSubmit() {
      // 在这里可以处理表单提交逻辑
      try {
        await this.$refs['form'].validate()
      } catch {
        this.$message.error("请确认信息是否填写完毕")
        return
      }
      
      try {
        let avatarUrl = null
        
        // 如果选择了新头像，先上传到OSS
        if (this.blob) {
          // this.$message.info('正在上传头像...')
          const formData = new FormData()
          formData.append("file", this.blob, this.options.filename)
          
          const uploadRes = await uploadFile(formData)
          if (uploadRes.code === 200) {
            avatarUrl = uploadRes.url  // OSS返回的URL
            console.log('头像上传成功:', avatarUrl)
          } else {
            this.$message.error('头像上传失败')
            return
          }
        }
        
        // 准备更新数据（JSON格式）
        const updateData = {
          nickName: this.form.nickName
        }
        
        // 如果上传了新头像，添加到更新数据中
        if (avatarUrl) {
          updateData.avatar = avatarUrl
        }
        
        console.log('准备更新的数据:', updateData)
        
        // 调用更新接口
        const res = await updateInfo(updateData)
        console.log('更新接口返回:', res)
        if (res.code === 200) {
          this.$message.success('修改成功！')
          
          // 刷新用户信息和头像显示
          await this.loadUserInfo()
        } else {
          this.$message.error(res.msg || "修改失败！")
        }
      } catch (error) {
        console.error('更新失败:', error)
        this.$message.error("修改失败！")
      }
    }
  },
}
</script>

<style scoped>
.avatar-upload-preview {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}
</style>
