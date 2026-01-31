# 🎓 智能校园活动管理系统

基于 Vue 3 + Vite + Element Plus + DeepSeek AI 的现代化校园活动管理平台

## ✨ 项目特色

- 🤖 **真实 AI 集成**：接入 DeepSeek 大模型 API，实现智能搜索、评论分析等功能
- 🎨 **现代化 UI**：采用 Element Plus 组件库，界面美观流畅
- 🔐 **角色权限**：学生端和管理员端分离，权限控制完善
- 📊 **数据可视化**：管理员后台提供丰富的数据统计和图表
- 💾 **数据隔离**：用户数据按 userId 隔离，收藏、报名等数据互不干扰

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 DeepSeek API（可选，不配置会使用本地智能算法）
# 编辑 .env 文件，填入你的 API Key
# VITE_DEEPSEEK_API_KEY=sk-your-api-key-here

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:5173
```

## 🤖 DeepSeek AI 配置

本项目已真正接入 DeepSeek 大模型 API，实现智能搜索、评论分析等功能。

### 配置步骤：

1. **获取 API Key**：访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册并获取 API Key

2. **配置 .env 文件**：
```env
VITE_DEEPSEEK_API_KEY=sk-你的真实API-Key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com
```

3. **重启服务**：`npm run dev`

4. **测试 AI 功能**：
   - 访问"智能搜索"页面
   - 输入搜索关键词（如："人工智能讲座"）
   - 打开浏览器控制台（F12）查看 API 调用日志
   - 看到 `🤖 正在调用DeepSeek API...` 表示配置成功
   - 看到 `✅ DeepSeek API调用成功` 表示调用成功

### 注意事项：

- ✅ **已配置 API Key**：真正调用 DeepSeek API，智能程度更高
- ⚠️ **未配置 API Key**：自动降级到本地智能算法，功能仍可用
- 📝 **详细说明**：查看 `AI接入说明.md` 文件

### 6 大 AI 功能：

1. **智能搜索** (`/search`) - 理解搜索意图，智能匹配活动
2. **活动摘要** (活动详情页) - 自动提取关键信息和亮点
3. **评论分析** (活动详情页) - 情感分析和内容审核
4. **智能推荐** (首页) - 基于用户行为的个性化推荐
5. **数据分析** (管理员后台) - 平台运营数据洞察和建议
6. **标题生成** (创建活动) - AI 创意文案生成

## 📦 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite 5
- **UI 组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP 客户端**：Axios
- **AI 模型**：DeepSeek API

## 🎯 核心功能

### 学生端功能

- ✅ 用户注册/登录
- ✅ 活动浏览（首页、列表页）
- ✅ 活动详情查看
- ✅ 活动搜索（普通搜索 + AI 智能搜索）
- ✅ 活动筛选（8 大分类、标签、状态、排序）
- ✅ 活动收藏
- ✅ 活动报名
- ✅ 评论功能（AI 情感分析）
- ✅ 个人中心（我的收藏、我的报名）

### 管理员端功能

- ✅ 活动管理（创建、编辑、删除）
- ✅ 活动审核
- ✅ 数据统计（活动数、用户数、参与度等）
- ✅ 数据可视化（图表展示）
- ✅ AI 数据分析（运营洞察和建议）

### AI 智能功能

- ✅ **智能搜索**：理解用户意图，推荐相关活动和关键词
- ✅ **活动摘要**：自动提取活动描述的关键信息
- ✅ **评论分析**：分析评论情感（正面/负面/中性）和规范性
- ✅ **智能推荐**：基于用户收藏、报名、浏览历史推荐活动
- ✅ **数据分析**：分析平台数据，提供洞察和优化建议
- ✅ **标题生成**：根据活动描述生成创意标题

## 📁 项目结构

```
d-campus-activities/
├── src/
│   ├── views/              # 页面组件
│   │   ├── Login.vue       # 登录页
│   │   ├── Home.vue        # 首页
│   │   ├── Activities.vue  # 活动列表（带筛选）
│   │   ├── Search.vue      # AI 智能搜索
│   │   ├── ActivityDetail.vue  # 活动详情
│   │   └── admin/          # 管理员页面
│   │       └── Dashboard.vue   # 管理员后台
│   ├── stores/             # Pinia 状态管理
│   │   ├── user.js         # 用户状态（含数据隔离）
│   │   ├── activity.js     # 活动数据
│   │   └── ai.js           # AI 功能状态
│   ├── services/           # API 服务
│   │   └── deepseek.js     # DeepSeek AI 服务（真实 API 调用）
│   ├── router/             # 路由配置
│   │   └── index.js        # 路由定义和权限守卫
│   ├── styles/             # 全局样式
│   └── main.js             # 应用入口
├── .env                    # 环境变量（DeepSeek API Key）
├── package.json            # 项目依赖
├── vite.config.js          # Vite 配置
├── README.md               # 项目说明
└── AI接入说明.md           # AI 配置详细说明
```

## 👥 测试账号

### 学生账号
- 账号：`student` / 密码：`123456`
- 账号：`zhangsan` / 密码：`123456`
- 账号：`lisi` / 密码：`123456`

### 管理员账号
- 账号：`admin` / 密码：`123456`

## 🎨 功能演示

### 1. 智能搜索
访问 `/search` 页面，输入自然语言搜索：
- "我想参加关于AI的讲座" → AI 理解意图，推荐学术讲座
- "周末有什么文艺活动" → AI 筛选周末的文艺演出
- "适合运动爱好者的活动" → AI 推荐体育竞技类活动

### 2. 活动筛选
访问 `/activities` 页面，支持多维度筛选：
- 8 大分类：学术讲座、文艺演出、体育竞技等
- 标签筛选：人工智能、音乐、运动等
- 状态筛选：报名中、进行中、已结束
- 关键词搜索
- 排序方式：最新、最热、即将开始

### 3. 评论分析
在活动详情页发表评论，AI 自动分析：
- 正面评论 → 显示"积极"、"正面"标签
- 负面评论 → 显示"消极"、"负面"标签
- 不当内容 → 提示修改

### 4. 数据可视化
管理员登录后访问后台，查看：
- 4 大统计卡片（活动数、用户数、参与人数、参与率）
- 分类分布图表
- 参与趋势图表
- AI 数据分析报告

## 🔍 如何验证 AI 真实调用

1. 打开浏览器控制台（F12）
2. 访问智能搜索页面
3. 输入搜索关键词并点击搜索
4. 查看控制台日志：

```
🤖 正在调用DeepSeek API...        ← API 开始调用
✅ DeepSeek API调用成功             ← API 调用成功
✅ AI搜索结果: {...}                ← 返回结果
```

如果看到：
- `⚠️ DeepSeek API Key未配置` → 需要配置 API Key
- `❌ DeepSeek API调用失败` → 检查 API Key 或网络
- `🔄 切换到本地智能匹配` → 自动降级到本地算法

## 📊 API 调用流程

```javascript
// 1. 用户触发搜索
handleSearch() → aiStore.enhanceSearch()

