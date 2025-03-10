#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing MCP Expert System...${NC}"

# Check if Python 3.10+ is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 not found. Please install Python 3.10 or higher.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]); then
    echo -e "${RED}Python 3.10+ is required. Found Python $PYTHON_VERSION.${NC}"
    exit 1
fi

echo -e "${GREEN}Using Python $PYTHON_VERSION${NC}"

# Check if uv is installed, install if not
if ! command -v uv &> /dev/null; then
    echo -e "${BLUE}Installing uv package manager...${NC}"
    curl -sSf https://install.python-poetry.org | python3 -
    pip install uv
fi

# Create a virtual environment
echo -e "${BLUE}Creating virtual environment...${NC}"
uv venv .venv

# Activate the virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source .venv/bin/activate

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
uv add "mcp[cli]"

# Install other dependencies
echo -e "${BLUE}Installing other dependencies...${NC}"
uv pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please edit it with your configuration.${NC}"
fi

# Install the package in development mode
echo -e "${BLUE}Installing MCP Expert System...${NC}"
uv pip install -e .

echo -e "${GREEN}Installation complete!${NC}"
echo -e "${BLUE}To run the server:${NC}"
echo -e "  1. Activate the virtual environment: ${GREEN}source .venv/bin/activate${NC}"
echo -e "  2. Run the server: ${GREEN}python server.py${NC}"
echo -e "  3. Or use MCP CLI for HTTP/SSE: ${GREEN}mcp run server.py --transport sse --port 8000${NC}"

echo -e "${BLUE}To configure in Cursor:${NC}"
echo -e "  1. Install in Cursor: ${GREEN}mcp install server.py --name \"Code Expert System\"${NC}" 