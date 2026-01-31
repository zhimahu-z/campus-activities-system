const { Favorite, Activity, User } = require('../models')

// 收藏活动
exports.addFavorite = async (req, res, next) => {
  try {
    const { activityId } = req.body
    const userId = req.user.id
    
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId)
    if (!activity) {
      return res.status(404).json({ message: '活动不存在' })
    }
    
    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { userId, activityId }
    })
    
    if (existingFavorite) {
      return res.status(400).json({ message: '已经收藏过该活动' })
    }
    
    // 创建收藏记录
    const favorite = await Favorite.create({
      userId,
      activityId
    })
    
    res.status(201).json({
      message: '收藏成功',
      favorite
    })
  } catch (error) {
    next(error)
  }
}

// 取消收藏
exports.removeFavorite = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const userId = req.user.id
    
    const favorite = await Favorite.findOne({
      where: { userId, activityId }
    })
    
    if (!favorite) {
      return res.status(404).json({ message: '未找到收藏记录' })
    }
    
    await favorite.destroy()
    
    res.json({ message: '取消收藏成功' })
  } catch (error) {
    next(error)
  }
}

// 获取用户的收藏列表
exports.getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id
    
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Activity,
          as: 'activity'
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    
    res.json(favorites)
  } catch (error) {
    next(error)
  }
}

// 检查是否已收藏
exports.checkFavorite = async (req, res, next) => {
  try {
    const { activityId } = req.params
    const userId = req.user.id
    
    const favorite = await Favorite.findOne({
      where: { userId, activityId }
    })
    
    res.json({ isFavorite: !!favorite })
  } catch (error) {
    next(error)
  }
}




