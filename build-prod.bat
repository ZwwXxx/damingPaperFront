@echo off
echo.
echo ====================================
echo 构建生产环境前端项目
echo ====================================
echo.

REM 使用生产环境配置打包
call npm run build:prod

echo.
echo ====================================
echo 构建完成！
echo 输出目录: dist/
echo 环境: 生产环境 (production)
echo 后端地址: https://paperback.zww0891.fun
echo ====================================
echo.

pause
