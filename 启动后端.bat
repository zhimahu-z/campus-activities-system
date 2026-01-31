@echo off
echo ========================================
echo 校园活动管理系统 - 后端启动脚本
echo ========================================
echo.

cd backend

echo [1/3] 检查依赖...
if not exist "node_modules" (
    echo 未找到依赖，开始安装...
    call npm install
) else (
    echo 依赖已安装
)

echo.
echo [2/3] 检查环境配置...
if not exist ".env" (
    echo 未找到.env文件，从.env.example复制...
    copy .env.example .env
    echo.
    echo ⚠️  请编辑 backend\.env 文件，配置数据库信息！
    echo.
    pause
)

echo.
echo [3/3] 启动后端服务...
echo.
echo 后端服务将在 http://localhost:3000 启动
echo 按 Ctrl+C 停止服务
echo.
call npm run dev

pause




