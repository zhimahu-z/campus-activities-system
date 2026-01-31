# DeepSeek AI 配置说明

## 📋 概述

本项目已完整接入 DeepSeek 大模型 API，实现了真正的 AI 智能功能。当 API Key 配置后，系统会调用 DeepSeek API；未配置时会自动降级到本地智能匹配算法。

## 🔑 获取 API Key

### 步骤 1：注册 DeepSeek 账号
1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 点击右上角"注册"按钮
3. 使用邮箱或手机号完成注册

### 步骤 2：获取 API Key
1. 登录后进入控制台
2. 点击左侧菜单"API Keys"
3. 点击"创建新的 API Key"
4. 复制生成的 API Key（格式：`sk-xxxxxxxxxxxxxxxx`）

### 步骤 3：充值（可选）
- DeepSeek 提供免费额度供测试
- 如需更多调用次数，可在控制台充值
- 价格参考：约 ¥0.001/千tokens（非常便宜）

## ⚙️ 配置方法

### 方法 1：修改 .env 文件（推荐）

1. 打开项目根目录的 `.env` 文件
2. 将 `VITE_DEEPSEEK_API_KEY` 的值替换为你的 API Key：

```env
# DeepSeek API 配置
VITE_DEEPSEEK_API_KEY=sk-你的真实API-Key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com
```

3. 保存文件
4. 重启开发服务器：

```bash
npm run dev
```

### 方法 2：环境变量（生产环境）

在服务器上设置环境变量：

```bash
export VITE_DEEPSEEK_API_KEY=sk-你的真实API-Key
export VITE_DEEPSEEK_API_URL=https://api.deepseek.com
```

## 🤖 AI 功能说明

配置完成后，以下 6 大 AI 功能将真正调用 DeepSeek API：

### 1. 智能搜索（/search 页面）
- **功能**：理解用户搜索意图，智能匹配活动
- **示例**：
  - 输入"我想参加关于AI的讲座" → AI 理解意图，推荐学术讲座类活动
  - 输入"周末有什么文艺活动" → AI 筛选周末的文艺演出
  - 输入"适合运动爱好者" → AI 推荐体育竞技类活动

- **API 调用**：`deepseekService.enhanceSearch()`
- **返回结果**：
  ```json
  {
    "relevantIds": ["1", "2", "3"],
    "relatedKeywords": ["人工智能", "讲座", "技术"],
    "suggestedFilters": {
      "category": "学术讲座",
      "tags": ["AI", "技术"]
    }
  }
  ```

### 2. 活动摘要（活动详情页）
- **功能**：自动提取活动描述的关键信息
- **API 调用**：`deepseekService.extractSummary()`
- **返回结果**：
  ```json
  {
    "summary": "本次讲座将深入探讨人工智能的最新发展...",
    "keywords": ["人工智能", "深度学习", "应用"],
    "highlights": ["知名教授主讲", "前沿技术分享", "互动答疑"]
  }
  ```

### 3. 评论分析（活动详情页）
- **功能**：分析评论情感倾向和内容规范性
- **API 调用**：`deepseekService.analyzeComment()`
- **返回结果**：
  ```json
  {
    "sentiment": "positive",
    "sentimentScore": 85,
    "isAppropriate": true,
    "suggestions": "",
    "tags": ["积极", "正面"]
  }
  ```

### 4. 智能推荐（首页）
- **功能**：基于用户行为推荐个性化活动
- **API 调用**：`deepseekService.recommendActivities()`
- **分析维度**：
  - 用户收藏历史
  - 用户报名记录
  - 浏览行为
  - 活动分类偏好

### 5. 数据分析（管理员后台）
- **功能**：分析平台运营数据，提供洞察和建议
- **API 调用**：`deepseekService.analyzeData()`
- **返回结果**：
  ```json
  {
    "insights": ["活动参与度较高", "用户活跃度良好"],
    "trends": ["参与人数呈上升趋势", "周末活动更受欢迎"],
    "recommendations": ["增加热门分类活动", "优化活动时间"],
    "summary": "平台整体运营良好，建议继续优化活动质量"
  }
  ```

### 6. 标题生成（管理员创建活动）
- **功能**：根据活动描述生成创意标题
- **API 调用**：`deepseekService.generateTitleSuggestions()`
- **返回结果**：5个创意标题建议

## 🔍 测试 AI 功能

### 测试智能搜索

1. 启动项目：`npm run dev`
2. 登录系统（学生账号：student / 123456）
3. 点击顶部导航"智能搜索"
4. 输入测试关键词：
   - "人工智能讲座"
   - "周末音乐会"
   - "适合运动爱好者的活动"
5. 点击"AI搜索"按钮
6. 查看控制台输出：
   - ✅ 看到 `🤖 正在调用DeepSeek API...` → API 配置成功
   - ⚠️ 看到 `DeepSeek API Key未配置` → 需要配置 API Key
   - ❌ 看到 `DeepSeek API调用失败` → 检查 API Key 是否正确

