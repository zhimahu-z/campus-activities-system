<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="container nav-content">
        <div class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text gradient-text">智能校园活动</span>
        </div>
        
        <div class="nav-menu">
          <router-link to="/home" class="nav-item active">首页</router-link>
          <router-link to="/activities" class="nav-item">活动列表</router-link>
          <router-link to="/search" class="nav-item">智能搜索</router-link>
          <router-link v-if="userStore.isLoggedIn" to="/my" class="nav-item">个人中心</router-link>
          <router-link v-if="userStore.isAdmin" to="/admin" class="nav-item">管理后台</router-link>
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
                <el-dropdown-item @click="router.push('/my/favorites')">我的收藏</el-dropdown-item>
                <el-dropdown-item @click="router.push('/my/registrations')">我的报名</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            发现精彩校园活动
            <br />
            <span class="gradient-text">AI智能推荐</span>
          </h1>
          <p class="hero-subtitle">基于DeepSeek AI的智能活动管理平台，为你推荐最适合的校园活动</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="router.push('/activities')">
              <el-icon><Calendar /></el-icon>
              浏览活动
            </el-button>
            <el-button size="large" @click="router.push('/search')">
              <el-icon><Search /></el-icon>
              智能搜索
            </el-button>
          </div>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="float-card card-1">📚</div>
        <div class="float-card card-2">🎭</div>
        <div class="float-card card-3">⚽</div>
        <div class="float-card card-4">🎨</div>
      </div>
    </section>

    <!-- AI推荐区域 -->
    <section v-if="userStore.isLoggedIn" class="section ai-recommend-section">
      <div class="container">
        <div class="section-header">
          <h2>
            <el-icon><MagicStick /></el-icon>
            AI为你推荐
          </h2>
          <p>基于你的兴趣和行为，智能推荐最适合的活动</p>
        </div>

        <div v-if="aiStore.loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="recommendedActivities.length > 0" class="activities-grid">
          <div
            v-for="activity in recommendedActivities"
            :key="activity.id"
            class="activity-card"
            @click="goToDetail(activity.id)"
          >
            <div class="activity-cover">
              <img :src="activity.cover" :alt="activity.title" />
              <div class="activity-badge">AI推荐</div>
            </div>
            <div class="activity-info">
              <h3>{{ activity.title }}</h3>
              <p class="activity-desc">{{ activity.description?.substring(0, 60) }}...</p>
              <div class="activity-meta">
                <span><el-icon><Location /></el-icon>{{ activity.location }}</span>
                <span><el-icon><User /></el-icon>{{ activity.participants }}/{{ activity.maxParticipants }}</span>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无推荐活动，多参与活动后会有更精准的推荐哦" />
      </div>
    </section>

    <!-- 热门活动 -->
    <section class="section hot-activities-section">
      <div class="container">
        <div class="section-header">
          <h2>
            <el-icon><TrendCharts /></el-icon>
            热门活动
          </h2>
          <p>最受欢迎的校园活动</p>
        </div>

        <div class="activities-grid">
          <div
            v-for="activity in hotActivities"
            :key="activity.id"
            class="activity-card"
            @click="goToDetail(activity.id)"
          >
            <div class="activity-cover">
              <img :src="activity.cover" :alt="activity.title" />
              <div class="activity-badge hot">🔥 热门</div>
            </div>
            <div class="activity-info">
              <div class="activity-category" :style="{ color: getCategoryColor(activity.category) }">
                {{ getCategoryIcon(activity.category) }} {{ activity.category }}
              </div>
              <h3>{{ activity.title }}</h3>
              <p class="activity-desc">{{ activity.description?.substring(0, 60) }}...</p>
              <div class="activity-meta">
                <span><el-icon><Clock /></el-icon>{{ formatDate(activity.startTime) }}</span>
                <span><el-icon><User /></el-icon>{{ activity.participants }}人参与</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 即将开始 -->
    <section class="section upcoming-section">
      <div class="container">
        <div class="section-header">
          <h2>
            <el-icon><Timer /></el-icon>
            即将开始
          </h2>
          <p>不要错过这些精彩活动</p>
        </div>

        <div class="timeline">
          <div
            v-for="activity in upcomingActivities.slice(0, 5)"
            :key="activity.id"
            class="timeline-item"
            @click="goToDetail(activity.id)"
          >
            <div class="timeline-date">
              <div class="date-day">{{ getDay(activity.startTime) }}</div>
              <div class="date-month">{{ getMonth(activity.startTime) }}</div>
            </div>
            <div class="timeline-content">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.location }} · {{ formatTime(activity.startTime) }}</p>
              <div class="timeline-tags">
                <el-tag v-for="tag in activity.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 分类浏览 -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header">
          <h2>
            <el-icon><Grid /></el-icon>
            分类浏览
          </h2>
          <p>按类别探索活动</p>
        </div>

        <div class="categories-grid">
          <div
            v-for="category in activityStore.categories"
            :key="category.id"
            class="category-card"
            @click="goToCategory(category.name)"
          >
            <div class="category-icon" :style="{ background: category.color }">
              {{ category.icon }}
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ getCategoryCount(category.name) }} 个活动</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>© 2026 智能校园活动管理系统 | 基于Vue3 + DeepSeek AI</p>
      </div>
    </footer>
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

