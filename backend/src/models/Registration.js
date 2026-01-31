const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  activityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '活动ID'
  },
  status: {
    type: DataTypes.ENUM('registered', 'cancelled', 'attended'),
    defaultValue: 'registered',
    comment: '报名状态'
  }
}, {
  tableName: 'registrations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'activityId']
    }
  ]
})

module.exports = Registration