### 测试评论分析

1. 进入任意活动详情页
2. 在评论区输入评论：
   - 正面评论："这个活动太棒了，学到很多！"
   - 负面评论："活动组织不好，很失望"
   - 不当评论："这是垃圾广告"
3. 点击发表评论
4. AI 会自动分析情感并显示标签

### 测试数据分析

1. 使用管理员账号登录（admin / 123456）
2. 进入管理员后台
3. 点击"AI数据分析"按钮
4. 查看 AI 生成的分析报告

## 📊 API 调用监控

### 查看调用日志

打开浏览器控制台（F12），查看以下日志：

```
🤖 正在调用DeepSeek API...
✅ DeepSeek API调用成功
✅ AI搜索结果: { relevantIds: [...], relatedKeywords: [...] }
```

### 调用失败处理

如果看到错误日志：

```
❌ DeepSeek API调用失败: { error: "..." }
🔄 切换到本地智能匹配
```

**可能原因**：
1. API Key 未配置或错误
2. API Key 额度不足
3. 网络连接问题
4. API 服务暂时不可用

**解决方案**：
- 系统会自动降级到本地智能匹配算法
- 功能仍然可用，但智能程度会降低
- 检查并修复 API Key 配置后重启服务

## 💡 本地智能匹配算法

当 DeepSeek API 不可用时，系统使用本地算法：

### 智能搜索算法
- 关键词提取：识别常见词汇（AI、音乐、运动等）
- 分类猜测：根据关键词映射到活动分类
- 模糊匹配：标题、描述、标签多维度匹配

### 情感分析算法
- 正面词汇库：好、棒、赞、优秀、精彩等
- 负面词汇库：差、烂、失望、不好等
- 不当内容检测：广告、脏话等
- 情感评分：基于词汇统计计算分数

### 推荐算法
- 基于用户历史行为
- 相似分类和标签匹配
- 热门活动推荐

## 🚀 性能优化

### API 调用优化
- 超时设置：60秒
- 错误重试：自动降级
- 结果缓存：避免重复调用

### 成本控制
- 使用较低的 temperature（0.3-0.5）提高准确性
- 限制 max_tokens（2000）控制成本
- 合理使用缓存减少调用次数

## 📝 API 调用示例

### 完整的搜索流程

```javascript
// 1. 用户输入搜索关键词
const query = "人工智能讲座"

// 2. 调用 AI 增强搜索
const enhancement = await aiStore.enhanceSearch(query, activities)

// 3. DeepSeek API 调用
POST https://api.deepseek.com/v1/chat/completions
Headers: {
  "Authorization": "Bearer sk-your-api-key",
  "Content-Type": "application/json"
}
Body: {
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个智能搜索助手..."
    },
    {
      "role": "user",
      "content": "用户搜索：人工智能讲座\n活动列表：[...]"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 2000
}

// 4. 解析 AI 返回结果
const result = {
  relevantIds: ["1", "2", "3"],
  relatedKeywords: ["人工智能", "AI", "讲座", "技术"],
  suggestedFilters: {
    category: "学术讲座",
    tags: ["AI", "技术"]
  }
}

// 5. 展示搜索结果
```

## 🔧 故障排查

### 问题 1：API Key 配置后仍显示未配置

**解决方案**：
1. 确认 `.env` 文件在项目根目录
2. 确认 API Key 格式正确（以 `sk-` 开头）
3. 重启开发服务器（Ctrl+C 后重新 `npm run dev`）
4. 清除浏览器缓存并刷新页面

### 问题 2：API 调用返回 401 错误

**原因**：API Key 无效或已过期

**解决方案**：
1. 登录 DeepSeek 控制台
2. 检查 API Key 是否有效
3. 重新生成新的 API Key
4. 更新 `.env` 文件

### 问题 3：API 调用返回 429 错误

**原因**：请求频率超限或额度不足

**解决方案**：
1. 检查账户余额
2. 等待一段时间后重试
3. 考虑升级套餐

### 问题 4：搜索结果不准确

**原因**：Prompt 需要优化

**解决方案**：
1. 修改 `src/services/deepseek.js` 中的 systemPrompt
2. 调整 temperature 参数（0.1-0.9）
3. 提供更多上下文信息

## 📚 相关文档

- [DeepSeek 官方文档](https://platform.deepseek.com/docs)
- [API 参考](https://platform.deepseek.com/api-docs)
- [定价说明](https://platform.deepseek.com/pricing)

## 💬 技术支持

如有问题，请：
1. 查看浏览器控制台日志
2. 检查 `.env` 配置
3. 参考本文档故障排查部分
4. 联系 DeepSeek 技术支持

---

**注意**：请妥善保管你的 API Key，不要提交到 Git 仓库或公开分享！







