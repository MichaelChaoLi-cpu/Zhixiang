@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

set REPO_DIR=%~dp0
set VENV_DIR=%REPO_DIR%.venv
set PYTHON_EXE=%VENV_DIR%\Scripts\python.exe
set PIP_EXE=%VENV_DIR%\Scripts\pip.exe

echo.
echo ╔══════════════════════════════════╗
echo ║      志翔日程  初始化              ║
echo ╚══════════════════════════════════╝
echo.

REM ── 1. 检查 Python ────────────────────────────────────────────────────────────
set PYTHON_CMD=
for %%c in (python3.12 python3 python) do (
    if "!PYTHON_CMD!"=="" (
        where %%c >nul 2>&1
        if not errorlevel 1 (
            for /f "tokens=*" %%v in ('%%c -c "import sys; print(str(sys.version_info.major)+\".\"+str(sys.version_info.minor))" 2^>nul') do (
                set VER=%%v
                if "!VER:~0,3!"=="3.1" set PYTHON_CMD=%%c
                if "!VER:~0,3!"=="3.1" echo ^→ 找到 Python !VER! (%%c)
            )
        )
    )
)

if "!PYTHON_CMD!"=="" (
    echo ✗ 未找到 Python 3.10+
    echo   请从 https://www.python.org/downloads/ 安装 Python 3.12
    echo   安装时勾选 "Add Python to PATH"
    pause
    exit /b 1
)

REM ── 2. 创建虚拟环境 ───────────────────────────────────────────────────────────
if exist "%PYTHON_EXE%" (
    for /f "tokens=*" %%v in ('"%PYTHON_EXE%" -c "import sys; print(str(sys.version_info.major)+\".\"+str(sys.version_info.minor))" 2^>nul') do set VENV_VER=%%v
    echo ^→ 虚拟环境 .venv (Python !VENV_VER!) 已存在，跳过
) else (
    echo ^→ 创建虚拟环境 .venv ...
    !PYTHON_CMD! -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo ✗ 创建虚拟环境失败
        pause
        exit /b 1
    )
)

REM ── 3. 安装依赖 ───────────────────────────────────────────────────────────────
echo ^→ 安装 Python 依赖（首次较慢，请稍候）...
"%PIP_EXE%" install -q --upgrade pip
"%PIP_EXE%" install -q -r "%REPO_DIR%requirement.txt"
if errorlevel 1 (
    echo ✗ 依赖安装失败，请检查网络连接后重试
    pause
    exit /b 1
)
echo ^→ 依赖安装完成

REM ── 完成 ──────────────────────────────────────────────────────────────────────
echo.
echo ✓ 初始化完成！
echo.
echo   双击 start.bat 即可启动应用
echo   浏览器会自动打开 http://localhost:4096
echo.
pause
