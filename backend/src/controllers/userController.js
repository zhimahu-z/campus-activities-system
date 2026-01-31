const { User } = require('../models')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// 注册
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: '数据验证失败', errors: errors.array() })
    }
    
    const { username, password, name, email, studentId, major, grade, phone } = req.body
    
    // 检查用户名是否存在
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' })
    }
    
    // 检查邮箱是否存在
    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已被使用' })
    }
    
    // 创建用户
    const user = await User.create({
      username,
      password,
      name,
      email,
      studentId,
      major,
      grade,
      phone,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      role: 'student'
    })
    
    res.status(201).json({
      message: '注册成功',
      user: user.toSafeJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 登录
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' })
    }
    
    // 查找用户
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    // 验证密码
    const isValid = await user.validatePassword(password)
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    // 生成token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    res.json({
      message: '登录成功',
      token,
      user: user.toSafeJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 获取当前用户信息
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json(user.toSafeJSON())
  } catch (error) {
    next(error)
  }
}

// 获取所有学生用户
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    })
    res.json(students)
  } catch (error) {
    next(error)
  }
}

// 获取用户详情
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    })
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// 创建用户（管理员）
exports.createUser = async (req, res, next) => {
  try {
    const { username, password, name, email, studentId, major, grade, phone } = req.body
    
    // 检查用户名是否存在
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' })
    }
    
    const user = await User.create({
      username,
      password,
      name,
      email,
      studentId,
      major,
      grade,
      phone,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      role: 'student'
    })
    
    res.status(201).json({
      message: '用户创建成功',
      user: user.toSafeJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 更新用户信息
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email, studentId, major, grade, phone } = req.body
    
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    await user.update({
      name,
      email,
      studentId,
      major,
      grade,
      phone
    })
    
    res.json({
      message: '用户信息更新成功',
      user: user.toSafeJSON()
    })
  } catch (error) {
    next(error)
  }
}

// 删除用户
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id)
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: '不能删除管理员账号' })
    }
    
    await user.destroy()
    res.json({ message: '用户已删除' })
  } catch (error) {
    next(error)
  }
}

// 修改密码
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    // 验证旧密码
    const isValid = await user.validatePassword(oldPassword)
    if (!isValid) {
      return res.status(400).json({ message: '原密码错误' })
    }
    
    // 更新密码
    user.password = newPassword
    await user.save()
    
    res.json({ message: '密码修改成功' })
  } catch (error) {
    next(error)
  }
}




