<template>
  <div class="search-page">
    <!-- 导航栏 -->
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
          <router-link v-if="userStore.isLoggedIn" to="/my" class="nav-item">个人中心</router-link>
        </div>

        <div class="nav-actions">
          <el-button v-if="!userStore.isLoggedIn" @click="router.push('/login')" type="primary">登录</el-button>
          <el-dropdown v-else>
            <div class="user-info">
              <el-avatar :src="userStore.userInfo?.avatar" />
              <span>{{ userStore.userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/my')">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <div class="container page-content">
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-header">
          <h1>
            <el-icon><MagicStick /></el-icon>
            AI智能搜索
          </h1>
          <p>基于DeepSeek AI的智能搜索，理解你的意图，找到最合适的活动</p>
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
            {{ searching ? '搜索中...' : 'AI搜索' }}
          </el-button>
        </div>

        <!-- AI增强结果 -->
        <div v-if="searchEnhancement" class="enhancement-section">
          <div class="enhancement-card">
            <h3>
              <el-icon><Compass /></el-icon>
              相关关键词
            </h3>
            <div class="keywords">
              <el-tag
                v-for="keyword in searchEnhancement.relatedKeywords"
                :key="keyword"
                @click="searchQuery = keyword; handleSearch()"
                class="keyword-tag"
              >
                {{ keyword }}
              </el-tag>
            </div>
          </div>

          <div v-if="searchEnhancement.suggestedFilters" class="enhancement-card">
            <h3>
              <el-icon><Filter /></el-icon>
              推荐筛选
            </h3>
            <div class="suggested-filters">
              <el-tag v-if="searchEnhancement.suggestedFilters.category" type="success">
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
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="results-section">
        <div class="results-header">
          <h2>找到 {{ searchResults.length }} 个相关活动</h2>
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
      <div v-else-if="hasSearched" class="empty-state">
        <el-empty description="没有找到相关活动，试试其他关键词吧" />
      </div>

      <!-- 搜索建议 -->
      <div v-else class="suggestions-section">
        <h2>热门搜索</h2>
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

        <h2 style="margin-top: 40px">搜索示例</h2>
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
import { ref, computed } from 'vue'
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

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  hasSearched.value = true

  try {
    // 获取所有活动
    const allActivities = activityStore.activities

    // 使用AI增强搜索
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

    ElMessage.success(`找到 ${searchResults.value.length} 个相关活动`)
  } catch (error) {
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

/* 导航栏 */
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
  gap: 10px;
  cursor: pointer;
}

/* 页面内容 */
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

/* 增强结果 */
.enhancement-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.enhancement-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.enhancement-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.keywords,
.suggested-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.keyword-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* 搜索结果 */
.results-section {
  margin-top: 40px;
}

.results-header {
  margin-bottom: 30px;
}

.results-header h2 {
  font-size: 28px;
  font-weight: 700;
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

/* 空状态 */
.empty-state {
  padding: 80px 20px;
}

/* 搜索建议 */
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

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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
</style>




