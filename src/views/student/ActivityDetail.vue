<template>
  <div class="activity-detail-page">
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
          <router-link to="/search" class="nav-item">智能搜索</router-link>
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
                <el-dropdown-item @click="router.push('/my/favorites')">我的收藏</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="activity" class="container page-content">
      <!-- 活动封面 -->
      <div class="activity-cover">
        <img :src="activity.cover" :alt="activity.title" />
        <div class="cover-overlay">
          <div class="cover-content">
            <div class="activity-category" :style="{ color: getCategoryColor(activity.category) }">
              {{ getCategoryIcon(activity.category) }} {{ activity.category }}
            </div>
            <h1>{{ activity.title }}</h1>
            <div class="activity-meta">
              <span><el-icon><Clock /></el-icon>{{ formatDateTime(activity.startTime) }}</span>
              <span><el-icon><Location /></el-icon>{{ activity.location }}</span>
              <span><el-icon><User /></el-icon>{{ activity.participants }}/{{ activity.maxParticipants }}人</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-content">
        <!-- 主要内容 -->
        <div class="main-content">
          <!-- AI摘要 -->
          <div v-if="aiSummary" class="ai-summary-card">
            <div class="card-header">
              <el-icon><MagicStick /></el-icon>
              <span>AI智能摘要</span>
            </div>
            <p class="summary-text">{{ aiSummary.summary }}</p>
            <div class="summary-keywords">
              <el-tag v-for="keyword in aiSummary.keywords" :key="keyword" type="info">
                {{ keyword }}
              </el-tag>
            </div>
            <div v-if="aiSummary.highlights.length > 0" class="summary-highlights">
              <h4>活动亮点</h4>
              <ul>
                <li v-for="highlight in aiSummary.highlights" :key="highlight">{{ highlight }}</li>
              </ul>
            </div>
          </div>

          <!-- 活动详情 -->
          <div class="detail-card">
            <h2>活动详情</h2>
            <div class="detail-text">{{ activity.description }}</div>
          </div>

          <!-- 活动信息 -->
          <div class="info-card">
            <h2>活动信息</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>开始时间</label>
                <span>{{ formatFullDateTime(activity.startTime) }}</span>
              </div>
              <div class="info-item">
                <label>结束时间</label>
                <span>{{ formatFullDateTime(activity.endTime) }}</span>
              </div>
              <div class="info-item">
                <label>活动地点</label>
                <span>{{ activity.location }}</span>
              </div>
              <div class="info-item">
                <label>主办方</label>
                <span>{{ activity.organizer }}</span>
              </div>
              <div class="info-item">
                <label>报名人数</label>
                <span>{{ activity.participants }}/{{ activity.maxParticipants }}</span>
              </div>
              <div class="info-item">
                <label>参与要求</label>
                <span>{{ activity.requirements }}</span>
              </div>
              <div class="info-item">
                <label>活动收益</label>
                <span>{{ activity.benefits }}</span>
              </div>
            </div>
          </div>

          <!-- 评论区 -->
          <div class="comments-card">
            <h2>活动评论</h2>
            
            <!-- 发表评论 -->
            <div v-if="userStore.isLoggedIn" class="comment-form">
              <el-input
                v-model="newComment"
                type="textarea"
                :rows="4"
                placeholder="分享你的想法..."
                maxlength="500"
                show-word-limit
              />
              
              <!-- AI评论助手 -->
              <div v-if="commentAnalysis" class="comment-analysis">
                <div class="analysis-item">
                  <span>情感倾向：</span>
                  <el-tag :type="getSentimentType(commentAnalysis.sentiment)">
                    {{ getSentimentText(commentAnalysis.sentiment) }}
                  </el-tag>
                </div>
                <div v-if="!commentAnalysis.isAppropriate" class="analysis-warning">
                  <el-icon><Warning /></el-icon>
                  <span>{{ commentAnalysis.suggestions }}</span>
                </div>
              </div>

              <div class="comment-actions">
                <el-button @click="analyzeCommentContent" :loading="analyzingComment">
                  <el-icon><MagicStick /></el-icon>
                  AI分析
                </el-button>
                <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
                  发表评论
                </el-button>
              </div>
            </div>

            <div v-else class="login-prompt">
              <p>登录后可以发表评论</p>
              <el-button type="primary" @click="router.push('/login')">立即登录</el-button>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :src="comment.userAvatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-user">{{ comment.userName }}</span>
                    <span class="comment-time">{{ formatCommentTime(comment.time) }}</span>
                  </div>
                  <p>{{ comment.content }}</p>
                </div>
              </div>
              
              <el-empty v-if="comments.length === 0" description="暂无评论，快来抢沙发吧" />
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="sidebar">
          <!-- 操作卡片 -->
          <div class="action-card">
            <el-button
              type="primary"
              size="large"
              :disabled="isRegistered || isFull"
              @click="handleRegister"
              class="register-btn"
            >
              {{ isRegistered ? '已报名' : isFull ? '名额已满' : '立即报名' }}
            </el-button>
            
            <el-button
              size="large"
              :icon="isFavorited ? 'StarFilled' : 'Star'"
              @click="toggleFavorite"
              class="favorite-btn"
            >
              {{ isFavorited ? '已收藏' : '收藏活动' }}
            </el-button>

            <div class="share-section">
              <label>分享活动</label>
              <div class="share-buttons">
                <el-button circle icon="Share" />
                <el-button circle icon="Link" @click="copyLink" />
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div class="tags-card">
            <h3>活动标签</h3>
            <div class="tags">
              <el-tag v-for="tag in activity.tags" :key="tag" size="large">
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 相关活动 -->
          <div class="related-card">
            <h3>相关活动</h3>
            <div class="related-list">
              <div
                v-for="related in relatedActivities"
                :key="related.id"
                class="related-item"
                @click="goToActivity(related.id)"
              >
                <img :src="related.cover" :alt="related.title" />
                <div class="related-info">
                  <h4>{{ related.title }}</h4>
                  <p>{{ formatDate(related.startTime) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="活动不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import { useAIStore } from '@/stores/ai'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activityStore = useActivityStore()
const aiStore = useAIStore()

const loading = ref(true)
const activity = ref(null)
const aiSummary = ref(null)
const newComment = ref('')
const commentAnalysis = ref(null)
const analyzingComment = ref(false)
const comments = ref([
  {
    id: 1,
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    content: '这个活动看起来很有意思，期待参加！',
    time: '2026-01-20T10:30:00'
  },
  {
    id: 2,
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    content: '去年参加过类似的活动，收获很大，强烈推荐！',
    time: '2026-01-21T14:20:00'
  }
])

const isRegistered = computed(() => userStore.isRegistered(activity.value?.id))
const isFavorited = computed(() => userStore.isFavorite(activity.value?.id))
const isFull = computed(() => activity.value?.participants >= activity.value?.maxParticipants)

const relatedActivities = computed(() => {
  if (!activity.value) return []
  return activityStore.activities
    .filter(a => 
      a.id !== activity.value.id && 
      (a.category === activity.value.category || 
       a.tags.some(tag => activity.value.tags.includes(tag)))
    )
    .slice(0, 3)
})

onMounted(async () => {
  const activityId = route.params.id
  activity.value = await activityStore.fetchActivityDetail(activityId)
  
  if (activity.value) {
    // 添加到浏览历史
    userStore.addBrowseHistory(activity.value)
    
    // 获取AI摘要
    aiSummary.value = await aiStore.extractSummary(activity.value.description)
  }
  
  loading.value = false
})

const handleRegister = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  userStore.registerActivity(activity.value.id)
  ElMessage.success('报名成功！')
}

const toggleFavorite = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  userStore.toggleFavorite(activity.value.id)
  ElMessage.success(isFavorited.value ? '已添加到收藏' : '已取消收藏')
}

