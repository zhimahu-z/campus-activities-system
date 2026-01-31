# DeepSeek API 配置指南

## 问题说明

当前系统显示"API Key调用失败，使用本地算法"，原因是 `.env` 文件中的API Key还是占位符 `your-api-key-here`，不是真实的API Key。

## 解决方案

您有两个选择：

---

## 方案1：使用DeepSeek AI功能（推荐体验完整功能）

### 步骤1：获取DeepSeek API Key

1. **访问DeepSeek平台**
   - 网址：https://platform.deepseek.com/
   - 注册/登录账号

2. **创建API Key**
   - 登录后，点击左侧菜单 "API Keys"
   - 点击 "Create API Key" 按钮
   - 复制生成的API Key（格式：`sk-xxxxxxxxxxxxxxxxxxxxxx`）
   - ⚠️ 注意：API Key只显示一次，请妥善保存

3. **充值账户（如需要）**
   - DeepSeek API按使用量计费
   - 访问 https://platform.deepseek.com/top_up 充值
   - 建议先充值10-20元测试

### 步骤2：配置API Key

打开项目根目录的 `.env` 文件，修改以下内容：

```env
# 后端API地址
VITE_API_BASE_URL=http://localhost:3001/api

# DeepSeek API配置
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx  # 👈 替换为您的真实API Key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com
```

**重要提示**：
- 将 `your-api-key-here` 替换为您从DeepSeek平台复制的真实API Key
- API Key以 `sk-` 开头
- 不要在API Key前后添加引号或空格

### 步骤3：重启开发服务器

修改 `.env` 文件后，**必须重启前端服务器**才能生效：

```bash
# 1. 停止当前运行的前端服务器（Ctrl+C）

# 2. 重新启动
npm run dev
```

### 步骤4：验证配置

1. 刷新浏览器页面（Ctrl+Shift+R 强制刷新）
2. 进入"智能搜索"页面
3. 打开浏览器控制台（F12）
4. 输入关键词搜索

**成功的标志**：
```
🤖 正在调用DeepSeek API...
📝 API Key前缀: sk-xxxxxxx...
✅ DeepSeek API调用成功
✅ AI搜索结果: {...}
```

---

## 方案2：继续使用本地算法（无需配置）

如果您不想使用DeepSeek API，可以继续使用本地算法。本地算法功能完整，只是没有AI增强功能。

### 本地算法特性

✅ **支持的功能**：
- 关键词搜索（标题、描述、标签、分类）
- 多维度匹配
- 智能关键词提取
- 分类推荐

❌ **不支持的功能**：
- AI理解搜索意图
- 智能推荐相关关键词
- 语义搜索

### 如何使用本地算法

**无需任何配置**，系统会自动使用本地算法。当前就是这种模式。

---

## 常见问题

### Q1: 配置了API Key后还是显示"使用本地算法"？

**解决方法**：
1. 确认 `.env` 文件中的API Key是真实的（以 `sk-` 开头）
2. 确认已重启前端开发服务器
3. 确认已清除浏览器缓存并刷新
4. 检查控制台是否有具体错误信息

### Q2: 显示"401 Unauthorized"错误？

**原因**：API Key无效或已过期

**解决方法**：
1. 访问 https://platform.deepseek.com/api_keys
2. 检查API Key是否有效
3. 如果无效，创建新的API Key并替换

### Q3: 显示"402 Payment Required"错误？

**原因**：账户余额不足

**解决方法**：
1. 访问 https://platform.deepseek.com/top_up
2. 充值账户
3. 重新尝试搜索

### Q4: 显示"Network Error"或"timeout"？

**原因**：网络连接问题

**解决方法**：
1. 检查网络连接
2. 确认可以访问 https://api.deepseek.com
3. 如果在国内，可能需要特殊网络环境

### Q5: 不想使用DeepSeek API，如何禁用？

**方法1**：将API Key留空
```env
VITE_DEEPSEEK_API_KEY=
```

**方法2**：保持当前配置不变
```env
VITE_DEEPSEEK_API_KEY=your-api-key-here
```

系统会自动检测并使用本地算法。

---

## 功能对比

| 功能 | DeepSeek API | 本地算法 |
|------|-------------|---------|
| 关键词搜索 | ✅ | ✅ |
| 多维度匹配 | ✅ | ✅ |
| 语义理解 | ✅ | ❌ |
| 意图分析 | ✅ | ❌ |
| 智能推荐 | ✅ | ⚠️ 基础 |
| 相关关键词 | ✅ AI生成 | ⚠️ 预设 |
| 搜索增强 | ✅ | ❌ |
| 评论分析 | ✅ | ⚠️ 基础 |
| 数据分析 | ✅ | ⚠️ 基础 |
| 响应速度 | ⚠️ 较慢(1-3秒) | ✅ 极快 |
| 成本 | ⚠️ 按量计费 | ✅ 免费 |
| 网络要求 | ⚠️ 需要 | ✅ 无需 |

---

## 推荐配置

### 开发/测试环境
- 建议使用**本地算法**（当前配置）
- 速度快，无需网络，免费
- 功能已经足够完整

### 生产环境
- 建议配置**DeepSeek API**
- 提供更好的用户体验
- AI增强功能更智能

---

## 技术支持

如果遇到问题，请：

1. **查看浏览器控制台**（F12）
   - 查看具体错误信息
   - 截图保存

2. **检查配置文件**
   - 确认 `.env` 文件内容
   - 确认API Key格式

3. **测试API连接**
   - 访问 https://platform.deepseek.com/
   - 确认账户状态

---

## 总结

**当前状态**：系统使用本地算法，功能正常

**如果满意当前功能**：无需任何操作

**如果想体验AI功能**：
1. 获取DeepSeek API Key
2. 修改 `.env` 文件
3. 重启开发服务器
4. 刷新浏览器

---

**最后更新**: 2026-01-31




