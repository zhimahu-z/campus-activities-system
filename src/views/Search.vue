<template>
  <div class="search-page">
    <nav class="navbar">
      <div class="container nav-content">
        <div class="logo" @click="router.push('/home')">
          <span class="logo-icon">🎓</span>
          <span class="logo-text gradient-text">智能校园活动</span>
        </div>
        
        <div class="nav-menu">
          <router-link to="/home" class="nav-item">首页</router-link>
          <router-link to="/activities" class="nav-item">活动列表</router-link>
          <router-link to="/search" class="nav-item active">智能搜索</router-link>
          <router-link v-if="userStore.isLoggedIn && !userStore.isAdmin" to="/my" class="nav-item">个人中心</router-link>
          <router-link v-if="userStore.isLoggedIn && userStore.isAdmin" to="/admin" class="nav-item">管理后台</router-link>
        </div>

        <div class="nav-actions">
          <el-button v-if="!userStore.isLoggedIn" @click="router.push('/login')" type="primary">登录</el-button>
          <div v-else class="user-info">
            <span>{{ userStore.userName }}</span>
            <el-button @click="handleLogout" size="small">退出</el-button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container page-content">
      <div class="search-section">
        <div class="search-header">
          <h1>
            <el-icon><MagicStick /></el-icon>
            AI智能搜索
          </h1>
          <p>基于DeepSeek大模型的智能搜索，理解你的意图，找到最合适的活动</p>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="输入关键词，AI会帮你找到最相关的活动..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" :loading="searching" @click="handleSearch">
            <el-icon><MagicStick /></el-icon>
            {{ searching ? 'AI分析中...' : 'AI搜索' }}
          </el-button>
        </div>

        <!-- AI增强结果 -->
        <div v-if="searchEnhancement" class="enhancement-section">
          <el-alert title="🤖 AI搜索增强" type="success" :closable="false">
            <p>DeepSeek AI已分析您的搜索意图，为您提供以下建议：</p>
          </el-alert>

          <div class="enhancement-cards">
            <el-card class="enhancement-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Compass /></el-icon>
                  <span>相关关键词</span>
                </div>
              </template>
              <div class="keywords">
                <el-tag
                  v-for="keyword in searchEnhancement.relatedKeywords"
                  :key="keyword"
                  @click="searchQuery = keyword; handleSearch()"
                  class="keyword-tag"
                  type="success"
                >
                  {{ keyword }}
                </el-tag>
              </div>
            </el-card>

            <el-card v-if="searchEnhancement.suggestedFilters && Object.keys(searchEnhancement.suggestedFilters).length > 0" class="enhancement-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Filter /></el-icon>
                  <span>推荐筛选</span>
                </div>
              </template>
              <div class="suggested-filters">
                <el-tag v-if="searchEnhancement.suggestedFilters.category" type="primary">
                  分类: {{ searchEnhancement.suggestedFilters.category }}
                </el-tag>
                <el-tag
                  v-for="tag in searchEnhancement.suggestedFilters.tags"
                  :key="tag"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- AI分析中的加载状态 -->
      <div v-if="searching" class="loading-section">
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <h2>🤖 DeepSeek AI 正在分析中...</h2>
          <p>AI正在理解您的搜索意图，为您匹配最相关的活动</p>
          <div class="loading-steps">
            <div class="step-item">
              <el-icon class="step-icon"><Check /></el-icon>
              <span>解析搜索关键词</span>
            </div>
            <div class="step-item">
              <el-icon class="step-icon"><Check /></el-icon>
              <span>分析活动内容</span>
            </div>
            <div class="step-item active">
              <el-icon class="step-icon"><Loading /></el-icon>
              <span>智能匹配推荐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchResults.length > 0" class="results-section">
        <div class="results-header">
          <h2>
            <el-icon><DocumentChecked /></el-icon>
            找到 {{ searchResults.length }} 个相关活动
          </h2>
        </div>

        <div class="results-grid">
          <div
            v-for="activity in searchResults"
            :key="activity.id"
            class="activity-card"
            @click="goToDetail(activity.id)"
          >
            <div class="activity-cover">
              <img :src="activity.cover" :alt="activity.title" />
              <div class="ai-badge">AI推荐</div>
              <!-- 活动状态标识 -->
              <div class="activity-status" :class="`status-${getActivityStatus(activity)}`">
                {{ getActivityStatusText(activity) }}
              </div>
            </div>
            <div class="activity-info">
              <div class="activity-category" :style="{ color: getCategoryColor(activity.category) }">
                {{ getCategoryIcon(activity.category) }} {{ activity.category }}
              </div>
              <h3>{{ activity.title }}</h3>
              <p class="activity-desc">{{ activity.description?.substring(0, 80) }}...</p>
              <div class="activity-meta">
                <span><el-icon><Clock /></el-icon>{{ formatDate(activity.startTime) }}</span>
                <span><el-icon><User /></el-icon>{{ activity.participants }}人</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="hasSearched && !searching" class="empty-state">
        <el-empty description="没有找到相关活动，试试其他关键词吧">
          <el-button type="primary" @click="hasSearched = false; searchResults = []">返回</el-button>
        </el-empty>
      </div>

      <!-- 搜索建议 -->
      <div v-else class="suggestions-section">
        <h2>💡 热门搜索</h2>
        <div class="suggestions">
          <el-tag
            v-for="suggestion in hotSearches"
            :key="suggestion"
            size="large"
            @click="searchQuery = suggestion; handleSearch()"
            class="suggestion-tag"
          >
            {{ suggestion }}
          </el-tag>
        </div>

        <h2 style="margin-top: 40px">📝 搜索示例</h2>
        <div class="examples">
          <div
            v-for="example in searchExamples"
            :key="example"
            class="example-item"
            @click="searchQuery = example; handleSearch()"
          >
            <el-icon><Search /></el-icon>
            <span>{{ example }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import { useAIStore } from '@/stores/ai'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activityStore = useActivityStore()
const aiStore = useAIStore()

const searchQuery = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const searchResults = ref([])
const searchEnhancement = ref(null)

const hotSearches = ['人工智能', '音乐会', '马拉松', '志愿服务', '创业', '摄影']
const searchExamples = [
  '我想参加关于AI的讲座',
  '周末有什么文艺活动',
  '适合运动爱好者的活动',
  '可以获得证书的活动',
  '创新创业相关的比赛'
]

onMounted(() => {
  activityStore.initMockData()
})

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  searchResults.value = [] // 清空之前的结果
  searchEnhancement.value = null // 清空之前的增强信息

  try {
    const allActivities = activityStore.activities

    // 使用AI增强搜索
    ElMessage.info('🤖 AI正在分析您的搜索意图...')
    const enhancement = await aiStore.enhanceSearch(searchQuery.value, allActivities)
    searchEnhancement.value = enhancement

    // 根据AI推荐的ID获取活动
    if (enhancement && enhancement.relevantIds.length > 0) {
      searchResults.value = allActivities.filter(activity =>
        enhancement.relevantIds.includes(activity.id.toString()) ||
        enhancement.relevantIds.includes(activity.id)
      )
    } else {
      // 降级到普通搜索
      const keyword = searchQuery.value.toLowerCase()
      searchResults.value = allActivities.filter(activity =>
        activity.title.toLowerCase().includes(keyword) ||
        activity.description.toLowerCase().includes(keyword) ||
        activity.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    }

    // 搜索完成后才设置 hasSearched
    hasSearched.value = true

    // 检查是否使用了本地算法
    const usedLocalAlgorithm = !enhancement || enhancement.relevantIds.length === 0
    if (usedLocalAlgorithm) {
      ElMessage.success(`✅ 搜索完成！找到 ${searchResults.value.length} 个相关活动（本地算法）`)
    } else {
      ElMessage.success(`✅ AI分析完成！找到 ${searchResults.value.length} 个相关活动`)
    }
  } catch (error) {
    hasSearched.value = true // 即使出错也要设置，以便显示空状态
    ElMessage.error('搜索失败，请重试')
    console.error('搜索错误:', error)
  } finally {
    searching.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/activity/${id}`)
}

const getCategoryIcon = (category) => {
  const cat = activityStore.categories.find(c => c.name === category)
  return cat?.icon || '✨'
}

const getCategoryColor = (category) => {
  const cat = activityStore.categories.find(c => c.name === category)
  return cat?.color || '#64748b'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取活动状态
const getActivityStatus = (activity) => {
  const now = new Date()
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)
  
  if (now < startTime) return 'upcoming' // 未开始
  if (now >= startTime && now <= endTime) return 'ongoing' // 进行中
  return 'ended' // 已结束
}

const getActivityStatusText = (activity) => {
  const status = getActivityStatus(activity)
  const statusMap = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return statusMap[status] || '未知'
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.navbar {
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-item:hover,
.nav-item.active {
  color: var(--primary-color);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-content {
  padding: 60px 20px;
}

.search-section {
  max-width: 800px;
  margin: 0 auto 60px;
}

.search-header {
  text-align: center;
  margin-bottom: 40px;
}

.search-header h1 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--primary-color);
}

.search-header p {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.search-box .el-input {
  flex: 1;
}

.enhancement-section {
  margin-top: 30px;
}

.enhancement-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.keywords,
.suggested-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag,
.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.keyword-tag:hover,
.suggestion-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.results-section {
  margin-top: 40px;
}

.results-header {
  margin-bottom: 30px;
}

.results-header h2 {
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.activity-card {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.activity-cover {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.activity-card:hover .activity-cover img {
  transform: scale(1.1);
}

.ai-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
}

.activity-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.status-upcoming {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
  color: white;
}

.status-ongoing {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.9), rgba(245, 87, 108, 0.9));
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.status-ended {
  background: rgba(224, 224, 224, 0.9);
  color: #666;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.activity-info {
  padding: 20px;
}

.activity-category {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.activity-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.activity-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: var(--text-secondary);
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.empty-state {
  padding: 80px 20px;
}

.suggestions-section {
  max-width: 800px;
  margin: 0 auto;
}

.suggestions-section h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 40px;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.example-item:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

.example-item span {
  font-size: 15px;
  color: var(--text-primary);
}

.loading-section {
  padding: 80px 20px;
  text-align: center;
}

.loading-content {
  max-width: 600px;
  margin: 0 auto;
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: var(--shadow-lg);
}

.loading-icon {
  font-size: 64px;
  color: var(--primary-color);
  animation: rotate 2s linear infinite;
  margin-bottom: 24px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.loading-content p {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.3s;
}

.step-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 2px solid var(--primary-color);
}

.step-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.step-item.active .step-icon {
  animation: rotate 2s linear infinite;
}

.step-item span {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}
</style>
