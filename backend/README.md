# 校园活动管理系统 - 后端API

## 📋 项目说明

这是校园活动管理系统的后端API服务，使用 Node.js + Express + MySQL 构建。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_activities

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your-random-secret-key-here
```

### 3. 创建数据库

在MySQL中创建数据库：

```sql
CREATE DATABASE campus_activities CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 初始化数据库

```bash
npm run init-db
```

这将创建所有表并插入初始数据（管理员账号和示例活动）。

### 5. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## 📚 API文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON

### 用户相关 API

#### 1. 用户注册
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "student1",
  "password": "123456",
  "name": "张三",
  "email": "student1@campus.edu",
  "studentId": "2024001",
  "major": "计算机科学与技术",
  "grade": "2024级",
  "phone": "13800138000"
}
```

#### 2. 用户登录
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}

响应：
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "系统管理员",
    "role": "admin",
    ...
  }
}
```

#### 3. 获取当前用户信息
```http
GET /api/users/me
Authorization: Bearer {token}
```

#### 4. 获取所有学生（管理员）
```http
GET /api/users/students
Authorization: Bearer {token}
```

#### 5. 删除用户（管理员）
```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

### 活动相关 API

#### 1. 获取活动列表
```http
GET /api/activities?page=1&limit=10&category=学术讲座&search=人工智能
```

#### 2. 获取活动详情
```http
GET /api/activities/:id
```

#### 3. 创建活动（管理员）
```http
POST /api/activities
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "活动标题",
  "description": "活动描述",
  "category": "学术讲座",
  "cover": "https://example.com/cover.jpg",
  "location": "学术报告厅",
  "startTime": "2026-02-15T14:00:00",
  "endTime": "2026-02-15T16:00:00",
  "maxParticipants": 200,
  "organizer": "计算机学院",
  "tags": ["人工智能", "学术"]
}
```

#### 4. 更新活动（管理员）
```http
PUT /api/activities/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### 5. 删除活动（管理员）
```http
DELETE /api/activities/:id
Authorization: Bearer {token}
```

#### 6. 获取活动统计
```http
GET /api/activities/statistics
```

### 报名相关 API

#### 1. 报名活动
```http
POST /api/registrations
Authorization: Bearer {token}
Content-Type: application/json

{
  "activityId": 1
}
```

#### 2. 取消报名
```http
DELETE /api/registrations/:activityId
Authorization: Bearer {token}
```

#### 3. 获取用户报名记录
```http
GET /api/registrations/user/:userId
Authorization: Bearer {token}
```

#### 4. 获取活动报名用户列表
```http
GET /api/registrations/activity/:activityId
Authorization: Bearer {token}
```

#### 5. 获取所有报名统计（管理员）
```http
GET /api/registrations/stats/all
Authorization: Bearer {token}
```

### 收藏相关 API

#### 1. 收藏活动
```http
POST /api/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "activityId": 1
}
```

#### 2. 取消收藏
```http
DELETE /api/favorites/:activityId
Authorization: Bearer {token}
```

#### 3. 获取用户收藏列表
```http
GET /api/favorites/user/:userId
Authorization: Bearer {token}
```

#### 4. 检查是否已收藏
```http
GET /api/favorites/check/:activityId
Authorization: Bearer {token}
```

### 评论相关 API

#### 1. 发表评论
```http
POST /api/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "activityId": 1,
  "content": "这个活动很有意思！"
}
```

#### 2. 获取活动评论列表
```http
GET /api/comments/activity/:activityId?page=1&limit=20
```

#### 3. 删除评论
```http
DELETE /api/comments/:id
Authorization: Bearer {token}
```

## 🗄️ 数据库设计

### 用户表 (users)
- id: 主键
- username: 用户名（唯一）
- password: 密码（加密）
- name: 真实姓名
- email: 邮箱（唯一）
- role: 角色（admin/student）
- avatar: 头像URL
- studentId: 学号
- major: 专业
- grade: 年级
- phone: 手机号
- createdAt: 创建时间
- updatedAt: 更新时间

### 活动表 (activities)
- id: 主键
- title: 活动标题
- description: 活动描述
- category: 活动分类
- cover: 封面图片
- location: 活动地点
- startTime: 开始时间
- endTime: 结束时间
- maxParticipants: 最大参与人数
- participants: 当前参与人数
- organizer: 主办方
- tags: 标签（JSON）
- status: 状态（active/inactive/cancelled）
- createdBy: 创建者ID
- createdAt: 创建时间
- updatedAt: 更新时间

### 报名表 (registrations)
- id: 主键
- userId: 用户ID
- activityId: 活动ID
- status: 状态（registered/cancelled/attended）
- createdAt: 创建时间
- updatedAt: 更新时间

### 收藏表 (favorites)
- id: 主键
- userId: 用户ID
- activityId: 活动ID
- createdAt: 创建时间
- updatedAt: 更新时间

### 评论表 (comments)
- id: 主键
- activityId: 活动ID
- userId: 用户ID
- content: 评论内容
- createdAt: 创建时间
- updatedAt: 更新时间

## 🔒 权限说明

### 公开接口（无需认证）
- 用户注册
- 用户登录
- 获取活动列表
- 获取活动详情
- 获取活动评论

### 需要认证的接口
- 获取当前用户信息
- 报名/取消报名
- 收藏/取消收藏
- 发表评论
- 删除自己的评论

### 管理员专属接口
- 创建/更新/删除活动
- 获取所有学生列表
- 创建/删除用户
- 获取报名统计

## 🛠️ 技术栈

- **Node.js**: JavaScript运行环境
- **Express**: Web框架
- **MySQL**: 关系型数据库
- **Sequelize**: ORM框架
- **JWT**: 身份认证
- **bcryptjs**: 密码加密
- **express-validator**: 数据验证

## 📝 开发说明

### 项目结构
```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── models/          # 数据模型
│   │   ├── User.js
│   │   ├── Activity.js
│   │   ├── Registration.js
│   │   ├── Favorite.js
│   │   ├── Comment.js
│   │   └── index.js
│   ├── controllers/     # 控制器
│   │   ├── userController.js
│   │   ├── activityController.js
│   │   ├── registrationController.js
│   │   ├── favoriteController.js
│   │   └── commentController.js
│   ├── routes/          # 路由
│   │   ├── user.js
│   │   ├── activity.js
│   │   ├── registration.js
│   │   ├── favorite.js
│   │   └── comment.js
│   ├── middleware/      # 中间件
│   │   ├── auth.js
│   │   ├── permission.js
│   │   └── errorHandler.js
│   ├── scripts/         # 脚本
│   │   └── initDB.js
│   └── app.js           # 应用入口
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

### 添加新功能

1. 在 `models/` 中定义数据模型
2. 在 `controllers/` 中实现业务逻辑
3. 在 `routes/` 中定义路由
4. 在 `app.js` 中注册路由

## 🐛 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 检查 `.env` 中的数据库配置是否正确
- 确认数据库已创建

### 2. JWT认证失败
- 检查请求头是否包含 `Authorization: Bearer {token}`
- 检查token是否过期
- 检查 `.env` 中的 `JWT_SECRET` 是否正确

### 3. 端口被占用
- 修改 `.env` 中的 `PORT` 配置
- 或者关闭占用3000端口的程序

## 📄 许可证

MIT License




