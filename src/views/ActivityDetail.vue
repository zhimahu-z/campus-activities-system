<template>
  <div class="activity-detail-page">
    <nav class="navbar">
      <div class="container nav-content">
        <div class="logo" @click="router.push('/home')">
          <span class="logo-icon">🎓</span>
          <span class="logo-text gradient-text">智能校园活动</span>
        </div>
        
        <div class="nav-actions">
          <el-button @click="router.push('/home')">返回首页</el-button>
          <el-button v-if="userStore.isLoggedIn" @click="handleLogout">退出</el-button>
        </div>
      </div>
    </nav>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="activity" class="container page-content">
      <div class="activity-cover">
        <img :src="activity.cover" :alt="activity.title" />
      </div>

      <div class="detail-content">
        <div class="main-content">
          <h1>{{ activity.title }}</h1>
          
          <div class="activity-meta">
            <span><el-icon><Calendar /></el-icon>{{ formatDateTime(activity.startTime) }}</span>
            <span><el-icon><Location /></el-icon>{{ activity.location }}</span>
            <span><el-icon><User /></el-icon>{{ activity.participants }}/{{ activity.maxParticipants }}人</span>
          </div>

          <el-divider />

          <!-- AI智能摘要 -->
          <div v-if="aiSummary" class="ai-summary-section">
            <el-alert type="success" :closable="false">
              <template #title>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <el-icon><MagicStick /></el-icon>
                  <strong>DeepSeek AI智能摘要</strong>
                </div>
              </template>
              <p style="margin: 12px 0;"><strong>摘要：</strong>{{ aiSummary.summary }}</p>
              <div class="summary-keywords">
                <strong>关键词：</strong>
                <el-tag v-for="keyword in aiSummary.keywords" :key="keyword" type="info" style="margin: 0 4px;">
                  {{ keyword }}
                </el-tag>
              </div>
              <div v-if="aiSummary.highlights && aiSummary.highlights.length > 0" class="summary-highlights">
                <strong>活动亮点：</strong>
                <ul>
                  <li v-for="(highlight, index) in aiSummary.highlights" :key="index">{{ highlight }}</li>
                </ul>
              </div>
            </el-alert>
          </div>

          <div class="detail-section">
            <h2>活动详情</h2>
            <p>{{ activity.description }}</p>
          </div>

          <div class="detail-section">
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
            </div>
          </div>

          <div class="detail-section">
            <h2>活动标签</h2>
            <div class="tags">
              <el-tag v-for="tag in activity.tags" :key="tag" size="large">{{ tag }}</el-tag>
            </div>
          </div>

          <!-- 评论区 -->
          <div class="detail-section comments-section">
            <h2>
              <el-icon><ChatDotRound /></el-icon>
              活动评论 ({{ comments.length }})
            </h2>
            
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
                <el-alert :type="getAnalysisType(commentAnalysis.sentiment)" :closable="false">
                  <div class="analysis-content">
                    <div class="analysis-item">
                      <strong>🤖 AI情感分析：</strong>
                      <el-tag :type="getSentimentType(commentAnalysis.sentiment)">
                        {{ getSentimentText(commentAnalysis.sentiment) }} ({{ commentAnalysis.sentimentScore }}分)
                      </el-tag>
                    </div>
                    <div v-if="!commentAnalysis.isAppropriate" class="analysis-warning">
                      <el-icon><Warning /></el-icon>
                      <span>{{ commentAnalysis.suggestions }}</span>
                    </div>
                    <div v-if="commentAnalysis.tags && commentAnalysis.tags.length > 0" class="analysis-tags">
                      <strong>内容标签：</strong>
                      <el-tag v-for="tag in commentAnalysis.tags" :key="tag" size="small">{{ tag }}</el-tag>
                    </div>
                  </div>
                </el-alert>
              </div>

              <div class="comment-actions">
                <el-button @click="analyzeCommentContent" :loading="analyzingComment">
                  <el-icon><MagicStick /></el-icon>
                  AI分析评论
                </el-button>
                <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
                  <el-icon><Promotion /></el-icon>
                  发表评论
                </el-button>
              </div>
            </div>

            <div v-else class="login-prompt">
              <el-empty description="登录后可以发表评论">
                <el-button type="primary" @click="router.push('/login')">立即登录</el-button>
              </el-empty>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :src="comment.userAvatar" :size="40" />
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

        <div class="sidebar">
          <div class="action-card">
            <!-- 活动状态标识 -->
            <div class="activity-status-badge" :class="activityStatusClass">
              <el-icon v-if="activityStatus === 'upcoming'"><Clock /></el-icon>
              <el-icon v-else-if="activityStatus === 'ongoing'"><VideoPlay /></el-icon>
              <el-icon v-else><CircleCheck /></el-icon>
              <span>{{ activityStatusText }}</span>
            </div>

            <!-- 报名按钮 -->
            <el-button
              v-if="!isRegistered"
              type="primary"
              size="large"
              :disabled="isFull || activityStatus !== 'upcoming'"
              @click="handleRegister"
              style="width: 100%;"
            >
              {{ getRegisterButtonText }}
            </el-button>
            
            <el-button
              v-else
              type="danger"
              size="large"
              @click="handleUnregister"
              style="width: 100%;"
            >
              取消报名
            </el-button>
            
            <!-- 收藏按钮 -->
            <el-button
              v-if="!isFavorited"
              size="large"
              @click="toggleFavorite"
              style="width: 100%; margin-top: 12px;"
            >
              <el-icon><Star /></el-icon>
              收藏活动
            </el-button>
            
            <el-button
              v-else
              size="large"
              type="warning"
              @click="toggleFavorite"
              style="width: 100%; margin-top: 12px;"
            >
              <el-icon><StarFilled /></el-icon>
              取消收藏
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="活动不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
import { useAIStore } from '@/stores/ai'
import { ElMessage, ElMessageBox } from 'element-plus'

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

