<!--
*@index
*@author Zww
*@date 2024/10/7 9:05
-->
<template>
  <wrapper size="md" padding="0">
    <!--左侧题目进度-->
    <el-card class="fixed top-20 left-0 w-1/4 ">
      <div class="difficulty-switch-row">
        <span class="difficulty-switch-label">显示难度</span>
        <el-switch
            v-model="showDifficultyTag"
            active-text="开"
            inactive-text="关">
        </el-switch>
      </div>
      <template v-if="!antiCheatActive">
        <!-- 按加入顺序：左侧不按题型分组，直接一列题号 -->
        <template v-if="(formData.numberMode || 2) === 2">
          <div class="questType">
            <p class="mb-2">题目列表</p>
            <div class="question-anchor flex flex-wrap">
              <el-tag
                  v-for="question in orderedQuestions"
                  :key="question.id != null ? `q-${question.id}` : `order-${question.itemOrder}-${question.questionType || 't'}`"
                  :type="getQuestionTagType(question.itemOrder)"
                  @click="handleQuestionAnchorClick(question.itemOrder)"
                  style="padding: 0; display: flex; justify-content: center; width: calc(20% - 10px); height: 30px;margin: 5px"
                  :class="['cursor-pointer', 'anchor-tag', {'current-question': question.itemOrder === currentQuestionOrder}]">
                <span class="anchor-tag-number">{{ getDisplayNumberByOrder(question.itemOrder) }}</span>
                <span
                    v-if="showDifficultyTag && getDifficultyLevel(question) !== null"
                    class="anchor-difficulty-badge"
                    :class="getDifficultyClass(question)">
                  {{ getDifficultyShortText(question) }}
                </span>
              </el-tag>
            </div>
          </div>
        </template>

        <!-- 按题型分组：左侧按题型分块 -->
        <div v-else class="questType" v-for="(questType,index) in formData.paperQuestionTypeDto" :key=index>
          <p class="mb-2">{{ getQuestionTypeName(questType) }}</p>
        <div class="question-anchor  flex flex-wrap  ">
          <el-tag
              @click="handleQuestionAnchorClick(question.itemOrder)"
              v-for="(question, qIndex) in getAnchorQuestions(questType)" :key="qIndex"
              :type="getQuestionTagType(question.itemOrder)"
              style="padding: 0; display: flex; justify-content: center; width:  calc(20% - 10px); height: 30px;margin: 5px"
              :class="['cursor-pointer', 'anchor-tag', {'current-question': question.itemOrder === currentQuestionOrder}]">
            <span class="anchor-tag-number">{{ getDisplayNumberByOrder(question.itemOrder) }}</span>
            <span
                v-if="showDifficultyTag && getDifficultyLevel(question) !== null"
                class="anchor-difficulty-badge"
                :class="getDifficultyClass(question)">
              {{ getDifficultyShortText(question) }}
            </span>
          </el-tag>
        </div>
      </div>
      </template>
      <template v-else>
        <div class="questType">
          <p class="mb-2">题目列表</p>
          <div class="question-anchor flex flex-wrap">
            <el-tag
                v-for="(question, qIndex) in orderedQuestions"
                :key="question.id != null ? `q-${question.id}` : `order-${question.itemOrder}-${qIndex}`"
                :type="getQuestionTagType(question.itemOrder, qIndex)"
                @click="handleQuestionAnchorClick(question.itemOrder, qIndex)"
                style="padding: 0; display: flex; justify-content: center; width: calc(20% - 10px); height: 30px;margin: 5px"
                :class="['cursor-pointer', 'anchor-tag', {'current-question': antiCheatActive && qIndex === currentQuestionIndex}]">
              <span class="anchor-tag-number">{{ qIndex + 1 }}</span>
              <span
                  v-if="showDifficultyTag && getDifficultyLevel(question) !== null"
                  class="anchor-difficulty-badge"
                  :class="getDifficultyClass(question)">
                {{ getDifficultyShortText(question) }}
              </span>
            </el-tag>
          </div>
        </div>
      </template>
    </el-card>
    <!--中间题目内容-->
    <div class="container" v-if="!antiCheatActive">
      <!-- 按加入顺序：不按题型分组渲染 -->
      <template v-if="(formData.numberMode || 2) === 2">
        <div class="question-item p-4"
             v-for="(it, idx) in getFlatDisplayItems()"
             :key="idx">
          <!-- 普通题 -->
          <template v-if="it.kind === 'question'">
            <div class="q-title">
              <span class="break-words w-full">
                <span>
                  <span class="text-red-800 font-bold mr-2" :id="it.question.itemOrder">
                    {{ getQuestionDisplayNumber(it.question) }}.
                  </span>
                  <span class="question-title-content"
                        :class="{'markdown-body': it.question.questionTitleFormat === 'markdown'}"
                        v-html="renderContent(it.question.questionTitle, it.question.questionTitleFormat)"></span>
                </span>
                <span class="font-bold text-red-600">
                  ({{ it.question.score }}分)
                </span>
              </span>
            </div>
            <div class="q-options p-6 flex flex-col ">
              <!-- 复用现有渲染：通过临时变量别名 -->
              <template v-if="true">
                <!-- 单选 -->
                <el-radio-group
                    v-if="it.question.questionType===1"
                    v-removeAria
                    v-model="answerMap[it.question.itemOrder].content"
                    @change="handleSingleRadioChange(it.question.itemOrder, $event)">
                  <el-radio class="py-2" :label="selection.prefix"
                            v-for="(selection,index) in it.question.items" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ selection.prefix }}.</span>
                      <span class="option-text" :class="{'markdown-body': it.question.optionFormat === 'markdown'}"
                            v-html="renderContent(selection.content, it.question.optionFormat)"></span>
                    </span>
                  </el-radio>
                </el-radio-group>
                <!-- 多选 -->
                <el-checkbox-group v-model="answerMap[it.question.itemOrder].contentArray"
                                   v-if="it.question.questionType===2"
                                   @change="updateCompletedStatus(it.question.itemOrder)">
                  <el-checkbox v-for="(checkBox,index) in it.question.items" :label="checkBox.prefix" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ checkBox.prefix }}.</span>
                      <span class="option-text" :class="{'markdown-body': it.question.optionFormat === 'markdown'}"
                            v-html="renderContent(checkBox.content, it.question.optionFormat)"></span>
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <!-- 判断 -->
                <el-radio-group
                    v-if="it.question.questionType===4"
                    v-model="answerMap[it.question.itemOrder].content"
                    @change="updateCompletedStatus(it.question.itemOrder)"
                    v-removeAria>
                  <el-radio class="py-2" :label="selection.prefix"
                            v-for="(selection,index) in it.question.items" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ selection.prefix }}.</span>
                      <span class="option-text" :class="{'markdown-body': it.question.optionFormat === 'markdown'}"
                            v-html="renderContent(selection.content, it.question.optionFormat)"></span>
                    </span>
                  </el-radio>
                </el-radio-group>
                <!-- 主观 -->
                <editor
                    v-if="it.question.questionType===3"
                    class="answer-rich-text"
                    :min-height="220"
                    :placeholder="'请输入答案（可插入图片、富文本）'"
                    v-model="answerMap[it.question.itemOrder].content"
                    @on-change="handleTextChange(it.question.itemOrder, $event)"
                />
                <!-- 填空 -->
                <div v-if="it.question.questionType===5" class="fill-blank-answers">
                  <div
                      v-for="(answerItem, index) in getFillBlankAnswerList(it.question)"
                      :key="index"
                      class="fill-blank-item"
                      style="margin-bottom: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: #606266;">
                      第{{ index + 1 }}空：
                    </div>
                    <el-input
                        :value="answerMap[it.question.itemOrder].contentArray[index] || ''"
                        :placeholder="`请输入第${index + 1}空答案`"
                        @input="updateFillBlankAnswer(it.question.itemOrder, index, $event)"
                    />
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- 完形父题 + 子题 -->
          <template v-else>
            <div class="part bg-gray-100 p-4 text-black">
              完形填空题（父题+子题）
            </div>
            <div class="q-title p-4">
              <span class="question-title-content"
                    :class="{'markdown-body': it.question.questionTitleFormat === 'markdown'}"
                    v-html="renderContent(it.question.questionTitle, it.question.questionTitleFormat)"></span>
            </div>
            <div class="cloze-body p-6">
              <div
                  v-for="child in getClozeChildren(it.question)"
                  :key="child.id"
                  class="cloze-item mb-6 border-b pb-4">
                <div class="font-bold mb-2 text-gray-700">
                  <span class="text-red-800 font-bold mr-2" :id="child.itemOrder">
                    {{ getQuestionDisplayNumber(child) }}.
                  </span>
                  （{{ child.score }}分）
                </div>
                <div v-if="child.questionTitle"
                     class="mb-2"
                     :class="{'markdown-body': child.questionTitleFormat === 'markdown'}"
                     v-html="renderContent(child.questionTitle, child.questionTitleFormat)">
                </div>
                <el-radio-group
                    v-if="child.questionType === 1"
                    v-removeAria
                    v-model="answerMap[child.itemOrder].content"
                    @change="handleSingleRadioChange(child.itemOrder, $event)">
                  <el-radio class="py-2" :label="selection.prefix"
                            v-for="(selection,index) in child.items" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ selection.prefix }}.</span>
                      <span class="option-text"
                            :class="{'markdown-body': child.optionFormat === 'markdown'}"
                            v-html="renderContent(selection.content, child.optionFormat)"></span>
                    </span>
                  </el-radio>
                </el-radio-group>
                <el-checkbox-group v-if="child.questionType === 2"
                                   v-model="answerMap[child.itemOrder].contentArray"
                                   @change="updateCompletedStatus(child.itemOrder)">
                  <el-checkbox v-for="(checkBox,index) in child.items"
                               :label="checkBox.prefix"
                               :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ checkBox.prefix }}.</span>
                      <span class="option-text"
                            :class="{'markdown-body': child.optionFormat === 'markdown'}"
                            v-html="renderContent(checkBox.content, child.optionFormat)"></span>
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-radio-group
                    v-if="child.questionType === 4"
                    v-model="answerMap[child.itemOrder].content"
                    @change="updateCompletedStatus(child.itemOrder)"
                    v-removeAria>
                  <el-radio class="py-2" :label="selection.prefix"
                            v-for="(selection,index) in child.items" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ selection.prefix }}.</span>
                      <span class="option-text"
                            :class="{'markdown-body': child.optionFormat === 'markdown'}"
                            v-html="renderContent(selection.content, child.optionFormat)"></span>
                    </span>
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- 按题型分组：保持原有渲染 -->
      <div v-else class="questionTypeBody" v-for="(questType,index)  in formData.paperQuestionTypeDto" :key="index">
        <div class="part bg-gray-100 p-4 text-black">
          {{ getQuestionTypeName(questType) }}
        </div>
        <div class="question-item p-4"
             v-for="(questionItem, index) in getDisplayQuestions(questType)"
             :key="questionItem.id != null ? `q-${questionItem.id}` : `order-${questionItem.itemOrder}-${index}`">
          <!-- 普通题 & 非完形父题 -->
          <template v-if="questionItem.questionType !== 6">
          <div class="q-title">

              <span class="break-words w-full">
                <span>
                  <span class="text-red-800 font-bold mr-2" :id="questionItem.itemOrder">{{ 
                      getQuestionDisplayNumber(questionItem)
                    }}.</span>
                  <span class="question-title-content" :class="{'markdown-body': questionItem.questionTitleFormat === 'markdown'}" v-html="renderContent(questionItem.questionTitle, questionItem.questionTitleFormat)"></span>
                </span>
                <span class="font-bold text-red-600">
                    ({{
                    questionItem.score
                  }}分)
                </span>
              </span>

          </div>


          <div class="q-options p-6 flex flex-col ">
            <!--只要选了，就把该题目的完成状态为true-->
            <el-radio-group
                v-if="questionItem.questionType===1"
                v-removeAria
                v-model="answerMap[questionItem.itemOrder].content"
                @change="handleSingleRadioChange(questionItem.itemOrder, $event)">
              <el-radio class="py-2" :label="selection.prefix"
                        v-for="(selection,index) in questionItem.items" :key="index">
                <span class="option-content">
                  <span class="option-prefix">{{ selection.prefix }}.</span>
                  <span class="option-text" :class="{'markdown-body': questionItem.optionFormat === 'markdown'}" v-html="renderContent(selection.content, questionItem.optionFormat)"></span>
                </span>
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-model="answerMap[questionItem.itemOrder].contentArray"
                               v-if="questionItem.questionType===2"
                               @change="updateCompletedStatus(questionItem.itemOrder)"
            >
              <el-checkbox v-for="(checkBox,index) in questionItem.items" :label="checkBox.prefix" :key="index">
                <span class="option-content">
                  <span class="option-prefix">{{ checkBox.prefix }}.</span>
                  <span class="option-text" :class="{'markdown-body': questionItem.optionFormat === 'markdown'}" v-html="renderContent(checkBox.content, questionItem.optionFormat)"></span>
                </span>
              </el-checkbox>
            </el-checkbox-group>
            <el-radio-group
                v-if="questionItem.questionType===4"
                v-model="answerMap[questionItem.itemOrder].content"
                @change="updateCompletedStatus(questionItem.itemOrder)"
                v-removeAria>
              <el-radio class="py-2" :label="selection.prefix"
                        v-for="(selection,index) in questionItem.items" :key="index">
                <span class="option-content">
                  <span class="option-prefix">{{ selection.prefix }}.</span>
                  <span class="option-text" :class="{'markdown-body': questionItem.optionFormat === 'markdown'}" v-html="renderContent(selection.content, questionItem.optionFormat)"></span>
                </span>
              </el-radio>
            </el-radio-group>
            <editor
                v-if="questionItem.questionType===3"
                class="answer-rich-text"
                :min-height="220"
                :placeholder="'请输入答案（可插入图片、富文本）'"
                v-model="answerMap[questionItem.itemOrder].content"
                @on-change="handleTextChange(questionItem.itemOrder, $event)"
            />
            <!-- 填空题：根据标准答案数量显示多个输入框 -->
            <div v-if="questionItem.questionType===5" class="fill-blank-answers">
              <!-- 答案顺序提示 -->
              <div 
                v-if="questionItem.requireOrder !== undefined" 
                style="margin-bottom: 10px; padding: 8px 12px; border-radius: 4px;"
                :style="questionItem.requireOrder ? 'background-color: #fff7e6; border: 1px solid #ffd591;' : 'background-color: #f0f9ff; border: 1px solid #91d5ff;'"
              >
                <i 
                  :class="questionItem.requireOrder ? 'el-icon-warning' : 'el-icon-info'" 
                  :style="questionItem.requireOrder ? 'color: #fa8c16;' : 'color: #1890ff;'"
                ></i>
                <span 
                  style="margin-left: 5px; font-size: 13px;"
                  :style="questionItem.requireOrder ? 'color: #fa8c16;' : 'color: #1890ff;'"
                >
                  {{ questionItem.requireOrder ? '⚠️ 注意：答案必须按照标准答案的顺序填写' : '💡 提示：答案可以不按顺序填写，系统会自动匹配' }}
                </span>
              </div>
              <div 
                v-for="(answerItem, index) in getFillBlankAnswerList(questionItem)" 
                :key="index"
                class="fill-blank-item"
                style="margin-bottom: 15px;"
              >
                <div style="font-weight: bold; margin-bottom: 5px; color: #606266;">
                  第{{ index + 1 }}空：
                </div>
                <el-input
                  :value="answerMap[questionItem.itemOrder].contentArray[index] || ''"
                  :placeholder="`请输入第${index + 1}空答案`"
                  @input="updateFillBlankAnswer(questionItem.itemOrder, index, $event)"
                />
              </div>
            </div>
          </div>
          </template>

          <!-- 完形填空父题：题干 + 多个子题（父题本身不占题号） -->
          <template v-else>
            <div class="q-title">
              <span class="break-words w-full">
                <span>
                  <span class="question-title-content"
                        :class="{'markdown-body': questionItem.questionTitleFormat === 'markdown'}"
                        v-html="renderContent(questionItem.questionTitle, questionItem.questionTitleFormat)"></span>
                </span>
                <span class="font-bold text-red-600">
                  （完形填空）
                </span>
              </span>
            </div>

            <div class="cloze-body p-6">
              <div
                  v-for="child in getClozeChildren(questionItem)"
                  :key="child.id"
                  class="cloze-item mb-6 border-b pb-4">
                <div class="font-bold mb-2 text-gray-700">
                  <!-- 子题按全局题号连续编号，父题不计入 -->
                  <span class="text-red-800 font-bold mr-2" :id="child.itemOrder">
                    {{ getQuestionDisplayNumber(child) }}.
                  </span>
                  <!-- 在按题型分组模式下，额外显示“第几空”提示 -->
                  <span v-if="(formData.numberMode || 2) === 1">
                    第{{ child.clozeIndex || 0 }}空
                  </span>
                  （{{ child.score }}分）
                </div>
                <!-- 子题题干（如果有单独题干的话） -->
                <div v-if="child.questionTitle"
                     class="mb-2"
                     :class="{'markdown-body': child.questionTitleFormat === 'markdown'}"
                     v-html="renderContent(child.questionTitle, child.questionTitleFormat)">
                </div>
                <!-- 单选 -->
                <el-radio-group
                    v-if="child.questionType === 1"
                    v-removeAria
                    v-model="answerMap[child.itemOrder].content"
                    @change="handleSingleRadioChange(child.itemOrder, $event)">
                  <el-radio class="py-2" :label="selection.prefix"
                            v-for="(selection,index) in child.items" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ selection.prefix }}.</span>
                      <span class="option-text"
                            :class="{'markdown-body': child.optionFormat === 'markdown'}"
                            v-html="renderContent(selection.content, child.optionFormat)"></span>
                    </span>
                  </el-radio>
                </el-radio-group>
                <!-- 多选 -->
                <el-checkbox-group v-if="child.questionType === 2"
                                   v-model="answerMap[child.itemOrder].contentArray"
                                   @change="updateCompletedStatus(child.itemOrder)">
                  <el-checkbox v-for="(checkBox,index) in child.items"
                               :label="checkBox.prefix"
                               :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ checkBox.prefix }}.</span>
                      <span class="option-text"
                            :class="{'markdown-body': child.optionFormat === 'markdown'}"
                            v-html="renderContent(checkBox.content, child.optionFormat)"></span>
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <!-- 判断 -->
                <el-radio-group
                    v-if="child.questionType === 4"
                    v-model="answerMap[child.itemOrder].content"
                    @change="updateCompletedStatus(child.itemOrder)"
                    v-removeAria>
                  <el-radio class="py-2" :label="selection.prefix"
                            v-for="(selection,index) in child.items" :key="index">
                    <span class="option-content">
                      <span class="option-prefix">{{ selection.prefix }}.</span>
                      <span class="option-text"
                            :class="{'markdown-body': child.optionFormat === 'markdown'}"
                            v-html="renderContent(selection.content, child.optionFormat)"></span>
                    </span>
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="container" v-else>
      <div class="questionTypeBody" v-if="currentQuestion">
        <div class="part bg-gray-100 p-4 text-black">
          {{ currentQuestion.questTypeName }}
        </div>
        <div class="question-item p-4">
          <div class="q-title">
              <span class="break-words w-full">
                <span>
                  <span class="text-red-800 font-bold mr-2" :id="currentQuestion.itemOrder">{{ 
                      getQuestionDisplayNumber(currentQuestion)
                    }}.</span>
                  <span class="question-title-content" :class="{'markdown-body': currentQuestion.questionTitleFormat === 'markdown'}" v-html="renderContent(currentQuestion.questionTitle, currentQuestion.questionTitleFormat)"></span>
                </span>
                <span class="font-bold text-red-600">
                    ({{
                    currentQuestion.score
                  }}分)
                </span>
              </span>
          </div>
          <div class="q-options p-6 flex flex-col ">
            <el-radio-group
                v-if="currentQuestion.questionType===1"
                v-removeAria
                v-model="answerMap[currentQuestion.itemOrder].content"
                @change="handleSingleRadioChange(currentQuestion.itemOrder, $event)">
              <el-radio class="py-2" :label="selection.prefix"
                        v-for="(selection,index) in currentQuestion.items" :key="index">
                <span class="option-content">
                  <span class="option-prefix">{{ selection.prefix }}.</span>
                  <span class="option-text" v-html="sanitizeHtml(selection.content)"></span>
                </span>
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-model="answerMap[currentQuestion.itemOrder].contentArray"
                               v-if="currentQuestion.questionType===2"
                               @change="updateCompletedStatus(currentQuestion.itemOrder)"
            >
              <el-checkbox v-for="(checkBox,index) in currentQuestion.items" :label="checkBox.prefix" :key="index">
                <span class="option-content">
                  <span class="option-prefix">{{ checkBox.prefix }}.</span>
                  <span class="option-text" v-html="sanitizeHtml(checkBox.content)"></span>
                </span>
              </el-checkbox>
            </el-checkbox-group>
            <el-radio-group
                v-if="currentQuestion.questionType===4"
                v-model="answerMap[currentQuestion.itemOrder].content"
                @change="updateCompletedStatus(currentQuestion.itemOrder)"
                v-removeAria>
              <el-radio class="py-2" :label="selection.prefix"
                        v-for="(selection,index) in currentQuestion.items" :key="index">
                <span class="option-content">
                  <span class="option-prefix">{{ selection.prefix }}.</span>
                  <span class="option-text" v-html="sanitizeHtml(selection.content)"></span>
                </span>
              </el-radio>
            </el-radio-group>
            <editor
                v-if="currentQuestion.questionType===3"
                class="answer-rich-text"
                :min-height="220"
                :placeholder="'请输入答案（可插入图片、富文本）'"
                v-model="answerMap[currentQuestion.itemOrder].content"
                @on-change="handleTextChange(currentQuestion.itemOrder, $event)"
            />
            <!-- 填空题：根据标准答案数量显示多个输入框 -->
            <div v-if="currentQuestion.questionType===5" class="fill-blank-answers">
              <!-- 答案顺序提示 -->
              <div 
                v-if="currentQuestion.requireOrder !== undefined" 
                style="margin-bottom: 10px; padding: 8px 12px; border-radius: 4px;"
                :style="currentQuestion.requireOrder ? 'background-color: #fff7e6; border: 1px solid #ffd591;' : 'background-color: #f0f9ff; border: 1px solid #91d5ff;'"
              >
                <i 
                  :class="currentQuestion.requireOrder ? 'el-icon-warning' : 'el-icon-info'" 
                  :style="currentQuestion.requireOrder ? 'color: #fa8c16;' : 'color: #1890ff;'"
                ></i>
                <span 
                  style="margin-left: 5px; font-size: 13px;"
                  :style="currentQuestion.requireOrder ? 'color: #fa8c16;' : 'color: #1890ff;'"
                >
                  {{ currentQuestion.requireOrder ? '⚠️ 注意：答案必须按照标准答案的顺序填写' : '💡 提示：答案可以不按顺序填写，系统会自动匹配' }}
                </span>
              </div>
              <div 
                v-for="(answerItem, index) in getFillBlankAnswerList(currentQuestion)" 
                :key="index"
                class="fill-blank-item"
                style="margin-bottom: 15px;"
              >
                <div style="font-weight: bold; margin-bottom: 5px; color: #606266;">
                  第{{ index + 1 }}空：
                </div>
                <el-input
                  :value="answerMap[currentQuestion.itemOrder].contentArray[index] || ''"
                  :placeholder="`请输入第${index + 1}空答案`"
                  @input="updateFillBlankAnswer(currentQuestion.itemOrder, index, $event)"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="question-navigation flex justify-between items-center p-4">
          <el-button
              @click="goToPrevQuestion"
              :disabled="currentQuestionIndex === 0"
          >
            上一题
          </el-button>
          <span>第 {{ currentQuestionIndex + 1 }} / {{ orderedQuestions.length }} 题</span>
          <el-button
              type="primary"
              @click="goToNextQuestion"
              :disabled="currentQuestionIndex === orderedQuestions.length - 1"
          >
            下一题
          </el-button>
        </div>
      </div>
    </div>

    <!--右侧题目介绍，倒计时-->
    <el-card class="fixed top-20 right-0 w-1/4 ">
      <p class="paper-name font-bolder text-xl">
        {{ formData.paperName || '试卷详情' }}
      </p>
      <div class="desc py-4 text-md leading-8  ">
        <p class="">试卷总分: {{ formData.score }}</p>
        <p class="">考试时长: {{ formData.suggestTime }}分钟</p>
      </div>
      <div class="desc py-4 text-sm leading-8 border-t-2 flex flex-col items-center">
        <p class="text-lg">剩余时间</p>
        <p class="font-bold text-2xl text-red-500">{{ formatSeconds(remainTime) }}</p>
      </div>
      <div class="desc py-4 text-sm leading-8 border-t-2 flex flex-col items-center">
        <button
            @click="submit"
            class="bg-red-700 text-white px-10 py-1 rounded-md">提交
        </button>
      </div>
    </el-card>
    
    <!-- 图片预览 -->
    <el-image-viewer
      v-if="imagePreview.visible"
      :url-list="imagePreview.urls"
      :initial-index="imagePreview.index"
      :on-close="closeImagePreview"
    />
  </wrapper>
