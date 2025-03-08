// Configuration for the Robert C. Martin (Uncle Bob) expert module
import { z } from "zod";

// Zod schema for code review request
export const CodeReviewRequestSchema = z.object({
  code: z.string(),
  language: z.string().optional(),
  description: z.string().optional(),
  storeInGraph: z.boolean().optional().default(true),
});

// Zod schema for code review response
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
  name: "Bob",
  fullName: "Robert C. Martin",
  nickname: "Uncle Bob",
  expertise: "Clean Code",

  // Tool configuration
  tool: {
    name: "ask_bob",
    description:
      "Ask Bob (Robert C. Martin) to review your code and provide feedback based on Clean Code principles",
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
    name: "Bob",
    entityType: "Expert",
    observations: [
      "Robert C. Martin (Uncle Bob)",
      "Author of Clean Code",
      "Software engineering expert",
      "Advocate for software craftsmanship",
      "Creator of SOLID principles",
    ],
  },
};
