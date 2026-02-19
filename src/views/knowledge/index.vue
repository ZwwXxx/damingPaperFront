<template>
  <div class="knowledge-library">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">🌟 知识点广场</span>
        <el-badge v-if="totalKnowledgeCount > 0" :value="totalKnowledgeCount" class="total-badge" type="success" />
      </div>

      <!-- Tab导航 -->
      <div class="tab-nav">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="广场" name="plaza">
            <span slot="label"><i class="el-icon-star-off"></i> 知识点广场</span>
          </el-tab-pane>
          <el-tab-pane name="myArticles">
            <span slot="label" style="display: inline-flex; align-items: center;">
              <i class="el-icon-tickets"></i> 我的文章
              <el-badge v-if="myArticleCount > 0" :value="myArticleCount" class="badge-item" type="primary" />
            </span>
          </el-tab-pane>
          <el-tab-pane label="我的收藏" name="myCollects">
            <span slot="label" style="display: inline-flex; align-items: center;">
              <i class="el-icon-folder"></i> 我的收藏
              <el-badge v-if="myCollectCount > 0" :value="myCollectCount" class="badge-item" type="warning" />
            </span>
          </el-tab-pane>
        </el-tabs>
        
        <div class="tab-actions">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="goPublish">
            发布知识点
          </el-button>
        </div>
      </div>

      <!-- 知识点广场筛选区（仅在广场tab显示） -->
      <div v-if="activeTab === 'plaza'" class="plaza-filters">
        <el-row :gutter="15" class="filter-row">
          <el-col :span="5">
            <el-select v-model="queryParams.subjectId" placeholder="全部科目" clearable @change="loadPointList">
              <el-option v-for="subject in subjectList" :key="subject.subjectId" :label="subject.subjectName" :value="subject.subjectId" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.difficulty" placeholder="全部难度" clearable @change="loadPointList">
              <el-option label="简单" :value="1" />
              <el-option label="中等" :value="2" />
              <el-option label="困难" :value="3" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="queryParams.sortType" placeholder="排序方式" @change="loadPointList">
              <el-option label="🎯 智能推荐" value="recommend" />
              <el-option label="⏰ 最新发布" value="latest" />
              <el-option label="🔥 热门榜单" value="hot" />
            </el-select>
          </el-col>
          <el-col :span="11">
            <el-input 
              v-model="queryParams.title" 
              placeholder="🔍 搜索知识点标题、内容..." 
              clearable 
              @keyup.enter.native="loadPointList"
              prefix-icon="el-icon-search">
              <el-button slot="append" type="primary" @click="loadPointList">搜索</el-button>
            </el-input>
          </el-col>
        </el-row>
      </div>
      <!-- 我的文章筛选条件 -->
      <div v-if="activeTab === 'myArticles'" class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filterParams.subjectId" placeholder="全部科目" clearable size="small" @change="applyFilter">
              <el-option label="全部科目" :value="null"></el-option>
              <el-option v-for="subject in subjectList" :key="subject.subjectId" :label="subject.subjectName" :value="subject.subjectId"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterParams.difficulty" placeholder="难度" clearable size="small" @change="applyFilter">
              <el-option label="全部难度" :value="null"></el-option>
              <el-option label="简单" :value="1"></el-option>
              <el-option label="中等" :value="2"></el-option>
              <el-option label="困难" :value="3"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterParams.status" placeholder="状态" clearable size="small" @change="applyFilter">
              <el-option label="全部状态" :value="null"></el-option>
              <el-option label="草稿" :value="0"></el-option>
              <el-option label="已发布" :value="1"></el-option>
              <el-option label="已下架" :value="2"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterParams.orderBy" placeholder="排序" size="small" @change="applyFilter">
              <el-option label="最新发布" value="create_time"></el-option>
              <el-option label="最多浏览" value="view_count"></el-option>
              <el-option label="最多点赞" value="like_count"></el-option>
              <el-option label="最多收藏" value="collect_count"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button size="small" icon="el-icon-refresh" @click="resetFilter">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 收藏夹布局：左侧目录 + 右侧内容 -->
      <div v-if="activeTab === 'myCollects'" class="collect-layout">
        <!-- 左侧收藏夹目录 -->
        <div class="folder-sidebar">
          <div class="sidebar-header">
            <div class="header-title">
              <i class="el-icon-star-off"></i>
              <span>我的收藏</span>
            </div>
            <el-button 
              type="text" 
              size="mini" 
              icon="el-icon-plus" 
              class="create-btn"
              @click="showCreateFolderDialog">
            </el-button>
          </div>
          
          <div class="folder-list">
          <!-- 所有收藏夹（包括默认收藏夹） -->
          <div 
            v-for="folder in sortedFolderList" 
            :key="folder.folderId || 'default'"
            class="folder-item"
            :class="{ active: selectedFolderId === folder.folderId }"
            @click="selectFolder(folder.folderId)">
            <div class="folder-info">
              <div class="folder-icon">
                <i :class="folder.isDefault === 1 ? 'el-icon-star-on' : 'el-icon-folder'"></i>
              </div>
              <div class="folder-content">
                <div class="folder-name">{{ folder.folderName }}</div>
                <div class="folder-desc">{{ folder.collectCount || 0 }}个收藏</div>
              </div>
            </div>
            <div class="folder-actions">
              <i class="el-icon-arrow-right folder-arrow"></i>
              <!-- 只有非默认收藏夹才显示删除菜单 -->
              <el-dropdown v-if="folder.isDefault !== 1" trigger="click" @command="handleFolderManageCommand" class="folder-menu">
                <i class="el-icon-more"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ action: 'edit', folder }">重命名</el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'delete', folder }" class="delete-item">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <!-- 默认收藏夹只允许重命名 -->
              <el-dropdown v-else trigger="click" @command="handleFolderManageCommand" class="folder-menu">
                <i class="el-icon-more"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ action: 'edit', folder }">重命名</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>
        </div>

        <!-- 右侧知识点内容 -->
        <div class="collect-content">
          <div class="content-header">
            <h2 class="folder-title">{{ selectedFolderName }}</h2>
            <div class="content-stats">
              <span class="total-count">共{{ pointList.length }}个收藏</span>
            </div>
          </div>

          <div v-loading="loading" class="collect-main">
            <div v-if="pointList.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="el-icon-star-off"></i>
              </div>
              <div class="empty-text">这个收藏夹还是空的</div>
              <div class="empty-desc">快去收藏一些知识点吧~</div>
            </div>

            <div class="knowledge-grid" v-else>
              <div
                v-for="point in pointList"
                :key="point.pointId"
                class="knowledge-card"
                @click="viewDetail(point)">
                
                <div class="card-cover">
                  <div class="card-subject">{{ point.subjectName }}</div>
                  <div class="card-menu">
                    <el-dropdown trigger="click" @command="(command) => handleKnowledgeCommand(command, point)" @click.native.stop>
                      <i class="el-icon-more"></i>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="move">移动到其他收藏夹</el-dropdown-item>
                        <el-dropdown-item command="remove" class="delete-item">移出收藏</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </div>
                
                <div class="card-info">
                  <h3 class="card-title">{{ point.title }}</h3>
                  <p class="card-desc">{{ point.summary }}</p>
                  <div class="card-meta">
                    <div class="meta-left">
                      <span class="difficulty" :class="'difficulty-' + point.difficulty">
                        {{ getDifficultyName(point.difficulty) }}
                      </span>
                    </div>
                    <div class="meta-right">
                      <span class="view-count">
                        <i class="el-icon-view"></i>{{ point.viewCount }}
                      </span>
                      <span class="like-count">
                        <i class="el-icon-thumb"></i>{{ point.likeCount }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他tab的原有布局 -->
      <div v-else v-loading="loading" class="point-list">
        <div v-if="pointList.length === 0" class="empty-data">
          <el-empty description="暂无知识点"></el-empty>
        </div>

        <div v-for="point in pointList" :key="point.pointId" class="point-item" @click="viewDetail(point)">
          <div class="item-header">
            <div class="header-left">
              <span class="title-text">{{ point.title }}</span>
              <el-tag v-if="activeTab === 'myArticles' && point.auditStatus === 0" type="warning" size="mini" class="audit-tag">
                待人工审核
              </el-tag>
              <el-tooltip v-else-if="activeTab === 'myArticles' && point.auditStatus === 2" content="点击查看拒绝原因" placement="top">
                <span class="audit-reject-wrap" @click.stop="showRejectReason(point)">
                  <el-tag type="danger" size="mini" class="audit-tag audit-tag-clickable">
                    已拒绝
                    <i class="el-icon-view el-icon--right"></i>
                  </el-tag>
                  <span class="audit-hint">点击查看原因</span>
                </span>
              </el-tooltip>
              <el-tag v-if="point.difficulty" :type="getDifficultyTag(point.difficulty)" size="mini" class="difficulty-tag">
                {{ getDifficultyName(point.difficulty) }}
              </el-tag>
            </div>
            <div class="header-right">
              <el-button v-if="activeTab === 'myArticles' || point.authorId === currentUserId" type="success" size="mini" icon="el-icon-edit" @click.stop="handleEdit(point)">编辑</el-button>
              <el-button v-if="activeTab === 'myArticles' || point.authorId === currentUserId" type="danger" size="mini" icon="el-icon-delete" @click.stop="handleDelete(point)">删除</el-button>
              <el-button :type="point.isLiked ? 'primary' : ''" size="mini" icon="el-icon-thumb" circle @click.stop="handleLike(point)" />
              <el-dropdown 
                trigger="click" 
                @command="(command) => handleFolderCommand(command, point)" 
                @visible-change="(visible) => onCollectDropdownChange(visible, point)"
                placement="bottom-end"
              >
                <el-button
                  :type="point.isCollected ? 'warning' : ''"
                  :icon="point.isCollected ? 'el-icon-folder-checked' : 'el-icon-folder'"
                  size="mini"
                  circle
                  @click.stop
                />
                <el-dropdown-menu slot="dropdown">
                  <div class="collect-folder-menu">
                    <div class="folder-header">选择收藏夹</div>
                    <div v-if="userFolders.length === 0" class="no-folders">
                      <span>还没有收藏夹</span>
                    </div>
                    <div v-else>
                      <el-dropdown-item
                        v-for="folder in userFolders"
                        :key="folder.folderId"
                        :command="`collect-${folder.folderId}-${point.pointId}`"
                        class="folder-item"
                      >
                        <div class="folder-info">
                          <span class="folder-name">
                            <i class="el-icon-folder" v-if="folder.isDefault"></i>
                            <i class="el-icon-folder-opened" v-else></i>
                            {{ folder.folderName }}
                          </span>
                          <span class="folder-count">{{ folder.collectCount }}</span>
                        </div>
                      </el-dropdown-item>
                    </div>
                    <el-divider style="margin: 8px 0;"></el-divider>
                    <el-dropdown-item :command="`create-folder-${point.pointId}`" class="create-folder-item">
                      <i class="el-icon-plus"></i> 新建收藏夹
                    </el-dropdown-item>
                  </div>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>

          <div class="item-content">
            <p class="summary-text">{{ point.summary }}</p>
          </div>

          <div class="item-footer">
            <div class="footer-left">
              <el-tag size="mini" effect="plain">{{ point.subjectName }}</el-tag>
            </div>
            <div class="footer-right">
              <span class="stat-item"><i class="el-icon-view"></i> {{ point.viewCount }}</span>
              <span class="stat-item"><i class="el-icon-thumb"></i> {{ point.likeCount }}</span>
              <span class="stat-item"><i class="el-icon-folder"></i> {{ point.collectCount }}</span>
              <span class="time"><i class="el-icon-time"></i> {{ formatTime(point.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 新建收藏夹对话框 -->
    <el-dialog title="新建收藏夹" :visible.sync="createFolderDialog" width="500px">
      <el-form :model="newFolder" :rules="folderRules" ref="folderForm">
        <el-form-item label="收藏夹名称" prop="folderName">
          <el-input v-model="newFolder.folderName" placeholder="请输入收藏夹名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="newFolder.description" type="textarea" placeholder="可选，描述这个收藏夹的用途"></el-input>
        </el-form-item>
        <el-form-item label="公开设置">
          <el-radio-group v-model="newFolder.isPublic">
            <el-radio :label="0">仅自己可见</el-radio>
            <el-radio :label="1">公开可见</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createFolderDialog = false">取消</el-button>
        <el-button type="primary" @click="createFolder">创建</el-button>
      </div>
    </el-dialog>

    <!-- 移动知识点对话框 -->
    <el-dialog title="移动到收藏夹" :visible.sync="moveDialog" width="400px">
      <div class="move-folder-list">
        <div 
          v-for="folder in sortedFolderList"
          :key="folder.folderId"
          class="move-folder-item"
          @click="moveToFolder(folder.folderId, selectedKnowledge)">
          <i :class="folder.isDefault === 1 ? 'el-icon-star-on' : 'el-icon-folder'"></i>
          <span>{{ folder.folderName }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getSubjectList, 
  getKnowledgePointList, 
  getKnowledgePointContent,
  getRecommendPoints, 
  toggleLike, 
  toggleCollect, 
  getMyCollects, 
  deleteKnowledgePoint,
  getUserFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  collectToFolder
} from '@/api/knowledge'

export default {
  name: 'KnowledgeLibrary',
  computed: {
    currentUserId() {
      return this.$store.getters.userId
    },
    // 排序后的收藏夹列表：默认收藏夹在前，其他按创建时间排序
    sortedFolderList() {
      return [...this.folderList].sort((a, b) => {
        // 默认收藏夹永远在最前面
        if (a.isDefault === 1 && b.isDefault !== 1) return -1
        if (a.isDefault !== 1 && b.isDefault === 1) return 1
        // 其他收藏夹按创建时间排序
        return new Date(a.createTime) - new Date(b.createTime)
      })
    },
    // 获取默认收藏夹
    defaultFolder() {
      return this.folderList.find(folder => folder.isDefault === 1)
    }
  },
  data() {
    return {
      loading: false,
      subjectList: [],
      pointList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      queryParams: {
        subjectId: null,
        difficulty: null,
        title: '',
        sortType: 'latest'
      },
      myArticleCount: 0,
      myCollectCount: 0,
      totalKnowledgeCount: 0,
      activeTab: 'plaza',
      filterParams: {
        subjectId: null,
        difficulty: null,
        status: null,
        orderBy: 'create_time'
      },
      // 收藏夹相关
      folderList: [],
      userFolders: [],
      selectedFolderId: null,
      selectedFolderName: '',
      createFolderDialog: false,
      moveDialog: false,
      selectedKnowledge: null,
      isCollectMode: false,
      currentKnowledgePoint: null,
      newFolder: {
        folderName: '',
        description: '',
        isPublic: 0
      },
      folderRules: {
        folderName: [
          { required: true, message: '请输入收藏夹名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 检查URL参数中的tab
    const tab = this.$route.query.tab
    if (tab && ['plaza', 'myArticles', 'myCollects'].includes(tab)) {
      this.activeTab = tab
    }
    
    this.loadSubjects()
    this.loadMyArticleCount()
    this.loadMyCollectCount()
    this.loadTotalKnowledgeCount()
    this.loadFolders()
    this.loadDataByTab()
  },
  methods: {
    loadSubjects() {
      getSubjectList().then(response => {
        this.subjectList = response.data || []
      })
    },
    loadPointList() {
      // 广场tab的查询逻辑
      if (this.activeTab !== 'plaza') return
      
      this.loading = true
      
      // 统一使用万能接口，支持所有筛选条件
      const params = { 
        pageNum: this.currentPage, 
        pageSize: this.pageSize, 
        ...this.queryParams 
      }
      
      // 根据sortType添加排序参数
      if (this.queryParams.sortType === 'hot') {
        params.orderBy = 'view_count'  // 按浏览量排序
      } else if (this.queryParams.sortType === 'latest') {
        params.orderBy = 'create_time'  // 按创建时间排序
      } else if (this.queryParams.sortType === 'recommend') {
        // 推荐使用复杂算法，调用专门接口
        this.loadRecommendPoints()
        return
      }
      
      getKnowledgePointList(params).then(response => {
        this.pointList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    
    handleTabClick(tab) {
      this.currentPage = 1
      this.resetFilter()
      this.loadDataByTab()
    },
    
    loadDataByTab() {
      switch (this.activeTab) {
        case 'plaza':
          this.loadPointList()
          break
        case 'myArticles':
          this.loadMyArticles()
          break
        case 'myCollects':
          this.initCollectTab()
          break
        default:
          this.loadPointList()
      }
    },
    loadRecommendPoints() {
      this.loading = true
      getRecommendPoints(10).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
      }).finally(() => {
        this.loading = false
      })
    },
    viewDetail(point) {
      // 大厂级性能优化：传递已有基础数据，避免重复请求
      this.$router.push({ 
        name: 'knowledgeDetail', 
        params: { 
          pointId: point.pointId,
          baseData: point,  // 传递列表中已有的基础数据
          fromTab: this.activeTab  // 传递来源tab
        } 
      })
    },
    handleLike(point) {
      toggleLike(point.pointId).then(response => {
        this.$message.success(response.msg)
        point.isLiked = response.data
        if (response.data) {
          point.likeCount++
        } else {
          point.likeCount--
        }
      }).catch(() => {
        this.$message.error('操作失败，请先登录')
      })
    },
    /** 点击「已拒绝」查看拒绝原因 */
    showRejectReason(point) {
      getKnowledgePointContent(point.pointId).then(res => {
        const remark = res.data && res.data.auditRemark
        this.$alert(
          remark || '管理员未填写拒绝原因',
          `《${point.title}》审核未通过`,
          {
            confirmButtonText: '知道了',
            type: remark ? 'warning' : 'info'
          }
        )
      }).catch(() => {
        this.$message.error('获取拒绝原因失败')
      })
    },
    
    /** 处理收藏夹下拉菜单命令 */
    handleFolderCommand(command, point) {
      if (command.startsWith('collect-')) {
        const parts = command.split('-')
        const folderId = parts[1]
        const pointId = parts[2] || point.pointId
        this.collectToSpecificFolder(pointId, folderId, point)
      } else if (command.startsWith('create-folder-')) {
        const pointId = command.split('-')[2] || point.pointId
        this.currentKnowledgePoint = point
        this.showCreateFolderDialog()
      }
    },
    
    /** 收藏到指定收藏夹 */
    async collectToSpecificFolder(pointId, folderId, point) {
      try {
        const res = await collectToFolder(pointId, folderId)
        if (res.code === 200) {
          this.$message.success('收藏成功')
          if (point) {
            point.isCollected = true
            point.collectCount++
          }
          // 刷新收藏夹列表和收藏总数
          this.loadFolders()
          this.loadMyCollectCount()
        }
      } catch (error) {
        console.error('收藏失败:', error)
        this.$message.error('收藏失败，请先登录')
      }
    },
    
    /** 下拉菜单显示/隐藏时加载收藏夹 */
    onCollectDropdownChange(visible, point) {
      if (visible) {
        this.currentKnowledgePoint = point
        this.loadFolders()
      }
    },
    loadMyCollects() {
      if (!this.currentUserId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.loading = true
      
      // 构建请求参数，确保传递正确的收藏夹ID
      const params = {}
      
      // 如果没有选中收藏夹，先尝试找默认收藏夹
      if (!this.selectedFolderId) {
        const defaultFolder = this.folderList.find(folder => folder.isDefault === 1)
        if (defaultFolder) {
          this.selectedFolderId = defaultFolder.folderId
          this.selectedFolderName = defaultFolder.folderName
        }
      }
      
      // 始终传递收藏夹ID，包括默认收藏夹
      if (this.selectedFolderId !== null && this.selectedFolderId !== undefined) {
        params.folderId = this.selectedFolderId
      }
      
      getMyCollects(params).then(response => {
        this.pointList = response.data || []
        this.total = this.pointList.length
      }).catch((error) => {
        console.error('加载收藏失败:', error)
        this.$message.error('加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    
    /** 初始化收藏tab */
    async initCollectTab() {
      // 先加载收藏夹列表
      await this.loadFolders()
      // 如果没有选中收藏夹，自动选中默认收藏夹
      if (!this.selectedFolderId) {
        const defaultFolder = this.folderList.find(folder => folder.isDefault === 1)
        if (defaultFolder) {
          this.selectedFolderId = defaultFolder.folderId
          this.selectedFolderName = defaultFolder.folderName
        }
      }
      // 加载收藏列表
      this.loadMyCollects()
    },
    
    goPublish() {
      this.$router.push({ name: 'knowledgePublish' })
    },
    // ==================== 收藏夹管理方法 ====================
    
    /** 加载收藏夹列表 */
    async loadFolders() {
      try {
        const res = await getUserFolders()
        if (res.code === 200) {
          this.folderList = res.data || []
          this.userFolders = res.data || []
        }
      } catch (error) {
        console.error('加载收藏夹失败:', error)
      }
    },
    
    /** 显示新建收藏夹对话框 */
    showCreateFolderDialog() {
      this.createFolderDialog = true
      this.newFolder = {
        folderName: '',
        description: '',
        isPublic: 0
      }
    },
    
    /** 创建收藏夹 */
    async createFolderAction() {
      try {
        await this.$refs.folderForm.validate()
        const res = await createFolder(this.newFolder)
        if (res.code === 200) {
          this.$message.success('创建成功')
          this.createFolderDialog = false
          await this.loadFolders()
          
          // 如果有当前知识点，自动收藏到新建的收藏夹
          if (this.currentKnowledgePoint && res.data && res.data.folderId) {
            await this.collectToSpecificFolder(
              this.currentKnowledgePoint.pointId, 
              res.data.folderId, 
              this.currentKnowledgePoint
            )
          }
        } else {
          this.$message.error(res.msg || '创建失败')
        }
      } catch (error) {
        console.error('创建收藏夹失败:', error)
      }
    },

    /** 选择收藏夹 */
    selectFolder(folderId) {
      this.selectedFolderId = folderId
      const folder = this.folderList.find(f => f.folderId === folderId)
      this.selectedFolderName = folder ? folder.folderName : '未知收藏夹'
      this.loadMyCollects()
    },

    /** 处理收藏夹管理菜单命令 */
    handleFolderManageCommand({ action, folder }) {
      if (action === 'edit') {
        this.editFolder(folder)
      } else if (action === 'delete') {
        this.deleteFolder(folder)
      }
    },

    /** 编辑收藏夹 */
    editFolder(folder) {
      this.$prompt('请输入新的收藏夹名称', '编辑收藏夹', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: folder.folderName,
        inputPattern: /^.{1,20}$/,
        inputErrorMessage: '名称长度在 1 到 20 个字符'
      }).then(async ({ value }) => {
        try {
          const res = await updateFolder({
            folderId: folder.folderId,
            folderName: value,
            description: folder.description
          })
          if (res.code === 200) {
            this.$message.success('修改成功')
            await this.loadFolders()
          } else {
            this.$message.error(res.msg || '修改失败')
          }
        } catch (error) {
          this.$message.error('修改失败')
        }
      })
    },

    /** 删除收藏夹 */
    deleteFolder(folder) {
      // 防止删除默认收藏夹
      if (folder.isDefault === 1) {
        this.$message.warning('默认收藏夹不能删除')
        return
      }
      
      this.$confirm(`确定删除收藏夹"${folder.folderName}"吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteFolder(folder.folderId)
          if (res.code === 200) {
            this.$message.success('删除成功')
            await this.loadFolders()
            if (this.selectedFolderId === folder.folderId) {
              // 删除当前选中的收藏夹后，切换到默认收藏夹
              const defaultFolder = this.defaultFolder
              if (defaultFolder) {
                this.selectFolder(defaultFolder.folderId)
              }
            }
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    /** 处理知识点菜单命令 */
    handleKnowledgeCommand(command, point) {
      if (command === 'move') {
        this.selectedKnowledge = point
        this.moveDialog = true
      } else if (command === 'remove') {
        this.removeFromFolder(point)
      }
    },

    /** 移动到收藏夹 */
    async moveToFolder(folderId, point) {
      try {
        const res = await collectToFolder(point.pointId, folderId)
        if (res.code === 200) {
          this.$message.success('移动成功')
          this.moveDialog = false
          // 重新加载收藏列表和收藏夹列表
          this.loadMyCollects()
          this.loadFolders()
          this.loadMyCollectCount()
        } else {
          this.$message.error(res.msg || '移动失败')
        }
      } catch (error) {
        this.$message.error('移动失败')
      }
    },

    /** 从收藏夹移除 */
    removeFromFolder(point) {
      this.$confirm('确定移出这个收藏夹吗？', '移出确认', {
        confirmButtonText: '移出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await toggleCollect(point.pointId)
          if (res.code === 200) {
            this.$message.success('已移出')
            // 重新加载收藏列表和收藏夹列表
            this.loadMyCollects()
            this.loadFolders()
            this.loadMyCollectCount()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } catch (error) {
          this.$message.error('操作失败')
        }
      })
    },
    loadMyArticles() {
      if (!this.currentUserId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.loading = true
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        authorId: this.currentUserId,
        ...this.filterParams
      }
      getKnowledgePointList(params).then(response => {
        this.pointList = response.rows || []
        this.total = response.total || 0
      }).catch(() => {
        this.$message.error('加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    applyFilter() {
      this.currentPage = 1
      this.loadDataByTab()
    },
    resetFilter() {
      this.filterParams = {
        subjectId: null,
        difficulty: null,
        status: null,
        orderBy: 'create_time'
      }
    },
    loadMyArticleCount() {
      const userId = this.$store.getters.userId
      if (!userId) {
        return
      }
      const params = {
        pageNum: 1,
        pageSize: 1,
        authorId: userId
      }
      getKnowledgePointList(params).then(response => {
        this.myArticleCount = response.total || 0
      }).catch(() => {
        // 静默失败
      })
    },
    loadMyCollectCount() {
      const userId = this.$store.getters.userId
      if (!userId) {
        return
      }
      getMyCollects().then(response => {
        this.myCollectCount = response.data ? response.data.length : 0
      }).catch(() => {
        // 静默失败
      })
    },
    loadTotalKnowledgeCount() {
      const params = {
        pageNum: 1,
        pageSize: 1
      }
      getKnowledgePointList(params).then(response => {
        this.totalKnowledgeCount = response.total || 0
      }).catch(() => {
        // 静默失败
      })
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadDataByTab()
    },
    handleEdit(point) {
      this.$router.push({ 
        name: 'knowledgePublish', 
        query: { 
          pointId: point.pointId,
          from: this.activeTab === 'myArticles' ? 'myArticles' : 'knowledge'
        } 
      })
    },
    handleDelete(point) {
      this.$confirm('确定要删除这个知识点吗？删除后无法恢复！', '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        this.deleteKnowledgePoint(point.pointId)
      }).catch(() => {
        // 用户取消删除
      })
    },
    deleteKnowledgePoint(pointId) {
      deleteKnowledgePoint(pointId).then(() => {
        this.$message.success('删除成功')
        // 重新加载数据
        this.loadDataByTab()
      }).catch(() => {
        this.$message.error('删除失败')
      })
    },
    getDifficultyName(difficulty) {
      const map = { 1: '简单', 2: '中等', 3: '困难' }
      return map[difficulty] || ''
    },
    getDifficultyTag(difficulty) {
      const map = { 1: 'success', 2: 'warning', 3: 'danger' }
      return map[difficulty] || 'info'
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    }
  }
}
</script>

<style scoped>
.knowledge-library {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.filter-bar {
  margin-bottom: 15px;
}
.filter-bar .el-select,
.filter-bar .el-input {
  width: 100%;
}
.plaza-filters {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}
.plaza-filters .el-select,
.plaza-filters .el-input {
  width: 100%;
}
.tab-nav {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tab-nav .el-tabs {
  flex: 1;
}
.tab-actions {
  margin-left: 20px;
}
.badge-item {
  margin-left: 5px;
}
.total-badge {
  margin-left: 10px;
}
.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.filter-section .el-select {
  width: 100%;
}
.point-list {
  min-height: 400px;
}
.point-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}
.point-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}
.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-right: 10px;
}
.audit-tag {
  margin-left: 8px;
}
.audit-tag-clickable {
  cursor: pointer;
}
.audit-tag-clickable:hover {
  opacity: 0.85;
}
.audit-reject-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin-left: 8px;
}
.audit-reject-wrap .audit-tag {
  margin-left: 0;
}
.audit-hint {
  margin-left: 4px;
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
}
.audit-reject-wrap:hover .audit-hint {
  color: #e6a23c;
  text-decoration: underline;
}
.difficulty-tag {
  margin-left: 10px;
}
.header-right {
  display: flex;
  gap: 8px;
}
.item-content {
  margin-bottom: 12px;
}
.summary-text {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}
.footer-left {
  display: flex;
  gap: 8px;
}
.footer-right {
  display: flex;
  gap: 15px;
  align-items: center;
}
.stat-item {
  color: #909399;
}
.stat-item i {
  margin-right: 4px;
}
.time {
  color: #909399;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
.empty-data {
  padding: 60px 0;
}

/* ===== B站风格收藏夹样式 ===== */
.collect-layout {
  display: flex;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 左侧收藏夹目录 */
.folder-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e7e7e7;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e7e7e7;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #18191c;
}

.header-title i {
  margin-right: 8px;
  color: #00aeec;
  font-size: 18px;
}

.create-btn {
  padding: 6px;
  color: #6d757a;
}

.create-btn:hover {
  color: #00aeec;
  background: #f0f9ff;
}

.folder-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.folder-item:hover {
  background: #f4f5f7;
}

.folder-item.active {
  background: #e7f3ff;
  border-right: 2px solid #00aeec;
}

.folder-item.active .folder-name {
  color: #00aeec;
  font-weight: 500;
}

.folder-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.folder-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-icon i {
  font-size: 16px;
  color: #6d757a;
}

.folder-item.active .folder-icon i {
  color: #00aeec;
}

.folder-content {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 14px;
  color: #18191c;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-desc {
  font-size: 12px;
  color: #9499a0;
  line-height: 16px;
  margin-top: 2px;
}

.folder-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.folder-item:hover .folder-actions {
  opacity: 1;
}

.folder-arrow {
  color: #9499a0;
  font-size: 12px;
  margin-right: 8px;
}

.folder-menu {
  padding: 4px;
  border-radius: 4px;
  color: #9499a0;
}

.folder-menu:hover {
  background: #f0f9ff;
  color: #00aeec;
}

/* 右侧内容区域 */
.collect-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e7e7e7;
  background: #fff;
}

.folder-title {
  font-size: 20px;
  font-weight: 500;
  color: #18191c;
  margin: 0 0 8px;
}

.content-stats {
  display: flex;
  align-items: center;
}

.total-count {
  font-size: 13px;
  color: #9499a0;
}

.collect-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-icon i {
  font-size: 64px;
  color: #c9ccd0;
}

.empty-text {
  font-size: 16px;
  color: #61666d;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #9499a0;
  margin-bottom: 24px;
}

/* 知识点网格布局 */
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.knowledge-card {
  background: #fff;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.knowledge-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #00aeec;
}

.card-cover {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-subject {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.card-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.knowledge-card:hover .card-menu {
  opacity: 1;
}

.card-menu:hover {
  background: rgba(255, 255, 255, 0.3);
}

.card-menu i {
  color: #fff;
  font-size: 14px;
}

.card-info {
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #18191c;
  line-height: 20px;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-desc {
  font-size: 13px;
  color: #61666d;
  line-height: 18px;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.difficulty {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.difficulty-1 {
  background: #e6f7ff;
  color: #1890ff;
}

.difficulty-2 {
  background: #fff7e6;
  color: #fa8c16;
}

.difficulty-3 {
  background: #fff2f0;
  color: #f5222d;
}

.meta-right {
  display: flex;
  gap: 12px;
  color: #9499a0;
}

.view-count,
.like-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-count i,
.like-count i {
  font-size: 12px;
}

/* 移动对话框样式 */
.move-folder-list {
  max-height: 300px;
  overflow-y: auto;
}

.move-folder-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.move-folder-item:hover {
  background: #f4f5f7;
}

.move-folder-item i {
  margin-right: 10px;
  font-size: 16px;
  color: #00aeec;
}

.delete-item {
  color: #f5222d !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .collect-layout {
    flex-direction: column;
    height: auto;
  }
  
  .folder-sidebar {
    width: 100%;
    height: 200px;
  }
  
  .folder-list {
    display: flex;
    overflow-x: auto;
    padding: 0 8px;
  }
  
  .folder-item {
    min-width: 160px;
    flex-shrink: 0;
  }
  
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}

/* 收藏夹下拉菜单样式 */
.collect-folder-menu {
  padding: 10px;
  min-width: 200px;
}

.folder-header {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
  text-align: center;
  padding-bottom: 5px;
  border-bottom: 1px solid #e4e7ed;
}

.no-folders {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 10px;
}

.folder-item {
  display: block !important;
  padding: 8px 12px !important;
}

.folder-item:hover {
  background-color: #f5f7fa;
}

.folder-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.folder-name {
  font-size: 13px;
  color: #606266;
}

.folder-name i {
  margin-right: 5px;
  color: #909399;
}

.folder-count {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 10px;
}

.create-folder-item {
  color: #409eff !important;
  font-size: 13px;
}

.create-folder-item:hover {
  background-color: #ecf5ff;
}
</style>
