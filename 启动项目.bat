@echo off
chcp 65001 >nul
echo ========================================
echo   🎓 智能校园活动管理系统
echo ========================================
echo.

echo [1/3] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo ✅ Node.js 环境正常

echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo ⚠️  未检测到依赖，正在安装...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

echo.
echo [3/3] 检查 DeepSeek API 配置...
findstr /C:"sk-your-api-key-here" .env >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  DeepSeek API Key 未配置
    echo.
    echo 📝 配置步骤：
    echo    1. 访问 https://platform.deepseek.com/
    echo    2. 注册并获取 API Key
    echo    3. 编辑 .env 文件，替换 sk-your-api-key-here
    echo.
    echo 💡 不配置也可以使用，系统会自动使用本地智能算法
    echo.
) else (
    echo ✅ DeepSeek API Key 已配置
)

echo.
echo ========================================
echo   🚀 启动开发服务器
echo ========================================
echo.
echo 📌 访问地址: http://localhost:5173
echo 📌 测试账号: student / 123456
echo 📌 管理员账号: admin / 123456
echo.
echo 💡 提示：
echo    - 按 Ctrl+C 停止服务器
echo    - 打开浏览器控制台(F12)查看 AI 调用日志
echo    - 查看 AI测试指南.md 了解测试方法
echo.
echo ========================================
echo.

call npm run dev







