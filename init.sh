#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════╗"
echo "║      志翔日程  初始化              ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── 1. 检查 Python ───────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
    echo "✗ 未找到 python3，请先安装 Python 3.9+"
    exit 1
fi
PY_VER=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "→ Python $PY_VER"

# ── 2. 创建虚拟环境 ───────────────────────────────────────────────────────────
if [ ! -d "$REPO_DIR/.venv" ]; then
    echo "→ 创建虚拟环境..."
    python3 -m venv "$REPO_DIR/.venv"
else
    echo "→ 虚拟环境已存在，跳过"
fi

# ── 3. 安装依赖 ───────────────────────────────────────────────────────────────
echo "→ 安装 Python 依赖（首次较慢，请稍候）..."
"$REPO_DIR/.venv/bin/pip" install -q --upgrade pip
"$REPO_DIR/.venv/bin/pip" install -q -r "$REPO_DIR/requirement.txt"
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
