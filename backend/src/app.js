const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '校园活动管理系统API运行正常',
    timestamp: new Date().toISOString()
  })
})

// API路由
app.use('/api/users', require('./routes/user'))
app.use('/api/activities', require('./routes/activity'))
app.use('/api/registrations', require('./routes/registration'))
app.use('/api/favorites', require('./routes/favorite'))
app.use('/api/comments', require('./routes/comment'))

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' })
})

// 错误处理
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('='.repeat(50))
  console.log('🚀 校园活动管理系统后端API启动成功！')
  console.log('='.repeat(50))
  console.log(`📡 服务器地址: http://localhost:${PORT}`)
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`)
  console.log(`📚 API文档: http://localhost:${PORT}/api`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('='.repeat(50))
})

module.exports = app




