const sequelize = require('../config/database')
const { Registration, Activity, User } = require('../models')

async function createMockRegistrations() {
  try {
    console.log('🔄 开始创建模拟报名数据...')
    
    // 获取所有学生和活动
    const students = await User.findAll({ where: { role: 'student' } })
    const activities = await Activity.findAll()
    
    if (students.length === 0) {
      console.log('❌ 没有找到学生账号，请先运行 createStudents.js')
      process.exit(1)
    }
    
    if (activities.length === 0) {
      console.log('❌ 没有找到活动，请先运行 initDB.js')
      process.exit(1)
    }
    
    console.log(`📊 找到 ${students.length} 个学生，${activities.length} 个活动`)
    console.log('')
    
    let successCount = 0
    let skipCount = 0
    
    // 为每个活动生成不同的报名数据（参与率有差异，体现热度）
    for (const activity of activities) {
      // 根据活动类型设置不同的参与率范围
      let minRate, maxRate
      
      // 根据活动ID或类型设置不同的热度
      const activityIndex = activities.indexOf(activity)
      
      if (activityIndex === 0) {
        // 第一个活动（进行中）- 高参与率
        minRate = 0.5
        maxRate = 0.7
      } else if (activityIndex <= 2) {
        // 前3个活动 - 中高参与率
        minRate = 0.4
        maxRate = 0.6
      } else if (activityIndex <= 5) {
        // 中间活动 - 中等参与率
        minRate = 0.25
        maxRate = 0.45
      } else {
        // 后面的活动 - 较低参与率
        minRate = 0.15
        maxRate = 0.35
      }
      
      // 计算目标参与人数
      const minParticipants = Math.floor(activity.maxParticipants * minRate)
      const maxParticipants = Math.floor(activity.maxParticipants * maxRate)
      const targetParticipants = Math.floor(Math.random() * (maxParticipants - minParticipants + 1)) + minParticipants
      
      // 随机选择学生报名
      const shuffledStudents = students.sort(() => 0.5 - Math.random())
      const selectedStudents = shuffledStudents.slice(0, Math.min(targetParticipants, students.length))
      
      for (const student of selectedStudents) {
        try {
          // 检查是否已报名
          const existing = await Registration.findOne({
            where: {
              userId: student.id,
              activityId: activity.id
            }
          })
          
          if (existing) {
            skipCount++
            continue
          }
          
          // 创建报名记录
          await Registration.create({
            userId: student.id,
            activityId: activity.id,
            status: 'registered'
          })
          
          // 更新活动参与人数
          await activity.increment('participants')
          
          console.log(`✅ ${student.name} 报名了 ${activity.title}`)
          successCount++
        } catch (error) {
          console.error(`❌ 报名失败：${student.name} -> ${activity.title}`)
        }
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 模拟报名数据创建完成！')
    console.log('='.repeat(50))
    console.log(`✅ 成功创建：${successCount} 条报名记录`)
    console.log(`⚠️  跳过：${skipCount} 条（已存在）`)
    console.log('='.repeat(50))
    
    // 显示统计
    console.log('\n📊 活动报名统计：')
    for (const activity of activities) {
      await activity.reload()
      console.log(`   ${activity.title}: ${activity.participants}/${activity.maxParticipants} 人`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 创建失败:', error)
    process.exit(1)
  }
}

createMockRegistrations()

