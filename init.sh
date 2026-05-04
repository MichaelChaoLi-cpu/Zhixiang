#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$REPO_DIR/.venv"

echo ""
echo "╔══════════════════════════════════╗"
echo "║      志翔日程  初始化              ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── 1. 检查 Python ───────────────────────────────────────────────────────────
if command -v python3.12 &>/dev/null; then
    PYTHON_BIN="python3.12"
elif command -v python3 &>/dev/null; then
    PYTHON_BIN="python3"
else
    echo "✗ 未找到 python3，请先安装 Python 3.12"
    echo "  https://www.python.org/downloads/"
    exit 1
fi
PY_VER=$("$PYTHON_BIN" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "→ Python $PY_VER（推荐 3.12）"

# ── 2. 创建虚拟环境（仅当 Zhixiang venv 存在且为 3.12 时跳过）──────────────────
NEED_VENV=true
if [ -f "$VENV_DIR/bin/python" ]; then
    VENV_VER=$("$VENV_DIR/bin/python" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "")
    if [ "$VENV_VER" = "3.12" ]; then
        echo "→ 虚拟环境 .venv（Python 3.12）已存在，跳过"
        NEED_VENV=false
    else
        echo "→ 虚拟环境 .venv 存在但 Python 版本为 $VENV_VER，重新创建..."
        rm -rf "$VENV_DIR"
    fi
fi

if [ "$NEED_VENV" = true ]; then
    if [ "$PY_VER" != "3.12" ]; then
        echo "✗ 当前 Python 版本为 $PY_VER，需要 3.12 才能创建虚拟环境"
        echo "  请先安装 Python 3.12：https://www.python.org/downloads/"
        exit 1
    fi
    echo "→ 创建虚拟环境 .venv（Python 3.12）..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# ── 3. 安装依赖 ───────────────────────────────────────────────────────────────
echo "→ 安装 Python 依赖（首次较慢，请稍候）..."
"$VENV_DIR/bin/pip" install -q --upgrade pip
"$VENV_DIR/bin/pip" install -q -r "$REPO_DIR/requirement.txt"
echo "→ 依赖安装完成"

# ── 4. 确保 start.sh 可执行 ───────────────────────────────────────────────────
chmod +x "$REPO_DIR/start.sh"

# ── 5. 写入 alias 到 ~/.zshrc ─────────────────────────────────────────────────
ALIAS_CMD="alias Zhixiang='$REPO_DIR/start.sh'"
ZSHRC="$HOME/.zshrc"

if grep -q "alias Zhixiang=" "$ZSHRC" 2>/dev/null; then
    # 更新已有 alias（兼容 macOS sed）
    sed -i '' "s|alias Zhixiang=.*|$ALIAS_CMD|" "$ZSHRC"
    echo "→ 已更新 ~/.zshrc 中的 Zhixiang alias"
else
    {
        echo ""
        echo "# 志翔日程 - https://github.com/MichaelChaoLi-cpu/Zhixiang"
        echo "$ALIAS_CMD"
    } >> "$ZSHRC"
    echo "→ 已添加 Zhixiang alias 到 ~/.zshrc"
fi

# ── 完成 ──────────────────────────────────────────────────────────────────────
echo ""
echo "✓ 初始化完成！"
echo ""
echo "  执行以下命令使 alias 立即生效："
echo ""
echo "    source ~/.zshrc"
echo ""
echo "  之后在任意终端输入："
echo ""
echo "    Zhixiang"
echo ""
echo "  即可启动应用，浏览器会自动打开 http://localhost:4096"
echo ""
