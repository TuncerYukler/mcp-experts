# MCP Experts - Clean Code Reviewer

An MCP (Model Context Protocol) server that provides code review services following Robert C. Martin's Clean Code principles. The server connects to Ollama for AI-powered code reviews and maintains a knowledge graph of reviewed code.

## Features

- Code review based on Robert C. Martin's Clean Code principles
- Automatic static analysis of code
- Integration with Ollama for AI-powered reviews
- Knowledge graph storage of code and reviews
- Automatic relationship building between experts, code, and reviews

## Prerequisites

### Install Ollama

[Ollama](https://ollama.com/) is required to run the AI models used for code analysis.

1. Install Ollama for your platform:

   - **macOS**: Download from [ollama.com](https://ollama.com/)
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
   - **Windows**: Windows WSL2 support via Linux instructions

2. Pull the required model:

   ```bash
   ollama pull deepseek-r1:7b
   ```

3. Start the Ollama server:

   ```bash
   ollama serve
   ```

   Ollama runs on `http://localhost:11434` by default. Keep this terminal window open.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-experts

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

1. Create or modify the `.env` file in the project root:

   ```
   # Ollama configuration
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=deepseek-r1:7b
   ```

## Setting Up in Cursor IDE

### Tool Configuration

1. Open Cursor IDE
2. Create a new MCP tool configuration:
   - **Name**: "Code Review (Uncle Bob)"
   - **Command**: The full path to the `dist/index.js` file in your project
     ```
     node /Users/[username]/path/to/mcp-experts/dist/index.js
     ```
   - For example: `node /Users/tom/Code/tomsiwik/mcp-experts/dist/index.js`

### Usage in Cursor

1. With the MCP tool configured, select "Code Review (Uncle Bob)" from your tools menu
2. Use the `ask_bob` tool to review your code:

```json
{
  "code": "YOUR_CODE_HERE",
  "language": "JavaScript",
  "description": "A description of what the code does"
}
```

3. Access the knowledge graph with:
   - `read_graph`: View the entire knowledge graph
   - `search_nodes`: Search for specific nodes
   - `open_nodes`: Open specific nodes by name

## Example Usage

To review a code snippet, use the `ask_bob` command:

```javascript
// Using the tool in Cursor
const response = await bob.ask_bob({
  code: `function calculateTotal(items) {
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      total += items[i].price;
    }
    return total;
  }`,
  language: "JavaScript",
  description: "Calculate the total price of items",
});

console.log(response);
```

The response will include a review, suggestions, and a rating:

```json
{
  "review": "I've reviewed your JavaScript code (190 characters).",
  "suggestions": [
    "Use 'const' or 'let' instead of 'var' for better scoping",
    "Consider using array methods like reduce instead of a for loop",
    "Functions should do one thing, and do it well",
    "Meaningful variable names improve code readability"
  ],
  "rating": 5
}
```

## Troubleshooting

- **"Uncle Bob is sleeping"**: This message appears when Ollama is not available. Make sure Ollama is running with `ollama serve`.
- **Model not found**: Make sure you've pulled the model with `ollama pull deepseek-r1:7b` or the model specified in your `.env` file.
- **Connection issues**: Check that the OLLAMA_HOST value in your .env file matches where Ollama is running (default: `http://localhost:11434`).

## License

MIT
