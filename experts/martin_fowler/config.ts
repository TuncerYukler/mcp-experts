// Configuration for the Martin Fowler expert module
import { z } from "zod";

// Reuse the same schemas as Robert C. Martin for simplicity
// In a real-world scenario, these might be different
export const CodeReviewRequestSchema = z.object({
  code: z.string(),
  language: z.string().optional(),
  description: z.string().optional(),
  storeInGraph: z.boolean().optional().default(true),
});

export const CodeReviewResponseSchema = z.object({
  review: z.string(),
  suggestions: z.array(z.string()),
  rating: z.number().min(1).max(10),
});

// Types inferred from schemas
export type CodeReviewRequest = z.infer<typeof CodeReviewRequestSchema>;
export type CodeReviewResponse = z.infer<typeof CodeReviewResponseSchema>;

export const expertConfig = {
  // Expert metadata
  name: "Martin",
  fullName: "Martin Fowler",
  nickname: "Refactoring Guru",
  expertise: "Refactoring",

  // Tool configuration
  tool: {
    name: "ask_martin",
    description:
      "Ask Martin Fowler to review your code and suggest refactorings based on his expertise",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code snippet or file content to review",
        },
        language: {
          type: "string",
          description: "The programming language of the code (optional)",
        },
        description: {
          type: "string",
          description: "A brief description of what the code does (optional)",
        },
        storeInGraph: {
          type: "boolean",
          description:
            "Whether to store the review in the knowledge graph (defaults to true)",
        },
      },
      required: ["code"],
    },
  },

  // Expert knowledge graph entity
  entity: {
    name: "Martin",
    entityType: "Expert",
    observations: [
      "Martin Fowler",
      "Author of Refactoring and Patterns of Enterprise Application Architecture",
      "Software architecture expert",
      "Advocate for continuous delivery and agile practices",
      "Authority on refactoring patterns and techniques",
    ],
  },
};
