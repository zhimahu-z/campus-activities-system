<template>
  <div class="activities-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="container nav-content">
        <div class="logo" @click="router.push('/home')">
          <span class="logo-icon">🎓</span>
          <span class="logo-text gradient-text">智能校园活动</span>
        </div>
        
        <div class="nav-menu">
          <router-link to="/home" class="nav-item">首页</router-link>
          <router-link to="/activities" class="nav-item active">活动列表</router-link>
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

    <div class="container page-content">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-header">
          <h2>活动筛选</h2>
          <el-button text @click="resetFilters">重置</el-button>
        </div>

        <div class="filter-group">
          <label>分类</label>
          <div class="category-filters">
            <el-tag
              v-for="category in activityStore.categories"
              :key="category.id"
              :type="filters.category === category.name ? 'primary' : 'info'"
              :effect="filters.category === category.name ? 'dark' : 'plain'"
              @click="toggleCategory(category.name)"
              class="category-tag"
            >
              {{ category.icon }} {{ category.name }}
            </el-tag>
          </div>
        </div>

        <div class="filter-group">
          <label>标签</label>
          <div class="tag-filters">
            <el-check-tag
              v-for="tag in allTags"
              :key="tag"
              :checked="filters.tags.includes(tag)"
              @change="toggleTag(tag)"
            >
              {{ tag }}
            </el-check-tag>
          </div>
        </div>

        <div class="filter-group">
          <label>状态</label>
          <el-radio-group v-model="filters.status">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="active">进行中</el-radio-button>
            <el-radio-button label="upcoming">即将开始</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-group">
          <label>排序</label>
          <el-select v-model="sortBy" placeholder="选择排序方式">
            <el-option label="最新发布" value="newest" />
            <el-option label="最热门" value="hot" />
            <el-option label="即将开始" value="upcoming" />
            <el-option label="报名人数" value="participants" />
          </el-select>
        </div>
      </div>

      <!-- 活动列表 -->
      <div class="activities-section">
        <div class="activities-header">
          <h2>
            找到 <span class="count">{{ filteredActivities.length }}</span> 个活动
          </h2>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索活动..."
            prefix-icon="Search"
            clearable
            style="width: 300px"
          />
        </div>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="filteredActivities.length > 0" class="activities-list">
          <div
            v-for="activity in paginatedActivities"
            :key="activity.id"
            class="activity-item"
            @click="goToDetail(activity.id)"
          >
            <div class="activity-cover">
              <img :src="activity.cover" :alt="activity.title" />
            </div>
            <div class="activity-content">
              <div class="activity-header">
                <div>
                  <div class="activity-category" :style="{ color: getCategoryColor(activity.category) }">
                    {{ getCategoryIcon(activity.category) }} {{ activity.category }}
                  </div>
                  <h3>{{ activity.title }}</h3>
                </div>
                <div class="activity-actions">
                  <el-button
                    :icon="userStore.isFavorite(activity.id) ? 'StarFilled' : 'Star'"
                    circle
                    @click.stop="toggleFavorite(activity.id)"
                  />
                </div>
              </div>
              <p class="activity-desc">{{ activity.description }}</p>
              <div class="activity-tags">
                <el-tag v-for="tag in activity.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
              <div class="activity-footer">
                <div class="activity-meta">
                  <span><el-icon><Clock /></el-icon>{{ formatDateTime(activity.startTime) }}</span>
                  <span><el-icon><Location /></el-icon>{{ activity.location }}</span>
                  <span><el-icon><User /></el-icon>{{ activity.participants }}/{{ activity.maxParticipants }}</span>
                </div>
                <el-button type="primary" @click.stop="handleRegister(activity)">
                  {{ userStore.isRegistered(activity.id) ? '已报名' : '立即报名' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="没有找到符合条件的活动" />

        <!-- 分页 -->
        <div v-if="filteredActivities.length > pageSize" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredActivities.length"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activityStore = useActivityStore()

const loading = ref(false)
const searchKeyword = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)

const filters = ref({
  category: '',
  tags: [],
  status: ''
})

const allTags = computed(() => activityStore.getAllTags())

const filteredActivities = computed(() => {
  let result = [...activityStore.activities]

  // 应用筛选
  if (filters.value.category) {
    result = result.filter(a => a.category === filters.value.category)
  }
  if (filters.value.tags.length > 0) {
    result = result.filter(a => 
      filters.value.tags.some(tag => a.tags.includes(tag))
    )
  }
  if (filters.value.status === 'active') {
    result = result.filter(a => a.status === 'active')
  }
  if (filters.value.status === 'upcoming') {
    result = result.filter(a => new Date(a.startTime) > new Date())
  }

  // 搜索关键词
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(keyword) ||
      a.description.toLowerCase().includes(keyword) ||
      a.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'hot':
      result.sort((a, b) => b.participants - a.participants)
      break
    case 'upcoming':
      result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      break
    case 'participants':
      result.sort((a, b) => b.participants - a.participants)
      break
  }

  return result
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActivities.value.slice(start, end)
})

onMounted(() => {
  activityStore.initMockData()
  
  // 从URL参数获取分类
  if (route.query.category) {
    filters.value.category = route.query.category
  }
})

watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    filters.value.category = newCategory
  }
})

const toggleCategory = (category) => {
  filters.value.category = filters.value.category === category ? '' : category
  currentPage.value = 1
}

const toggleTag = (tag) => {
  const index = filters.value.tags.indexOf(tag)
  if (index > -1) {
    filters.value.tags.splice(index, 1)
  } else {
    filters.value.tags.push(tag)
  }
  currentPage.value = 1
}

const resetFilters = () => {
  filters.value = {
    category: '',
    tags: [],
    status: ''
  }
  searchKeyword.value = ''
  sortBy.value = 'newest'
  currentPage.value = 1
}

const goToDetail = (id) => {
  router.push(`/activity/${id}`)
}

const toggleFavorite = (id) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  userStore.toggleFavorite(id)
  ElMessage.success(userStore.isFavorite(id) ? '已添加到收藏' : '已取消收藏')
}

const handleRegister = (activity) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (userStore.isRegistered(activity.id)) {
    ElMessage.info('您已报名该活动')
    return
  }
  
  userStore.registerActivity(activity.id)
  ElMessage.success('报名成功！')
}

const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getCategoryIcon = (category) => {
  const cat = activityStore.categories.find(c => c.name === category)
  return cat?.icon || '✨'
}

const getCategoryColor = (category) => {
  const cat = activityStore.categories.find(c => c.name === category)
  return cat?.color || '#64748b'
}

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.activities-page {
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
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  padding: 30px 20px;
}

/* 筛选区域 */
.filter-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 90px;
  box-shadow: var(--shadow-sm);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.category-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 活动列表 */
.activities-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.activities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.activities-header h2 {
  font-size: 24px;
  font-weight: 600;
}

.count {
  color: var(--primary-color);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.activity-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.activity-cover {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.activity-item:hover .activity-cover img {
  transform: scale(1.1);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.activity-category {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.activity-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading-container {
  padding: 40px;
}
</style>




