const User = require('./User')
const Activity = require('./Activity')
const Registration = require('./Registration')
const Favorite = require('./Favorite')
const Comment = require('./Comment')

// 定义关联关系

// Registration - User
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' })

// Registration - Activity
Registration.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' })
Activity.hasMany(Registration, { foreignKey: 'activityId', as: 'registrations' })

// Favorite - User
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' })

// Favorite - Activity
Favorite.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' })
Activity.hasMany(Favorite, { foreignKey: 'activityId', as: 'favorites' })

// 用户 - 活动（报名）- 多对多关系
User.belongsToMany(Activity, { 
  through: Registration, 
  foreignKey: 'userId',
  as: 'registeredActivities'
})
Activity.belongsToMany(User, { 
  through: Registration, 
  foreignKey: 'activityId',
  as: 'registeredUsers'
})

// 用户 - 活动（收藏）- 多对多关系
User.belongsToMany(Activity, { 
  through: Favorite, 
  foreignKey: 'userId',
  as: 'favoriteActivities'
})
Activity.belongsToMany(User, { 
  through: Favorite, 
  foreignKey: 'activityId',
  as: 'favoritedByUsers'
})

// 用户 - 评论
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' })
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// 活动 - 评论
Activity.hasMany(Comment, { foreignKey: 'activityId', as: 'comments' })
Comment.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' })

// 活动 - 创建者
Activity.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' })
User.hasMany(Activity, { foreignKey: 'createdBy', as: 'createdActivities' })

module.exports = {
  User,
  Activity,
  Registration,
  Favorite,
  Comment
}

