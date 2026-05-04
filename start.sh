#!/bin/bash
set -e
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "正在创建虚拟环境..."
    python3 -m venv .venv
fi

# Activate and install dependencies quietly
source .venv/bin/activate
pip install -q -r requirement.txt

# Start the app
echo "启动 志翔日程 → http://localhost:4096"
python app.py
