<!--
*@ai
*@author niemengshi
*@date 2024/10/26 11:12
-->
<template>
  <!--内容输出区域-->
  <!--加入滚动溢出，使得上半部分内容区域超出高度后出现滚动条-->
  <div class="fixed top-20 right-0  bg-white  "
       :class="isCollapsed?'w-1/4':'w-full'"
       style="height: calc(100vh - 80px );
           z-index: 2;
           transition: all 0.3s;
              max-height:100%;display: flex;flex-direction: column;justify-content: space-between;
">
    <div style="position: absolute;top: -10px;z-index: 999;display: flex;align-items: center">
      <el-button style="height: 40px;" @click="toggleCollapse" v-if="needCollapse">
        展开/收缩
      </el-button>
      <span class="bg-black text-white"
            style="width:140px;height: 40px; display: block;line-height: 40px ;margin-left: 20px;border-radius: 20px 0 0 20px;font-size: 14px;text-align: center">修改当前回复速度:</span>
      <el-input :disabled="btnForbidden"
                style="width: 80px;"
                v-model="speed"></el-input>
    </div>

    <div style=" overflow: auto;  " ref="output">
      <el-descriptions :column=1 border size="small" style="width: 100% ;">
        <el-descriptions-item :label="record.role"
                              :label-style="{ width: '0px' ,fontWeight:'bolder',color:record.role==='Zww:'?'#be0a00':'#2400c5' }"
                              v-for="(record,index) in chatRecord" :key="index">
          <!--<span v-html="record.content"></span>-->
          <!--<div class="markdown-body">-->
          <!--  <VueMarkdown   :source="record.content"></VueMarkdown>-->
          <!--</div>-->
          <!--<div class="show" v-html="renderMdText(record.content)"></div>-->
          <div class="restore-list">
            <v-md-preview class="listBack" :text="record.content"
                          @copy-code-success="handleCopySuccess"
                          style="max-width: 100vh;min-width: 100%;list-style: disc"
            ></v-md-preview>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <!--内容输入区域-->
    <div style="position: relative





     ">
      <!--停止输出按钮-->
      <el-button
          @click="stopOutput"
          style="position: absolute ;box-shadow: 0px 5px 8px rgba(0,0,0,0.4);top: 0;left: 50%;transform:translateX(-50%)translateY(-110%);z-index: 2;height: 40px"
          type="warning" v-if="btnForbidden">停止生成
      </el-button>
      <el-row>
        <el-col :span="4">
          <el-button @click="clearContext"
                     style="width: 100%;height: 75px;text-align: center; white-space: wrap; font-size: 14px;padding: 5px;background:#008a77;color: white">
            清除记忆
          </el-button>
        </el-col>
        <el-col :span="16">
          <el-input
              type="textarea"
              @keyup.enter.native="handleEnter"
              placeholder="请输入内容"
              v-model="content "
              :rows="3"
              resize="none"
              style="width: 100%"
          >
          </el-input>
        </el-col>
        <el-col :span="4" style="position: relative">
          <div style="position: absolute;top: 50%;left:-50px;transform: translateY(-45%);cursor: pointer "
               @click="handleUpload">
            <svg t="1729773874203" class="icon  " viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="4436" width="40" height="40">
              <path
                  d="M677.888 494.592q0 28.672-10.752 53.76t-29.184 43.52-43.008 29.184-53.248 10.752-53.248-10.752-43.008-29.184-29.184-43.52-10.752-53.76q0-27.648 10.752-52.736t29.184-43.52 43.008-29.184 53.248-10.752 53.248 10.752 43.008 29.184 29.184 43.52 10.752 52.736zM171.008 766.976q-28.672 0-51.2-5.12t-37.888-17.408-23.552-33.28-8.192-52.736l0-346.112q0-57.344 27.136-79.872t85.504-22.528l172.032 0q16.384 0 27.136-6.144t17.408-16.384 11.776-24.064 11.264-28.16q10.24-26.624 35.84-46.08t58.368-19.456l95.232 0q37.888 0 61.952 20.992t32.256 44.544q11.264 30.72 29.696 52.736t38.912 22.016l130.048 0q45.056-1.024 71.68 24.576t26.624 74.752l0 351.232q0 52.224-27.648 79.36t-73.728 27.136l-710.656 0zM539.648 280.576q-45.056 0-83.968 16.896t-67.584 46.08-45.568 68.096-16.896 82.944q0 45.056 16.896 83.968t45.568 67.584 67.584 45.568 83.968 16.896q44.032 0 82.944-16.896t67.584-45.568 45.568-67.584 16.896-83.968q0-44.032-16.896-82.944t-45.568-68.096-67.584-46.08-82.944-16.896zM611.328 169.984q0-16.384-1.536-25.6t-20.992-9.216l-84.992 0q-19.456-1.024-20.992 8.192t-1.536 26.624q-1.024 19.456 2.048 27.648t20.48 8.192l84.992 0q19.456 0 20.992-9.216t1.536-26.624z"
                  p-id="4437"></path>
            </svg>
          </div>
          <!--隐藏的表单域-->
          <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              style="display: none"
          />
          <el-button type="primary" style="height: 75px;width: 100%;" @click="sendChatBySse"
                     :disabled="btnForbidden"
                     :style="btnForbidden ? 'background: #be0a00;': 'background: #6047cb;'"
          >
            发送
          </el-button>
          <!--<button @click="setSession">Set Session</button>-->
          <!--<button @click="getSession">Get Session</button>-->
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import {clearRecord, stopStream} from "@/api/ai";
import {EventSourcePolyfill} from 'event-source-polyfill';
import {getToken} from "@/utils/auth";

