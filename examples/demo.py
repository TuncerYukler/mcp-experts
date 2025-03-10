import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from knowledge_graph import KnowledgeGraphManager
from experts import MartinFowlerExpert, RobertCMartinExpert
from ollama_service import OllamaService

async def demo():
    # Initialize services
    kg = KnowledgeGraphManager("data/demo_knowledge_graph.json")
    ollama = OllamaService()
    
    print(f"Ollama service available: {ollama.is_available}")
    
    # Initialize experts
    martin = MartinFowlerExpert(kg)
    bob = RobertCMartinExpert(kg)
    
    # Read example files
    examples = {
        "javascript": Path(__file__).parent / "javascript" / "shopping_cart.js",
        "python": Path(__file__).parent / "python" / "data_processor.py",
        "typescript": Path(__file__).parent / "typescript" / "task_manager.ts"
    }
    
    example_code = {}
    for lang, path in examples.items():
        with open(path, "r") as f:
            example_code[lang] = f.read()
    
    # Get reviews from both experts for the JavaScript example
    print("\n" + "="*80)
    print(f"REVIEWING JAVASCRIPT CODE: shopping_cart.js")
    print("="*80)
    
    print("\nMARTIN FOWLER'S REVIEW:")
    martin_review = await martin.review_code({
        "code": example_code["javascript"],
        "language": "javascript",
        "description": "A shopping cart implementation",
        "storeInGraph": True
    })
    
    print(f"Rating: {martin_review['rating']}/5")
    print(f"Review: {martin_review['review']}")
    print("Suggestions:")
    for suggestion in martin_review['suggestions']:
        print(f"- {suggestion}")
    
    print("\nROBERT C. MARTIN'S REVIEW:")
    bob_review = await bob.review_code({
        "code": example_code["javascript"],
        "language": "javascript",
        "description": "A shopping cart implementation",
        "storeInGraph": True
    })
    
    print(f"Rating: {bob_review['rating']}/5")
    print(f"Review: {bob_review['review']}")
    print("Suggestions:")
    for suggestion in bob_review['suggestions']:
        print(f"- {suggestion}")
    
    # Get a review from Martin for the Python example
    print("\n" + "="*80)
    print(f"REVIEWING PYTHON CODE: data_processor.py")
    print("="*80)
    
    print("\nMARTIN FOWLER'S REVIEW:")
    martin_review = await martin.review_code({
        "code": example_code["python"],
        "language": "python",
        "description": "A data processing utility class",
        "storeInGraph": True
    })
    
    print(f"Rating: {martin_review['rating']}/5")
    print(f"Review: {martin_review['review']}")
    print("Suggestions:")
    for suggestion in martin_review['suggestions']:
        print(f"- {suggestion}")
    
    # Get a review from Bob for the TypeScript example
    print("\n" + "="*80)
    print(f"REVIEWING TYPESCRIPT CODE: task_manager.ts")
    print("="*80)
    
    print("\nROBERT C. MARTIN'S REVIEW:")
    bob_review = await bob.review_code({
        "code": example_code["typescript"],
        "language": "typescript",
        "description": "A task management system",
        "storeInGraph": True
    })
    
    print(f"Rating: {bob_review['rating']}/5")
    print(f"Review: {bob_review['review']}")
    print("Suggestions:")
    for suggestion in bob_review['suggestions']:
        print(f"- {suggestion}")
    
    # Display the knowledge graph statistics
    print("\n" + "="*80)
    print("KNOWLEDGE GRAPH STATISTICS")
    print("="*80)
    
    code_snippets = kg.get_entities_by_type("CodeSnippet")
    reviews = kg.get_entities_by_type("CodeReview")
    experts = kg.get_entities_by_type("Expert")
    
    print(f"Total entities: {len(kg.entities)}")
    print(f"Code snippets: {len(code_snippets)}")
    print(f"Reviews: {len(reviews)}")
    print(f"Experts: {len(experts)}")
    
    for expert in experts:
        reviews_by_expert = kg.get_related_entities(expert.id, "authored")
        print(f"- {expert.name}: {len(reviews_by_expert)} reviews")

if __name__ == "__main__":
    asyncio.run(demo()) 