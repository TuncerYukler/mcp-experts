"""
Robert C. Martin Expert Implementation
"""

from typing import Dict, List, Any, Optional
import mcp.types as types
from experts import CodeReviewRequest, CodeReviewResponse
from knowledge_graph import KnowledgeGraph

class RobertCMartinExpert:
    """
    Expert implementation for Robert C. Martin (Uncle Bob)
    Provides code reviews focused on Clean Code principles
    """
    
    def __init__(self, knowledge_graph: KnowledgeGraph, ollama_service):
        """
        Initialize the Robert C. Martin expert
        
        Args:
            knowledge_graph: The knowledge graph instance
            ollama_service: The Ollama service instance
        """
        self.knowledge_graph = knowledge_graph
        self.ollama_service = ollama_service
    
    @property
    def name(self) -> str:
        """Get the expert's name"""
        return "Robert C. Martin"
    
    @property
    def tool_name(self) -> str:
        """Get the name of the tool for this expert"""
        return "ask_bob"
    
    @property
    def description(self) -> str:
        """Get the description of this expert"""
        return "Software craftsmanship and clean code expert"
    
    @property
    def tool_description(self) -> str:
        """Get the description of the tool for this expert"""
        return "Ask Bob Martin to review your code based on Clean Code principles"
    
    @property
    def input_schema(self) -> Dict[str, Any]:
        """Get the input schema for this expert's tool"""
        return {
            "type": "object",
            "required": ["code"],
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The code to review"
                },
                "description": {
                    "type": "string",
                    "description": "Description of what the code does"
                },
                "language": {
                    "type": "string",
                    "description": "The programming language"
                },
                "storeInGraph": {
                    "type": "boolean",
                    "description": "Whether to store the review in the knowledge graph",
                    "default": True
                }
            }
        }
    
    async def review_code(self, request: CodeReviewRequest) -> CodeReviewResponse:
        """
        Review code according to Robert C. Martin's Clean Code principles
        
        Args:
            request: The code review request
        
        Returns:
            The code review response
        """
        print(f"[RobertCMartinExpert] Reviewing code: {request.code[:50]}...")
        
        # Get review from Ollama
        result = self.ollama_service.get_robert_c_martin_review(
            code=request.code,
            language=request.language,
            description=request.description
        )
        
        print(f"[RobertCMartinExpert] Review result: {result['rating']}/5")
        
        # Create response
        response = CodeReviewResponse(
            review=result["review"],
            suggestions=result["suggestions"],
            rating=result["rating"]
        )
        
        # Store in knowledge graph if requested
        if request.storeInGraph:
            self._store_review_in_graph(request, response)
        
        return response
    
    def _store_review_in_graph(self, request: CodeReviewRequest, response: CodeReviewResponse) -> None:
        """
        Store a code review in the knowledge graph
        
        Args:
            request: The code review request
            response: The code review response
        """
        # Create code node
        code_name = f"code-{len(self.knowledge_graph.nodes) + 1}"
        self.knowledge_graph.add_node(
            code_name,
            "CodeSnippet",
            {
                "code": request.code,
                "description": request.description,
                "language": request.language,
            }
        )
        
        # Create review node
        review_name = f"bob-review-{len(self.knowledge_graph.nodes) + 1}"
        self.knowledge_graph.add_node(
            review_name,
            "CodeReview",
            {
                "review": response.review,
                "suggestions": response.suggestions,
                "rating": response.rating,
                "reviewer": self.name,
            }
        )
        
        # Ensure expert exists
        expert_name = self.name
        expert_node = self.knowledge_graph.get_node(expert_name)
        if not expert_node:
            self.knowledge_graph.add_node(
                expert_name,
                "Expert",
                {
                    "expertise": "Clean Code",
                    "description": self.description
                }
            )
        
        # Add relationships
        self.knowledge_graph.add_edge(
            review_name, code_name, "reviews"
        )
        self.knowledge_graph.add_edge(
            expert_name, review_name, "authored"
        ) 