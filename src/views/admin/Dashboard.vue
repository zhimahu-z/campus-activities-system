<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>📊 管理后台</h1>
      <div class="header-actions">
        <el-button @click="router.push('/home')">返回前台</el-button>
        <el-button @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="admin-nav">
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        @select="handleMenuSelect"
        background-color="#ffffff"
        text-color="#333"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/admin/activities">
          <el-icon><Calendar /></el-icon>
          <span>活动管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/activities/create">
          <el-icon><Plus /></el-icon>
          <span>创建活动</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalActivities }}</div>
          <div class="stat-label">总活动数</div>
        </div>
      </div>

      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalParticipants }}</div>
          <div class="stat-label">总参与人数</div>
        </div>
      </div>

      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <div class="stat-value">{{ activeActivities }}</div>
          <div class="stat-label">进行中活动</div>
        </div>
      </div>

      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ avgParticipationRate }}</div>
          <div class="stat-label">平均参与率</div>
        </div>
      </div>
    </div>

    <!-- 数据可视化 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>📊 分类统计</span>
            </div>
          </template>
          <div class="category-chart">
            <div v-for="(count, category) in categoryStats" :key="category" class="category-bar">
              <div class="category-label">
                <span>{{ getCategoryIcon(category) }} {{ category }}</span>
                <span class="category-count">{{ count }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: (count / totalActivities * 100) + '%',
                    background: getCategoryColor(category)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>🔥 热门活动排行</span>
            </div>
          </template>
          <div class="hot-activities">
            <div v-for="(activity, index) in hotActivities" :key="activity.id" class="hot-item">
              <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="hot-info">
                <div class="hot-title">{{ activity.title }}</div>
                <div class="hot-meta">
                  <el-tag size="small">{{ activity.category }}</el-tag>
                  <span>{{ activity.participants }}人参与</span>
                </div>
              </div>
              <div class="hot-progress">
                <el-progress 
                  :percentage="Math.round(activity.participants / activity.maxParticipants * 100)" 
                  :color="getProgressColor(activity.participants / activity.maxParticipants)"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { activityAPI, registrationAPI } from '@/api'
import { DataAnalysis, Calendar, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const activities = ref([])
const registrationStats = ref({})

const activeMenu = computed(() => route.path)

const totalActivities = computed(() => activities.value.length)
const totalParticipants = computed(() => {
  return Object.values(registrationStats.value).reduce((sum, count) => sum + count, 0)
})
const activeActivities = computed(() => {
  const now = new Date()
  return activities.value.filter(a => {
    const startTime = new Date(a.startTime)
    const endTime = new Date(a.endTime)
    return now >= startTime && now <= endTime
  }).length
})
const avgParticipationRate = computed(() => {
  if (totalActivities.value === 0) return '0%'
  const avg = activities.value.reduce((sum, a) => {
    const participants = registrationStats.value[a.id] || 0
    return sum + (participants / a.maxParticipants * 100)
  }, 0) / totalActivities.value
  return Math.round(avg) + '%'
})

const categoryStats = computed(() => {
  const stats = {}
  activities.value.forEach(a => {
    stats[a.category] = (stats[a.category] || 0) + 1
  })
  return stats
})

const hotActivities = computed(() => {
  return activities.value
    .map(a => ({
      ...a,
      participants: registrationStats.value[a.id] || 0,
      participationRate: (registrationStats.value[a.id] || 0) / a.maxParticipants
    }))
    .sort((a, b) => b.participationRate - a.participationRate)
    .slice(0, 5)
})

const loadData = async () => {
  try {
    loading.value = true
    
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    const [activitiesRes, statsRes] = await Promise.all([
      activityAPI.getAll(),
      registrationAPI.getAllStats()
    ])
    
    activities.value = activitiesRes.data || activitiesRes
    registrationStats.value = statsRes
    
    console.log('✅ 数据加载成功')
  } catch (error) {
    console.error('❌ 数据加载失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error('数据加载失败：' + (error.response?.data?.message || error.message))
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const handleMenuSelect = (index) => {
  router.push(index)
}

const categories = [
  { name: '学术讲座', icon: '📚', color: '#667eea' },
  { name: '文艺演出', icon: '🎭', color: '#f093fb' },
  { name: '体育竞技', icon: '⚽', color: '#4facfe' },
  { name: '志愿服务', icon: '🤝', color: '#43e97b' },
  { name: '创新创业', icon: '💡', color: '#fa709a' },
  { name: '社团活动', icon: '🎪', color: '#30cfd0' }
]

const getCategoryIcon = (category) => {
  const cat = categories.find(c => c.name === category)
  return cat?.icon || '✨'
}

const getCategoryColor = (category) => {
  const cat = categories.find(c => c.name === category)
  return cat?.color || '#64748b'
}

const getProgressColor = (rate) => {
  if (rate >= 0.8) return '#67c23a'
  if (rate >= 0.5) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.admin-nav {
  margin-bottom: 30px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.admin-nav :deep(.el-menu) {
  border: none;
}

.admin-nav :deep(.el-menu-item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 30px;
  height: 60px;
  line-height: 60px;
}

.admin-nav :deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}

.admin-nav :deep(.el-menu-item.is-active) {
  border-bottom: 3px solid #409eff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 48px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.chart-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.category-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
}

.category-count {
  color: #909399;
}

.progress-bar {
  height: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s;
}

.hot-activities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 12px;
}

.rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background: #909399;
  color: white;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e8a87c);
  color: white;
}

.hot-info {
  flex: 1;
}

.hot-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
}

.hot-progress {
  width: 200px;
}
</style>
