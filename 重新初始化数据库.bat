@echo off
chcp 65001 >nul
echo ========================================
echo 🔄 重新初始化数据库
echo ========================================
echo.
echo ⚠️  警告：此操作会删除所有现有数据！
echo.
pause
echo.

cd backend

echo 📝 步骤1：重新初始化数据库...
call npm run init-db
if %errorlevel% neq 0 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)

echo.
echo 📝 步骤2：创建10个学生账户...
call npm run create-students
if %errorlevel% neq 0 (
    echo ❌ 创建学生账户失败
    pause
    exit /b 1
)

echo.
echo 📝 步骤3：创建模拟报名数据...
call npm run create-registrations
if %errorlevel% neq 0 (
    echo ❌ 创建报名数据失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 数据库重新初始化完成！
echo ========================================
echo.
echo 📝 测试账号：
echo    管理员: admin / 123456
echo    学生: student1 ~ student11 / 123456
echo.
echo ========================================
pause




