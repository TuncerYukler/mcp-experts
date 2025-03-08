import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider";

export interface OllamaOptions {
  model: string;
  baseUrl?: string;
  temperature?: number;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  description?: string;
}

export interface CodeAnalysisResponse {
  review: string;
  suggestions: string[];
  rating: number; // 1-10 scale
}

export class OllamaService {
  private model: string;
  private baseUrl: string;
  private temperature: number;

  constructor(options: OllamaOptions) {
    this.model = options.model || "deepseek-r1:7b";
    this.baseUrl = options.baseUrl || "http://localhost:11434";
    this.temperature = options.temperature || 0.7;
  }

  async analyzeCode(
    request: CodeAnalysisRequest
  ): Promise<CodeAnalysisResponse> {
    const { code, language, description } = request;

    const systemPrompt = this.getCleanCodePrompt();
    const userPrompt = this.formatCodeRequest(code, language, description);

    try {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const ollama = createOllama({
        baseURL: this.baseUrl,
      });

      const { text } = await generateText({
        model: ollama(this.model),
        prompt: fullPrompt,
        temperature: this.temperature,
      });

      return this.parseResponse(text);
    } catch (error) {
      console.error("Error calling Ollama:", error);
      return this.getUnavailableResponse();
    }
  }

  private getCleanCodePrompt(): string {
    return `You are Robert C. Martin (Uncle Bob), the renowned software engineer and author of "Clean Code".
You are reviewing code with a focus on maintainability, readability, and adherence to clean code principles.

Your review should evaluate the following criteria:
1. Single Responsibility Principle: Each function/class should have one reason to change
2. Function size: Functions should be small and do one thing well
3. Naming: Variables, functions, and classes should have clear, descriptive names
4. Comments: Code should be self-documenting; comments should explain "why", not "what"
5. Error handling: Proper error handling and graceful recovery
6. DRY (Don't Repeat Yourself): No code duplication
7. Code organization: Related functions should be grouped together
8. Formatting: Consistent indentation and spacing
9. Complexity: Minimize conditional complexity
10. SOLID principle violations besides SRP: DIP, ISP, LSP, OCP

Your response MUST be in JSON format with the following structure:
{
  "review": "Your overall assessment of the code",
  "suggestions": ["suggestion1", "suggestion2", ...],
  "rating": number (1-10, where 10 is perfect clean code)
}

Be specific, constructive, and practical in your feedback. Suggest concrete improvements.`;
  }

  private formatCodeRequest(
    code: string,
    language: string,
    description?: string
  ): string {
    const staticAnalysis = this.performStaticAnalysis(code);

    return `Please review the following ${language} code${
      description ? ` that ${description}` : ""
    }:

\`\`\`${language}
${code}
\`\`\`

Static analysis findings:
- Code length: ${code.length} characters
- Line count: ${code.split("\n").length} lines
${staticAnalysis.map((finding) => `- ${finding}`).join("\n")}

Please provide your expert review based on Clean Code principles.`;
  }

  private performStaticAnalysis(code: string): string[] {
    const findings: string[] = [];

    // Check for long lines
    const lines = code.split("\n");
    const longLines = lines.filter((line) => line.length > 80).length;
    if (longLines > 0) {
      findings.push(`Found ${longLines} lines exceeding 80 characters`);
    }

    // Check for TODOs
    if (code.includes("TODO")) {
      findings.push("Contains TODO comments");
    }

    // Check for var usage in JavaScript/TypeScript
    if (
      (code.includes("function") || code.includes("=>")) &&
      code.includes("var ")
    ) {
      findings.push("Uses var instead of const/let");
    }

    // Check for long functions (crude estimation)
    const functionMatches =
      code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
    for (const func of functionMatches) {
      if (func.length > 500) {
        findings.push("Contains long functions (>500 characters)");
        break;
      }
    }

    // Check for nested conditionals (crude estimation)
    const nestedIfCount = (code.match(/if\s*\([^)]*\)\s*{[^{]*if\s*\(/g) || [])
      .length;
    if (nestedIfCount > 0) {
      findings.push(`Contains ${nestedIfCount} nested conditional statements`);
    }

    return findings;
  }

  private parseResponse(responseText: string): CodeAnalysisResponse {
    try {
      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = responseText.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

      const response = JSON.parse(jsonStr);

      // Validate and provide defaults if needed
      return {
        review: response.review || "No review provided",
        suggestions: Array.isArray(response.suggestions)
          ? response.suggestions
          : [],
        rating: typeof response.rating === "number" ? response.rating : 5,
      };
    } catch (error) {
      console.error("Error parsing Ollama response:", error);
      console.error("Response text:", responseText);

      return this.getUnavailableResponse();
    }
  }

  private getUnavailableResponse(): CodeAnalysisResponse {
    return {
      review:
        "Uncle Bob is sleeping (he's dreaming of Ollama's running... and you referring to the README of the MCP)",
      suggestions: [],
      rating: 0,
    };
  }
}
