const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const bcrypt = require('bcryptjs')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（加密）'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '真实姓名'
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    comment: '邮箱'
  },
  role: {
    type: DataTypes.ENUM('admin', 'student'),
    defaultValue: 'student',
    comment: '角色'
  },
  avatar: {
    type: DataTypes.STRING(255),
    comment: '头像URL'
  },
  studentId: {
    type: DataTypes.STRING(20),
    comment: '学号'
  },
  major: {
    type: DataTypes.STRING(50),
    comment: '专业'
  },
  grade: {
    type: DataTypes.STRING(20),
    comment: '年级'
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '手机号'
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    }
  }
})

// 验证密码
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}

// 转换为安全的JSON（不包含密码）
User.prototype.toSafeJSON = function() {
  const values = { ...this.get() }
  delete values.password
  return values
}

module.exports = User




