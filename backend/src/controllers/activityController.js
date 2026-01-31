const { Activity, User, Registration } = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/database')

// 获取所有活动
exports.getAllActivities = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query
    
    const where = {}
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }
    
    const offset = (page - 1) * limit
    
    const { count, rows } = await Activity.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      data: rows
    })
  } catch (error) {
    next(error)
  }
}

// 获取活动详情
exports.getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const activity = await Activity.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'username']
        }
      ]
    })
    
    if (!activity) {
      return res.status(404).json({ message: '活动不存在' })
    }
    
    res.json(activity)
  } catch (error) {
    next(error)
  }
}

// 创建活动
exports.createActivity = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      cover,
      location,
      startTime,
      endTime,
      maxParticipants,
      organizer,
      tags
    } = req.body
    
    const activity = await Activity.create({
      title,
      description,
      category,
      cover,
      location,
      startTime,
      endTime,
      maxParticipants,
      organizer,
      tags,
      createdBy: req.user.id,
      participants: 0,
      status: 'active'
    })
    
    res.status(201).json({
      message: '活动创建成功',
      activity
    })
  } catch (error) {
    next(error)
  }
}

// 更新活动
exports.updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      category,
      cover,
      location,
      startTime,
      endTime,
      maxParticipants,
      organizer,
      tags,
      status
    } = req.body
    
    const activity = await Activity.findByPk(id)
    
    if (!activity) {
      return res.status(404).json({ message: '活动不存在' })
    }
    
    await activity.update({
      title,
      description,
      category,
      cover,
      location,
      startTime,
      endTime,
      maxParticipants,
      organizer,
      tags,
      status
    })
    
    res.json({
      message: '活动更新成功',
      activity
    })
  } catch (error) {
    next(error)
  }
}

// 删除活动
exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const activity = await Activity.findByPk(id)
    
    if (!activity) {
      return res.status(404).json({ message: '活动不存在' })
    }
    
    await activity.destroy()
    res.json({ message: '活动已删除' })
  } catch (error) {
    next(error)
  }
}

// 获取活动统计
exports.getStatistics = async (req, res, next) => {
  try {
    // 总活动数
    const totalActivities = await Activity.count()
    
    // 总参与人数
    const totalParticipants = await Registration.count({
      where: { status: 'registered' }
    })
    
    // 进行中的活动
    const now = new Date()
    const activeActivities = await Activity.count({
      where: {
        status: 'active',
        startTime: { [Op.lte]: now },
        endTime: { [Op.gte]: now }
      }
    })
    
    // 分类统计
    const categoryStats = await Activity.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    })
    
    // 热门活动
    const hotActivities = await Activity.findAll({
      order: [['participants', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ]
    })
    
    res.json({
      totalActivities,
      totalParticipants,
      activeActivities,
      categoryStats,
      hotActivities
    })
  } catch (error) {
    next(error)
  }
}




