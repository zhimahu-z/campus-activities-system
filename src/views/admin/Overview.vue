<template>
  <div class="overview-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #6366f1;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalActivities }}</div>
              <div class="stat-label">总活动数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #10b981;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalParticipants }}</div>
              <div class="stat-label">总参与人数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f59e0b;">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ activeActivities }}</div>
              <div class="stat-label">进行中活动</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ec4899;">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ avgParticipants }}</div>
              <div class="stat-label">平均参与率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>分类统计</span>
          </template>
          <div class="category-stats">
            <div v-for="(count, category) in categoryStats" :key="category" class="category-item">
              <span>{{ category }}</span>
              <el-progress :percentage="(count / totalActivities * 100)" :format="() => count" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>热门活动</span>
          </template>
          <el-table :data="hotActivities" style="width: 100%">
            <el-table-column prop="title" label="活动名称" />
            <el-table-column prop="participants" label="参与人数" width="120" />
            <el-table-column prop="category" label="分类" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useActivityStore } from '@/stores/activity'

const activityStore = useActivityStore()

onMounted(() => {
  activityStore.initMockData()
})

const totalActivities = computed(() => activityStore.activities.length)
const totalParticipants = computed(() => 
  activityStore.activities.reduce((sum, a) => sum + a.participants, 0)
)
const activeActivities = computed(() => 
  activityStore.activities.filter(a => a.status === 'active').length
)
const avgParticipants = computed(() => {
  if (totalActivities.value === 0) return 0
  const avg = activityStore.activities.reduce((sum, a) => 
    sum + (a.participants / a.maxParticipants * 100), 0
  ) / totalActivities.value
  return Math.round(avg) + '%'
})

const categoryStats = computed(() => activityStore.getCategoryStats())
const hotActivities = computed(() => activityStore.hotActivities.slice(0, 5))
</script>

<style scoped>
.overview-page {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-item span {
  width: 100px;
  font-size: 14px;
}
</style>




