<template>
  <div class="home-page">
    <nav class="navbar">
      <div class="container nav-content">
        <div class="logo" @click="router.push('/home')" style="cursor: pointer;">
          <span class="logo-icon">🎓</span>
          <span class="logo-text gradient-text">智能校园活动</span>
        </div>
        
        <div class="nav-menu">
          <router-link to="/home" class="nav-item">首页</router-link>
          <router-link to="/activities" class="nav-item">活动列表</router-link>
          <router-link to="/search" class="nav-item">智能搜索</router-link>
          <router-link v-if="userStore.isLoggedIn && !userStore.isAdmin" to="/my" class="nav-item">个人中心</router-link>
          <router-link v-if="userStore.isLoggedIn && userStore.isAdmin" to="/admin" class="nav-item">管理后台</router-link>
        </div>
        
        <div class="nav-actions">
          <el-button v-if="!userStore.isLoggedIn" @click="router.push('/login')" type="primary">
            登录
          </el-button>
          <div v-else class="user-info">
            <span>{{ userStore.userName }}</span>
            <el-button @click="handleLogout" size="small">退出</el-button>
          </div>
        </div>
      </div>
    </nav>

    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            发现精彩校园活动
            <br />
            <span class="gradient-text">AI智能推荐</span>
          </h1>
          <p class="hero-subtitle">基于DeepSeek AI的智能活动管理平台</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 40px;">热门活动</h2>
        <div class="activities-grid">
          <div 
            v-for="activity in activities" 
            :key="activity.id" 
            class="activity-card"
            @click="goToDetail(activity.id)"
          >
            <div class="activity-cover">
              <img :src="activity.cover" :alt="activity.title" />
              <!-- 活动状态标识 -->
              <div class="activity-status" :class="`status-${getActivityStatus(activity)}`">
                {{ getActivityStatusText(activity) }}
              </div>
            </div>
            <div class="activity-info">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.description.substring(0, 60) }}...</p>
              <div class="activity-meta">
                <span>📍 {{ activity.location }}</span>
                <span>👥 {{ activity.participants }}人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activityStore = useActivityStore()

const activities = computed(() => activityStore.activities)

onMounted(async () => {
  // 从后端API加载活动数据
  await activityStore.initMockData()
  // 监听报名变化事件
  window.addEventListener('activity-registration-changed', handleRegistrationChange)
})

// 处理报名变化事件
const handleRegistrationChange = async () => {
  // 重新加载活动数据以获取最新的参与人数
  await activityStore.fetchActivities()
}

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('activity-registration-changed', handleRegistrationChange)
})

const goToDetail = (id) => {
  router.push(`/activity/${id}`)
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
}
</script>

<style scoped>
.home-page {
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
.nav-item.router-link-active {
  color: var(--primary-color);
}

.nav-item.router-link-active::after {
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

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.9;
}

.section {
  padding: 80px 20px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.activity-card {
  background: var(--bg-primary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.activity-cover {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.activity-info h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.activity-info p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.activity-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
