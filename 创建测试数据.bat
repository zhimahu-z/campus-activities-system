@echo off
echo ========================================
echo 批量创建学生账户和模拟数据
echo ========================================
echo.

cd backend

echo [1/2] 创建10个学生账户...
echo.
call npm run create-students

echo.
echo [2/2] 为学生随机报名活动...
echo.
call npm run create-registrations

echo.
echo ========================================
echo 完成！
echo ========================================
echo.
echo 现在可以：
echo 1. 刷新管理后台查看新增的学生
echo 2. 查看活动报名统计
echo 3. 使用任意学生账号登录测试
echo.
echo 所有学生账号密码统一为：123456
echo.
pause




