# 🧪 AI 功能测试指南

## 快速测试步骤

### 第一步：启动项目

```bash
npm run dev
```

访问：http://localhost:5173

### 第二步：打开浏览器控制台

按 `F12` 打开开发者工具，切换到 `Console` 标签

### 第三步：测试智能搜索

1. 登录系统（student / 123456）
2. 点击顶部导航"智能搜索"
3. 输入测试关键词：**"人工智能讲座"**
4. 点击"AI搜索"按钮
5. **查看控制台输出**

## 🔍 控制台日志说明

### ✅ API 配置成功（真实调用）

```
🤖 正在调用DeepSeek API...
✅ DeepSeek API调用成功
✅ AI搜索结果: {
  relevantIds: ["1", "2"],
  relatedKeywords: ["人工智能", "AI", "讲座", "技术"],
  suggestedFilters: { category: "学术讲座" }
}
```

**说明**：DeepSeek API 真实调用成功！

---

### ⚠️ API 未配置（本地算法）

```
⚠️ DeepSeek API Key未配置，使用本地智能匹配
💡 使用本地智能匹配算法
```

**说明**：未配置 API Key，使用本地智能算法（功能仍可用）

**解决方案**：
1. 访问 https://platform.deepseek.com/ 获取 API Key
2. 编辑 `.env` 文件：`VITE_DEEPSEEK_API_KEY=sk-你的Key`
3. 重启服务：`npm run dev`

---

### ❌ API 调用失败（自动降级）

```
🤖 正在调用DeepSeek API...
❌ DeepSeek API调用失败: { error: "..." }
🔄 切换到本地智能匹配
💡 使用本地智能匹配算法
```

**说明**：API 调用失败，自动降级到本地算法

**可能原因**：
- API Key 错误或过期
- 网络连接问题
- API 服务暂时不可用
- 账户余额不足

## 📝 测试用例

### 测试 1：智能搜索

**输入**：`人工智能讲座`

**预期结果**：
- 推荐"学术讲座"分类的活动
- 相关关键词：人工智能、AI、讲座、技术
- 找到相关活动并展示

---

### 测试 2：自然语言搜索

**输入**：`我想参加周末的音乐活动`

**预期结果**：
- AI 理解"周末"和"音乐"意图
- 推荐"文艺演出"分类
- 相关关键词：音乐、周末、演出

---

### 测试 3：评论分析

1. 进入任意活动详情页
2. 发表评论：`这个活动太棒了，学到很多！`
3. 查看控制台

**预期日志**：
```
🤖 正在调用DeepSeek API...
✅ DeepSeek API调用成功
✅ AI评论分析结果: {
  sentiment: "positive",
  sentimentScore: 85,
  isAppropriate: true,
  tags: ["积极", "正面"]
}
```

---

### 测试 4：负面评论检测

**输入评论**：`活动组织很差，很失望`

**预期结果**：
- sentiment: "negative"
- sentimentScore: 30
- tags: ["消极", "负面"]

---

### 测试 5：不当内容检测

**输入评论**：`这是垃圾广告`

**预期结果**：
- isAppropriate: false
- suggestions: "评论包含不当内容，请修改后再发表"

---

### 测试 6：管理员数据分析

1. 使用管理员账号登录（admin / 123456）
2. 进入管理员后台
3. 点击"AI数据分析"按钮
4. 查看控制台

**预期日志**：
```
🤖 正在调用DeepSeek API...
✅ DeepSeek API调用成功
✅ AI数据分析结果: {
  insights: ["活动参与度较高", "用户活跃度良好"],
  trends: ["参与人数呈上升趋势"],
  recommendations: ["增加热门分类活动", "优化活动时间"],
  summary: "平台整体运营良好..."
}
```

## 🎯 验证清单

- [ ] 控制台看到 `🤖 正在调用DeepSeek API...`
- [ ] 控制台看到 `✅ DeepSeek API调用成功`
- [ ] 搜索结果正确展示
- [ ] 相关关键词正确显示
- [ ] 评论分析标签正确
- [ ] 管理员数据分析报告生成

## 🔧 调试技巧

### 1. 查看完整的 API 请求

在 `src/services/deepseek.js` 中添加：

```javascript
console.log('📤 API 请求:', {
  url: DEEPSEEK_API_URL + '/v1/chat/completions',
  headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY.substring(0, 10)}...` },
  body: { model: 'deepseek-chat', messages }
})
```

### 2. 查看完整的 API 响应

```javascript
console.log('📥 API 响应:', response.data)
```

### 3. 查看错误详情

```javascript
console.error('❌ 错误详情:', error.response?.data || error.message)
```

## 📊 性能监控

### API 调用时间

在控制台查看每次 API 调用的耗时：

```
🤖 正在调用DeepSeek API...
⏱️ API 调用耗时: 1.2s
✅ DeepSeek API调用成功
```

### 降级统计

统计 API 调用成功率：

```
📊 API 统计:
- 总调用次数: 10
- 成功次数: 8
- 失败次数: 2
- 成功率: 80%
```

## 🚀 高级测试

### 并发测试

快速连续搜索多次，测试 API 并发处理能力：

1. 搜索"人工智能"
2. 立即搜索"音乐会"
3. 立即搜索"马拉松"

查看控制台是否正确处理所有请求。

### 边界测试

测试特殊输入：

- 空字符串
- 超长文本（1000+ 字符）
- 特殊字符（emoji、符号）
- 多语言（英文、日文）

### 压力测试

连续调用 API 20 次，测试：
- 是否有请求失败
- 响应时间是否稳定
- 是否触发限流

## 📝 测试报告模板

```
# AI 功能测试报告

## 测试环境
- 浏览器：Chrome 120
- Node 版本：v18.17.0
- API Key：已配置 ✅

## 测试结果

### 1. 智能搜索
- 状态：✅ 通过
- API 调用：成功
- 响应时间：1.2s
- 结果准确性：高

### 2. 评论分析
- 状态：✅ 通过
- 正面评论识别：准确
- 负面评论识别：准确
- 不当内容检测：准确

### 3. 数据分析
- 状态：✅ 通过
- 洞察生成：合理
- 建议实用性：高

## 问题记录
无

## 总结
所有 AI 功能正常工作，DeepSeek API 调用成功。
```

## 🎓 常见问题

### Q: 如何确认是真实 API 调用而不是模拟？

**A**: 查看控制台日志：
- 真实调用：`🤖 正在调用DeepSeek API...` → `✅ DeepSeek API调用成功`
- 本地算法：`💡 使用本地智能匹配算法`

### Q: API 调用很慢怎么办？

**A**: 
1. 检查网络连接
2. DeepSeek API 响应时间通常 1-3 秒
3. 可以调整 timeout 参数（默认 60 秒）

### Q: 如何查看 API 消费情况？

**A**: 登录 DeepSeek 控制台查看：
- 调用次数统计
- Token 消耗量
- 账户余额

---

**提示**：测试时请保持控制台打开，所有 AI 调用都有详细日志输出！







