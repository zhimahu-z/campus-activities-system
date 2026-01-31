import request from '@/utils/request'

// 用户相关API
export const userAPI = {
  // 注册
  register: (data) => request.post('/users/register', data),
  
  // 登录
  login: (credentials) => request.post('/users/login', credentials),
  
  // 获取当前用户信息
  getCurrentUser: () => request.get('/users/me'),
  
  // 获取所有学生（管理员）
  getAllStudents: () => request.get('/users/students'),
  
  // 获取用户详情
  getUserById: (id) => request.get(`/users/${id}`),
  
  // 创建用户（管理员）
  createUser: (data) => request.post('/users', data),
  
  // 更新用户信息
  updateUser: (id, data) => request.put(`/users/${id}`, data),
  
  // 删除用户（管理员）
  deleteUser: (id) => request.delete(`/users/${id}`),
  
  // 修改密码
  changePassword: (data) => request.post('/users/change-password', data)
}

// 活动相关API
export const activityAPI = {
  // 获取活动列表
  getAll: (params) => request.get('/activities', { params }),
  
  // 获取活动详情
  getById: (id) => request.get(`/activities/${id}`),
  
  // 创建活动（管理员）
  create: (data) => request.post('/activities', data),
  
  // 更新活动（管理员）
  update: (id, data) => request.put(`/activities/${id}`, data),
  
  // 删除活动（管理员）
  delete: (id) => request.delete(`/activities/${id}`),
  
  // 获取活动统计
  getStatistics: () => request.get('/activities/statistics')
}

// 报名相关API
export const registrationAPI = {
  // 报名活动
  register: (activityId) => request.post('/registrations', { activityId }),
  
  // 取消报名
  cancel: (activityId) => request.delete(`/registrations/${activityId}`),
  
  // 获取用户报名记录
  getUserRegistrations: (userId) => request.get(`/registrations/user/${userId || ''}`),
  
  // 获取活动报名用户列表
  getActivityRegistrations: (activityId) => request.get(`/registrations/activity/${activityId}`),
  
  // 获取所有报名统计（管理员）
  getAllStats: () => request.get('/registrations/stats/all')
}

// 收藏相关API
export const favoriteAPI = {
  // 收藏活动
  add: (activityId) => request.post('/favorites', { activityId }),
  
  // 取消收藏
  remove: (activityId) => request.delete(`/favorites/${activityId}`),
  
  // 获取用户收藏列表
  getUserFavorites: (userId) => request.get(`/favorites/user/${userId || ''}`),
  
  // 检查是否已收藏
  check: (activityId) => request.get(`/favorites/check/${activityId}`)
}

// 评论相关API
export const commentAPI = {
  // 发表评论
  create: (data) => request.post('/comments', data),
  
  // 获取活动评论列表
  getActivityComments: (activityId, params) => request.get(`/comments/activity/${activityId}`, { params }),
  
  // 删除评论
  delete: (id) => request.delete(`/comments/${id}`)
}




