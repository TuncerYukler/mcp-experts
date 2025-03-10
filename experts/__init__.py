"""
Code Expert System - Expert Modules
"""

from typing import Dict, List, Any, Optional, Protocol
from pydantic import BaseModel

# Standardized models for all experts
class CodeReviewRequest(BaseModel):
    """Request model for code review"""
    code: str
    description: Optional[str] = None
    language: Optional[str] = None
    storeInGraph: bool = True

class CodeReviewResponse(BaseModel):
    """Response model for code review"""
    review: str
    suggestions: List[str]
    rating: int
    
    # Pydantic v2 configuration
    model_config = {
        "extra": "ignore"
    }

# Expert Interface
class ExpertInterface(Protocol):
    """Protocol defining what an expert implementation must provide"""
    
    @property
    def name(self) -> str:
        """Get the expert's name"""
        ...
    
    @property
    def tool_name(self) -> str:
        """Get the name of the tool for this expert"""
        ...
    
    @property
    def description(self) -> str:
        """Get the description of this expert"""
        ...
    
    @property
    def tool_description(self) -> str:
        """Get the description of the tool for this expert"""
        ...
    
    @property
    def input_schema(self) -> Dict[str, Any]:
        """Get the input schema for this expert's tool"""
        ...
    
    async def review_code(self, request: CodeReviewRequest) -> CodeReviewResponse:
        """Review code according to this expert's principles"""
        ...

# Import and expose expert implementations
from .martin_fowler import MartinFowlerExpert
from .robert_c_martin import RobertCMartinExpert

# Function to get all expert implementations
def get_all_experts(knowledge_graph=None, ollama_service=None) -> List[ExpertInterface]:
    """Get all available expert implementations
    
    Args:
        knowledge_graph: Optional shared knowledge graph instance
        ollama_service: Optional shared Ollama service instance
        
    Returns:
        List of expert implementations
    """
    from knowledge_graph import KnowledgeGraph
    from ollama_service import OllamaService
    
    # Use provided instances or create new ones if not provided
    knowledge_graph = knowledge_graph or KnowledgeGraph()
    ollama_service = ollama_service or OllamaService()
    
    # Create and return expert instances
    return [
        MartinFowlerExpert(knowledge_graph, ollama_service),
        RobertCMartinExpert(knowledge_graph, ollama_service)
    ] 