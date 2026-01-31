# 安装和运行指南

## 问题修复说明

本项目已修复以下常见问题：

### 1. Vite 配置问题
- ✅ 修复了 `__dirname` 在 ES 模块中的使用问题
- ✅ 使用 `fileURLToPath` 和 `import.meta.url` 正确处理路径

### 2. Element Plus 导入问题
- ✅ 修复了中文语言包导入路径
- ✅ 使用正确的导入路径：`element-plus/es/locale/lang/zh-cn`

### 3. 项目配置
- ✅ 添加了 `jsconfig.json` 支持路径别名
- ✅ 配置了正确的环境变量示例

## 安装步骤

### 1. 安装 Node.js
确保已安装 Node.js 16+ 版本：
```bash
node --version
```

### 2. 克隆或下载项目
```bash
cd d-campus-activities
```

### 3. 安装依赖
```bash
npm install
```

如果安装速度慢，可以使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### 4. 配置环境变量（可选）
如果要使用 AI 功能，需要配置 DeepSeek API Key：

创建 `.env` 文件（或复制 `.env.example`）：
```env
VITE_DEEPSEEK_API_KEY=your_api_key_here
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

> 注意：如果不配置 API Key，AI 功能会使用降级方案，不影响其他功能使用。

### 5. 启动开发服务器
```bash
npm run dev
```

成功启动后，浏览器会自动打开 `http://localhost:3000`

## 常见错误解决

### 错误 1: `Cannot find module 'xxx'`
**解决方案**：
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 重新安装
npm install
```

### 错误 2: `__dirname is not defined`
**解决方案**：已在 `vite.config.js` 中修复，使用：
```javascript
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

### 错误 3: Element Plus 样式不显示
**解决方案**：确保在 `main.js` 中导入了样式：
```javascript
import 'element-plus/dist/index.css'
```

### 错误 4: 路由 404 错误
**解决方案**：
1. 检查路由配置是否正确
2. 确保所有页面组件都已创建
3. 使用 `createWebHistory()` 而不是 `createWebHashHistory()`

### 错误 5: Axios 请求失败
**解决方案**：
- 本项目使用模拟数据，不需要后端服务器
- AI 功能需要配置 DeepSeek API Key
- 如果 API 调用失败，会自动降级到本地逻辑

## 项目结构检查

确保以下文件都存在：

```
✅ package.json
✅ vite.config.js
✅ jsconfig.json
✅ index.html
✅ src/main.js
✅ src/App.vue
✅ src/router/index.js
✅ src/stores/user.js
✅ src/stores/activity.js
✅ src/stores/ai.js
✅ src/services/deepseek.js
✅ src/utils/request.js
✅ src/styles/main.css
✅ src/views/Login.vue
✅ src/views/Register.vue
✅ src/views/student/Home.vue
✅ src/views/admin/Dashboard.vue
```

## 功能测试

### 1. 测试登录功能
- 访问 `http://localhost:3000/login`
- 使用演示账号登录：
  - 学生：`student` / `123456`
  - 管理员：`admin` / `123456`

### 2. 测试学生端功能
- 浏览活动列表
- 查看活动详情
- 收藏和报名活动
- 使用智能搜索

### 3. 测试管理员功能
- 访问管理后台
- 查看数据概览
- 创建/编辑活动
- 使用 AI 数据分析

### 4. 测试 AI 功能
需要配置 DeepSeek API Key：
- AI 智能推荐
- 智能搜索增强
- 评论情感分析
- 活动摘要提取
- 数据智能分析

## 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

构建产物在 `dist` 目录中。

## 部署建议

### 静态托管
可以部署到：
- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 开发建议

### 1. 使用 VS Code
推荐安装以下插件：
- Volar (Vue 3 支持)
- ESLint
- Prettier

### 2. 开发工具
- Vue DevTools (浏览器插件)
- 使用 `console.log` 调试
- 使用 Vue DevTools 查看状态

### 3. 代码规范
- 使用 `<script setup>` 语法
- 组件名使用 PascalCase
- 使用 Composition API

## 技术支持

如果遇到问题：
1. 查看本文档的常见错误解决方案
2. 检查浏览器控制台的错误信息
3. 查看 README.md 了解更多信息
4. 提交 Issue 到项目仓库

## 更新日志

### v1.0.0 (2026-01-24)
- ✅ 完成基础架构搭建
- ✅ 实现学生端所有功能
- ✅ 实现管理员端所有功能
- ✅ 集成 DeepSeek AI 功能
- ✅ 修复所有已知问题
- ✅ 完善项目文档

---

祝你使用愉快！🎉