const analyzeCommentContent = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请先输入评论内容')
    return
  }
  
  analyzingComment.value = true
  try {
    commentAnalysis.value = await aiStore.analyzeComment(newComment.value)
  } catch (error) {
    ElMessage.error('分析失败，请重试')
  } finally {
    analyzingComment.value = false
  }
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  
  comments.value.unshift({
    id: Date.now(),
    userName: userStore.userName,
    userAvatar: userStore.userInfo?.avatar,
    content: newComment.value,
    time: new Date().toISOString()
  })
  
  newComment.value = ''
  commentAnalysis.value = null
  ElMessage.success('评论发表成功')
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('链接已复制到剪贴板')
}

const goToActivity = (id) => {
  router.push(`/activity/${id}`)
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

const formatFullDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatCommentTime = (timeStr) => {
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(timeStr)
}

const getSentimentType = (sentiment) => {
  const types = {
    positive: 'success',
    neutral: 'info',
    negative: 'danger'
  }
  return types[sentiment] || 'info'
}

const getSentimentText = (sentiment) => {
  const texts = {
    positive: '积极',
    neutral: '中性',
    negative: '消极'
  }
  return texts[sentiment] || '未知'
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.activity-detail-page {
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
}

.nav-item:hover {
  color: var(--primary-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

/* 活动封面 */
.activity-cover {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  align-items: flex-end;
}

.cover-content {
  padding: 40px;
  color: white;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.activity-category {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.cover-content h1 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 20px;
}

.activity-meta {
  display: flex;
  gap: 30px;
  font-size: 16px;
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 详情内容 */
.page-content {
  padding: 40px 20px;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ai-summary-card,
.detail-card,
.info-card,
.comments-card,
.action-card,
.tags-card,
.related-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.summary-text {
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.summary-keywords {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.summary-highlights h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.summary-highlights ul {
  list-style: none;
  padding: 0;
}

.summary-highlights li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.summary-highlights li::before {
  content: '✨';
  position: absolute;
  left: 0;
}

.detail-card h2,
.info-card h2,
.comments-card h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.detail-text {
  line-height: 1.8;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item span {
  font-size: 15px;
  color: var(--text-primary);
}

/* 评论区 */
.comment-form {
  margin-bottom: 30px;
}

.comment-analysis {
  margin: 12px 0;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.analysis-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--warning-color);
  font-size: 14px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.login-prompt {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: 600;
}

.comment-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.comment-content p {
  line-height: 1.6;
  color: var(--text-primary);
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-btn,
.favorite-btn {
  width: 100%;
}

.share-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.share-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.share-buttons {
  display: flex;
  gap: 10px;
}

.tags-card h3,
.related-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.related-item:hover {
  background: var(--bg-secondary);
}

.related-item img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.related-info {
  flex: 1;
}

.related-info h4 {
  font-size: 14px;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-info p {
  font-size: 12px;
  color: var(--text-secondary);
}

.loading-container {
  padding: 60px 20px;
}
</style>




