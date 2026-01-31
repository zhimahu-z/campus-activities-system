# localStorage使用情况分析和清理计划

## 📊 当前localStorage使用情况

### 1. 必须保留的localStorage使用（用于认证）

#### `src/utils/request.js`
- ✅ **保留**：`localStorage.getItem('token')` - 用于请求拦截器添加Authorization头
- ✅ **保留**：`localStorage.removeItem('token')` - 401错误时清除token
- ✅ **保留**：`localStorage.removeItem('userInfo')` - 401错误时清除用户信息

#### `src/stores/user.js`
- ✅ **保留**：`localStorage.getItem('token')` - 初始化时读取token
- ✅ **保留**：`localStorage.setItem('token', ...)` - 登录时保存token
- ✅ **保留**：`localStorage.setItem('userInfo', ...)` - 登录时保存用户信息
- ✅ **保留**：`localStorage.getItem('userInfo')` - 加载用户信息
- ✅ **保留**：`localStorage.removeItem('token')` - 登出时清除
- ✅ **保留**：`localStorage.removeItem('userInfo')` - 登出时清除

---

### 2. 需要改为后端API的localStorage使用

#### `src/stores/user.js` - 用户行为数据

❌ **需要删除或改为API**：
```javascript
// 收藏功能
localStorage.setItem(`favorites_${userId}`, ...)
localStorage.getItem(`favorites_${userId}`)

// 报名功能
localStorage.setItem(`registrations_${userId}`, ...)
localStorage.getItem(`registrations_${userId}`)

// 浏览历史
localStorage.setItem(`browseHistory_${userId}`, ...)
localStorage.getItem(`browseHistory_${userId}`)
```

**问题**：
1. 收藏、报名、浏览历史都应该存储在后端数据库
2. 当前使用localStorage会导致：
   - 数据不同步（换设备/浏览器就丢失）
   - 无法在管理后台查看用户行为
   - 报名数据与后端不一致

**解决方案**：
- 收藏功能 → 调用 `favoriteAPI.add()` / `favoriteAPI.remove()`
- 报名功能 → 调用 `registrationAPI.register()` / `registrationAPI.cancel()`
- 浏览历史 → 暂时保留localStorage（非关键功能）

---

## 🗑️ 需要删除的文件

### 文档文件（.md）- 临时文档，可以删除
1. ❌ `最终修复完成报告.md` - 临时修复报告
2. ❌ `问题修复完成报告.md` - 临时修复报告
3. ❌ `活动数据更新说明.md` - 临时说明
4. ❌ `前后端数据统一修复报告.md` - 临时报告
5. ❌ `前后端分离改造对比.md` - 临时对比文档
6. ❌ `永久解决端口冲突.md` - 临时说明
7. ❌ `后端启动完整指南.md` - 临时指南
8. ❌ `backend/端口冲突解决方案.md` - 临时说明
9. ❌ `backend/环境变量配置说明.md` - 临时说明

### 批处理文件（.bat）- 临时脚本，可以删除
1. ❌ `清理前端缓存.bat` - 临时脚本
2. ❌ `完整测试.bat` - 临时脚本
3. ❌ `测试登录.bat` - 临时脚本
4. ❌ `检查后端状态.bat` - 临时脚本
5. ❌ `修改端口配置.bat` - 临时脚本
6. ❌ `初始化数据库.bat` - 临时脚本（功能重复）

### 保留的批处理文件
1. ✅ **保留**：`启动项目.bat` - 主启动脚本
2. ✅ **保留**：`启动后端.bat` - 后端启动脚本
3. ✅ **保留**：`重新初始化数据库.bat` - 数据库初始化脚本
4. ✅ **保留**：`创建测试数据.bat` - 测试数据生成脚本
5. ✅ **保留**：`start.bat` - 快速启动脚本

---

## 🔧 修复计划

### 步骤1：修改用户报名和收藏功能，改为调用后端API

**修改文件**：`src/stores/user.js`

**修改内容**：
1. `registerActivity()` - 改为调用 `registrationAPI.register()`
2. `unregisterActivity()` - 改为调用 `registrationAPI.cancel()`
3. `toggleFavorite()` - 改为调用 `favoriteAPI.add()` / `favoriteAPI.remove()`
4. `isRegistered()` - 改为从后端API获取
5. `isFavorite()` - 改为从后端API获取

### 步骤2：删除无用的localStorage相关代码

**删除**：
- `getUserRegistrations()` - 不再需要
- `getAllRegistrationsStats()` - 不再需要
- 所有 `localStorage.setItem/getItem` 关于 favorites/registrations 的代码

### 步骤3：删除临时文档和脚本

---

## 📝 总结

### localStorage使用情况
- **必须保留**：token、userInfo（用于认证）
- **可以保留**：browseHistory（非关键功能，暂时保留）
- **必须删除**：favorites、registrations（改为后端API）

### 文件清理
- **删除**：9个临时.md文档
- **删除**：6个临时.bat脚本
- **保留**：5个核心.bat脚本

---

**下一步**：执行修复和清理