// 活动状态
const activityStatus = computed(() => {
  if (!activity.value) return 'upcoming'
  const now = new Date()
  const startTime = new Date(activity.value.startTime)
  const endTime = new Date(activity.value.endTime)
  
  if (now < startTime) return 'upcoming' // 未开始
  if (now >= startTime && now <= endTime) return 'ongoing' // 进行中
  return 'ended' // 已结束
})

const activityStatusText = computed(() => {
  const statusMap = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return statusMap[activityStatus.value] || '未知'
})

const activityStatusClass = computed(() => {
  return `status-${activityStatus.value}`
})

// 报名按钮文本
const getRegisterButtonText = computed(() => {
  if (isFull.value) return '名额已满'
  if (activityStatus.value === 'ongoing') return '活动进行中'
  if (activityStatus.value === 'ended') return '活动已结束'
  return '立即报名'
})

onMounted(async () => {
  const activityId = route.params.id
  activity.value = await activityStore.fetchActivityDetail(activityId)
  
  if (activity.value) {
    // 活动数据已经从后端API获取，包含正确的participants数量
    userStore.addBrowseHistory(activity.value)
    
    // 获取AI摘要
    ElMessage.info('🤖 DeepSeek AI正在分析活动内容...')
    aiSummary.value = await aiStore.extractSummary(activity.value.description)
    if (aiSummary.value) {
      ElMessage.success('✅ AI分析完成！')
    }
  }
  
  loading.value = false
  
  // 监听报名变化事件
  window.addEventListener('activity-registration-changed', updateActivityParticipants)
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('activity-registration-changed', updateActivityParticipants)
})

const handleRegister = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 禁止管理员报名
  if (userStore.isAdmin) {
    ElMessage.warning('管理员账号不能报名活动')
    return
  }
  
  if (activityStatus.value === 'ongoing') {
    ElMessage.warning('活动正在进行中，无法报名')
    return
  }
  
  if (activityStatus.value === 'ended') {
    ElMessage.warning('活动已结束，无法报名')
    return
  }
  
  if (isFull.value) {
    ElMessage.warning('活动名额已满')
    return
  }
  
  const result = await userStore.registerActivity(activity.value.id)
  if (result.success) {
    ElMessage.success('报名成功！')
    // 实时更新活动参与人数
    await updateActivityParticipants()
  } else {
    ElMessage.error(result.message)
  }
}

const handleUnregister = async () => {
  try {
    await ElMessageBox.confirm('确定要取消报名吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await userStore.unregisterActivity(activity.value.id)
    if (result.success) {
      ElMessage.success('已取消报名')
      // 实时更新活动参与人数
      await updateActivityParticipants()
    } else {
      ElMessage.error(result.message)
    }
  } catch {
    // 用户取消操作
  }
}

// 更新活动参与人数
const updateActivityParticipants = async () => {
  // 重新从后端获取活动数据
  const activityId = route.params.id
  const updatedActivity = await activityStore.fetchActivityDetail(activityId)
  if (updatedActivity) {
    activity.value = updatedActivity
  }
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (isFavorited.value) {
    try {
      await ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const result = await userStore.toggleFavorite(activity.value.id)
      if (result.success) {
        ElMessage.success('已取消收藏')
      } else {
        ElMessage.error(result.message)
      }
    } catch {
      // 用户取消操作
    }
  } else {
    const result = await userStore.toggleFavorite(activity.value.id)
    if (result.success) {
      ElMessage.success('已添加到收藏')
    } else {
      ElMessage.error(result.message)
    }
  }
}

const analyzeCommentContent = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请先输入评论内容')
    return
  }
  
  analyzingComment.value = true
  try {
    ElMessage.info('🤖 DeepSeek AI正在分析您的评论...')
    commentAnalysis.value = await aiStore.analyzeComment(newComment.value)
    ElMessage.success('✅ AI分析完成！')
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

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatFullDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
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
  return formatDateTime(timeStr)
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

const getAnalysisType = (sentiment) => {
  const types = {
    positive: 'success',
    neutral: 'info',
    negative: 'warning'
  }
  return types[sentiment] || 'info'
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

.nav-actions {
  display: flex;
  gap: 12px;
}

.page-content {
  padding: 40px 20px;
}

.activity-cover {
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 30px;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.main-content {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 30px;
  box-shadow: var(--shadow-sm);
}

.main-content h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.activity-meta {
  display: flex;
  gap: 30px;
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-summary-section {
  margin: 24px 0;
}

.summary-keywords {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.summary-highlights {
  margin-top: 12px;
}

.summary-highlights ul {
  margin-top: 8px;
  padding-left: 20px;
}

.summary-highlights li {
  margin: 4px 0;
  line-height: 1.6;
}

.detail-section {
  margin-top: 30px;
}

.detail-section h2 {
  font-size: 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section p {
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

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.comments-section {
  border-top: 2px solid var(--border-color);
  padding-top: 30px;
}

.comment-form {
  margin: 20px 0;
}

.comment-analysis {
  margin: 12px 0;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.analysis-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--warning-color);
}

.analysis-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
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
  color: var(--text-primary);
}

.comment-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.comment-content p {
  line-height: 1.6;
  color: var(--text-primary);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 90px;
}

.activity-status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 16px;
}

.status-upcoming {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.status-ongoing {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.status-ended {
  background: #e0e0e0;
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

.loading-container {
  padding: 60px 20px;
}
</style>