</template>

<script>
  import wrapper from "@/components/wrapper.vue";
  import Editor from "@/components/Editor";
  import {getPaper} from "@/api/paper";
  import {submitAnswer} from "@/api/paperAnswer";
  import {formatSeconds} from "@/utils/time"
  import {getOrCreateShuffledOrder, clearShuffledOrder} from "@/utils/shuffle";
  import DOMPurify from 'dompurify';
  import ElImageViewer from "element-ui/packages/image/src/image-viewer";
  import { marked } from 'marked';
  import { renderMathInHtml, KATEX_ALLOWED_TAGS, KATEX_ALLOWED_ATTR } from '@/utils/katex';

export default {
  name: "index",
  props: {},
  mounted() {
    this.syncAntiCheatState()
    window.addEventListener('scroll', this.updateCurrentQuestionByScroll)
  },
  created() {
    const paramsId = this.$route.params.paperId
    const queryId = this.$route.query.paperId
    const paperId = paramsId || queryId
    if (paperId) {
      this.getPaperById(paperId)
    } else {
      this.$router.replace({path: '/home'})
    }
  },
  components: {wrapper, Editor, ElImageViewer},
  data() {
    return {
      timer: undefined,
      remainTime: undefined,
      cutScreenCount: 0,
      cutScreenLimit: 3,
      cutScreenCooldown: false,
      cutScreenCooldownTimer: null,
      // 记录安全事件句柄及提示节流
      securityHandlers: {},
      securityWarningCooldown: false,
      securityWarningTimer: null,
      // 控制是否启用防作弊（后续由试卷配置覆盖）
      antiCheatEnabled: true,
      antiCheatActive: false,
      orderedQuestions: [],
      questionIndexByOrder: {},
      // 按 itemOrder 快速找到题目对象（用于按原卷题号展示）
      questionByOrder: {},
      currentQuestionIndex: 0,
      // 开发者工具检测相关
      devToolsCheckTimer: null,
      devToolsDetected: false,
      // 浏览器环境检测
      browserEnvironmentTimer: null,
      showDifficultyTag: false,
      radio: '',
      formData: {},
      scrollCurrentQuestionOrder: -1,
      //试卷的回答,包含耗时和 该回答记录的id，和回答的所有问题集合
      answer: {
        doTime: 0,
        paperId: 1,
        // 所有回答的题目,完成状态，答案content，多选的contentArray存放多个答案，题序itemOrder,题目iD
        questionAnswerDtos: [
          // {
          //   completed: true,
          //   content: "B",
          //   itemOrder: 1,
          //   contentArray: ["A", "C"],
          //   questionId: 4
          // },
        ]
      },
      answerList: [
        {
          id: null, content: '', contentArray: []
        }
      ],
      questionTypeNameMap: {
        1: '单选题',
        2: '多选题',
        3: '主观题',
        4: '判断题',
        5: '填空题',
        6: '完形填空题'
      },
      isCollapse: false,
      // 图片预览
      imagePreview: {
        visible: false,
        urls: [],
        index: 0
      }
    }
  },
  // 组件销毁时清空定时器
  beforeDestroy() {
    window.clearInterval(this.timer)
    this.disableAntiCheatFeatures()
    window.removeEventListener('scroll', this.updateCurrentQuestionByScroll)
  },
  beforeRouteLeave(to, from, next) {
    this.resetShuffleCache()
    next()
  },
  watch: {
    antiCheatEnabled() {
      this.syncAntiCheatState()
    },
    // 深度监听答案数组的变化
    'answer.questionAnswerDtos': {
      handler(newVal) {
        if (!newVal) return;
        // 当答案内容变化时，自动更新completed状态
        newVal.forEach(answer => {
          if (!answer) return;
          let shouldBeCompleted = false;
          if (Array.isArray(answer.contentArray) && answer.contentArray.length > 0) {
            // 填空题：检查数组中的答案是否都有值
            shouldBeCompleted = answer.contentArray.every(a => a && a.toString().trim());
          } else if (answer.content) {
            const contentStr = answer.content.toString().trim();
            shouldBeCompleted = contentStr.length > 0;
          }
          
          // 如果状态不一致，更新它
          if (answer.completed !== shouldBeCompleted) {
            this.$set(answer, 'completed', shouldBeCompleted);
            console.log(`自动更新题目${answer.itemOrder} completed:`, shouldBeCompleted);
          }
        });
      },
      deep: true
    }
  },
  computed: {
    // 创建答案映射，通过itemOrder快速查找对应的答案
    answerMap() {
      const map = {}
      if (this.answer && this.answer.questionAnswerDtos) {
        this.answer.questionAnswerDtos.forEach(answer => {
          map[answer.itemOrder] = answer
        })
      }
      return map
    },
    currentQuestion() {
      return this.orderedQuestions[this.currentQuestionIndex] || null
    },
    currentQuestionOrder() {
      if (this.antiCheatActive) {
        return this.currentQuestion ? this.currentQuestion.itemOrder : -1
      }
      return this.scrollCurrentQuestionOrder
    }
  },
  methods: {
    // 题号规则：统一将 numberMode 归一化为 number，避免 "3" !== 3 导致逻辑分支失效
    getNormalizedNumberMode() {
      const raw = this.formData ? this.formData.numberMode : null
      const n = Number(raw)
      return Number.isFinite(n) ? n : 2
    },
    // 将可能为 string/number 的 id 统一为字符串用于比较（避免 1 !== "1" 导致匹配不到子题）
    normalizeId(value) {
      if (value === null || value === undefined) return null
      // 后端 Long 可能以 string 形式返回；统一转 string 比较最稳
      return String(value)
    },
    // 将可能为 string/number 的数值字段转为 number（失败则返回 null）
    normalizeNumber(value) {
      if (value === null || value === undefined || value === '') return null
      const n = Number(value)
      return Number.isFinite(n) ? n : null
    },
    // 题目难度：1=简单，2=中等，3=困难
    getDifficultyLevel(question) {
      const n = this.normalizeNumber(question && question.difficulty)
      if (n === 1 || n === 2 || n === 3) return n
      return null
    },
    getDifficultyShortText(question) {
      const level = this.getDifficultyLevel(question)
      if (level === 1) return '简'
      if (level === 2) return '中'
      if (level === 3) return '难'
      return ''
    },
    getDifficultyClass(question) {
      const level = this.getDifficultyLevel(question)
      if (level === 1) return 'is-easy'
      if (level === 2) return 'is-medium'
      if (level === 3) return 'is-hard'
      return ''
    },
    // 按原卷题号(numberMode=3)时，尽量解析出展示题号（兼容正文使用的“原始 questionDto”没有 originDisplayNo 字段）
    resolveOriginDisplayNo(question) {
      if (!question) return null
      // 1) 优先使用缓存里预计算的 originDisplayNo
      if (question.originDisplayNo !== null && question.originDisplayNo !== undefined && question.originDisplayNo !== '') {
        return this.normalizeNumber(question.originDisplayNo) ?? question.originDisplayNo
      }
      // 2) 如果带 itemOrder，尝试从 questionByOrder（缓存包装对象）取
      if (question.itemOrder !== null && question.itemOrder !== undefined && question.itemOrder !== '') {
        const cached = this.questionByOrder ? this.questionByOrder[String(question.itemOrder)] : null
        if (cached && cached.originDisplayNo !== null && cached.originDisplayNo !== undefined && cached.originDisplayNo !== '') {
          return this.normalizeNumber(cached.originDisplayNo) ?? cached.originDisplayNo
        }
      }
      // 3) 完形子题：用（子题 originOrder || 父题 originOrder）+ clozeIndex-1
      if (question.parentId) {
        const pid = this.normalizeId(question.parentId)
        let parent = null
        const typeList = (this.formData && this.formData.paperQuestionTypeDto) || []
        for (const type of typeList) {
          const list = (type && type.questionDtos) || []
          for (const q of list) {
            if (q && this.normalizeId(q.id) === pid) {
              parent = q
              break
            }
          }
          if (parent) break
        }
        const base = this.normalizeNumber(
          (question.originOrder !== null && question.originOrder !== undefined && question.originOrder !== '')
            ? question.originOrder
            : (parent ? parent.originOrder : null)
        )
        const idx = this.normalizeNumber(question.clozeIndex)
        if (base != null) {
          const offset = idx != null ? Math.max(0, idx - 1) : 0
          return base + offset
        }
      }
      // 4) 普通题：直接用 originOrder
      const n = this.normalizeNumber(question.originOrder)
      return n != null ? n : null
    },
    // 是否为完形填空的子题（目前 parentId 有值的都视为完形子题）
    isClozeChild(question) {
      return !!(question && question.parentId !== null && question.parentId !== undefined && question.parentId !== '')
    },
    // 题型下用于列表展示的题目（排除完形子题，避免 v-for 与 v-if 同用）
    getDisplayQuestions(questType) {
      if (!questType || !Array.isArray(questType.questionDtos)) return []
      return questType.questionDtos.filter(q => !this.isClozeChild(q))
    },
    // 左侧锚点题目列表：不展示完形父题，只展示可作答的小题
    getAnchorQuestions(questType) {
      if (!questType || !Array.isArray(questType.questionDtos)) {
        return []
      }
      return questType.questionDtos.filter(q => q && q.questionType !== 6)
    },

    // 按加入顺序展示：顶层展示项（普通题 + 完形父题），按“首个子题/自身题序”排序
    getFlatDisplayItems() {
      const typeList = this.formData.paperQuestionTypeDto || []
      const items = []
      typeList.forEach(type => {
        (type.questionDtos || []).forEach(q => {
          if (!q) return
          // 完形子题不作为顶层展示项
          if (q.parentId) return
          // 完形父题：用其首个子题的 itemOrder 作为排序键
          if (q.questionType === 6) {
            const children = this.getClozeChildren(q)
            const firstOrder = children.length ? children[0].itemOrder : Number.MAX_SAFE_INTEGER
            items.push({ kind: 'cloze', question: q, sortKey: firstOrder })
            return
          }
          // 普通题：自身 itemOrder 作为排序键
          items.push({ kind: 'question', question: q, sortKey: q.itemOrder })
        })
      })
      return items.sort((a, b) => (a.sortKey || 0) - (b.sortKey || 0))
    },
    // 获取某个完形父题下的所有子题，按 clozeIndex 排序
    getClozeChildren(parentQuestion) {
      if (!parentQuestion || !this.formData || !Array.isArray(this.formData.paperQuestionTypeDto)) {
        return []
      }
      const result = []
      const parentId = this.normalizeId(parentQuestion.id)
      if (!parentId) return []
      this.formData.paperQuestionTypeDto.forEach(type => {
        (type.questionDtos || []).forEach(q => {
          const qParentId = q ? this.normalizeId(q.parentId) : null
          if (q && qParentId && qParentId === parentId) {
            result.push(q)
          }
        })
      })
      return result.sort((a, b) => {
        const ai = this.normalizeNumber(a && a.clozeIndex) || 0
        const bi = this.normalizeNumber(b && b.clozeIndex) || 0
        return ai - bi
      })
    },
    /**
     * 使用DOMPurify清理HTML内容，防止XSS攻击
     * @param {string} html - 原始HTML内容
     * @returns {string} - 清理后的安全HTML
     */
    sanitizeHtml(html) {
      if (!html) return '';
      // 如果是纯文本（不包含HTML标签），直接返回
      if (!/<[^>]+>/.test(html)) {
        return html;
      }
      // 使用DOMPurify清理HTML
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'img', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target'],
        ALLOW_DATA_ATTR: false
      });
    },
    /**
     * 根据格式渲染内容（题干或解析）
     * @param {string} content - 内容
     * @param {string} format - 格式（html或markdown）
     * @returns {string} - 渲染后的HTML
     */
    renderContent(content, format) {
      if (!content) return '';
      
      const contentFormat = format || 'html';
      
      if (contentFormat === 'markdown') {
        try {
          // 使用 marked 渲染 Markdown
          let html = marked(content);
          // 处理表格，添加边框样式
          html = html.replace(/<table([^>]*)>/gi, (match, attrs) => {
            return `<table${attrs} style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #dcdfe6;">`;
          });
          // 为表格单元格添加边框
          html = html.replace(/<th([^>]*)>/gi, (match, attrs) => {
            return `<th${attrs} style="border: 1px solid #dcdfe6; padding: 8px 12px; text-align: left; background-color: #f5f7fa; font-weight: 600;">`;
          });
          html = html.replace(/<td([^>]*)>/gi, (match, attrs) => {
            return `<td${attrs} style="border: 1px solid #dcdfe6; padding: 8px 12px; text-align: left;">`;
          });
          // 处理图片标签，添加预览功能
          html = html.replace(/<img\s+([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*?)>/gi, (match, beforeSrc, src, afterSrc) => {
            const altMatch = match.match(/alt\s*=\s*["']([^"']*?)["']/i);
            const alt = altMatch ? altMatch[1] : '';
            return `<img src="${src}" alt="${alt}" class="content-image" data-preview="${src}" style="max-width: 100%; cursor: pointer; border-radius: 8px; margin: 16px 0; display: block;" />`;
          });
          // 数学公式 $...$ / $$...$$ 渲染（与后台一致）
          html = renderMathInHtml(html);
          // 使用 DOMPurify 清理渲染后的 HTML（允许 KaTeX 标签）
          return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: KATEX_ALLOWED_TAGS,
            ALLOWED_ATTR: KATEX_ALLOWED_ATTR,
            ALLOW_DATA_ATTR: true
          });
        } catch (error) {
          console.error('Markdown渲染失败:', error);
          // 渲染失败时返回原始内容（转义HTML）
          return this.sanitizeHtml(content.replace(/\n/g, '<br>'));
        }
      } else {
        // HTML 格式，直接使用 sanitizeHtml
        return this.sanitizeHtml(content);
      }
    },
    getQuestionTypeName(questType) {
      const rawType = questType && (questType.questionType || questType.type);
      const name = questType && questType.name;
      const numericName = name && !isNaN(name) ? Number(name) : null;
      if (name && isNaN(name)) {
        return name;
      }
      const map = this.questionTypeNameMap || {};
      const resolvedType = rawType || numericName;
      return map[resolvedType] || name || '';
    },
    syncAntiCheatState() {
      if (this.antiCheatEnabled) {
        this.enableAntiCheatFeatures()
      } else {
        this.disableAntiCheatFeatures()
      }
    },
    enableAntiCheatFeatures() {
      if (this.antiCheatActive) return
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
      window.addEventListener('blur', this.handleWindowBlur)
      // 进入考试页立即绑定各类安全事件，阻断复制/右键/快捷键
      this.bindSecurityEvents()
      // 启用开发者工具检测
      this.startDevToolsDetection()
      // 启用浏览器环境检测
      this.startBrowserEnvironmentDetection()
      this.currentQuestionIndex = 0
      this.ensureCurrentQuestionInRange()
      this.antiCheatActive = true
    },
    disableAntiCheatFeatures() {
      if (!this.antiCheatActive) return
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      window.removeEventListener('blur', this.handleWindowBlur)
      if (this.cutScreenCooldownTimer) {
        clearTimeout(this.cutScreenCooldownTimer)
      }
      // 离开页面时解除安全事件监听
      this.unbindSecurityEvents()
      // 停止开发者工具检测
      this.stopDevToolsDetection()
      // 停止浏览器环境检测
      this.stopBrowserEnvironmentDetection()
      if (this.securityWarningTimer) {
        clearTimeout(this.securityWarningTimer)
      }
      this.cutScreenCount = 0
      this.cutScreenCooldown = false
      this.securityWarningCooldown = false
      this.fullscreenWarningCount = 0
      this.devToolsDetected = false
      this.antiCheatActive = false
    },
    ensureCurrentQuestionInRange() {
      if (!this.orderedQuestions.length) {
        this.currentQuestionIndex = 0
        return
      }
      if (this.currentQuestionIndex >= this.orderedQuestions.length) {
        this.currentQuestionIndex = this.orderedQuestions.length - 1
      }
    },
    bindSecurityEvents() {
      this.securityHandlers = {
        // 禁用右键、复制
        contextmenu: (event) => this.handleForbiddenEvent(event, '考试期间禁用右键操作'),
        copy: (event) => this.handleForbiddenEvent(event, '考试期间禁用复制内容'),
        // 阻止敏感快捷键触发
        keydown: (event) => this.handleKeydown(event),
      }
      document.addEventListener('contextmenu', this.securityHandlers.contextmenu)
      document.addEventListener('copy', this.securityHandlers.copy)
      document.addEventListener('keydown', this.securityHandlers.keydown)
    },
    unbindSecurityEvents() {
      if (!this.securityHandlers) return
      document.removeEventListener('contextmenu', this.securityHandlers.contextmenu)
      document.removeEventListener('copy', this.securityHandlers.copy)
      document.removeEventListener('keydown', this.securityHandlers.keydown)
    },
    handleForbiddenEvent(event, message) {
      if (!this.antiCheatActive) return
      event.preventDefault()
      this.showSecurityWarning(message)
    },
    handleKeydown(event) {
      if (!this.antiCheatActive) return
      const key = event.key.toLowerCase()
      const blockedCtrlKeys = ['c', 'v', 'x', 'a', 's', 'p', 'r', 'f']
      const isBlockedCtrlCombo = (event.ctrlKey || event.metaKey) && blockedCtrlKeys.includes(key)
      const isDevToolsCombo = ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c', 'u'].includes(key))
      if (event.key === 'F12' || isBlockedCtrlCombo || isDevToolsCombo) {
        event.preventDefault()
        this.showSecurityWarning('考试期间禁用快捷键操作')
      }
    },
    showSecurityWarning(message) {
      if (!this.antiCheatActive) return
      if (this.securityWarningCooldown) {
        return
      }
      this.securityWarningCooldown = true
      this.$message.warning(message)
      this.securityWarningTimer = setTimeout(() => {
        this.securityWarningCooldown = false
      }, 1500)
    },
    handleVisibilityChange() {
      if (document.hidden) {
        this.handleCutScreen('检测到切换到其他标签页')
      }
    },
    handleWindowBlur() {
      // blur 触发时 document.hidden 尚未一定为 true，通过事件来源限制重复统计
      if (!document.hidden) {
        this.handleCutScreen('检测到切换到其他窗口')
      }
    },
    handleCutScreen(reason) {
      if (!this.antiCheatActive) return
      if (this.cutScreenCooldown) {
        return
      }
      this.cutScreenCooldown = true
      this.cutScreenCooldownTimer = setTimeout(() => {
        this.cutScreenCooldown = false
      }, 2000)
      this.cutScreenCount++
      const remain = this.cutScreenLimit - this.cutScreenCount
      const message = remain > 0
          ? `${reason}，还有${remain}次机会，请保持考试页面在前台。`
          : `${reason}，切屏次数已达上限，系统将自动交卷。`
      this.$message.warning(message)
      if (this.cutScreenCount >= this.cutScreenLimit) {
        this.$alert('多次检测到切屏行为，考试已结束，系统将自动提交试卷。', '警告', {
          confirmButtonText: '知道了',
          showClose: false, // 禁用右上角关闭按钮
          callback: () => {
            this.sendSubmitAnswerRequest()
          }
        })
      }
    },
    // ==================== 开发者工具检测 ====================
    startDevToolsDetection() {
      this.devToolsCheckTimer = setInterval(() => {
        this.detectDevTools()
      }, 1000)
    },
    stopDevToolsDetection() {
      if (this.devToolsCheckTimer) {
        clearInterval(this.devToolsCheckTimer)
        this.devToolsCheckTimer = null
      }
    },
    detectDevTools() {
      if (!this.antiCheatActive) return

      const threshold = 160
      let devToolsOpen = false

      // 方法1: 检测窗口尺寸差异
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        devToolsOpen = true
      }

      // 方法2: 检测console对象
      let consoleOpened = false
      const devtools = {
        toString: function() {
          consoleOpened = true
          return ''
        }
      }
      console.log('%c', devtools)

      if (consoleOpened) {
        devToolsOpen = true
      }

      // 方法3: 检测性能异常（替代debugger检测）
      let start = performance.now()
      // 执行一个简单的计算任务
      for (let i = 0; i < 1000; i++) {
        Math.random()
      }
      let end = performance.now()

      // 如果执行时间异常长，可能是在调试状态
      if (end - start > 50) {
        devToolsOpen = true
      }

      if (devToolsOpen && !this.devToolsDetected) {
        this.devToolsDetected = true
        this.handleDevToolsDetection()
      } else if (!devToolsOpen) {
        this.devToolsDetected = false
      }
    },
    handleDevToolsDetection() {
      this.$alert(
        '检测到开发者工具已打开！这违反了考试规定，系统将自动提交试卷。',
        '安全警告',
        {
          confirmButtonText: '确定',
          showClose: false,
          callback: () => {
            this.sendSubmitAnswerRequest()
          }
        }
      )
    },
    // ==================== 浏览器环境检测 ====================
    startBrowserEnvironmentDetection() {
      this.checkBrowserEnvironment()
      this.browserEnvironmentTimer = setInterval(() => {
        this.checkBrowserEnvironment()
      }, 5000)
    },
    stopBrowserEnvironmentDetection() {
      if (this.browserEnvironmentTimer) {
        clearInterval(this.browserEnvironmentTimer)
        this.browserEnvironmentTimer = null
      }
    },
    checkBrowserEnvironment() {
      if (!this.antiCheatActive) return

      // 检测常见的作弊插件或扩展
      this.detectSuspiciousExtensions()

  

      // 检测自动化工具
      this.detectAutomationTools()
    },
    detectSuspiciousExtensions() {
      // 检测DOM中是否有插件注入的元素
      const suspiciousSelectors = [
        '[class*="tampermonkey"]',
        '[class*="greasemonkey"]',
        '[class*="violentmonkey"]',
        '[id*="extension"]',
        '[class*="adblock"]'
      ]

      suspiciousSelectors.forEach(selector => {
        if (document.querySelector(selector)) {
          this.reportSuspiciousActivity('检测到可疑浏览器扩展')
        }
      })

      // 检测是否有异常的全局变量
      const suspiciousGlobals = [
        'webdriver',
        'callPhantom',
        '_phantom',
        'phantom'
      ]

      suspiciousGlobals.forEach(global => {
        if (window[global]) {
          this.reportSuspiciousActivity('检测到自动化工具特征')
        }
      })
    },
   
    detectAutomationTools() {
      // 检测Selenium等自动化工具
      if (navigator.webdriver) {
        this.reportSuspiciousActivity('检测到自动化工具')
        return
      }

      // 检测异常的用户代理
      const userAgent = navigator.userAgent.toLowerCase()
      const suspiciousUA = [
        'phantomjs',
        'selenium',
        'webdriver',
        'robot',
        'spider',
        'crawler'
      ]

      suspiciousUA.forEach(ua => {
        if (userAgent.includes(ua)) {
          this.reportSuspiciousActivity('检测到可疑用户代理')
        }
      })
    },
    reportSuspiciousActivity(activity) {
      console.warn('可疑活动:', activity)

      // 记录到后端
      // this.logSecurityEvent(activity)

      this.$message.warning(`安全检测: ${activity}`)

      // 累计可疑活动，达到阈值后采取行动
      this.cutScreenCount++
      if (this.cutScreenCount >= this.cutScreenLimit) {
        this.$alert(
          `检测到多次可疑活动: ${activity}。系统将自动提交试卷。`,
          '安全警告',
          {
            confirmButtonText: '确定',
            showClose: false,
            callback: () => {
              this.sendSubmitAnswerRequest()
            }
          }
        )
      }
    },
    jumpTo(itemOrder) {
      const target = document.getElementById(itemOrder);
      if (target) {
        // 求得距离顶部的值，加上卷去的值
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY - 80  // 减去导航条高度
        window.scrollTo({top: absoluteTop, behavior: 'smooth'});
      } else {
        console.log('目标元素未找到');
      }
    },
    handleSingleRadioChange(itemOrder, option) {
      const answer = this.answerMap[itemOrder]
      if (!answer) {
        console.warn('单选题答案未找到，itemOrder:', itemOrder);
        return
      }
      answer.content = option
      console.log(`单选题${itemOrder} 选择了:`, option, 'completed设为true');
      // 使用$set确保Vue能检测到变化
      this.$set(answer, 'completed', true)
    },
    updateCompletedStatus(itemOrder) {
      const answer = this.answerMap[itemOrder];
      if (!answer) {
        console.warn('答案未找到，itemOrder:', itemOrder);
        return;
      }
      let isCompleted;
      if (Array.isArray(answer.contentArray)) {
        // 填空题：检查数组中的答案是否都有值
        isCompleted = answer.contentArray.length > 0 && answer.contentArray.every(a => a && a.trim());
      } else {
        isCompleted = !!(answer.content && answer.content.toString().trim());
      }
      console.log(`题目${itemOrder} completed状态更新:`, isCompleted, '内容:', answer.content);
      // 使用$set确保Vue能检测到变化
      this.$set(answer, 'completed', isCompleted);
    },
    // 获取填空题答案列表（根据标准答案数量初始化）
    getFillBlankAnswerList(question) {
      const answer = this.answerMap[question.itemOrder];
      if (!answer) {
        return [];
      }
      // 从标准答案中获取答案数量
      let answerCount = 1;
      if (question.correct) {
        const answers = question.correct.split(',').map(a => a.trim()).filter(a => a);
        answerCount = Math.max(1, answers.length);
      }
      // 初始化或更新答案数组
      if (!answer.contentArray || answer.contentArray.length !== answerCount) {
        answer.contentArray = new Array(answerCount).fill('').map((_, index) => {
          // 如果已有答案，尝试恢复
          if (answer.contentArray && answer.contentArray[index]) {
            return answer.contentArray[index];
          }
          return '';
        });
        this.$set(answer, 'contentArray', answer.contentArray);
      }
      // 返回用于v-for的数组
      return answer.contentArray.map((value, index) => ({
        index,
        value: value || ''
      }));
    },
    // 更新填空题答案
    updateFillBlankAnswer(itemOrder, index, value) {
      const answer = this.answerMap[itemOrder];
      if (!answer) {
        console.warn('答案未找到，itemOrder:', itemOrder);
        return;
      }
      if (!Array.isArray(answer.contentArray)) {
        this.$set(answer, 'contentArray', []);
      }
      // 确保数组长度足够
      while (answer.contentArray.length <= index) {
        answer.contentArray.push('');
      }
      // 更新对应位置的答案（自动去除前后空格）
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      // 使用 $set 确保 Vue 能检测到数组索引的变化
      this.$set(answer.contentArray, index, trimmedValue);
      // 更新completed状态
      this.updateCompletedStatus(itemOrder);
    },
    handleTextChange(itemOrder, payload = {}) {
      const answer = this.answerMap[itemOrder];
      if (!answer) {
        console.warn('主观题答案未找到，itemOrder:', itemOrder);
        return;
      }
      const html = Object.prototype.hasOwnProperty.call(payload, 'html') ? payload.html : answer.content || ''
      const text = typeof payload.text === 'string' ? payload.text : ''
      answer.content = html
      const plainText = text || html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ')
      const hasImage = typeof html === 'string' && /<img[\s\S]*?>/i.test(html)
      const isCompleted = hasImage || !!(plainText && plainText.trim());
      console.log(`主观题${itemOrder} completed状态:`, isCompleted, 'html长度:', html.length, 'text:', plainText.substring(0, 20));
      // 使用$set确保Vue能检测到变化
      this.$set(answer, 'completed', isCompleted);
    },
    // 格式化日期为时分秒
    formatSeconds(remainTime) {
      return formatSeconds(remainTime)
    },
    timeReduce() {
      // 开启一个定时器，循环执行判断时间
      this.timer = setInterval(() => {
        // 如果小于等于0那么自动提交
        if (this.remainTime <= 0) {
          this.sendSubmitAnswerRequest();
        } else {
          // 不小于0，那就耗时++， 剩余时间--
          this.answer.doTime++
          this.remainTime--
        }
      }, 1000)
    },
    initRemainTime() {
      // 转为秒，然后自减方便一点
      this.remainTime = this.formData.suggestTime * 60
    },
    // 根据总题目，遍历出数组的每一个键，外层键为下标，设置N个题型，内部遍历出每一个下初始化答案数组，后续往里塞值传到后端
    initAnswer() {
      this.answer.paperId = this.formData.paperId
      let paperQuestionTypeList = this.formData.paperQuestionTypeDto
      for (let tIndex in paperQuestionTypeList) {
        let questionArray = paperQuestionTypeList[tIndex].questionDtos
        for (let qIndex in questionArray) {
          let question = questionArray[qIndex]
          // 完形填空父题本身不需要作答，跳过
          if (question.questionType === 6) {
            continue
          }
          // 填空题使用contentArray存储多个答案
          const isFillBlank = question.questionType === 5
          this.answer.questionAnswerDtos.push({
            questionId: question.id,
            content: '',//后续radio勾选后录入
            contentArray: isFillBlank ? [] : [],//填空题用数组存储多个答案
            completed: false,//同上
            itemOrder: question.itemOrder
          })
        }
      }
      this.buildQuestionCache()
      const firstType = (paperQuestionTypeList || [])[0]
      const firstQuestion = firstType && (firstType.questionDtos || [])[0]
      this.scrollCurrentQuestionOrder = firstQuestion ? firstQuestion.itemOrder : -1
      this.$nextTick(() => {
        this.updateCurrentQuestionByScroll()
      })
    },
    buildQuestionCache() {
      let questionList = []
      const indexMap = {}
      const byOrderMap = {}
      const typeList = this.formData.paperQuestionTypeDto || []

      // 预先收集所有题目，构建完形父题映射，用于按原卷题号给子题续号
      const allRawQuestions = []
      const clozeParentById = {}
      typeList.forEach((type) => {
        (type.questionDtos || []).forEach((q) => {
          if (!q) return
          allRawQuestions.push(q)
          if (q.questionType === 6 && !q.parentId && q.id != null) {
            clozeParentById[this.normalizeId(q.id)] = q
          }
        })
      })

      const mode = this.getNormalizedNumberMode()

      typeList.forEach((type) => {
        (type.questionDtos || []).forEach((question) => {
          // 完形填空父题本身不参与编号与锚点，仅子题作为可作答题目
          if (question && question.questionType === 6) {
            return
          }
          // 计算“按原卷题号”下的展示题号：完形父题不占号，子题从父题 originOrder 开始顺延
          let originDisplayNo = null
          if (mode === 3) {
            const pid = this.normalizeId(question && question.parentId)
            if (pid && clozeParentById[pid]) {
              const parent = clozeParentById[pid]
              // 优先使用子题自己设置的原卷题号；没有再回退到父题的原卷题号
              const baseRaw = (question.originOrder !== null && question.originOrder !== undefined)
                ? question.originOrder
                : (parent && parent.originOrder)
              const base = this.normalizeNumber(baseRaw)
              const idx = this.normalizeNumber(question && question.clozeIndex)
              const offset = idx != null ? idx - 1 : 0
              if (Number.isFinite(base)) {
                originDisplayNo = base + Math.max(0, offset)
              }
            } else {
              const n = this.normalizeNumber(question && question.originOrder)
              if (n != null) originDisplayNo = n
            }
          }

          const wrapped = {
            ...question,
            questTypeName: this.getQuestionTypeName(type),
            originDisplayNo
          }
          questionList.push(wrapped)
          if (question.itemOrder !== null && question.itemOrder !== undefined && question.itemOrder !== '') {
            // object key 最终都会变 string，这里显式用字符串，避免 1 / "1" 混用
            byOrderMap[String(question.itemOrder)] = wrapped
          }
        })
      })
      questionList.sort((a, b) => (this.normalizeNumber(a && a.itemOrder) || 0) - (this.normalizeNumber(b && b.itemOrder) || 0))
      const orderedList = this.antiCheatEnabled
          ? this.applyPersistedShuffle(questionList)
          : questionList
      orderedList.forEach((question, index) => {
        question.displayOrder = index
        indexMap[String(question.itemOrder)] = index
      })
      this.orderedQuestions = orderedList
      this.questionIndexByOrder = indexMap
      this.questionByOrder = byOrderMap
      this.currentQuestionIndex = 0
      this.ensureCurrentQuestionInRange()
    },
    applyPersistedShuffle(list) {
      const arr = list.slice()
      const key = this.getShuffleCacheKey()
      const order = getOrCreateShuffledOrder(key, arr.length)
      const shuffled = order.map(idx => arr[idx]).filter(Boolean)
      return shuffled.length === arr.length ? shuffled : arr
    },
    resetShuffleCache() {
      if (this.antiCheatEnabled) {
        clearShuffledOrder(this.getShuffleCacheKey())
      }
    },
    getShuffleCacheKey() {
      const paperId = this.formData.paperId || this.$route.params.paperId || 'unknown'
      const version = this.formData.updateTime || this.formData.paperInfoId || 'v1'
      return `paper_shuffle_${paperId}_${version}`
    },
    getQuestionDisplayNumber(question) {
      if (!question) {
        return ''
      }
      const mode = this.getNormalizedNumberMode()
      // 按原卷题号：直接使用预计算好的 originDisplayNo，不做补位
      if (mode === 3) {
        const raw = this.resolveOriginDisplayNo(question)
        if (raw === null || raw === undefined || raw === '') return ''
        const n = this.normalizeNumber(raw)
        return n != null ? n : String(raw)
      }
      // 按加入顺序：用当前缓存的顺序映射保证连续编号（兼容历史试卷存在父题占号导致的间断）
      if (mode === 2) {
        const key = question.itemOrder === null || question.itemOrder === undefined ? null : String(question.itemOrder)
        const index = key != null ? (this.questionIndexByOrder && this.questionIndexByOrder[key]) : undefined
        if (typeof index === 'number') {
          return index + 1
        }
      }
      if (this.antiCheatEnabled && typeof question.displayOrder === 'number') {
        return question.displayOrder + 1
      }
      return (question.itemOrder || 0) + 1
    },
    getDisplayNumberByOrder(itemOrder) {
      const mode = this.getNormalizedNumberMode()
      const key = itemOrder === null || itemOrder === undefined ? null : String(itemOrder)
      // 按原卷题号：通过 itemOrder 找到题目，再读 originOrder
      if (mode === 3 && this.questionByOrder) {
        const q = key != null ? this.questionByOrder[key] : null
        if (q) {
          const raw = q.originDisplayNo
          if (raw === null || raw === undefined || raw === '') {
            return ''
          }
          const n = this.normalizeNumber(raw)
          return n != null ? n : String(raw)
        }
      }
      const index = key != null ? this.questionIndexByOrder[key] : undefined
      // 按加入顺序：用 indexMap 保证连续编号
      if (mode === 2 && typeof index === 'number') {
        return index + 1
      }
      if (this.antiCheatEnabled && typeof index === 'number') {
        return index + 1
      }
      return (itemOrder || 0) + 1
    },
    goToPrevQuestion() {
      if (this.currentQuestionIndex <= 0) return
      this.currentQuestionIndex--
      window.scrollTo({top: 0, behavior: 'smooth'})
    },
    goToNextQuestion() {
      if (this.currentQuestionIndex >= this.orderedQuestions.length - 1) return
      this.currentQuestionIndex++
      window.scrollTo({top: 0, behavior: 'smooth'})
    },
    getQuestionTagType(itemOrder, displayIndex) {
      // 使用answerMap通过itemOrder获取答案
      const answer = this.answerMap[itemOrder]
      const isCompleted = answer ? answer.completed : false
      
      // 判断是否为当前题目
      const isCurrent = this.antiCheatActive
        ? (typeof displayIndex === 'number' ? displayIndex === this.currentQuestionIndex : itemOrder === this.currentQuestionOrder)
        : itemOrder === this.currentQuestionOrder
      
      // 已完成的题目显示绿色，即使是当前题目
      if (isCompleted) {
        return 'success'
      }
      
      // 当前题目但未完成显示蓝色
      if (isCurrent) {
        return 'primary'
      }
      
      // 其他未完成显示灰色
      return 'plain'
    },
    handleQuestionAnchorClick(itemOrder, displayIndex) {
      if (this.antiCheatActive) {
        const targetIndex = typeof displayIndex === 'number'
            ? displayIndex
            : this.questionIndexByOrder[String(itemOrder)]
        if (typeof targetIndex === 'number') {
          this.currentQuestionIndex = targetIndex
          window.scrollTo({top: 0, behavior: 'smooth'})
        }
      } else {
        this.jumpTo(itemOrder)
      }
    },

    updateCurrentQuestionByScroll() {
      if (this.antiCheatActive) {
        return
      }
      const list = this.orderedQuestions || []
      if (!Array.isArray(list) || !list.length) {
        return
      }
      const anchorTop = 120
      let nearestOrder = this.scrollCurrentQuestionOrder
      let minDistance = Number.POSITIVE_INFINITY
      list.forEach(question => {
        if (!question || question.itemOrder === null || question.itemOrder === undefined) return
        const el = document.getElementById(question.itemOrder)
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) return
        const distance = Math.abs(rect.top - anchorTop)
        if (distance < minDistance) {
          minDistance = distance
          nearestOrder = question.itemOrder
        }
      })
      if (nearestOrder !== this.scrollCurrentQuestionOrder) {
        this.scrollCurrentQuestionOrder = nearestOrder
      }
    },

    async getPaperById(paperId) {
      this.formData = (await getPaper(paperId)).data
      const windowStatus = this.checkPaperWindow(this.formData)
      if (windowStatus.status !== 'open') {
        this.$message.warning(windowStatus.tip)
        this.$router.replace({path: '/home'})
        return
      }
      // 后端下发试卷时若带有开关字段，则以其为准
      if (Object.prototype.hasOwnProperty.call(this.formData, 'enableAntiCheat')) {
        this.antiCheatEnabled = !!this.formData.enableAntiCheat
      }
      this.initAnswer()
      //初始化时间为毫秒调用格式化时间戳工具
      this.initRemainTime()
      // 时间开始倒计时
      this.timeReduce()
      // 绑定题干图片预览事件
      this.bindQuestionImagePreview()
    },
    checkPaperWindow(paper = {}) {
      const {start, end} = this.getPaperTimeRange(paper)
      const now = Date.now()
      if (start && now < start) {
        return {
          status: 'not_started',
          tip: `考试未开始，开始时间：${this.formatDateTime(start)}`
        }
      }
      if (end && now > end) {
        return {
          status: 'closed',
          tip: `考试已截止，截止时间：${this.formatDateTime(end)}`
        }
      }
      return { status: 'open', tip: '' }
    },
    getPaperTimeRange(paper = {}) {
      const start = this.parseDate(
          paper.startTime || paper.beginTime || paper.openTime || paper.publishTime)
      const end = this.parseDate(
          paper.endTime || paper.closeTime || paper.deadlineTime || paper.deadline)
      return { start, end }
    },
    parseDate(value) {
      if (!value) return null
      const ts = Date.parse(value)
      if (!Number.isNaN(ts)) return ts
      const normalized = String(value).replace(/-/g, '/')
      const ts2 = Date.parse(normalized)
      return Number.isNaN(ts2) ? null : ts2
    },
    formatDateTime(ts) {
      if (!ts) return ''
      const date = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    },
    //提交试卷弹框确认信息
    submit() {

      this.$confirm('不需要再检查一下吗亲~', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.$message({
        //   type: 'success',
        //   message: '提交成功!'
        // });
        this.sendSubmitAnswerRequest();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消提交'
        });
      });
    },
    //点击确认提交答案的请求方法
    async sendSubmitAnswerRequest() {
      window.clearInterval(this.timer)
      this.resetShuffleCache()
      
      // 在提交前对答案进行处理：去除填空题答案中的空格
      const processedAnswer = {
        ...this.answer,
        questionAnswerDtos: this.answer.questionAnswerDtos.map(answerDto => {
          // 如果是填空题，对contentArray中的每个答案进行trim
          if (Array.isArray(answerDto.contentArray) && answerDto.contentArray.length > 0) {
            return {
              ...answerDto,
              contentArray: answerDto.contentArray.map(answer => {
                return typeof answer === 'string' ? answer.trim() : answer
              }).filter(answer => answer !== null && answer !== undefined && answer !== '')
            }
          }
          // 其他题型也去除content的前后空格
          if (answerDto.content && typeof answerDto.content === 'string') {
            return {
              ...answerDto,
              content: answerDto.content.trim()
            }
          }
          return answerDto
        })
      }
      
      const res = await submitAnswer(processedAnswer)
      if (res.code !== 200) {
        return
      }
      const rawResult = res.data
      const fallbackScore = typeof rawResult === 'number' ? rawResult : 0
      const result = (rawResult && typeof rawResult === 'object')
          ? rawResult
          : {
            reviewStatus: 0,
            finalScore: fallbackScore,
            objectiveScore: fallbackScore
          }
      let message = ''
      if (result.reviewStatus === 1) {
        const objective = result.objectiveScore != null ? result.objectiveScore : 0
        message = `客观题得分：${objective} 分，主观题将由老师批改，请耐心等待。`
      } else {
        message = `试卷总得分：${result.finalScore}`
      }
      this.$alert(message, '考试结果', {
        confirmButtonText: '查看此次考试详情',
        cancelButtonText: '取消', // 添加取消按钮
        showClose: false, // 禁用右上角关闭按钮
        callback: action => {
          if (action === 'confirm') {
            // 用户点击了确认按钮
            // 在这里可以添加跳转到考试详情的代码
            this.$router.push({
              path: '/person/record',
              // query: {examId}
            })
          } else if (action === 'cancel') {
            // 用户点击了取消按钮
            this.$message({
              type: 'info',
              message: '您已取消查看考试详情。'
            });
          }
        }
      });
    },
    // 绑定题干和选项图片预览事件
    bindQuestionImagePreview() {
      this.$nextTick(() => {
        // 绑定题干图片预览和强制尺寸限制
        const questionTitleElements = document.querySelectorAll('.question-title-content');
        questionTitleElements.forEach(element => {
          const images = element.querySelectorAll('img');
          images.forEach((img, index) => {
            // 强制设置图片尺寸
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.display = 'inline-block';
            img.style.cursor = 'zoom-in';
            img.onclick = (e) => {
              e.preventDefault();
              const allImages = Array.from(element.querySelectorAll('img'));
              const urls = allImages.map(image => image.getAttribute('src')).filter(Boolean);
              if (urls.length > 0) {
                const clickedIndex = allImages.indexOf(img);
                this.openImagePreview(urls, clickedIndex >= 0 ? clickedIndex : 0);
              }
            };
          });
        });

        // 绑定选项图片预览和强制尺寸限制
        const optionTextElements = document.querySelectorAll('.option-text');
        optionTextElements.forEach(element => {
          const images = element.querySelectorAll('img');
          images.forEach((img, index) => {
            // 强制设置选项图片尺寸
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.display = 'inline-block';
            img.style.cursor = 'zoom-in';
            img.onclick = (e) => {
              e.preventDefault();
              const allImages = Array.from(element.querySelectorAll('img'));
              const urls = allImages.map(image => image.getAttribute('src')).filter(Boolean);
              if (urls.length > 0) {
                const clickedIndex = allImages.indexOf(img);
                this.openImagePreview(urls, clickedIndex >= 0 ? clickedIndex : 0);
              }
            };
          });
        });
      });
    },
    // 打开图片预览
    openImagePreview(urls, index) {
      this.imagePreview = {
        visible: true,
        urls: urls,
        index: index
      };
    },
    // 关闭图片预览
    closeImagePreview() {
      this.imagePreview.visible = false;
      this.imagePreview.urls = [];
      this.imagePreview.index = 0;
    }
  },
}
</script>