export default {
  name: "ai",
  components: {},
  props: {
    isCollapse: {
      type: Boolean,
      required: false,
      default: false, // 设置默认值
    },
    needCollapse: {
      type: Boolean,
      required: false,
      default: false, // 设置默认值
    },
  },
  data() {
    return {
      isCollapsed: this.isCollapse,// 使用 prop 初始化局部状态
      eventsource: null,
      timer: null,
      //存储输出区域的dom，后续持续滚动到底
      outputElement: null,
      // 是否提前结束
      preStop: false,
      // 打字机的速度
      speed: 120,
      // 实时滚动到底
      srcollBottom: true,
      //是否禁用按钮
      btnForbidden: false,
      paperDto: {},
      paperAnswerDto: {},
      content: '',
      chatRecord: [
        {
          role: "Zww:", content: "嗨嗨嗨,又见面了老壁灯😚,Zww在线为你解答世间万物"
        },
      ],
      user: {},
      // md: new MarkdownIt()
    }
  },
  beforeDestroy() {
    this.clearContext();
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed; // 切换局部状态
    },
    sendChatBySse() {
      console.log('当前速度为')
      console.log('当前速度为' + this.speed)
      this.preStop = false;
      // 限制发送内容长度
      let byteLength = 0;
      for (let i = 0; i < this.content.length; i++) {
        const charCode = this.content.charCodeAt(i);
        // 判断字符是汉字还是其他字符
        if (charCode > 0x7f) {
          byteLength += 3; // 汉字占 3 字节
        } else {
          byteLength += 1; // 英文字符占 1 字节
        }
      }
      if (byteLength > 2000) {
        this.$message.error('内容超出长度限制，当前字节数:' + byteLength);
        return false;
      }
      // 空值校验
      if (this.content.trim() === '') {
        this.content = ''
        return this.$message.error("请输入内容！")
      }
      // 校验通过，禁用按钮，开始输出内容
      this.btnForbidden = true
      // this.btnForbidden=true
      // 定义初始内容
      // 中转值，后续用打字机慢慢将数组存到真实数组里
      let buffer = ""
      // 定时器,打字机效果
      let timer;
      // 当前存储的下标
      let char_index = 0
      // 标志用于检测是否是第一条消息,用来清空等待时的内容
      let isFirstMessage = true;
      this.chatRecord.push(
          // 初始化用户输入字符串
          {role: `${this.$store.state.user.name}:`, content: this.content},
          // 初始化机器人输出字符串
          {role: "Zww:", content: "让我想想🧐，稍等一下. . . . . . . . . . . ."},
      )
      // 拷贝引用，后续往里填值
      let ai = this.chatRecord[this.chatRecord.length - 1]
//       encodeURIComponent 函数将字符串中的特殊字符转换为可以在 URL 中安全使用的格式，通常是百分号编码（URL 编码）。
//       在 URL 中，一些字符是保留字符，具有特殊含义（如 ?, &, = 等）。如果你要在 URL 中使用这些字符，就需要将它们进行编码。
//       空格 ( ) 被编码为 %20
//       & 被编码为 %26
//           = 被编码为 %3D
//       / 被编码为 %2F
      const uriContent = encodeURIComponent(this.content)
      // this.eventsource = new EventSourcePolyfill(`http://localhost:8080/quiz/student/chat/openSseRaw?content=${uriContent}`,
      this.eventsource = new EventSourcePolyfill(`${process.env.VUE_APP_BASE_API}/quiz/student/chat/openSseRaw?content=${uriContent}`,
          {
            headers: {
              'Authorization': 'Bearer ' + getToken()
            }
          },
          {withCredentials: true})
      //置空内容
      this.content = ""
      this.eventsource.onerror = (e) => {
        this.eventsource.close(); // 可选: 在错误时关闭连接
        this.btnForbidden = false
      };
      this.eventsource.onmessage = (event) => {
        // 在收到第一条消息时，清空机器人的输出内容
        if (isFirstMessage) {
          ai.content = ""; // 清空机器人的输出内容
          isFirstMessage = false; // 设置为 false，表示后续的消息不再清空
        }
        let data = JSON.parse(event.data);
        // 判断是否为最后一条消息，如果是则清空定时器
        if (data.is_end) {
          // 等待最后一个定时器清除
          let lastInterval
          lastInterval = setInterval(() => {
            if (timer == null) {
              console.log("over")
              clearInterval(lastInterval)
              lastInterval = null
              this.btnForbidden = false;
              return;
            }
          }, 250)
          this.eventsource.close();
        }
        // console.log("收到一条新消息" + data.result)
        buffer += data.result
        // 获取新的信息并将其设置到数组
        // 这里可以更新 DOM 或执行其他操作
        if (timer == null) {
          timer = setInterval(() => {
            // 用户关闭了该输出
            if (this.preStop) {
              clearInterval(timer)
              timer = null
              this.btnForbidden = false
              this.eventsource.close()
              return
            }
            //这里我们给一个定时器设置异步打字机效果 从0开始一直到内容的长度 依次输出
            if (char_index < buffer.length) {
              // 如果从0，从头开始算，没有自增到内容结尾，那么就慢慢一直输出到数组值里
              ai.content += buffer.charAt(char_index)
              // 实时滚动条, 实时卷去总高度，这样就能一直在最底下了
              if (this.srcollBottom) {
                const output = this.$refs.output;
                output.scrollTop = output.scrollHeight
              }
              char_index++
            } else {
              // 输出结束后清除定时器，等待下一个流来开启
              clearInterval(timer)
              // 置空，下次判断为空则开启新定时器，
              // 以免出现流太慢到达而导致char_index提前自增到text.length
              timer = null
              // 如果已经是最后一条消息，那么按钮恢复
            }
          }, 1000 / this.speed)
        }
      };
    },
    async clearContext() {

      // 关闭客户端消息接收事件对象,空值校验，防止用户未开启而导致的空指针错误
      if (this.eventsource) {
        this.eventsource.close()
        // 清除定时器
        clearInterval(this.timer)
        // 置空定时器
        this.timer = null
        // 发送请求给后端，告知清除session数据，下次线程则不会获取老的聊天记录
        const res = await clearRecord();
        res.code === 200 ? this.$message.success("清除记忆成功！") : this.$message.error("清除记忆失败！")
      }
    },
    handleUpload() {
      // 触发文件输入框的点击事件
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        console.log(file.name)
      }
    },
    stopOutput() {
      this.btnForbidden = false
      this.preStop = true;
      this.eventsource.close()
      stopStream()
      this.$message.success("停止回复成功")
    },
    // 按住shift加换行 不触发回车发送事件
    handleEnter(event) {
      // 检查是否按住 Shift 键
      if (event.shiftKey) {
        // 允许换行
        return; // 不做任何处理
      } else {
        // 阻止默认行为并触发发送事件
        event.preventDefault();
        if (!this.btnForbidden) {
          this.sendChatBySse();
        }
      }
    },
    handleCopySuccess() {
      this.$message.success("复制成功")
    },
  },
}
</script>

<style scoped>

</style>
