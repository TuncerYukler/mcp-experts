"""Service for interacting with Ollama AI models.

This module provides a simple client for generating code reviews
using Ollama's REST API.
"""

import json
import os
import random
import requests
from typing import Dict, Any, Optional, List, Union
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Default configuration
DEFAULT_OLLAMA_HOST = "http://localhost:11434"
DEFAULT_OLLAMA_MODEL = "llama3:8b"

# Get configuration from environment
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", DEFAULT_OLLAMA_HOST)
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", DEFAULT_OLLAMA_MODEL)


class OllamaService:
    """Client for interacting with Ollama API."""

    def __init__(self, host: str = OLLAMA_HOST, model: str = OLLAMA_MODEL):
        """Initialize the Ollama service.
        
        Args:
            host: Ollama API host
            model: Model to use for generation
        """
        self.host = host
        self.model = model
        self.api_url = f"{host}/api/generate"
        self.is_available = self._check_availability()

    def _check_availability(self) -> bool:
        """Check if Ollama is available.
        
        Returns:
            True if Ollama is available, False otherwise
        """
        try:
            response = requests.get(f"{self.host}/api/tags")
            return response.status_code == 200
        except requests.RequestException:
            print(f"Ollama service not available at {self.host}")
            return False

    def get_martin_fowler_review(
        self, 
        code: str, 
        language: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get a code review from Martin Fowler's perspective.
        
        Args:
            code: Code to review
            language: Programming language
            description: Description of the code
            
        Returns:
            Dictionary with review, suggestions, and rating
        """
        if not self.is_available:
            return self._mock_martin_fowler_review(code, language)
            
        # Prepare prompt
        prompt = self._prepare_martin_fowler_prompt(code, language, description)
        
        try:
            # Call Ollama API
            response = self._call_ollama(prompt)
            
            # Parse response
            return self._parse_review_response(response)
        except Exception as e:
            print(f"Error getting review from Ollama: {e}")
            return self._mock_martin_fowler_review(code, language)

    def get_robert_c_martin_review(
        self, 
        code: str, 
        language: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get a code review from Robert C. Martin's perspective.
        
        Args:
            code: Code to review
            language: Programming language
            description: Description of the code
            
        Returns:
            Dictionary with review, suggestions, and rating
        """
        if not self.is_available:
            return self._mock_robert_c_martin_review(code, language)
            
        # Prepare prompt
        prompt = self._prepare_robert_c_martin_prompt(code, language, description)
        
        try:
            # Call Ollama API
            response = self._call_ollama(prompt)
            
            # Parse response
            return self._parse_review_response(response)
        except Exception as e:
            print(f"Error getting review from Ollama: {e}")
            return self._mock_robert_c_martin_review(code, language)

    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API to generate text.
        
        Args:
            prompt: Prompt for the model
            
        Returns:
            Generated text
        """
        data = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.7,
            "max_tokens": 1024
        }
        
        response = requests.post(self.api_url, json=data)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")

    def _prepare_martin_fowler_prompt(
        self, 
        code: str, 
        language: Optional[str] = None,
        description: Optional[str] = None
    ) -> str:
        """Prepare a prompt for Martin Fowler's review.
        
        Args:
            code: Code to review
            language: Programming language
            description: Description of the code
            
        Returns:
            Formatted prompt
        """
        lang_info = f" in {language}" if language else ""
        desc_info = f"\nDescription: {description}" if description else ""
        
        return f"""You are Martin Fowler, a renowned software architect and author who specializes in refactoring, patterns, and software design.
        
Review the following code{lang_info}{desc_info}. Provide a detailed review focusing on:

1. Code structure and organization
2. Potential code smells
3. Refactoring opportunities
4. Design pattern usage (or potential for it)

Format your response as JSON with these fields:
- "review": Your detailed analysis
- "suggestions": An array of specific refactoring suggestions
- "rating": A numerical score from 1-5 (1=poor, 5=excellent)

CODE TO REVIEW:
```
{code}
```

JSON RESPONSE:
"""

    def _prepare_robert_c_martin_prompt(
        self, 
        code: str, 
        language: Optional[str] = None,
        description: Optional[str] = None
    ) -> str:
        """Prepare a prompt for Robert C. Martin's review.
        
        Args:
            code: Code to review
            language: Programming language
            description: Description of the code
            
        Returns:
            Formatted prompt
        """
        lang_info = f" in {language}" if language else ""
        desc_info = f"\nDescription: {description}" if description else ""
        
        return f"""You are Robert C. Martin (Uncle Bob), a renowned software engineer and advocate for clean code principles.
        
Review the following code{lang_info}{desc_info}. Provide a detailed review focusing on:

1. Clean code principles
2. SOLID principles
3. Function naming, size, and responsibility
4. Overall code clarity and maintainability

Format your response as JSON with these fields:
- "review": Your detailed analysis
- "suggestions": An array of specific clean code improvements
- "rating": A numerical score from 1-5 (1=poor, 5=excellent)

CODE TO REVIEW:
```
{code}
```

JSON RESPONSE:
"""

    def _parse_review_response(self, response: str) -> Dict[str, Any]:
        """Parse the review response from Ollama.
        
        Args:
            response: Raw text response from Ollama
            
        Returns:
            Parsed review dictionary
        """
        try:
            # Try to extract JSON from the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                review_data = json.loads(json_str)
                
                # Ensure all required fields are present
                if not all(key in review_data for key in ['review', 'suggestions', 'rating']):
                    raise ValueError("Missing required fields in review data")
                    
                # Ensure suggestions is a list
                if not isinstance(review_data['suggestions'], list):
                    review_data['suggestions'] = [review_data['suggestions']]
                    
                # Ensure rating is a number between 1 and 5
                if not isinstance(review_data['rating'], (int, float)) or review_data['rating'] < 1 or review_data['rating'] > 5:
                    review_data['rating'] = random.randint(2, 5)
                    
                return review_data
        except Exception as e:
            print(f"Error parsing review response: {e}")
            
        # Fallback to extracting parts of the review manually
        lines = response.split('\n')
        review_lines = []
        suggestions = []
        rating = random.randint(2, 5)
        
        in_review = False
        in_suggestions = False
        
        for line in lines:
            # Look for review section
            if 'review' in line.lower() and ':' in line:
                in_review = True
                in_suggestions = False
                continue
                
            # Look for suggestions section
            if 'suggestion' in line.lower() and ':' in line:
                in_review = False
                in_suggestions = True
                continue
                
            # Look for rating
            if 'rating' in line.lower() and ':' in line:
                try:
                    # Extract rating value
                    rating_str = line.split(':')[1].strip()
                    # Remove any non-numeric characters
                    rating_str = ''.join(c for c in rating_str if c.isdigit() or c == '.')
                    rating = float(rating_str)
                    # Ensure rating is between 1 and 5
                    rating = max(1, min(5, rating))
                except:
                    pass
                continue
                
            # Collect review text
            if in_review:
                review_lines.append(line.strip())
                
            # Collect suggestions
            if in_suggestions and line.strip():
                # Check if line starts with number or dash
                if (line.strip().startswith('-') or 
                    any(line.strip().startswith(str(i)) for i in range(10))):
                    suggestions.append(line.strip())
                    
        # Create review dictionary
        review = {
            'review': ' '.join(review_lines) if review_lines else response,
            'suggestions': suggestions if suggestions else ["Improve code readability", "Consider adding comments"],
            'rating': rating
        }
        
        return review

    def _mock_martin_fowler_review(
        self, 
        code: str, 
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a mock review from Martin Fowler's perspective.
        
        Args:
            code: Code to review
            language: Programming language
            
        Returns:
            Mock review dictionary
        """
        lang_text = language if language else "this code"
        code_length = len(code.strip().split('\n'))
        
        # Determine complexity heuristic
        complexity = "simple" if code_length < 10 else "moderately complex" if code_length < 30 else "complex"
        rating = 4 if code_length < 10 else 3 if code_length < 30 else 2
        
        review = f"""I've reviewed the {complexity} {lang_text} snippet. The code appears functional but has room for improvement in terms of structure and design. There are several refactoring opportunities that could make it more maintainable and aligned with good software design principles."""
        
        suggestions = [
            "Extract smaller, focused methods with clear responsibilities",
            "Consider introducing appropriate design patterns",
            "Improve variable and method naming for clarity",
            "Reduce duplication and increase code reuse"
        ]
        
        if complexity == "complex":
            suggestions.append("Break down complex logic into smaller, testable units")
            suggestions.append("Consider separating concerns with appropriate abstractions")
            
        return {
            "review": review,
            "suggestions": suggestions,
            "rating": rating
        }

    def _mock_robert_c_martin_review(
        self, 
        code: str, 
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a mock review from Robert C. Martin's perspective.
        
        Args:
            code: Code to review
            language: Programming language
            
        Returns:
            Mock review dictionary
        """
        lang_text = language if language else "this code"
        code_length = len(code.strip().split('\n'))
        
        # Determine complexity heuristic
        complexity = "simple" if code_length < 10 else "moderately complex" if code_length < 30 else "complex"
        rating = 4 if code_length < 10 else 3 if code_length < 30 else 2
        
        review = f"""I've examined the {complexity} {lang_text} snippet through the lens of Clean Code principles. The code has several areas where it could better adhere to SOLID principles and clean code practices. Function naming and responsibility could be improved to enhance readability and maintainability."""
        
        suggestions = [
            "Use more descriptive names for variables and functions",
            "Ensure each function does one thing well",
            "Keep functions small and focused on a single responsibility",
            "Add meaningful comments explaining 'why' not 'what'"
        ]
        
        if complexity == "complex":
            suggestions.append("Apply the Single Responsibility Principle more rigorously")
            suggestions.append("Reduce function parameter counts for simpler interfaces")
            
        return {
            "review": review,
            "suggestions": suggestions,
            "rating": rating
        } 