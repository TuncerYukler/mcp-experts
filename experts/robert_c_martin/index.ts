import {
  expertConfig,
  CodeReviewRequest,
  CodeReviewResponse,
  CodeReviewRequestSchema,
  CodeReviewResponseSchema,
} from "./config.js";
import { KnowledgeGraphManager, Entity } from "../../knowledge-graph.js";
import { OllamaService } from "../../services/ollama.js";

/**
 * Expert implementation for Robert C. Martin (Uncle Bob)
 * Provides code reviews based on Clean Code principles
 */
export class RobertCMartinExpert {
  /**
   * The knowledge graph manager instance
   */
  private knowledgeGraphManager: KnowledgeGraphManager;
  private ollamaService: OllamaService | null = null;
  private useOllama: boolean = false;

  /**
   * Constructor
   * @param knowledgeGraphManager Instance of KnowledgeGraphManager
   */
  constructor(knowledgeGraphManager: KnowledgeGraphManager) {
    this.knowledgeGraphManager = knowledgeGraphManager;

    try {
      this.ollamaService = new OllamaService({
        model: process.env.OLLAMA_MODEL || "llama3",
        baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
        temperature: 0.5,
      });
      this.useOllama = true;
    } catch (error) {
      console.error("Failed to initialize Ollama service:", error);
      this.useOllama = false;
    }
  }

  /**
   * Extension of KnowledgeGraphManager to access protected methods
   * This lets the expert modify the knowledge graph while keeping these
   * methods protected from external use
   */
  private get graph() {
    return {
      // Cast to any to access protected methods
      createEntities: (entities: Entity[]) =>
        (this.knowledgeGraphManager as any).createEntities(entities),
      createRelations: (relations: any[]) =>
        (this.knowledgeGraphManager as any).createRelations(relations),
      addObservations: (observations: any[]) =>
        (this.knowledgeGraphManager as any).addObservations(observations),
      deleteEntities: (entityNames: string[]) =>
        (this.knowledgeGraphManager as any).deleteEntities(entityNames),
      deleteObservations: (deletions: any[]) =>
        (this.knowledgeGraphManager as any).deleteObservations(deletions),
      deleteRelations: (relations: any[]) =>
        (this.knowledgeGraphManager as any).deleteRelations(relations),
      // Public methods are directly accessible
      readGraph: () => this.knowledgeGraphManager.readGraph(),
      searchNodes: (query: string) =>
        this.knowledgeGraphManager.searchNodes(query),
      openNodes: (names: string[]) =>
        this.knowledgeGraphManager.openNodes(names),
    };
  }

  /**
   * Ensure the expert exists in the knowledge graph
   */
  private async ensureExpertExists(): Promise<void> {
    const graph = await this.knowledgeGraphManager.readGraph();
    if (!graph.entities.some((e: any) => e.name === expertConfig.name)) {
      await this.graph.createEntities([expertConfig.entity]);
    }
  }

  /**
   * Review code for clean code principles
   * @param rawRequest The code review request
   * @returns Code review with suggestions and rating
   */
  async reviewCode(rawRequest: unknown): Promise<CodeReviewResponse> {
    const request = CodeReviewRequestSchema.parse(rawRequest);

    let response: CodeReviewResponse;

    if (this.useOllama && this.ollamaService) {
      try {
        response = await this.getOllamaReview(request);
      } catch (error) {
        console.error("Error getting Ollama review:", error);
        response = await this.getMockReview(request);
      }
    } else {
      response = await this.getMockReview(request);
    }

    if (request.storeInGraph) {
      await this.storeReviewInGraph(
        request,
        response.review,
        response.suggestions,
        response.rating
      );
    }

    return CodeReviewResponseSchema.parse(response);
  }

  private async getOllamaReview(
    request: CodeReviewRequest
  ): Promise<CodeReviewResponse> {
    if (!this.ollamaService) {
      throw new Error("Ollama service is not initialized");
    }

    return await this.ollamaService.analyzeCode({
      code: request.code,
      language: request.language || "unknown",
      description: request.description,
    });
  }

  private async getMockReview(
    request: CodeReviewRequest
  ): Promise<CodeReviewResponse> {
    const codeLength = request.code.length;
    const language = request.language || "unknown";

    let review = `I've reviewed your ${language} code (${codeLength} characters).`;
    const suggestions: string[] = [];
    let rating = 7;

    if (codeLength > 500) {
      suggestions.push(
        "Consider breaking down this code into smaller functions"
      );
      rating -= 1;
    }

    if (request.code.includes("TODO")) {
      suggestions.push(
        "Remove TODO comments before submitting production code"
      );
      rating -= 1;
    }

    if (request.code.includes("var ")) {
      suggestions.push(
        "Use 'const' or 'let' instead of 'var' for better scoping"
      );
      rating -= 1;
    }

    if (request.code.includes("function") && !request.code.includes("return")) {
      suggestions.push(
        "Functions should generally return a value or clearly indicate side effects"
      );
    }

    suggestions.push(
      "Remember that functions should do one thing, and do it well"
    );
    suggestions.push("Meaningful variable names improve code readability");

    return {
      review,
      suggestions,
      rating,
    };
  }

  /**
   * Store the review in the knowledge graph
   */
  private async storeReviewInGraph(
    request: CodeReviewRequest,
    review: string,
    suggestions: string[],
    rating: number
  ): Promise<void> {
    // Ensure the expert exists
    await this.ensureExpertExists();

    // Create unique IDs for the review and code
    const timestamp = Date.now();
    const reviewId = `review_${timestamp}`;
    const codeId = `code_${timestamp}`;

    // Create the review entity
    const reviewEntity: Entity = {
      name: reviewId,
      entityType: "CodeReview",
      observations: [
        `Language: ${request.language || "unknown"}`,
        `Length: ${request.code.length} characters`,
        `Rating: ${rating}/10`,
        `Review: ${review}`,
        ...suggestions.map((s) => `Suggestion: ${s}`),
      ],
    };

    // Create the code entity
    const codeEntity: Entity = {
      name: codeId,
      entityType: "Code",
      observations: [
        `Language: ${request.language || "unknown"}`,
        `Description: ${request.description || "No description provided"}`,
        `Content: ${request.code.substring(0, 500)}${
          request.code.length > 500 ? "..." : ""
        }`,
      ],
    };

    // Add entities to the graph
    await this.graph.createEntities([reviewEntity, codeEntity]);

    // Create relations
    await this.graph.createRelations([
      {
        from: reviewId,
        to: codeId,
        relationType: "reviews",
      },
      {
        from: expertConfig.name,
        to: reviewId,
        relationType: "authored",
      },
    ]);
  }

  /**
   * Get the tool configuration for this expert
   */
  getToolConfig() {
    return expertConfig.tool;
  }
}
