<template>
  <div class="personal-dashboard">
    <el-card class="page-header">
      <h2>📊 我的学习报表</h2>
      <p>查看您的学习进度、成绩分析和错题统计</p>
    </el-card>

    <!-- 学习概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <i class="el-icon-edit-outline"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.totalQuestions || 0 }}</div>
            <div class="stat-label">累计做题</div>
            <div class="stat-trend" v-if="overviewData.weekQuestions">
              <span>本周 +{{ overviewData.weekQuestions }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <i class="el-icon-document"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.totalExams || 0 }}</div>
            <div class="stat-label">累计考试</div>
            <div class="stat-trend" v-if="overviewData.weekExams">
              <span>本周 +{{ overviewData.weekExams }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
            <i class="el-icon-warning-outline"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.totalWrongQuestions || 0 }}</div>
            <div class="stat-label">累计错题</div>
            <div class="stat-trend error">
              <span>需要复习</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%)">
            <i class="el-icon-star-off"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overviewData.totalFavorites || 0 }}</div>
            <div class="stat-label">累计收藏</div>
            <div class="stat-trend">
              <span>{{ formatTime(overviewData.totalStudyTime) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 考试成绩趋势 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>📈 考试成绩趋势对比</span>
            <el-tag size="small" type="info">每个试卷最近20次</el-tag>
          </div>
          <div id="examTrendChart" style="width: 100%; height: 450px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错题统计 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>❌ 错题科目分布</span>
            <el-tag size="small" type="danger">共{{ wrongQuestionData.totalWrong }}题</el-tag>
          </div>
          <div id="wrongSubjectChart" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>📝 错题题型分布</span>
          </div>
          <div id="wrongTypeChart" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学习时间分布 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>⏰ 学习时间分布（24小时）</span>
            <el-tag size="small" type="warning">最近30天</el-tag>
          </div>
          <div id="studyTimeChart" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="stat-detail-card">
          <div slot="header">
            <span>📅 学习统计</span>
          </div>
          <div class="study-stats">
            <div class="stat-item">
              <div class="stat-item-label">学习天数</div>
              <div class="stat-item-value">{{ studyTimeData.studyDays || 0 }} 天</div>
            </div>
            <el-divider></el-divider>
            <div class="stat-item">
              <div class="stat-item-label">连续学习</div>
              <div class="stat-item-value fire">
                <i class="el-icon-medal"></i> {{ studyTimeData.continuousDays || 0 }} 天
              </div>
            </div>
            <el-divider></el-divider>
            <div class="stat-item">
              <div class="stat-item-label">累计学习</div>
              <div class="stat-item-value">{{ formatTime(overviewData.totalStudyTime) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  getOverview,
  getExamTrend,
  getWrongQuestionStat,
  getStudyTimeDistribution
} from '@/api/personal-dashboard'

export default {
  name: 'PersonalDashboard',
  data() {
    return {
      overviewData: {},
      examTrendData: [],
      wrongQuestionData: {
        totalWrong: 0,
        subjectDistribution: [],
        typeDistribution: []
      },
      studyTimeData: {
        studyDays: 0,
        continuousDays: 0,
        hourDistribution: []
      },
      charts: {}
    }
  },
  mounted() {
    this.loadAllData()
  },
  beforeDestroy() {
    // 销毁所有图表
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose()
    })
  },
  methods: {
    async loadAllData() {
      await Promise.all([
        this.loadOverview(),
        this.loadExamTrend(),
        this.loadWrongQuestions(),
        this.loadStudyTime()
      ])
    },

    async loadOverview() {
      try {
        const res = await getOverview()
        console.log('=== 学习概览API响应:', res)
        // 注意：响应拦截器已经返回了res.data，所以这里直接用res
        if (res.code === 200) {
          this.overviewData = res.data || {}
        } else {
          this.$message.error(res.msg || '获取学习概览失败')
        }
        console.log('=== 学习概览数据:', this.overviewData)
      } catch (error) {
        console.error('=== 学习概览API错误:', error)
        this.$message.error('获取学习概览失败: ' + error.message)
      }
    },

    async loadExamTrend() {
      try {
        // 获取所有试卷的考试记录（不筛选），获取100条用于分组
        const res = await getExamTrend(100, null)
        console.log('=== 考试趋势API响应:', res)
        if (res.code === 200) {
          this.examTrendData = res.data || []
          console.log('=== 考试趋势数据:', this.examTrendData)
        }
        this.$nextTick(() => {
          this.renderExamTrendChart()
        })
      } catch (error) {
        console.error('=== 考试趋势API错误:', error)
      }
    },

    async loadWrongQuestions() {
      try {
        const res = await getWrongQuestionStat()
        console.log('=== 错题统计API响应:', res)
        if (res.code === 200) {
          this.wrongQuestionData = res.data || { totalWrong: 0, subjectDistribution: [], typeDistribution: [] }
        }
        this.$nextTick(() => {
          this.renderWrongSubjectChart()
          this.renderWrongTypeChart()
        })
      } catch (error) {
        console.error('=== 错题统计API错误:', error)
      }
    },

    async loadStudyTime() {
      try {
        const res = await getStudyTimeDistribution(30)
        console.log('=== 学习时间API响应:', res)
        if (res.code === 200) {
          this.studyTimeData = res.data || { studyDays: 0, continuousDays: 0, hourDistribution: [] }
        }
        this.$nextTick(() => {
          this.renderStudyTimeChart()
        })
      } catch (error) {
        console.error('=== 学习时间API错误:', error)
      }
    },

    // 渲染考试趋势图（多试卷对比）
    renderExamTrendChart() {
      const chartDom = document.getElementById('examTrendChart')
      if (!chartDom) return

      if (this.charts.examTrend) {
        this.charts.examTrend.dispose()
      }

      const chart = echarts.init(chartDom)
      const allData = this.examTrendData

      // 数据为空时显示提示
      if (!allData || allData.length === 0) {
        chart.setOption({
          title: {
            text: '暂无考试记录',
            left: 'center',
            top: 'center',
            textStyle: { color: '#999', fontSize: 14 }
          }
        })
        this.charts.examTrend = chart
        return
      }

      // 按试卷名称分组数据
      const paperDataMap = new Map()
      allData.forEach(item => {
        if (!paperDataMap.has(item.paperName)) {
          paperDataMap.set(item.paperName, [])
        }
        paperDataMap.get(item.paperName).push(item)
      })

      // 为每个试卷取最近20次记录并排序
      const paperSeriesData = []
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
      let colorIndex = 0
      
      paperDataMap.forEach((records, paperName) => {
        // 按时间倒序排列，取最近20次
        const sortedRecords = records
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
          .slice(0, 20)
          .reverse() // 再反转为正序
        
        paperSeriesData.push({
          paperName,
          records: sortedRecords,
          color: colors[colorIndex % colors.length]
        })
        colorIndex++
      })

      // 生成X轴数据（使用最大的考试次数）
      const maxExamCount = Math.max(...paperSeriesData.map(p => p.records.length))
      const xAxisData = Array.from({ length: maxExamCount }, (_, i) => `第${i + 1}次`)

      // 生成系列数据
      const series = paperSeriesData.map(paperData => {
        // 补全数据，不足的用null填充
        const scoreData = Array(maxExamCount).fill(null)
        paperData.records.forEach((record, index) => {
          scoreData[index] = record.scorePercent.toFixed(1)
        })

        return {
          name: paperData.paperName,
          type: 'line',
          smooth: true,
          connectNulls: false, // 不连接空值
          data: scoreData,
          itemStyle: {
            color: paperData.color
          },
          lineStyle: {
            width: 2
          },
          emphasis: {
            focus: 'series'
          }
        }
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          z: 9999,
          padding: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409EFF',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          formatter: (params) => {
            let result = `<div style="padding: 8px; min-width: 200px;">`
            params.forEach(item => {
              if (item.value !== null) {
                const paperData = paperSeriesData.find(p => p.paperName === item.seriesName)
                const record = paperData.records[item.dataIndex]
                if (record) {
                  const date = new Date(record.createTime)
                  const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
                  result += `
                    <div style="margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #eee;">
                      <div style="margin-bottom: 6px;">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:8px;vertical-align:middle;"></span>
                        <strong style="font-size: 14px;">${item.seriesName}</strong>
                      </div>
                      <div style="margin-left: 18px; line-height: 22px;">
                        <div>得分率: <strong style="color: ${item.color};">${item.value}%</strong></div>
                        <div>得分: ${record.finalScore}/${record.paperScore}</div>
                        <div style="color: #999; font-size: 12px;">时间: ${dateStr}</div>
                      </div>
                    </div>
                  `
                }
              }
            })
            result += `</div>`
            return result
          }
        },
        legend: {
          type: 'scroll',
          bottom: 5,
          left: 'center',
          orient: 'horizontal',
          itemWidth: 20,
          itemHeight: 10,
          itemGap: 15,
          textStyle: {
            fontSize: 12
          },
          pageButtonItemGap: 5,
          pageIconSize: 12,
          pageTextStyle: {
            fontSize: 11
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '18%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: 0,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          name: '得分率(%)',
          max: 100,
          min: 0
        },
        series: series
      }

      chart.setOption(option)
      this.charts.examTrend = chart
    },

    // 渲染错题科目分布
    renderWrongSubjectChart() {
      const chartDom = document.getElementById('wrongSubjectChart')
      if (!chartDom) return

      if (this.charts.wrongSubject) {
        this.charts.wrongSubject.dispose()
      }

      const chart = echarts.init(chartDom)
      const data = this.wrongQuestionData.subjectDistribution || []

      if (data.length === 0) {
        chart.setOption({
          title: {
            text: '暂无错题',
            left: 'center',
            top: 'center',
            textStyle: { color: '#999', fontSize: 14 }
          }
        })
        this.charts.wrongSubject = chart
        return
      }

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}题 ({d}%)',
          z: 9999,
          padding: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#67C23A',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 13
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: data.map(item => ({
            name: item.subjectName,
            value: item.count
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

      chart.setOption(option)
      this.charts.wrongSubject = chart
    },

    // 渲染错题题型分布
    renderWrongTypeChart() {
      const chartDom = document.getElementById('wrongTypeChart')
      if (!chartDom) return

      if (this.charts.wrongType) {
        this.charts.wrongType.dispose()
      }

      const chart = echarts.init(chartDom)
      const data = this.wrongQuestionData.typeDistribution || []

      if (data.length === 0) {
        chart.setOption({
          title: {
            text: '暂无错题',
            left: 'center',
            top: 'center',
            textStyle: { color: '#999', fontSize: 14 }
          }
        })
        this.charts.wrongType = chart
        return
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          z: 9999,
          padding: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E6A23C',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 13
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.typeName)
        },
        yAxis: {
          type: 'value',
          name: '题目数'
        },
        series: [{
          type: 'bar',
          data: data.map(item => item.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F56C6C' },
              { offset: 1, color: '#FFA07A' }
            ])
          },
          barWidth: '50%'
        }]
      }

      chart.setOption(option)
      this.charts.wrongType = chart
    },

    // 渲染学习时间分布
    renderStudyTimeChart() {
      const chartDom = document.getElementById('studyTimeChart')
      if (!chartDom) return

      if (this.charts.studyTime) {
        this.charts.studyTime.dispose()
      }

      const chart = echarts.init(chartDom)
      const hourData = this.studyTimeData.hourDistribution || []
      
      // 补全24小时数据
      const fullHourData = []
      for (let i = 0; i < 24; i++) {
        const found = hourData.find(item => item.hour === i)
        fullHourData.push(found ? found.count : 0)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          z: 9999,
          padding: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#409EFF',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 13
          },
          formatter: (params) => {
            return `<div style="line-height: 22px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${params[0].name}:00 - ${params[0].name}:59</div>
              <div>活动次数: <strong style="color: #409EFF;">${params[0].value}</strong></div>
            </div>`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }, (_, i) => i),
          name: '小时'
        },
        yAxis: {
          type: 'value',
          name: '活动次数'
        },
        series: [{
          type: 'bar',
          data: fullHourData,
          itemStyle: {
            color: (params) => {
              const hour = params.dataIndex
              if (hour >= 6 && hour < 12) return '#67C23A' // 早上-绿色
              if (hour >= 12 && hour < 18) return '#409EFF' // 下午-蓝色
              if (hour >= 18 && hour < 22) return '#E6A23C' // 晚上-橙色
              return '#909399' // 深夜-灰色
            }
          },
          barWidth: '60%'
        }]
      }

      chart.setOption(option)
      this.charts.studyTime = chart
    },

    // 格式化时间（分钟转小时）
    formatTime(minutes) {
      if (!minutes) return '0小时'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours === 0) return `${mins}分钟`
      if (mins === 0) return `${hours}小时`
      return `${hours}h${mins}m`
    }
  }
}
</script>

<style scoped>
.personal-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
  }
}

.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 140px;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  /deep/ .el-card__body {
    padding: 20px;
    display: flex;
    align-items: center;
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  
  i {
    font-size: 28px;
    color: white;
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 12px;
  color: #67C23A;
  
  &.error {
    color: #F56C6C;
  }
}

.chart-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }
}

.stat-detail-card {
  margin-bottom: 20px;
  height: 436px;
}

.study-stats {
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-item-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-item-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  
  &.fire {
    color: #E6A23C;
    
    i {
      color: #E6A23C;
      animation: fire 1.5s infinite;
    }
  }
}

@keyframes fire {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
