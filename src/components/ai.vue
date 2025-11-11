<!--
*@ai
*@author niemengshi
*@date 2024/10/26 11:12
-->
<template>
  <!--内容输出区域-->
  <!--加入滚动溢出，使得上半部分内容区域超出高度后出现滚动条-->
  <div class="fixed top-20 right-0  bg-white  " :class="isCollapsed ? 'w-1/4' : 'w-full'" style="height: calc(100vh - 80px );
           z-index: 2;
           transition: all 0.3s;
              max-height:100%;display: flex;flex-direction: column;justify-content: space-between;
">
    <!-- 功能区域 -->
    <div style="position: absolute;top: -10px;z-index: 999;display: flex;align-items: center">
      <el-button style="height: 40px;" @click="toggleCollapse" v-if="needCollapse">
        展开/收缩
      </el-button>
      <!-- <span class="bg-black text-white"
            style="width:140px;height: 40px; display: block;line-height: 40px ;margin-left: 20px;border-radius: 20px 0 0 20px;font-size: 14px;text-align: center">修改当前回复速度:</span>
      <el-input :disabled="btnForbidden" style="width: 80px;" v-model="speed"></el-input> -->
    </div>


    <!-- 回复区域 -->
    <div style=" overflow: auto;  " ref="output">
      <el-descriptions :column=1 border size="small" style="width: 100% ;">
        <el-descriptions-item :label="record.role"
                              :label-style="{ width: '0px', fontWeight: 'bolder', color: record.role === 'Zww:' ? '#be0a00' : '#2400c5' }"
                              v-for="(record, index) in chatRecord" :key="index">
          <!--<span v-html="record.content"></span>-->
          <!--<div class="markdown-body">-->
          <!--  <VueMarkdown   :source="record.content"></VueMarkdown>-->
          <!--</div>-->
          <!--<div class="show" v-html="renderMdText(record.content)"></div>-->
          <div class="restore-list">
            <v-md-preview class="listBack" :text="record.content" @copy-code-success="handleCopySuccess"
                          style="max-width: 100vh;min-width: 100%;list-style: disc"></v-md-preview>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>



    <!--内容输入区域-->
    <div style="position: relative
     ">
      <!--停止输出按钮-->
      <el-button @click="stopOutput"
                 style="position: absolute ;box-shadow: 0px 5px 8px rgba(0,0,0,0.4);top: 0;left: 50%;transform:translateX(-50%)translateY(-110%);z-index: 2;height: 40px"
                 type="warning" v-if="btnForbidden">停止生成
      </el-button>
      <el-row>
        <el-col :span="4">
          <el-button @click="clearContext" :disabled="btnForbidden"
                     :style="btnForbidden ? 'background: #be0a00;' : 'background:#008a77'"
                     style="width: 100%;height: 75px;text-align: center; white-space: wrap; font-size: 14px;padding: 5px;color: white">
            清除记忆
          </el-button>
        </el-col>
        <el-col :span="16">
          <el-input type="textarea" @keyup.enter.native="handleEnter" placeholder="请输入内容" v-model="content" :rows="3"
                    resize="none" style="width: 100%">
          </el-input>
        </el-col>
        <el-col :span="4" style="position: relative">
          <div style="position: absolute;top: 50%;left:-50px;transform: translateY(-45%);cursor: pointer "
               @click="handleUpload">
            <svg t="1729773874203" class="icon  " viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="4436" width="40" height="40">
              <path d="M677.888 494.592q0 28.672-10.752 53.76t-29.184 43.52-43.008 29.184-53.248 10.752-53.248-10.752-43.008-29.184-29.184-43.52-10.752-53.76q0-27.648 10.752-52.736t29.184-43.52 43.008-29.184 53.248-10.752 53.248 10.752 43.008 29.184 29.184 43.52 10.752 52.736zM171.008 766.976q-28.672 0-51.2-5.12t-37.888-17.408-23.552-33.28-8.192-52.736l0-346.112q0-57.344 27.136-79.872t85.504-22.528l172.032 0q16.384 0 27.136-6.144t17.408-16.384 11.776-24.064 11.264-28.16q10.24-26.624 35.84-46.08t58.368-19.456l95.232 0q37.888 0 61.952 20.992t32.256 44.544q11.264 30.72 29.696 52.736t38.912 22.016l130.048 0q45.056-1.024 71.68 24.576t26.624 74.752l0 351.232q0 52.224-27.648 79.36t-73.728 27.136l-710.656 0zM539.648 280.576q-45.056 0-83.968 16.896t-67.584 46.08-45.568 68.096-16.896 82.944q0 45.056 16.896 83.968t45.568 67.584 67.584 45.568 83.968 16.896q44.032 0 82.944-16.896t67.584-45.568 45.568-67.584 16.896-83.968q0-44.032-16.896-82.944t-45.568-68.096-67.584-46.08-82.944-16.896zM611.328 169.984q0-16.384-1.536-25.6t-20.992-9.216l-84.992 0q-19.456-1.024-20.992 8.192t-1.536 26.624q-1.024 19.456 2.048 27.648t20.48 8.192l84.992 0q19.456 0 20.992-9.216t1.536-26.624z"
                    p-id="4437"></path>
            </svg>
          </div>
          <!--隐藏的表单域-->
          <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" />
          <el-button type="primary" style="height: 75px;width: 100%;" @click="sendChatBySse" :disabled="btnForbidden"
                     :style="btnForbidden ? 'background: #be0a00;' : 'background: #6047cb;'">
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
import { clearRecord, stopStream } from "@/api/ai";
import { EventSourcePolyfill } from 'event-source-polyfill';
import { getToken } from "@/utils/auth";
import { debounce } from 'lodash'; // 需要添加lodash依赖

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
      // 新增缓冲区大小
      bufferChunkSize: 10,
      // 缓存当前打字机位置
      char_index: 0,
      // 缓存消息内容
      messageBuffer: "",
      // 使用requestAnimationFrame的ID
      animationFrameId: null,
      // 上次更新时间
      lastUpdateTime: 0,
      // 更新频率 (毫秒)
      updateInterval: 16, // 约60fps
    }
  },
  created() {
    // 创建节流后的滚动函数
    this.scrollToBottom = debounce(this.performScrollToBottom, 100);
  },
  beforeDestroy() {
    this.clearTimers();
    this.clearContext();
  },
  methods: {
    performScrollToBottom() {
      if (this.srcollBottom && this.$refs.output) {
        this.$refs.output.scrollTop = this.$refs.output.scrollHeight;
      }
    },
    clearTimers() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed; // 切换局部状态
    },
    sendChatBySse() {
      // 禁用多余的日志输出
      // console.log('当前速度为');
      // console.log('当前速度为' + this.speed);

      this.preStop = false;

      // 使用更高效的字节计算方法
      const byteLength = new Blob([this.content]).size;
      if (byteLength > 2000) {
        this.$message.error('内容超出长度限制，当前字节数:' + byteLength);
        return false;
      }

      // 空值校验
      if (this.content.trim() === '') {
        this.content = '';
        return this.$message.error("请输入内容！");
      }

      // 校验通过，禁用按钮，开始输出内容
      this.btnForbidden = true;

      // 重置缓冲区和索引
      this.messageBuffer = "";
      this.char_index = 0;

      // 清除之前的定时器
      this.clearTimers();

      // 标志用于检测是否是第一条消息
      let isFirstMessage = true;

      this.chatRecord.push(
        // 用户消息
        { role: `${this.$store.state.user.name}:`, content: this.content },
        // AI响应占位
        { role: "Zww:", content: "让我想想🧐，稍等一下. . . . . ." },
      );

      // 获取AI消息引用
      const ai = this.chatRecord[this.chatRecord.length - 1];

      // URL编码内容
      const uriContent = encodeURIComponent(this.content);

      // 创建EventSource连接
      this.eventsource = new EventSourcePolyfill(
        `${process.env.VUE_APP_BASE_API}/quiz/student/chat/openSseRaw?content=${uriContent}`,
        {
          headers: { 'Authorization': 'Bearer ' + getToken() },
          withCredentials: true
        }
      );

      // 清空输入框
      this.content = "";

      // 错误处理
      this.eventsource.onerror = (e) => {
        console.error("SSE连接错误:", e);
        this.eventsource.close();
        this.btnForbidden = false;
        this.clearTimers();
      };

      // 消息处理
      this.eventsource.onmessage = (event) => {
        console.log(event)
        // 清空等待提示
        if (isFirstMessage) {
          ai.content = "";
          isFirstMessage = false;
        }

        try {
          const data = JSON.parse(event.data);

          // 添加到缓冲区
          this.messageBuffer += data.result || "";

          // 如果是结束消息
          if (data.is_end) {
            // 使用requestAnimationFrame完成剩余文本显示
            this.completeTextDisplay(ai);
            this.eventsource.close();
          }

          // 启动或继续打字机效果
          this.startOrContinueTypingEffect(ai);

        } catch (error) {
          console.error("处理消息时出错:", error);
        }
      };
    },

    // 使用requestAnimationFrame实现更平滑的打字机效果
    startOrContinueTypingEffect(ai) {
      if (!this.animationFrameId) {
        this.lastUpdateTime = performance.now();
        this.typeNextChunk(ai);
      }
    },

    typeNextChunk(ai) {
      if (this.preStop) {
        this.clearTimers();
        this.btnForbidden = false;
        if (this.eventsource) {
          this.eventsource.close();
        }
        return;
      }

      const now = performance.now();
      const elapsed = now - this.lastUpdateTime;

      // 根据设定的速度和时间间隔计算应该显示的字符数
      if (elapsed >= this.updateInterval) {
        this.lastUpdateTime = now;

        // 计算这次应该添加多少字符
        const charsToAdd = Math.max(1, Math.floor((this.speed / 60) * (elapsed / 16)));

        if (this.char_index < this.messageBuffer.length) {
          // 添加一块字符而不是一个字符，提高性能
          const endIndex = Math.min(this.char_index + charsToAdd, this.messageBuffer.length);
          const chunk = this.messageBuffer.substring(this.char_index, endIndex);
          ai.content += chunk;
          this.char_index = endIndex;

          // 定期滚动，而不是每次都滚动
          this.scrollToBottom();
        } else if (this.messageBuffer.length > 0 && this.char_index >= this.messageBuffer.length) {
          // 当前缓冲区已处理完
          this.clearTimers();
          this.btnForbidden = this.eventsource !== null; // 仅当仍有连接时保持禁用
          return;
        }
      }

      // 继续下一帧
      this.animationFrameId = requestAnimationFrame(() => this.typeNextChunk(ai));
    },

    // 快速完成剩余文本显示
    completeTextDisplay(ai) {
      // 取消现有动画
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // 设置最终的完整文本
      setTimeout(() => {
        ai.content = this.messageBuffer;
        this.scrollToBottom();
        this.btnForbidden = false;
      }, 300); // 短暂延迟以确保用户能感知到文本已完成
    },

    async clearContext() {
      // 关闭事件源
      if (this.eventsource) {
        this.eventsource.close();
        this.eventsource = null;
      }

      // 清除所有计时器
      this.clearTimers();

      // 发送请求给后端清除会话
      try {
        const res = await clearRecord();
        if (res.code === 200) {
          this.$message.success("清除记忆成功！");
          // 重置聊天记录
          this.chatRecord = [{
            role: "Zww:", content: "嗨嗨嗨,又见面了老壁灯😚,Zww在线为你解答世间万物"
          }];
        } else {
          this.$message.error("清除记忆失败！");
        }
      } catch (error) {
        console.error("清除记忆出错:", error);
        this.$message.error("清除记忆请求出错！");
      }
    },

    handleUpload() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        // 这里添加文件处理逻辑
        console.log("选择的文件:", file.name);
      }
    },

    stopOutput() {
      this.btnForbidden = false;
      this.preStop = true;

      if (this.eventsource) {
        this.eventsource.close();
        this.eventsource = null;
      }

      this.clearTimers();

      // 快速完成当前文本显示
      const ai = this.chatRecord[this.chatRecord.length - 1];
      if (ai && ai.role === "Zww:") {
        ai.content = this.messageBuffer;
      }

      stopStream().then(() => {
        this.$message.success("停止回复成功");
      }).catch(error => {
        console.error("停止回复出错:", error);
      });
    },

    handleEnter(event) {
      if (event.shiftKey) {
        return; // 允许换行
      } else {
        event.preventDefault();
        if (!this.btnForbidden) {
          this.sendChatBySse();
        }
      }
    },

    handleCopySuccess() {
      this.$message.success("复制成功");
    },
  },
}
</script>

<style scoped></style>
