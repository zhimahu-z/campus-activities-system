@echo off
chcp 65001 >nul
echo ========================================
echo   智能校园活动管理系统 - 快速启动
echo ========================================
echo.

echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js 16+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 环境正常
echo.

echo [2/4] 检查依赖是否已安装...
if not exist "node_modules" (
    echo ⚠️  依赖未安装，开始安装...
    echo.
    echo 正在安装依赖，请稍候...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 依赖安装失败，尝试使用国内镜像...
        call npm install --registry=https://registry.npmmirror.com
        if %errorlevel% neq 0 (
            echo ❌ 安装失败，请检查网络连接
            pause
            exit /b 1
        )
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)
echo.

echo [3/4] 检查环境配置...
if not exist ".env" (
    echo ⚠️  未找到 .env 文件，创建默认配置...
    copy .env.example .env >nul 2>&1
    echo ✅ 已创建 .env 文件
    echo 💡 提示: 如需使用 AI 功能，请在 .env 文件中配置 DeepSeek API Key
) else (
    echo ✅ 环境配置已存在
)
echo.

echo [4/4] 启动开发服务器...
echo.
echo ========================================
echo   服务器启动中...
echo   访问地址: http://localhost:3000
echo ========================================
echo.
echo 演示账号:
echo   学生账号: student / 123456
echo   管理员账号: admin / 123456
echo.
echo 按 Ctrl+C 可停止服务器
echo ========================================
echo.

call npm run dev