<style scoped>
/* 当前题目的特殊高亮样式 */
.current-question {
  border: 2px solid #409EFF !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3) !important;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* 防止在非防作弊模式下应用样式 */
.current-question:not(.el-tag--primary) {
  border: none !important;
  box-shadow: none !important;
  transform: none;
}

.difficulty-switch-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.difficulty-switch-label {
  font-size: 12px;
  color: #606266;
}

.anchor-tag {
  position: relative;
  overflow: hidden;
}

.anchor-tag-number {
  line-height: 30px;
}

.anchor-difficulty-badge {
  position: absolute;
  right: 2px;
  bottom: 1px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  color: #fff;
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  transform: scale(0.95);
}

.anchor-difficulty-badge.is-easy {
  background: #67c23a;
}

.anchor-difficulty-badge.is-medium {
  background: #e6a23c;
}

.anchor-difficulty-badge.is-hard {
  background: #f56c6c;
}



/* 安全警告样式 */
.security-warning {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.95);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  z-index: 10000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.answer-rich-text {
  margin-top: 12px;
  width: 100%;
}
.answer-rich-text .ql-toolbar {
  border-radius: 6px 6px 0 0;
}
.answer-rich-text .ql-container {
  border-radius: 0 0 6px 6px;
  width: 100%;
  box-sizing: border-box;
}
.answer-rich-text .ql-editor {
  width: 100%;
  box-sizing: border-box;
  display: block;
  padding: 16px;
}
.answer-rich-text .ql-editor::before {
  width: 100%;
  display: block;
  left: 16px;
  right: 16px;
}
.answer-rich-text .ql-editor p {
  min-height: 20px;
}

/* 富文本题干样式 */
.question-title-content {
  display: inline;
  word-break: break-word;
}

/* Markdown 样式支持（题干） */
.question-title-content.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #24292e;
  display: inline-block;
}

