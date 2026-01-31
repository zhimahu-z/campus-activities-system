// 检查是否为管理员
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' })
  }
  next()
}

// 检查是否为学生
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: '需要学生权限' })
  }
  next()
}

// 检查是否为资源所有者或管理员
const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此资源' })
    }
    next()
  }
}

module.exports = {
  isAdmin,
  isStudent,
  isOwnerOrAdmin
}




