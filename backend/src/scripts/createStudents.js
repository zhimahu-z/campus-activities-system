const sequelize = require('../config/database')
const { User } = require('../models')
const bcrypt = require('bcryptjs')

async function createStudents() {
  try {
    console.log('🔄 开始批量创建学生账户...')
    
    // 学生数据
    const students = [
      {
        username: 'student2',
        password: '123456',
        name: '李四',
        email: 'student2@campus.edu',
        studentId: '2024002',
        major: '软件工程',
        grade: '2024级',
        phone: '13800138001'
      },
      {
        username: 'student3',
        password: '123456',
        name: '王五',
        email: 'student3@campus.edu',
        studentId: '2024003',
        major: '人工智能',
        grade: '2024级',
        phone: '13800138002'
      },
      {
        username: 'student4',
        password: '123456',
        name: '赵六',
        email: 'student4@campus.edu',
        studentId: '2024004',
        major: '数据科学',
        grade: '2024级',
        phone: '13800138003'
      },
      {
        username: 'student5',
        password: '123456',
        name: '孙七',
        email: 'student5@campus.edu',
        studentId: '2024005',
        major: '网络工程',
        grade: '2023级',
        phone: '13800138004'
      },
      {
        username: 'student6',
        password: '123456',
        name: '周八',
        email: 'student6@campus.edu',
        studentId: '2023001',
        major: '信息安全',
        grade: '2023级',
        phone: '13800138005'
      },
      {
        username: 'student7',
        password: '123456',
        name: '吴九',
        email: 'student7@campus.edu',
        studentId: '2023002',
        major: '物联网工程',
        grade: '2023级',
        phone: '13800138006'
      },
      {
        username: 'student8',
        password: '123456',
        name: '郑十',
        email: 'student8@campus.edu',
        studentId: '2023003',
        major: '大数据技术',
        grade: '2022级',
        phone: '13800138007'
      },
      {
        username: 'student9',
        password: '123456',
        name: '钱十一',
        email: 'student9@campus.edu',
        studentId: '2022001',
        major: '云计算',
        grade: '2022级',
        phone: '13800138008'
      },
      {
        username: 'student10',
        password: '123456',
        name: '陈十二',
        email: 'student10@campus.edu',
        studentId: '2022002',
        major: '区块链工程',
        grade: '2022级',
        phone: '13800138009'
      },
      {
        username: 'student11',
        password: '123456',
        name: '刘十三',
        email: 'student11@campus.edu',
        studentId: '2021001',
        major: '计算机科学与技术',
        grade: '2021级',
        phone: '13800138010'
      }
    ]
    
    let successCount = 0
    let skipCount = 0
    
    for (const studentData of students) {
      try {
        // 检查用户名是否已存在
        const existing = await User.findOne({ where: { username: studentData.username } })
        if (existing) {
          console.log(`⚠️  跳过：${studentData.username} (${studentData.name}) - 已存在`)
          skipCount++
          continue
        }
        
        // 创建学生账号
        await User.create({
          ...studentData,
          role: 'student',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.username}`
        })
        
        console.log(`✅ 创建成功：${studentData.username} (${studentData.name})`)
        successCount++
      } catch (error) {
        console.error(`❌ 创建失败：${studentData.username} - ${error.message}`)
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 批量创建完成！')
    console.log('='.repeat(50))
    console.log(`✅ 成功创建：${successCount} 个账号`)
    console.log(`⚠️  跳过：${skipCount} 个账号（已存在）`)
    console.log('='.repeat(50))
    console.log('\n📝 所有账号密码统一为：123456')
    console.log('\n账号列表：')
    students.forEach((s, i) => {
      console.log(`${i + 2}. ${s.username} / 123456 - ${s.name} (${s.major})`)
    })
    console.log('='.repeat(50))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 批量创建失败:', error)
    process.exit(1)
  }
}

createStudents()




