import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI, favoriteAPI, registrationAPI } from '@/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const favorites = ref([])
  const registrations = ref([])
  const browseHistory = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const userName = computed(() => userInfo.value?.name || '游客')

  const login = async (credentials) => {
    try {
      // 调用后端API登录
      const response = await userAPI.login(credentials)
      
      token.value = response.token
      userInfo.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('userInfo', JSON.stringify(response.user))

      await loadUserData()
      return { success: true, user: response.user }
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败，请检查用户名和密码' 
      }
    }
  }

  const logout = () => {
    // 保存浏览历史（非关键数据，保留localStorage）
    if (userInfo.value) {
      const userId = userInfo.value.id
      localStorage.setItem(`browseHistory_${userId}`, JSON.stringify(browseHistory.value))
    }
    
    token.value = ''
    userInfo.value = null
    favorites.value = []
    registrations.value = []
    browseHistory.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const loadUserData = async () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
      const userId = userInfo.value.id
      
      // 从后端API加载用户数据
      try {
        const [favoritesData, registrationsData] = await Promise.all([
          favoriteAPI.getUserFavorites(userId),
          registrationAPI.getUserRegistrations(userId)
        ])
        
        favorites.value = favoritesData.map(f => f.activityId)
        registrations.value = registrationsData.map(r => r.activityId)
      } catch (error) {
        console.error('加载用户数据失败:', error)
        favorites.value = []
        registrations.value = []
      }
      
      // 浏览历史暂时保留localStorage（非关键功能）
      const storedHistory = localStorage.getItem(`browseHistory_${userId}`)
      browseHistory.value = storedHistory ? JSON.parse(storedHistory) : []
    }
  }

  const toggleFavorite = async (activityId) => {
    try {
      const index = favorites.value.indexOf(activityId)
      if (index > -1) {
        // 取消收藏
        await favoriteAPI.remove(activityId)
        favorites.value.splice(index, 1)
      } else {
        // 添加收藏
        await favoriteAPI.add(activityId)
        favorites.value.push(activityId)
      }
      return { success: true }
    } catch (error) {
      console.error('收藏操作失败:', error)
      return { success: false, message: error.response?.data?.message || '操作失败' }
    }
  }

  const isFavorite = (activityId) => favorites.value.includes(activityId)

  const registerActivity = async (activityId) => {
    // 禁止管理员报名
    if (userInfo.value?.role === 'admin') {
      return { success: false, message: '管理员账号不能报名活动' }
    }
    
    try {
      if (!registrations.value.includes(activityId)) {
        await registrationAPI.register(activityId)
        registrations.value.push(activityId)
        // 触发全局事件，通知活动参与人数更新
        window.dispatchEvent(new CustomEvent('activity-registration-changed'))
        return { success: true }
      }
      return { success: false, message: '已经报名过该活动' }
    } catch (error) {
      console.error('报名失败:', error)
      return { success: false, message: error.response?.data?.message || '报名失败' }
    }
  }

  const unregisterActivity = async (activityId) => {
    try {
      const index = registrations.value.indexOf(activityId)
      if (index > -1) {
        await registrationAPI.cancel(activityId)
        registrations.value.splice(index, 1)
        // 触发全局事件，通知活动参与人数更新
        window.dispatchEvent(new CustomEvent('activity-registration-changed'))
        return { success: true }
      }
      return { success: false, message: '未报名该活动' }
    } catch (error) {
      console.error('取消报名失败:', error)
      return { success: false, message: error.response?.data?.message || '取消报名失败' }
    }
  }

  const isRegistered = (activityId) => registrations.value.includes(activityId)

  const addBrowseHistory = (activity) => {
    browseHistory.value = browseHistory.value.filter(item => item.id !== activity.id)
    browseHistory.value.unshift({ ...activity, viewTime: new Date().toISOString() })
    if (browseHistory.value.length > 50) {
      browseHistory.value = browseHistory.value.slice(0, 50)
    }
    if (userInfo.value) {
      const userId = userInfo.value.id
      localStorage.setItem(`browseHistory_${userId}`, JSON.stringify(browseHistory.value))
    }
  }

  const getUserBehaviorData = () => ({
    favorites: favorites.value,
    registrations: registrations.value,
    browseHistory: browseHistory.value.slice(0, 20)
  })

  // 创建新用户（仅管理员）
  const createUser = async (userData) => {
    try {
      const response = await userAPI.createUser(userData)
      return { success: true, user: response.user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '创建用户失败' 
      }
    }
  }

  // 获取所有学生用户
  const getAllStudents = async () => {
    try {
      const students = await userAPI.getAllStudents()
      return students
    } catch (error) {
      console.error('获取学生列表失败:', error)
      return []
    }
  }

  // 删除用户（仅管理员）
  const deleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '删除用户失败' 
      }
    }
  }

  // 更新用户信息
  const updateUser = async (userId, userData) => {
    try {
      const response = await userAPI.updateUser(userId, userData)
      return { success: true, user: response.user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '更新用户失败' 
      }
    }
  }

  // 这些方法已废弃，不再需要

  const init = () => {
    if (token.value) {
      loadUserData()
    }
  }

  return {
    userInfo, token, favorites, registrations, browseHistory,
    isLoggedIn, isAdmin, userName,
    login, logout, loadUserData, toggleFavorite, isFavorite,
    registerActivity, unregisterActivity, isRegistered, addBrowseHistory,
    getUserBehaviorData, init,
    createUser, getAllStudents, deleteUser, updateUser
  }
})
