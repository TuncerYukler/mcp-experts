#!/bin/bash
set -e

echo "Setting up MCP Code Expert System"

# Check Python
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed. Aborting."; exit 1; }

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install "mcp[cli] @ git+https://github.com/modelcontextprotocol/python-sdk.git"

# Create data directory
mkdir -p data

echo "Setup complete!"
echo "To run the server:"
echo " 1. source .venv/bin/activate"
echo " 2. python server.py"
echo "Or with SSE transport:"
echo " 3. python server.py --transport sse"
echo "To install in Cursor:"
echo " 4. mcp install server.py --name \"Code Expert System\"" 