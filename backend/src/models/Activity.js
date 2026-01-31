const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '活动标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '活动描述'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '活动分类'
  },
  cover: {
    type: DataTypes.STRING(255),
    comment: '封面图片URL'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '活动地点'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始时间'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '结束时间'
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: '最大参与人数'
  },
  participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前参与人数'
  },
  organizer: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '主办方'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '标签'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
    defaultValue: 'active',
    comment: '状态'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    comment: '创建者ID'
  }
}, {
  tableName: 'activities',
  timestamps: true
})

module.exports = Activity




