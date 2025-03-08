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
 * Expert implementation for Martin Fowler
 * Provides code reviews focused on refactoring opportunities
 */
export class MartinFowlerExpert {
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
        unavailableMessage: `${expertConfig.nickname} is currently unavailable. Please try again later.`,
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
   * Get the system prompt for Martin Fowler's code reviews
   * @returns The system prompt
   */
  private getRefactoringPrompt(): string {
    return `You are ${expertConfig.fullName} (${expertConfig.nickname}), renowned software architecture expert and author of "Refactoring" and "Patterns of Enterprise Application Architecture".
You are reviewing code with a focus on identifying refactoring opportunities and improving software design.

Your review should evaluate the following criteria:
1. Code smells: Identify duplicated code, long methods, large classes, etc.
2. Refactoring opportunities: Suggest specific refactorings from your catalog
3. Design patterns: Identify where appropriate design patterns could be applied
4. Technical debt: Point out areas where technical debt has accumulated
5. Architecture concerns: Comment on higher-level structural issues
6. Naming: Evaluate whether names reveal intent clearly
7. Testability: Assess how easily the code can be tested
8. Coupling: Identify tight coupling that could be reduced
9. Cohesion: Evaluate whether classes and methods have high cohesion
10. Maintainability: Overall assessment of how maintainable the code is

Your response MUST be in JSON format with the following structure:
{
  "review": "Your overall assessment of the code",
  "suggestions": ["suggestion1", "suggestion2", ...],
  "rating": number (1-10, where 10 is perfect code)
}

Be specific, constructive, and practical in your feedback. Suggest concrete improvements using established refactoring patterns.`;
  }

  /**
   * Review code for refactoring opportunities
   * @param rawRequest The code review request
   * @returns Code review with suggestions and rating
   */
  async reviewCode(rawRequest: unknown): Promise<CodeReviewResponse> {
    const request = CodeReviewRequestSchema.parse(rawRequest);

    let response: CodeReviewResponse;

    if (this.useOllama && this.ollamaService) {
      response = await this.getOllamaReview(request);
    } else {
      response = await this.getMockReview(request);
    }

    if (request.storeInGraph !== false) {
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
      systemPrompt: this.getRefactoringPrompt(),
    });
  }

  private async getMockReview(
    request: CodeReviewRequest
  ): Promise<CodeReviewResponse> {
    const codeLength = request.code.length;
    const language = request.language || "unknown";

    let review = `I've reviewed your ${language} code (${codeLength} characters) for refactoring opportunities.`;
    const suggestions: string[] = [];
    let rating = 7;

    if (codeLength > 500) {
      suggestions.push(
        "Consider breaking down this code into smaller, focused components"
      );
      rating -= 1;
    }

    if (request.code.includes("class") && request.code.includes("extends")) {
      suggestions.push(
        "Consider if composition could be more appropriate than inheritance here"
      );
      rating -= 1;
    }

    if (request.code.match(/if\s*\(.+\)\s*{[\s\S]+?if\s*\(/g)) {
      suggestions.push(
        "Look for opportunities to extract complex conditional logic into guard clauses"
      );
      rating -= 1;
    }

    suggestions.push(
      "Apply the 'Replace Conditional with Polymorphism' pattern where appropriate"
    );
    suggestions.push(
      "Consider introducing intermediate variables to clarify complex expressions"
    );

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
