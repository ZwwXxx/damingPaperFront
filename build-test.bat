@echo off
echo.
echo ====================================
echo 构建测试环境前端项目
echo ====================================
echo.

REM 使用测试环境配置打包
call npm run build:test

echo.
echo ====================================
echo 构建完成！
echo 输出目录: dist/
echo 环境: 测试环境 (test)
echo 后端地址: http://test.paperback.zww0891.fun
echo ====================================
echo.

pause
