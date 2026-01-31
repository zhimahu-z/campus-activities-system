const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err)
  
  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: '数据验证失败',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    })
  }
  
  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: '数据已存在',
      field: err.errors[0]?.path
    })
  }
  
  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: '无效的认证令牌' })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: '认证令牌已过期' })
  }
  
  // 默认错误
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler




