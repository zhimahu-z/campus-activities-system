const sequelize = require('../config/database')
const { User, Activity, Registration, Favorite, Comment } = require('../models')

async function initDatabase() {
  try {
    console.log('🔄 开始初始化数据库...')
    
    // 同步数据库（force: true 会删除已存在的表）
    await sequelize.sync({ force: true })
    console.log('✅ 数据库表创建成功')
    
    // 创建管理员账号（密码会被模型的hook自动加密）
    await User.create({
      username: 'admin',
      password: '123456',  // 明文密码，会被hook自动加密
      name: '系统管理员',
      email: 'admin@campus.edu',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    })
    console.log('✅ 管理员账号创建成功 (admin/123456)')
    
    // 创建示例学生账号（密码会被模型的hook自动加密）
    const student = await User.create({
      username: 'student1',
      password: '123456',  // 明文密码，会被hook自动加密
      name: '张三',
      email: 'student1@campus.edu',
      role: 'student',
      studentId: '2024001',
      major: '计算机科学与技术',
      grade: '2024级',
      phone: '13800138000',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1'
    })
    console.log('✅ 示例学生账号创建成功 (student1/123456)')
    
    // 创建示例活动（包含未开始、进行中、已结束三种状态）
    const now = new Date()
    
    const activities = [
      // 进行中的活动（1个）
      {
        title: '人工智能前沿讲座',
        description: '邀请知名AI专家分享最新研究成果，探讨人工智能在各领域的应用前景。本次讲座将深入浅出地介绍深度学习、自然语言处理等前沿技术。',
        category: '学术讲座',
        cover: 'https://picsum.photos/800/400?random=1',
        location: '学术报告厅',
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30分钟前开始
        endTime: new Date(now.getTime() + 90 * 60 * 1000),   // 90分钟后结束
        maxParticipants: 80,
        participants: 0,
        organizer: '计算机学院',
        tags: ['人工智能', '学术', '前沿技术'],
        status: 'active',
        createdBy: 1
      },
      // 未开始的活动（3个）
      {
        title: '校园音乐节',
        description: '一年一度的校园音乐盛会，汇聚校内外优秀音乐人，为大家带来精彩的音乐表演。现场还有互动游戏和抽奖环节。',
        category: '文艺演出',
        cover: 'https://picsum.photos/800/400?random=2',
        location: '体育场',
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),  // 3天后
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        maxParticipants: 150,
        participants: 0,
        organizer: '学生会',
        tags: ['音乐', '演出', '娱乐'],
        status: 'active',
        createdBy: 1
      },
      {
        title: '春季马拉松',
        description: '挑战自我，超越极限！春季校园马拉松等你来战。设有全程、半程和迷你马拉松三个项目，欢迎所有师生参与。',
        category: '体育竞技',
        cover: 'https://picsum.photos/800/400?random=3',
        location: '校园环道',
        startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),  // 7天后
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        maxParticipants: 100,
        participants: 0,
        organizer: '体育部',
        tags: ['运动', '马拉松', '健康'],
        status: 'active',
        createdBy: 1
      },
      {
        title: '创业项目路演大赛',
        description: '为有创业梦想的同学提供展示平台，邀请知名投资人和企业家担任评委，优秀项目可获得创业基金支持。',
        category: '创新创业',
        cover: 'https://picsum.photos/800/400?random=4',
        location: '创新创业中心',
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),  // 5天后
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        maxParticipants: 50,
        participants: 0,
        organizer: '创业学院',
        tags: ['创业', '路演', '比赛'],
        status: 'active',
        createdBy: 1
      },
      // 已结束的活动（2个）
      {
        title: '摄影社作品展',
        description: '摄影社年度作品展，展出社员们一年来的优秀摄影作品，涵盖风光、人像、纪实等多个主题。',
        category: '社团活动',
        cover: 'https://picsum.photos/800/400?random=5',
        location: '艺术中心展厅',
        startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10天前开始
        endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),    // 3天前结束
        maxParticipants: 200,
        participants: 0,
        organizer: '摄影社',
        tags: ['摄影', '展览', '艺术'],
        status: 'active',
        createdBy: 1
      },
      {
        title: '社区志愿服务活动',
        description: '走进社区，为老人提供陪伴和帮助，包括打扫卫生、聊天陪伴、教授智能手机使用等。',
        category: '志愿服务',
        cover: 'https://picsum.photos/800/400?random=6',
        location: '阳光社区',
        startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),  // 5天前开始
        endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 当天结束
        maxParticipants: 30,
        participants: 0,
        organizer: '志愿者协会',
        tags: ['志愿', '公益', '社区'],
        status: 'active',
        createdBy: 1
      },
      // 额外的未开始活动（2个）
      {
        title: '编程马拉松大赛',
        description: '48小时编程挑战赛，组队参赛，现场开发创新项目。设有丰厚奖金和企业实习机会。',
        category: '学术讲座',
        cover: 'https://picsum.photos/800/400?random=7',
        location: '计算机实验楼',
        startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10天后
        endTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        maxParticipants: 60,
        participants: 0,
        organizer: '计算机学院',
        tags: ['编程', '比赛', '创新'],
        status: 'active',
        createdBy: 1
      },
      {
        title: '校园歌手大赛',
        description: '展现你的音乐才华，成为校园明星！海选、复赛、决赛层层选拔，冠军将获得专业录音机会。',
        category: '文艺演出',
        cover: 'https://picsum.photos/800/400?random=8',
        location: '大礼堂',
        startTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15天后
        endTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        maxParticipants: 120,
        participants: 0,
        organizer: '艺术学院',
        tags: ['音乐', '比赛', '才艺'],
        status: 'active',
        createdBy: 1
      }
    ]
    
    for (const activityData of activities) {
      await Activity.create(activityData)
    }
    console.log('✅ 示例活动创建成功')
    
    console.log('='.repeat(50))
    console.log('🎉 数据库初始化完成！')
    console.log('='.repeat(50))
    console.log('📝 测试账号：')
    console.log('   管理员: admin / 123456')
    console.log('   学生: student1 / 123456')
    console.log('='.repeat(50))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  }
}

initDatabase()

