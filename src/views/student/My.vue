<template>
  <div class="my-page">
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
          <div class="user-info">
            <span>{{ userStore.userName }}</span>
            <el-button @click="handleLogout" size="small">退出</el-button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container page-content">
      <div class="profile-header">
        <el-avatar :src="userStore.userInfo?.avatar" :size="100" />
        <div class="profile-info">
          <h1>{{ userStore.userInfo?.name }}</h1>
          <p>{{ userStore.userInfo?.email }}</p>
          <div class="profile-meta">
            <span>学号: {{ userStore.userInfo?.studentId }}</span>
            <span>专业: {{ userStore.userInfo?.major }}</span>
            <span>年级: {{ userStore.userInfo?.grade }}</span>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的报名" name="registrations">
          <div v-if="registeredActivities.length > 0" class="activities-grid">
            <div v-for="activity in registeredActivities" :key="activity.id" class="activity-card">
              <!-- 活动状态标识 -->
              <div class="activity-status" :class="`status-${getActivityStatus(activity)}`">
                {{ getActivityStatusText(activity) }}
              </div>
              
              <img :src="activity.cover" :alt="activity.title" @click="goToDetail(activity.id)" />
              <div class="activity-info">
                <h3 @click="goToDetail(activity.id)">{{ activity.title }}</h3>
                <p>{{ formatDate(activity.startTime) }}</p>
                
                <div class="card-actions">
                  <el-button size="small" type="primary" @click="goToDetail(activity.id)">查看详情</el-button>
                  <el-button size="small" type="danger" @click.stop="handleUnregister(activity.id)">取消报名</el-button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无报名活动" />
        </el-tab-pane>

        <el-tab-pane label="我的收藏" name="favorites">
          <div v-if="favoritedActivities.length > 0" class="activities-grid">
            <div v-for="activity in favoritedActivities" :key="activity.id" class="activity-card">
              <!-- 活动状态标识 -->
              <div class="activity-status" :class="`status-${getActivityStatus(activity)}`">
                {{ getActivityStatusText(activity) }}
              </div>
              
              <img :src="activity.cover" :alt="activity.title" @click="goToDetail(activity.id)" />
              <div class="activity-info">
                <h3 @click="goToDetail(activity.id)">{{ activity.title }}</h3>
                <p>{{ formatDate(activity.startTime) }}</p>
                
                <div class="card-actions">
                  <el-button size="small" type="primary" @click="goToDetail(activity.id)">查看详情</el-button>
                  <el-button size="small" type="warning" @click.stop="handleUnfavorite(activity.id)">取消收藏</el-button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无收藏活动" />
        </el-tab-pane>

        <el-tab-pane label="浏览历史" name="history">
          <div v-if="userStore.browseHistory.length > 0" class="activities-grid">
            <div v-for="item in userStore.browseHistory.slice(0, 12)" :key="item.id" class="activity-card">
              <!-- 活动状态标识 -->
              <div class="activity-status" :class="`status-${getActivityStatus(item)}`">
                {{ getActivityStatusText(item) }}
              </div>
              
              <img :src="item.cover" :alt="item.title" @click="goToDetail(item.id)" />
              <div class="activity-info">
                <h3 @click="goToDetail(item.id)">{{ item.title }}</h3>
                <p>浏览时间：{{ formatDate(item.viewTime) }}</p>
                
                <div class="card-actions">
                  <el-button size="small" type="primary" @click="goToDetail(item.id)">查看详情</el-button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无浏览历史" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activityStore = useActivityStore()
const activeTab = ref('registrations')

const registeredActivities = computed(() => 
  activityStore.activities.filter(a => userStore.registrations.includes(a.id))
)

const favoritedActivities = computed(() => 
  activityStore.activities.filter(a => userStore.favorites.includes(a.id))
)

onMounted(() => {
  activityStore.initMockData()
})

const goToDetail = (id) => {
  router.push(`/activity/${id}`)
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

// 取消报名
const handleUnregister = (activityId) => {
  ElMessageBox.confirm('确定要取消报名吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.unregisterActivity(activityId)
    ElMessage.success('已取消报名')
  }).catch(() => {
    // 用户取消操作
  })
}

// 取消收藏
const handleUnfavorite = (activityId) => {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.toggleFavorite(activityId)
    ElMessage.success('已取消收藏')
  }).catch(() => {
    // 用户取消操作
  })
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.my-page {
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

.page-content {
  padding: 40px 20px;
}

.profile-header {
  display: flex;
  gap: 30px;
  align-items: center;
  background: var(--bg-primary);
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: var(--shadow-sm);
}

.profile-info h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.profile-info p {
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.profile-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.activity-card {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.activity-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  backdrop-filter: blur(10px);
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

.activity-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.activity-card:hover img {
  transform: scale(1.05);
}

.activity-info {
  padding: 16px;
}

.activity-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.3s;
}

.activity-info h3:hover {
  color: var(--primary-color);
}

.activity-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
