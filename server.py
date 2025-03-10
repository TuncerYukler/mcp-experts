"""
MCP Code Expert System Server

A server that provides code review capabilities through expert personas
using the Model Context Protocol (MCP).
"""

import os
import anyio
import click
import json
from typing import Dict, List, Any

import mcp.types as types
from mcp.server.lowlevel import Server
from dotenv import load_dotenv

from knowledge_graph import KnowledgeGraph
from ollama_service import OllamaService
from experts import get_all_experts

# Load environment variables
load_dotenv()

# Initialize knowledge graph
STORAGE_PATH = os.environ.get("KNOWLEDGE_GRAPH_PATH", "data/knowledge_graph.json")
os.makedirs(os.path.dirname(STORAGE_PATH), exist_ok=True)
knowledge_graph = KnowledgeGraph(STORAGE_PATH)

# Initialize Ollama service
ollama_service = OllamaService()

# Initialize experts with shared resources
experts = list(get_all_experts(knowledge_graph, ollama_service))
experts_by_tool = {expert.tool_name: expert for expert in experts}

@click.command()
@click.option("--port", default=8000, help="Port to listen on for SSE")
@click.option(
    "--transport", 
    type=click.Choice(["stdio", "sse"]), 
    default="stdio", 
    help="Transport type"
)
def main(port: int, transport: str) -> int:
    """Run the MCP Code Expert System server."""
    
    print(f"Starting MCP Code Expert System")
    print(f"Transport: {transport}")
    print(f"Ollama service available: {ollama_service.is_available}")
    print(f"Experts loaded: {', '.join(expert.name for expert in experts)}")
    
    # Create server
    app = Server("Code Expert System")
    
    @app.list_tools()
    async def list_tools() -> List[types.Tool]:
        """List available tools"""
        tools = []
        
        # Add expert tools
        for expert in experts:
            tools.append(
                types.Tool(
                    name=expert.tool_name,
                    description=expert.tool_description,
                    inputSchema=expert.input_schema
                )
            )
        
        # Add knowledge graph tools
        tools.extend([
            types.Tool(
                name="read_graph",
                description="Read the entire knowledge graph",
                inputSchema={
                    "type": "object",
                    "properties": {}
                }
            ),
            types.Tool(
                name="search_nodes",
                description="Search for nodes in the knowledge graph based on a query",
                inputSchema={
                    "type": "object",
                    "required": ["query"],
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query"
                        }
                    }
                }
            ),
            types.Tool(
                name="open_nodes",
                description="Open specific nodes in the knowledge graph by their names",
                inputSchema={
                    "type": "object",
                    "required": ["names"],
                    "properties": {
                        "names": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of node names to open"
                        }
                    }
                }
            ),
        ])
        
        print(f"Listing {len(tools)} tools")
        for tool in tools:
            print(f" - {tool.name}: {tool.description}")
        
        return tools
    
    @app.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> Any:
        """Handle tool calls"""
        print(f"Tool call: {name} with arguments: {json.dumps(arguments)[:100]}")
        
        try:
            # Handle expert tools
            if name in experts_by_tool:
                expert = experts_by_tool[name]
                from experts import CodeReviewRequest
                response = await expert.review_code(CodeReviewRequest(**arguments))
                return response.model_dump()
            
            # Handle knowledge graph tools
            elif name == "read_graph":
                return knowledge_graph.get_all()
                
            elif name == "search_nodes":
                query = arguments.get("query", "")
                return knowledge_graph.search_nodes(query)
                
            elif name == "open_nodes":
                names = arguments.get("names", [])
                results = []
                for name in names:
                    node = knowledge_graph.get_node(name)
                    if node:
                        results.append({"name": name, **node})
                return results
                
            else:
                raise ValueError(f"Unknown tool: {name}")
            
        except Exception as e:
            print(f"Error handling tool call {name}: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    # Run with the appropriate transport
    if transport == "sse":
        from mcp.server.sse import SseServerTransport
        from starlette.applications import Starlette
        from starlette.routing import Mount, Route
        from starlette.middleware import Middleware
        from starlette.middleware.cors import CORSMiddleware
        
        # Create SSE transport
        sse = SseServerTransport("/messages/")
        
        async def handle_sse(request):
            print(f"New SSE connection received")
            async with sse.connect_sse(
                request.scope, request.receive, request._send
            ) as streams:
                await app.run(
                    streams[0], streams[1], app.create_initialization_options()
                )
        
        # Create Starlette app with CORS middleware
        starlette_app = Starlette(
            debug=True,
            routes=[
                Route("/sse", endpoint=handle_sse),
                Mount("/messages/", app=sse.handle_post_message),
            ],
            middleware=[
                Middleware(
                    CORSMiddleware,
                    allow_origins=["*"],
                    allow_methods=["*"],
                    allow_headers=["*"],
                ),
            ]
        )
        
        import uvicorn
        print(f"SSE endpoint: http://localhost:{port}/sse")
        uvicorn.run(starlette_app, host="0.0.0.0", port=port)
    else:
        from mcp.server.stdio import stdio_server
        
        async def arun():
            async with stdio_server() as streams:
                await app.run(
                    streams[0], streams[1], app.create_initialization_options()
                )
        
        anyio.run(arun)
    
    return 0

if __name__ == "__main__":
    main() 