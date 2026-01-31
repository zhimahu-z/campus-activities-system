import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { activityAPI } from '@/api'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const currentActivity = ref(null)
  const loading = ref(false)
  const categories = ref([
    { id: 1, name: '学术讲座', icon: '📚', color: '#6366f1' },
    { id: 2, name: '文艺演出', icon: '🎭', color: '#ec4899' },
    { id: 3, name: '体育竞技', icon: '⚽', color: '#10b981' },
    { id: 4, name: '社团活动', icon: '🎨', color: '#f59e0b' },
    { id: 5, name: '志愿服务', icon: '❤️', color: '#ef4444' },
    { id: 6, name: '创新创业', icon: '💡', color: '#8b5cf6' },
    { id: 7, name: '社会实践', icon: '🌍', color: '#14b8a6' },
    { id: 8, name: '其他活动', icon: '✨', color: '#64748b' }
  ])

  const activeActivities = computed(() => 
    activities.value.filter(a => a.status === 'active')
  )

  const upcomingActivities = computed(() => 
    activities.value.filter(a => {
      const startDate = new Date(a.startTime)
      const now = new Date()
      return startDate > now && a.status === 'active'
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  )

  const hotActivities = computed(() => 
    activities.value
      .filter(a => a.status === 'active')
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 10)
  )

  // 从后端API加载活动数据
  const initMockData = async () => {
    try {
      loading.value = true
      const response = await activityAPI.getAll()
      activities.value = response.data || response
      console.log('✅ 活动数据加载成功:', activities.value.length, '个活动')
    } catch (error) {
      console.error('❌ 活动数据加载失败:', error)
      // 如果API调用失败，使用空数组
      activities.value = []
    } finally {
      loading.value = false
    }
  }

  // 更新活动的参与人数（从后端数据已包含，无需手动更新）
  const updateParticipantsCount = (registrationStats) => {
    // 后端返回的数据已经包含正确的participants数量
    // 这个方法保留用于兼容性，但不再需要手动更新
  }

  // 获取活动的真实参与人数
  const getActivityParticipants = (activityId, registrationStats) => {
    return registrationStats[activityId] || 0
  }

  const fetchActivities = async (filters = {}) => {
    loading.value = true
    try {
      const response = await activityAPI.getAll(filters)
      const result = response.data || response
      activities.value = result
      return result
    } catch (error) {
      console.error('获取活动列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchActivityDetail = async (id) => {
    loading.value = true
    try {
      const activity = await activityAPI.getById(id)
      currentActivity.value = activity
      return activity
    } catch (error) {
      console.error('获取活动详情失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (activityData) => {
    try {
      const response = await activityAPI.create(activityData)
      const newActivity = response.activity || response
      activities.value.push(newActivity)
      return { success: true, activity: newActivity }
    } catch (error) {
      console.error('创建活动失败:', error)
      return { success: false, message: error.response?.data?.message || '创建失败' }
    }
  }

  const updateActivity = async (id, activityData) => {
    try {
      const response = await activityAPI.update(id, activityData)
      const updatedActivity = response.activity || response
      const index = activities.value.findIndex(a => a.id === id)
      if (index > -1) {
        activities.value[index] = updatedActivity
      }
      return { success: true, activity: updatedActivity }
    } catch (error) {
      console.error('更新活动失败:', error)
      return { success: false, message: error.response?.data?.message || '更新失败' }
    }
  }

  const deleteActivity = async (id) => {
    try {
      await activityAPI.delete(id)
      const index = activities.value.findIndex(a => a.id === id)
      if (index > -1) {
        activities.value.splice(index, 1)
      }
      return { success: true }
    } catch (error) {
      console.error('删除活动失败:', error)
      return { success: false, message: error.response?.data?.message || '删除失败' }
    }
  }

  const getCategoryStats = () => {
    const stats = {}
    categories.value.forEach(cat => {
      stats[cat.name] = activities.value.filter(a => a.category === cat.name).length
    })
    return stats
  }

  const getAllTags = () => {
    const tagsSet = new Set()
    activities.value.forEach(activity => {
      activity.tags.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
  }

  return {
    activities, currentActivity, loading, categories,
    activeActivities, upcomingActivities, hotActivities,
    initMockData, fetchActivities, fetchActivityDetail,
    createActivity, updateActivity, deleteActivity,
    getCategoryStats, getAllTags,
    updateParticipantsCount, getActivityParticipants
  }
})
