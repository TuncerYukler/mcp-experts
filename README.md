# MCP Code Expert System

A Python-based code review system using the Model Context Protocol (MCP). It provides code review capabilities through simulated expert personas like Martin Fowler and Robert C. Martin (Uncle Bob).

## Features

- Code review based on Martin Fowler's refactoring principles
- Code review based on Robert C. Martin's Clean Code principles
- Knowledge graph storage of code, reviews, and relationships
- Integration with Ollama for AI-powered reviews
- Server-side Event (SSE) support for web integration

## Prerequisites

### Python 3.10+

This project requires Python 3.10 or higher.

### Ollama

[Ollama](https://ollama.com/) is required for AI-powered code reviews.

1. Install Ollama for your platform:

   - **macOS**: Download from [ollama.com](https://ollama.com/)
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
   - **Windows**: Windows WSL2 support via Linux instructions

2. Pull a recommended model:

   ```bash
   ollama pull llama3:8b
   ```

3. Start the Ollama server:

   ```bash
   ollama serve
   ```

## Installation

Run the setup script to install dependencies and create the virtual environment:

```bash
chmod +x setup.sh
./setup.sh
```

## Configuration

Edit the `.env` file to configure (create from `.env.example` if needed):

```
# Knowledge Graph Settings
KNOWLEDGE_GRAPH_PATH=data/knowledge_graph.json

# Ollama Configuration (local AI models)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:8b
```

## Usage

### Running the Server

#### Standard Mode (for Cursor Integration)

```bash
source .venv/bin/activate
python server.py
```

#### HTTP/SSE Mode (for Web Integration)

```bash
source .venv/bin/activate
python server.py --transport sse
```

This will start the server at `http://localhost:8000/sse` for SSE transport.

For custom port:

```bash
python server.py --transport sse --port 9000
```

### Installing in Cursor

To install in Cursor IDE:

```bash
source .venv/bin/activate
mcp install server.py --name "Code Expert System"
```

### Available Tools

The server exposes these tools:

- `ask_martin`: Ask Martin Fowler to review code and suggest refactorings
- `ask_bob`: Ask Robert C. Martin (Uncle Bob) to review code based on Clean Code principles
- `read_graph`: Read the entire knowledge graph
- `search_nodes`: Search for nodes in the knowledge graph
- `open_nodes`: Open specific nodes by their names

### Example Usage

To review a code snippet with Martin Fowler:

```json
{
  "code": "function calculateTotal(items) {\n  var total = 0;\n  for (var i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
  "language": "javascript",
  "description": "Calculate the total price of items"
}
```

## Project Structure

- `server.py`: Main server implementation with MCP integration
- `experts/`: Expert modules implementing the code review capabilities
  - `__init__.py`: Shared models and interfaces
  - `martin_fowler/`: Martin Fowler expert implementation
  - `robert_c_martin/`: Robert C. Martin expert implementation
- `knowledge_graph.py`: Knowledge graph for storing code and reviews
- `ollama_service.py`: Integration with Ollama for AI-powered reviews
- `examples/`: Example code for review in different languages
- `requirements.txt`: Python dependencies
- `setup.sh`: Setup script

## Architecture

The system follows a modular architecture:

1. **Server Layer**: Handles MCP protocol communication and routes requests
2. **Expert Layer**: Encapsulates code review logic for each expert
3. **Service Layer**: Provides AI integration and knowledge graph functionality

Each expert implements a standard interface allowing for consistent handling and easy addition of new experts.

## License

MIT
