const { Comment, Activity, User } = require('../models')

// 创建评论
exports.createComment = async (req, res, next) => {
  try {
    const { activityId, content } = req.body
    const userId = req.user.id
    
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId)
    if (!activity) {
      return res.status(404).json({ message: '活动不存在' })
    }
    
    // 创建评论
    const comment = await Comment.create({
      activityId,
      userId,
      content
    })
    
    // 获取完整的评论信息
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'avatar']
        }
      ]
    })
    
    res.status(201).json({
      message: '评论发表成功',
      comment: fullComment
    })
  } catch (error) {
    next(error)
  }
}

// 获取活动的评论列表
exports.getActivityComments = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const { page = 1, limit = 20 } = req.query
    
    const offset = (page - 1) * limit
    
    const { count, rows } = await Comment.findAndCountAll({
      where: { activityId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'avatar']
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

// 删除评论
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const comment = await Comment.findByPk(id)
    
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' })
    }
    
    // 只有评论作者或管理员可以删除
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此评论' })
    }
    
    await comment.destroy()
    
    res.json({ message: '评论已删除' })
  } catch (error) {
    next(error)
  }
}




