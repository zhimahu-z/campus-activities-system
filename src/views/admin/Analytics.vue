<template>
  <div class="analytics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI数据分析</span>
          <el-button type="primary" @click="analyzeData" :loading="analyzing">
            <el-icon><MagicStick /></el-icon>
            开始分析
          </el-button>
        </div>
      </template>

      <div v-if="insights" class="insights-content">
        <el-alert title="AI分析报告" type="success" :closable="false" style="margin-bottom: 20px;">
          <p>{{ insights.summary }}</p>
        </el-alert>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>数据洞察</template>
              <ul class="insight-list">
                <li v-for="(insight, index) in insights.insights" :key="index">
                  {{ insight }}
                </li>
              </ul>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card>
              <template #header>发展趋势</template>
              <ul class="insight-list">
                <li v-for="(trend, index) in insights.trends" :key="index">
                  {{ trend }}
                </li>
              </ul>
            </el-card>
          </el-col>
        </el-row>

        <el-card style="margin-top: 20px;">
          <template #header>优化建议</template>
          <ul class="insight-list">
            <li v-for="(rec, index) in insights.recommendations" :key="index">
              {{ rec }}
            </li>
          </ul>
        </el-card>
      </div>

      <el-empty v-else description="点击"开始分析"按钮，AI将为您生成数据分析报告" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { useAIStore } from '@/stores/ai'
import { ElMessage } from 'element-plus'

const activityStore = useActivityStore()
const aiStore = useAIStore()

const analyzing = ref(false)
const insights = ref(null)

onMounted(() => {
  activityStore.initMockData()
})

const analyzeData = async () => {
  analyzing.value = true
  try {
    const data = {
      totalActivities: activityStore.activities.length,
      categoryStats: activityStore.getCategoryStats(),
      hotActivities: activityStore.hotActivities.slice(0, 5).map(a => ({
        title: a.title,
        participants: a.participants,
        category: a.category
      })),
      avgParticipants: activityStore.activities.reduce((sum, a) => 
        sum + (a.participants / a.maxParticipants), 0
      ) / activityStore.activities.length
    }

    insights.value = await aiStore.analyzeData(data)
    ElMessage.success('分析完成')
  } catch (error) {
    ElMessage.error('分析失败，请重试')
  } finally {
    analyzing.value = false
  }
}
</script>

<style scoped>
.analytics-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insights-content {
  padding: 20px 0;
}

.insight-list {
  list-style: none;
  padding: 0;
}

.insight-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  line-height: 1.6;
}

.insight-list li:last-child {
  border-bottom: none;
}
</style>




