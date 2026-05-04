#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

PYTHON="$REPO_DIR/.venv/bin/python"

# 首次运行或 venv 丢失时自动初始化
if [ ! -f "$PYTHON" ]; then
    echo "未检测到虚拟环境，正在初始化..."
    bash "$REPO_DIR/init.sh"
    source "$HOME/.zshrc" 2>/dev/null || true
fi

echo "启动 志翔日程 → http://localhost:4096"
exec "$PYTHON" "$REPO_DIR/app.py"
