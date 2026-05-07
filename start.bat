@echo off
setlocal
chcp 65001 >nul 2>&1

set REPO_DIR=%~dp0
set PYTHON_EXE=%REPO_DIR%.venv\Scripts\python.exe

REM 首次运行或 venv 丢失时自动初始化
if not exist "%PYTHON_EXE%" (
    echo 未检测到虚拟环境，正在初始化...
    call "%REPO_DIR%init.bat"
    if errorlevel 1 exit /b 1
)

echo 启动 志翔日程 ^→ http://localhost:4096
"%PYTHON_EXE%" "%REPO_DIR%app.py"