// 2. AI Store 调用 DeepSeek Service
aiStore.enhanceSearch() → deepseekService.enhanceSearch()

// 3. DeepSeek Service 调用真实 API
axios.post('https://api.deepseek.com/v1/chat/completions', {
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: '你是智能搜索助手...' },
    { role: 'user', content: '用户搜索：人工智能讲座' }
  ],
  temperature: 0.3,
  max_tokens: 2000
})

// 4. 解析 AI 返回的 JSON 结果
{
  "relevantIds": ["1", "2", "3"],
  "relatedKeywords": ["人工智能", "AI", "讲座"],
  "suggestedFilters": { "category": "学术讲座" }
}

// 5. 展示搜索结果
```

## 🛠️ 开发说明

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📝 环境变量

创建 `.env` 文件：

```env
# DeepSeek API 配置
VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
VITE_DEEPSEEK_API_URL=https://api.deepseek.com
```

## 🚨 常见问题

### Q1: 如何确认 API 是否真正调用？
**A**: 打开浏览器控制台（F12），查看日志输出。看到 `🤖 正在调用DeepSeek API...` 和 `✅ DeepSeek API调用成功` 表示真实调用。

### Q2: 不配置 API Key 能用吗？
**A**: 可以！系统会自动降级到本地智能算法，所有功能仍然可用，只是智能程度会降低。

### Q3: API 调用失败怎么办？
**A**: 系统会自动降级到本地算法，不影响使用。检查 API Key 配置、网络连接和账户余额。

### Q4: 如何查看详细的 API 调用信息？
**A**: 查看 `src/services/deepseek.js` 文件，所有 API 调用都有详细的 console.log 输出。

## 📚 相关文档

- [AI 接入详细说明](./AI接入说明.md) - DeepSeek API 配置和使用指南
- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs)

## 🎓 毕业设计说明

本项目是一个完整的毕业设计项目，包含：

1. ✅ 完整的前端应用（Vue 3 + Vite）
2. ✅ 真实的 AI 集成（DeepSeek API）
3. ✅ 用户权限管理（学生/管理员）
4. ✅ 数据可视化（图表统计）
5. ✅ 响应式设计（适配多种设备）
6. ✅ 完善的文档（README + AI 配置说明）

### 技术亮点

- 🤖 **真实 AI 集成**：不是模拟数据，而是真正调用 DeepSeek API
- 🔄 **智能降级**：API 不可用时自动切换到本地算法
- 🔐 **数据隔离**：用户数据按 userId 隔离，避免数据混乱
- 📊 **数据可视化**：管理员后台提供丰富的统计图表
- 🎨 **现代化 UI**：采用 Element Plus，界面美观流畅

## 📄 License

MIT License

## 👨‍💻 作者

校园活动管理系统 - 毕业设计项目

---

**重要提示**：
1. 请妥善保管 DeepSeek API Key，不要提交到 Git 仓库
2. 建议在 `.gitignore` 中添加 `.env` 文件
3. 生产环境使用环境变量而非 `.env` 文件
4. 详细的 AI 配置说明请查看 `AI接入说明.md`
