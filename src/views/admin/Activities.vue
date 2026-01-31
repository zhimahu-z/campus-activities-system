<template>
  <div class="activities-page">
    <div class="page-header">
      <h2>活动管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索活动名称"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterCategory" placeholder="筛选分类" clearable style="width: 150px; margin-right: 10px;">
          <el-option label="全部分类" value="" />
          <el-option
            v-for="cat in activityStore.categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.name"
          />
        </el-select>
        <el-button type="primary" @click="router.push('/admin/activities/create')">
          <el-icon><Plus /></el-icon>
          创建活动
        </el-button>
      </div>
    </div>

    <el-table :data="filteredActivities" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="活动名称" min-width="200" />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="participants" label="参与人数" width="120">
        <template #default="{ row }">
          {{ row.participants }}/{{ row.maxParticipants }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row)">
            {{ getStatusText(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewActivity(row.id)">
            <el-icon><View /></el-icon>
            查看
          </el-button>
          <el-button size="small" type="primary" @click="editActivity(row.id)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="deleteActivity(row.id)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-text>共 {{ filteredActivities.length }} 个活动</el-text>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Edit, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterCategory = ref('')

const activities = computed(() => activityStore.activities)

const filteredActivities = computed(() => {
  let result = activities.value

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(a => 
      a.title.toLowerCase().includes(keyword) ||
      a.description.toLowerCase().includes(keyword)
    )
  }

  // 按分类筛选
  if (filterCategory.value) {
    result = result.filter(a => a.category === filterCategory.value)
  }

  return result
})

onMounted(async () => {
  loading.value = true
  await activityStore.fetchActivities()
  loading.value = false
})

const viewActivity = (id) => {
  router.push(`/activity/${id}`)
}

const editActivity = (id) => {
  router.push(`/admin/activities/edit/${id}`)
}

const deleteActivity = async (id) => {
  try {
    const activity = activities.value.find(a => a.id === id)
    await ElMessageBox.confirm(
      `确定要删除活动"${activity?.title}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
    
    loading.value = true
    const result = await activityStore.deleteActivity(id)
    if (result.success) {
      ElMessage.success('删除成功')
      // 刷新列表
      await activityStore.fetchActivities()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除活动失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const getStatusText = (activity) => {
  const now = new Date()
  const startDate = new Date(activity.startTime)
  const endDate = new Date(activity.endTime)
  
  if (now < startDate) {
    return '未开始'
  } else if (now >= startDate && now <= endDate) {
    return '进行中'
  } else {
    return '已结束'
  }
}

const getStatusType = (activity) => {
  const now = new Date()
  const startDate = new Date(activity.startTime)
  const endDate = new Date(activity.endTime)
  
  if (now < startDate) {
    return 'info'
  } else if (now >= startDate && now <= endDate) {
    return 'success'
  } else {
    return 'warning'
  }
}

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.activities-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