const recommendedActivities = ref([])

const hotActivities = computed(() => activityStore.hotActivities.slice(0, 6))
const upcomingActivities = computed(() => activityStore.upcomingActivities)

onMounted(async () => {
  // 初始化活动数据
  activityStore.initMockData()
  
  // 如果用户已登录，获取AI推荐
  if (userStore.isLoggedIn) {
    const userBehavior = userStore.getUserBehaviorData()
    const allActivities = activityStore.activities
    recommendedActivities.value = await aiStore.getRecommendations(userBehavior, allActivities)
  }
})

const goToDetail = (id) => {
  router.push(`/activity/${id}`)
}

const goToCategory = (category) => {
  router.push({ path: '/activities', query: { category } })
}

const getCategoryIcon = (category) => {
  const cat = activityStore.categories.find(c => c.name === category)
  return cat?.icon || '✨'
}

const getCategoryColor = (category) => {
  const cat = activityStore.categories.find(c => c.name === category)
  return cat?.color || '#64748b'
}

const getCategoryCount = (category) => {
  return activityStore.activities.filter(a => a.category === category).length
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getDay = (dateStr) => {
  return new Date(dateStr).getDate()
}

const getMonth = (dateStr) => {
  return `${new Date(dateStr).getMonth() + 1}月`
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home-page {
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

/* 英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.hero-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.float-card {
  position: absolute;
  font-size: 60px;
  opacity: 0.2;
  animation: float 6s infinite ease-in-out;
}

.card-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.card-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 2s;
}

.card-4 {
  bottom: 10%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 通用区域样式 */
.section {
  padding: 80px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.section-header p {
  color: var(--text-secondary);
  font-size: 16px;
}

/* 活动网格 */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.activity-card {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.activity-cover {
  position: relative;
  height: 200px;
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

.activity-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(99, 102, 241, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.activity-badge.hot {
  background: rgba(239, 68, 68, 0.9);
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
  color: var(--text-primary);
}

.activity-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.6;
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

/* 时间线 */
.timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.timeline-item:hover {
  transform: translateX(10px);
  box-shadow: var(--shadow-md);
}

.timeline-date {
  flex-shrink: 0;
  width: 60px;
  text-align: center;
  padding: 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 8px;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
}

.date-month {
  font-size: 12px;
}

.timeline-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.timeline-content p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
}

.timeline-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 分类网格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.category-card {
  background: var(--bg-primary);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.category-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.category-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.category-card p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 页脚 */
.footer {
  background: var(--bg-primary);
  padding: 30px 20px;
  text-align: center;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}

.loading-container {
  padding: 40px;
}
</style>




