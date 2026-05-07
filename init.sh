#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$REPO_DIR/.venv"
OS_TYPE="$(uname -s)"   # Darwin | Linux

echo ""
echo "╔══════════════════════════════════╗"
echo "║      志翔日程  初始化              ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── 1. 确保 Python 3.12 可用 ──────────────────────────────────────────────────
_ensure_python312() {
    # 先检查常见名称
    for cmd in python3.12 python3 python; do
        if command -v "$cmd" &>/dev/null; then
            ver=$("$cmd" -c "import sys; print(str(sys.version_info.major)+'.'+str(sys.version_info.minor))" 2>/dev/null || echo "")
            if [ "$ver" = "3.12" ] || [ "$ver" = "3.13" ] || [ "$ver" = "3.11" ]; then
                echo "$cmd"
                return
            fi
        fi
    done

    echo "→ 未找到 Python 3.12+，尝试自动安装..." >&2

    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS: 用 Homebrew
        if ! command -v brew &>/dev/null; then
            echo "→ 未检测到 Homebrew，正在安装..." >&2
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            if [ -f /opt/homebrew/bin/brew ]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            fi
        fi
        if ! command -v brew &>/dev/null; then
            echo "✗ Homebrew 安装失败，请手动安装 Python 3.12: https://www.python.org/downloads/" >&2
            exit 1
        fi
        echo "→ 通过 Homebrew 安装 python@3.12..." >&2
        brew install python@3.12
        for candidate in \
            "$(brew --prefix python@3.12 2>/dev/null)/bin/python3.12" \
            /opt/homebrew/bin/python3.12 \
            /usr/local/bin/python3.12; do
            if [ -x "$candidate" ]; then echo "$candidate"; return; fi
        done

    elif [ "$OS_TYPE" = "Linux" ]; then
        # Linux: 尝试常见包管理器
        if command -v apt-get &>/dev/null; then
            echo "→ 通过 apt 安装 python3.12..." >&2
            sudo apt-get update -qq && sudo apt-get install -y python3.12 python3.12-venv python3-pip
        elif command -v dnf &>/dev/null; then
            echo "→ 通过 dnf 安装 python3.12..." >&2
            sudo dnf install -y python3.12
        elif command -v pacman &>/dev/null; then
            echo "→ 通过 pacman 安装 python..." >&2
            sudo pacman -Sy --noconfirm python
        else
            echo "✗ 未识别的包管理器，请手动安装 Python 3.12: https://www.python.org/downloads/" >&2
            exit 1
        fi
        # 安装后重新搜索
        for cmd in python3.12 python3 python; do
            if command -v "$cmd" &>/dev/null; then
                ver=$("$cmd" -c "import sys; print(str(sys.version_info.major)+'.'+str(sys.version_info.minor))" 2>/dev/null || echo "")
                if [[ "$ver" == 3.1* ]]; then echo "$cmd"; return; fi
            fi
        done
    fi

    echo "✗ Python 3.12 安装后仍无法找到，请手动安装后重试" >&2
    exit 1
}

PYTHON_BIN=$(_ensure_python312)
PY_VER=$("$PYTHON_BIN" -c "import sys; print(str(sys.version_info.major)+'.'+str(sys.version_info.minor))")
echo "→ Python $PY_VER  ($PYTHON_BIN)"

# ── 2. 创建虚拟环境 ────────────────────────────────────────────────────────────
NEED_VENV=true
if [ -f "$VENV_DIR/bin/python" ]; then
    VENV_VER=$("$VENV_DIR/bin/python" -c "import sys; print(str(sys.version_info.major)+'.'+str(sys.version_info.minor))" 2>/dev/null || echo "")
    if [[ "$VENV_VER" == 3.1* ]]; then
        echo "→ 虚拟环境 .venv (Python $VENV_VER) 已存在，跳过"
        NEED_VENV=false
    else
        echo "→ 虚拟环境版本 $VENV_VER，重新创建..."
        rm -rf "$VENV_DIR"
    fi
fi

if [ "$NEED_VENV" = true ]; then
    echo "→ 创建虚拟环境 .venv ..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# 确保 pip 可用（Ubuntu 上 python3.12-venv 可能不含 ensurepip）
if [ ! -f "$VENV_DIR/bin/pip" ]; then
    echo "→ pip 不存在，尝试通过 ensurepip 安装..."
    "$VENV_DIR/bin/python" -m ensurepip --upgrade 2>/dev/null || true
fi
if [ ! -f "$VENV_DIR/bin/pip" ]; then
    echo "→ ensurepip 不可用，尝试通过系统 pip 引导..."
    if command -v apt-get &>/dev/null; then
        sudo apt-get install -y python3-pip python3.12-venv 2>/dev/null || true
        rm -rf "$VENV_DIR"
        "$PYTHON_BIN" -m venv "$VENV_DIR"
    fi
fi

# ── 3. 安装依赖 ───────────────────────────────────────────────────────────────
echo "→ 安装 Python 依赖（首次较慢，请稍候）..."
"$VENV_DIR/bin/python" -m pip install -q --upgrade pip
"$VENV_DIR/bin/python" -m pip install -q -r "$REPO_DIR/requirement.txt"
echo "→ 依赖安装完成"

# ── 4. 确保 start.sh 可执行 ───────────────────────────────────────────────────
chmod +x "$REPO_DIR/start.sh"

# ── 5. 写入 alias 到 shell rc ─────────────────────────────────────────────────
ALIAS_CMD="alias Zhixiang='$REPO_DIR/start.sh'"

# 根据当前 shell 或系统默认选 rc 文件
if [[ "$SHELL" == */zsh ]]; then
    RC_FILE="$HOME/.zshrc"
elif [[ "$SHELL" == */bash ]]; then
    RC_FILE="$HOME/.bashrc"
else
    RC_FILE="$HOME/.bashrc"
fi

if grep -q "alias Zhixiang=" "$RC_FILE" 2>/dev/null; then
    # macOS BSD sed 需要 -i '', Linux GNU sed 只需 -i
    if [ "$OS_TYPE" = "Darwin" ]; then
        sed -i '' "s|alias Zhixiang=.*|$ALIAS_CMD|" "$RC_FILE"
    else
        sed -i "s|alias Zhixiang=.*|$ALIAS_CMD|" "$RC_FILE"
    fi
    echo "→ 已更新 $RC_FILE 中的 Zhixiang alias"
else
    {
        echo ""
        echo "# 志翔日程 - https://github.com/MichaelChaoLi-cpu/Zhixiang"
        echo "$ALIAS_CMD"
    } >> "$RC_FILE"
    echo "→ 已添加 Zhixiang alias 到 $RC_FILE"
fi

# ── 完成 ──────────────────────────────────────────────────────────────────────
echo ""
echo "✓ 初始化完成！"
echo ""
echo "  执行以下命令使 alias 立即生效："
echo ""
echo "    source $RC_FILE"
echo ""
echo "  之后在任意终端输入："
echo ""
echo "    Zhixiang"
echo ""
echo "  即可启动应用，浏览器会自动打开 http://localhost:4096"
echo ""
