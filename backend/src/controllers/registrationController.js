const { Registration, Activity, User } = require('../models')
const sequelize = require('../config/database')

// 报名活动
exports.registerActivity = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  
  try {
    const { activityId } = req.body
    const userId = req.user.id
    
    // 检查用户角色
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: '管理员账号不能报名活动' })
    }
    
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId)
    if (!activity) {
      await transaction.rollback()
      return res.status(404).json({ message: '活动不存在' })
    }
    
    // 检查活动状态
    if (activity.status !== 'active') {
      await transaction.rollback()
      return res.status(400).json({ message: '活动不可报名' })
    }
    
    // 检查是否已报名
    const existingRegistration = await Registration.findOne({
      where: { userId, activityId }
    })
    
    if (existingRegistration) {
      await transaction.rollback()
      return res.status(400).json({ message: '已经报名过该活动' })
    }
    
    // 检查名额
    if (activity.participants >= activity.maxParticipants) {
      await transaction.rollback()
      return res.status(400).json({ message: '活动名额已满' })
    }
    
    // 创建报名记录
    const registration = await Registration.create({
      userId,
      activityId,
      status: 'registered'
    }, { transaction })
    
    // 更新活动参与人数
    await activity.increment('participants', { transaction })
    
    await transaction.commit()
    
    res.status(201).json({
      message: '报名成功',
      registration
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// 取消报名
exports.cancelRegistration = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  
  try {
    const { activityId } = req.params
    const userId = req.user.id
    
    const registration = await Registration.findOne({
      where: { userId, activityId, status: 'registered' }
    })
    
    if (!registration) {
      await transaction.rollback()
      return res.status(404).json({ message: '未找到报名记录' })
    }
    
    // 更新报名状态
    await registration.update({ status: 'cancelled' }, { transaction })
    
    // 更新活动参与人数
    const activity = await Activity.findByPk(activityId)
    if (activity && activity.participants > 0) {
      await activity.decrement('participants', { transaction })
    }
    
    await transaction.commit()
    
    res.json({ message: '取消报名成功' })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// 获取用户的报名记录
exports.getUserRegistrations = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id
    
    const registrations = await Registration.findAll({
      where: { userId, status: 'registered' },
      include: [
        {
          model: Activity,
          as: 'activity'
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    
    res.json(registrations)
  } catch (error) {
    next(error)
  }
}

// 获取活动的报名用户列表
exports.getActivityRegistrations = async (req, res, next) => {
  try {
    const { activityId } = req.params
    
    const registrations = await Registration.findAll({
      where: { activityId, status: 'registered' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    
    res.json(registrations)
  } catch (error) {
    next(error)
  }
}

// 获取所有报名统计
exports.getAllRegistrationsStats = async (req, res, next) => {
  try {
    const stats = await Registration.findAll({
      where: { status: 'registered' },
      attributes: [
        'activityId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['activityId']
    })
    
    const result = {}
    stats.forEach(stat => {
      result[stat.activityId] = parseInt(stat.get('count'))
    })
    
    res.json(result)
  } catch (error) {
    next(error)
  }
}