.question-title-content.markdown-body h1,
.question-title-content.markdown-body h2,
.question-title-content.markdown-body h3,
.question-title-content.markdown-body h4,
.question-title-content.markdown-body h5,
.question-title-content.markdown-body h6 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  line-height: 1.25;
}

.question-title-content.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

.question-title-content.markdown-body pre {
  padding: 12px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin: 8px 0;
}

.question-title-content.markdown-body pre code {
  display: inline;
  max-width: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

/* 全局强制覆盖题干图片尺寸 */
.question-title-content >>> img,
.question-title-content img[src] {
  max-width: 560px !important;
  max-height: 560px !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
  margin: 18px auto !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.question-title-content >>> img:hover {
  transform: scale(1.02);
}

/* 确保所有块级元素都内联显示，防止换行 */
.question-title-content >>> p,
.question-title-content >>> div,
.question-title-content >>> h1,
.question-title-content >>> h2,
.question-title-content >>> h3,
.question-title-content >>> h4,
.question-title-content >>> h5,
.question-title-content >>> h6 {
  margin: 0 0 10px 0;
  padding: 0;
}

.question-title-content strong {
  font-weight: bold;
}

.question-title-content em {
  font-style: italic;
}

.question-title-content u {
  text-decoration: underline;
}

.question-title-content ol,
.question-title-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.question-title-content code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.question-title-content pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.question-title-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 10px;
  margin: 10px 0;
  color: #666;
}

/* 选项富文本样式 */
.option-content {
  display: inline-flex;
  align-items: flex-start;
  word-break: break-word;
  width: 100%;
}

.option-prefix {
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  display: inline-block;
}

/* 修复单选框和复选框布局 */
.el-radio, .el-checkbox {
  display: flex !important;
  align-items: flex-start !important;
  margin-bottom: 12px !important;
}

.el-radio__input, .el-checkbox__input {
  margin-top: 2px !important;
}

.el-radio__label, .el-checkbox__label {
  flex: 1 !important;
  padding-left: 8px !important;
}

.option-text img {
  max-width: 560px !important;
  max-height: 560px !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
  margin: 16px auto !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.option-text img:hover {
  transform: scale(1.02);
}

.option-text p {
  display: inline;
  margin: 0;
}

.option-text strong {
  font-weight: bold;
}

.option-text em {
  font-style: italic;
}

.option-text u {
  text-decoration: underline;
}

.option-text ol,
.option-text ul {
  margin: 5px 0;
  padding-left: 15px;
}

.option-text code {
  background-color: #f5f5f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.option-text pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 5px 0;
  font-size: 0.9em;
}

.option-text blockquote {
  border-left: 3px solid #ddd;
  padding-left: 8px;
  margin: 5px 0;
  color: #666;
  font-style: italic;
}

/* Markdown 表格样式 */
.question-title-content.markdown-body table,
.option-text.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin: 10px 0;
}

.question-title-content.markdown-body table th,
.question-title-content.markdown-body table td,
.option-text.markdown-body table th,
.option-text.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #dcdfe6;
}

.question-title-content.markdown-body table th,
.option-text.markdown-body table th {
  font-weight: 600;
  background-color: #f5f7fa;
}

/* 使用深度选择器确保样式应用到 v-html 注入的内容 */
.question-title-content >>> table,
.option-text >>> table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin: 10px 0;
  border: 1px solid #dcdfe6;
}

.question-title-content >>> table th,
.question-title-content >>> table td,
.option-text >>> table th,
.option-text >>> table td {
  padding: 6px 13px;
  border: 1px solid #dcdfe6;
}

.question-title-content >>> table th,
.option-text >>> table th {
  font-weight: 600;
  background-color: #f5f7fa;
}
</style>
