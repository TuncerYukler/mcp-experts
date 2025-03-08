#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Import our modules
import { KnowledgeGraphManager } from "./knowledge-graph.js";
import { RobertCMartinExpert } from "./experts/robert_c_martin/index.js";

/**
 * Initialize the knowledge graph manager and experts
 */
const knowledgeGraphManager = new KnowledgeGraphManager();
const bobExpert = new RobertCMartinExpert(knowledgeGraphManager);

/**
 * Schema for the read_graph tool
 */
const ReadGraphSchema = z.object({
  random_string: z.string().optional(),
});

/**
 * Schema for the search_nodes tool
 */
const SearchNodesSchema = z.object({
  query: z.string(),
});

/**
 * Schema for the open_nodes tool
 */
const OpenNodesSchema = z.object({
  names: z.array(z.string()),
});

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "mcp-experts",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Configure the available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Get Bob's tool configuration
  const bobToolConfig = bobExpert.getToolConfig();

  return {
    tools: [
      // Only include read-only knowledge graph tools
      {
        name: "read_graph",
        description: "Read the entire knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            random_string: {
              type: "string",
              description: "Dummy parameter for no-parameter tools",
            },
          },
          required: [],
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The search query to match against entity names, types, and observation content",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description:
          "Open specific nodes in the knowledge graph by their names",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to retrieve",
            },
          },
          required: ["names"],
        },
      },
      // Add Bob's tool
      {
        name: bobToolConfig.name,
        description: bobToolConfig.description,
        inputSchema: bobToolConfig.inputSchema,
      },
    ],
  };
});

/**
 * Handle tool requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args && name !== "read_graph") {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  try {
    switch (name) {
      case "read_graph":
        // Validate with zod schema
        ReadGraphSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await knowledgeGraphManager.readGraph(),
                null,
                2
              ),
            },
          ],
        };

      case "search_nodes":
        // Validate with zod schema
        const searchParams = SearchNodesSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await knowledgeGraphManager.searchNodes(searchParams.query),
                null,
                2
              ),
            },
          ],
        };

      case "open_nodes":
        // Validate with zod schema
        const openParams = OpenNodesSchema.parse(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await knowledgeGraphManager.openNodes(openParams.names),
                null,
                2
              ),
            },
          ],
        };

      case "ask_bob":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await bobExpert.reviewCode(args), null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Better error handling with zod validation errors
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Validation error",
                details: error.errors,
              },
              null,
              2
            ),
          },
        ],
      };
    }
    throw error;
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Experts Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
