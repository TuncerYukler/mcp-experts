"""
Example client for MCP Code Expert System
"""

import asyncio
import json
import os
from mcp.client import Client

async def main():
    # Initialize client (SSE transport)
    client = Client("http://localhost:8000/sse")
    
    # List available tools
    print("Available tools:")
    tools = await client.list_tools()
    for tool in tools:
        print(f"- {tool.name}: {tool.description}")
        print("  Parameters:")
        for param in tool.parameters:
            required = " (required)" if param.required else ""
            print(f"  - {param.name}: {param.description}{required}")
        print()
    
    # Read example code
    example_file = os.path.join(os.path.dirname(__file__), "javascript_example.js")
    with open(example_file, "r") as f:
        js_code = f.read()
    
    # Ask Martin Fowler to review the code
    print("Asking Martin Fowler to review JavaScript code...")
    martin_result = await client.call_tool(
        name="ask_martin",
        arguments={
            "code": js_code,
            "language": "javascript",
            "description": "A shopping cart implementation",
            "storeInGraph": True
        }
    )
    
    # Print Martin's review
    print("\nMartin Fowler's Review:")
    print(f"Rating: {martin_result['rating']}/5")
    print("\nReview:")
    print(martin_result["review"])
    print("\nSuggestions:")
    for i, suggestion in enumerate(martin_result["suggestions"], 1):
        print(f"{i}. {suggestion}")
    
    # Read another example
    example_file = os.path.join(os.path.dirname(__file__), "python_example.py")
    with open(example_file, "r") as f:
        py_code = f.read()
    
    # Ask Bob Martin to review the code
    print("\n\nAsking Bob Martin to review Python code...")
    bob_result = await client.call_tool(
        name="ask_bob",
        arguments={
            "code": py_code,
            "language": "python",
            "description": "A task management system",
            "storeInGraph": True
        }
    )
    
    # Print Bob's review
    print("\nBob Martin's Review:")
    print(f"Rating: {bob_result['rating']}/5")
    print("\nReview:")
    print(bob_result["review"])
    print("\nSuggestions:")
    for i, suggestion in enumerate(bob_result["suggestions"], 1):
        print(f"{i}. {suggestion}")
    
    # Query the knowledge graph
    print("\n\nQuerying the knowledge graph...")
    graph = await client.call_tool(name="read_graph", arguments={})
    print(f"Graph contains {len(graph['nodes'])} nodes and {len(graph['edges'])} edges")
    
    # Search for nodes
    print("\nSearching for 'shopping cart' in knowledge graph...")
    search_results = await client.call_tool(
        name="search_nodes",
        arguments={"query": "shopping cart"}
    )
    
    print(f"Found {len(search_results)} matches:")
    for node in search_results:
        print(f"- {node['name']} ({node['type']})")

if __name__ == "__main__":
    asyncio.run(main()) 