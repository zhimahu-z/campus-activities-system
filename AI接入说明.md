# DeepSeek AI 接入说明

## ✅ 已完成的工作

本项目已完整接入 DeepSeek 大模型 API，实现真正的 AI 智能功能。

### 核心文件

1. **`src/services/deepseek.js`** - DeepSeek API 服务封装
   - 真实的 API 调用逻辑
   - 自动降级机制（API 不可用时使用本地算法）
   - 6 大 AI 功能完整实现

2. **`.env`** - API 配置文件
   ```env
   VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
   VITE_DEEPSEEK_API_URL=https://api.deepseek.com
   ```

## 🔑 快速配置

### 1. 获取 API Key
访问 https://platform.deepseek.com/ 注册并获取 API Key

### 2. 配置 API Key
编辑项目根目录的 `.env` 文件：
```env
VITE_DEEPSEEK_API_KEY=sk-你的真实API-Key
```

### 3. 重启服务
```bash
npm run dev
```

## 🤖 AI 功能列表

### 1. 智能搜索 (/search)
- 理解用户搜索意图
- 智能匹配相关活动
- 提供相关关键词和筛选建议

**测试方法**：
- 访问 `/search` 页面
- 输入："我想参加关于AI的讲座"
- 点击"AI搜索"
- 查看控制台日志确认 API 调用

### 2. 活动摘要 (活动详情页)
- 自动提取活动关键信息
- 生成简短摘要
- 提取关键词和亮点

### 3. 评论分析 (活动详情页)
- 情感分析（正面/中性/负面）
- 内容规范性检测
- 自动标签生成

### 4. 智能推荐 (首页)
- 基于用户行为推荐活动
- 分析收藏、报名、浏览历史
- 个性化推荐

### 5. 数据分析 (管理员后台)
- 平台运营数据分析
- 趋势洞察
- 优化建议

### 6. 标题生成 (管理员创建活动)
- 根据描述生成创意标题
- 提供多个选项

## 📊 API 调用流程

```javascript
// 1. 检查 API Key
if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'sk-your-api-key-here') {
  console.warn('⚠️ DeepSeek API Key未配置，使用本地智能匹配')
  return localIntelligentMatch()
}

// 2. 调用 DeepSeek API
console.log('🤖 正在调用DeepSeek API...')
const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ],
  temperature: 0.3,
  max_tokens: 2000
})

// 3. 解析结果
console.log('✅ DeepSeek API调用成功')
return response.data.choices[0].message.content

// 4. 失败降级
catch (error) {
  console.error('❌ DeepSeek API调用失败')
  console.log('🔄 切换到本地智能匹配')
  return localIntelligentMatch()
}
```

## 🔍 测试步骤

### 测试智能搜索

1. 启动项目：`npm run dev`
2. 登录系统（student / 123456）
3. 访问"智能搜索"页面
4. 输入："人工智能讲座"
5. 点击"AI搜索"
6. **打开浏览器控制台（F12）查看日志**：
   - ✅ `🤖 正在调用DeepSeek API...` → API 配置成功
   - ✅ `✅ DeepSeek API调用成功` → 调用成功
   - ⚠️ `⚠️ DeepSeek API Key未配置` → 需要配置 Key
   - ❌ `❌ DeepSeek API调用失败` → 检查 Key 或网络

## 💡 本地智能匹配（降级方案）

当 API 不可用时，系统自动使用本地算法：

### 智能搜索
- 关键词提取（人工智能、音乐、运动等）
- 分类映射（关键词 → 活动分类）
- 多维度匹配（标题、描述、标签）

### 情感分析
- 正面词汇：好、棒、赞、优秀、精彩
- 负面词汇：差、烂、失望、不好
- 不当内容：广告、脏话
- 评分计算：基于词汇统计

## 🚨 常见问题

### Q1: 如何确认 API 是否真正调用？
**A**: 打开浏览器控制台（F12），查看日志输出：
- 看到 `🤖 正在调用DeepSeek API...` 表示正在调用
- 看到 `✅ DeepSeek API调用成功` 表示调用成功
- 看到 `⚠️ 使用本地智能匹配` 表示未配置 API

### Q2: 配置后仍显示未配置？
**A**: 
1. 确认 `.env` 文件在项目根目录
2. 确认 API Key 格式正确（以 `sk-` 开头）
3. **重启开发服务器**（Ctrl+C 后重新 `npm run dev`）
4. 清除浏览器缓存

### Q3: API 调用失败怎么办？
**A**: 
- 检查 API Key 是否正确
- 检查网络连接
- 检查账户余额
- 系统会自动降级到本地算法，功能仍可用

### Q4: 如何查看 API 调用详情？
**A**: 在 `src/services/deepseek.js` 中已添加详细日志：
```javascript
console.log('🤖 正在调用DeepSeek API...')
console.log('✅ DeepSeek API调用成功')
console.log('✅ AI搜索结果:', result)
```

## 📝 代码示例

### 智能搜索调用

```javascript
// 在 Search.vue 中
const handleSearch = async () => {
  // 调用 AI Store
  const enhancement = await aiStore.enhanceSearch(searchQuery.value, allActivities)
  
  // AI Store 调用 DeepSeek Service
  // deepseekService.enhanceSearch() 会：
  // 1. 检查 API Key
  // 2. 调用 DeepSeek API
  // 3. 解析 JSON 结果
  // 4. 失败时降级到本地算法
  
  // 使用返回结果
  searchResults.value = allActivities.filter(activity =>
    enhancement.relevantIds.includes(activity.id.toString())
  )
}
```

## 🎯 核心优势

1. **真实 API 调用**：使用 axios 真正调用 DeepSeek API
2. **智能降级**：API 不可用时自动切换到本地算法
3. **详细日志**：每次调用都有清晰的控制台输出
4. **错误处理**：完善的异常捕获和处理机制
5. **用户友好**：无论 API 是否可用，功能都能正常使用

## 📚 相关文档

- DeepSeek 官网：https://platform.deepseek.com/
- API 文档：https://platform.deepseek.com/api-docs
- 定价说明：https://platform.deepseek.com/pricing

---

**重要提示**：
1. 请妥善保管 API Key，不要提交到 Git
2. 建议在 `.gitignore` 中添加 `.env`
3. 生产环境使用环境变量而非 `.env` 文件







