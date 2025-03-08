import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider";

export interface OllamaOptions {
  model: string;
  baseUrl?: string;
  temperature?: number;
  unavailableMessage?: string;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  description?: string;
  systemPrompt: string;
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
  private unavailableMessage: string;

  constructor(options: OllamaOptions) {
    this.model = options.model || "deepseek-r1:7b";
    this.baseUrl = options.baseUrl || "http://localhost:11434";
    this.temperature = options.temperature || 0.7;
    this.unavailableMessage =
      options.unavailableMessage ||
      "The AI service is currently unavailable. Please check your connection to the Ollama service and try again later.";
  }

  async analyzeCode(
    request: CodeAnalysisRequest
  ): Promise<CodeAnalysisResponse> {
    const { code, language, description, systemPrompt } = request;

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

Please provide your expert review based on the criteria above.`;
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
      review: this.unavailableMessage,
      suggestions: [],
      rating: 1,
    };
  }
}
