const sequelize = require('../config/database')
const { User } = require('../models')
const bcrypt = require('bcryptjs')

async function testLogin() {
  try {
    console.log('🔍 测试登录功能...\n')
    
    // 查找管理员账号
    const admin = await User.findOne({ where: { username: 'admin' } })
    
    if (!admin) {
      console.log('❌ 管理员账号不存在！')
      console.log('请先运行: npm run init-db')
      process.exit(1)
    }
    
    console.log('✅ 找到管理员账号:')
    console.log('   用户名:', admin.username)
    console.log('   姓名:', admin.name)
    console.log('   角色:', admin.role)
    console.log('   密码哈希:', admin.password.substring(0, 30) + '...')
    console.log()
    
    // 测试密码验证
    const testPassword = '123456'
    console.log(`🔐 测试密码: ${testPassword}`)
    
    // 方法1: 使用模型的 validatePassword 方法
    const isValid1 = await admin.validatePassword(testPassword)
    console.log('   方法1 (validatePassword):', isValid1 ? '✅ 通过' : '❌ 失败')
    
    // 方法2: 直接使用 bcrypt.compare
    const isValid2 = await bcrypt.compare(testPassword, admin.password)
    console.log('   方法2 (bcrypt.compare):', isValid2 ? '✅ 通过' : '❌ 失败')
    
    // 测试错误密码
    const wrongPassword = 'wrong123'
    const isValid3 = await admin.validatePassword(wrongPassword)
    console.log(`   测试错误密码 (${wrongPassword}):`, isValid3 ? '❌ 不应该通过' : '✅ 正确拒绝')
    
    console.log()
    
    if (isValid1 && isValid2) {
      console.log('🎉 密码验证功能正常！')
      console.log('✅ 可以使用 admin/123456 登录')
    } else {
      console.log('❌ 密码验证失败！')
      console.log('⚠️  请重新初始化数据库: npm run init-db')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

testLogin()




