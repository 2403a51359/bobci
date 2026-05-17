"""
IBM watsonx.ai Integration Client
Provides real AI-powered analysis using IBM's Granite models
"""

import os
import json
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

load_dotenv()


class WatsonxClient:
    """Client for IBM watsonx.ai API integration"""
    
    def __init__(self):
        self.api_key = os.getenv("WATSONX_API_KEY")
        self.project_id = os.getenv("WATSONX_PROJECT_ID")
        self.api_url = os.getenv("WATSONX_API_URL", "https://us-south.ml.cloud.ibm.com")
        self.model_id = os.getenv("WATSONX_MODEL_ID", "ibm/granite-13b-chat-v2")
        
        self.is_configured = bool(self.api_key and self.project_id)
        
        if self.is_configured:
            print("✅ watsonx.ai client configured")
        else:
            print("⚠️  watsonx.ai credentials not found - using fallback")
    
    def generate_text(self, prompt: str, max_tokens: int = 2000) -> Optional[str]:
        """Generate text using watsonx.ai"""
        if not self.is_configured:
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model_id": self.model_id,
                "input": prompt,
                "parameters": {
                    "max_new_tokens": max_tokens,
                    "temperature": 0.7,
                    "top_p": 0.9
                },
                "project_id": self.project_id
            }
            
            response = requests.post(
                f"{self.api_url}/ml/v1/text/generation",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("results", [{}])[0].get("generated_text", "")
            else:
                print(f"❌ watsonx.ai error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ watsonx.ai error: {e}")
            return None
    
    def analyze_junior_guide(self, diff_content: str) -> Optional[Dict[str, Any]]:
        """Generate junior developer guide using watsonx.ai"""
        prompt = f"""You are a senior developer mentor. Explain this code change to a junior developer.

CODE DIFF:
{diff_content[:2000]}

Provide JSON response:
{{
  "difficulty": "beginner|intermediate|advanced",
  "problem_solved": "What problem does this solve?",
  "solution_explained": "How does it work?",
  "new_concepts": [
    {{
      "concept": "Concept name",
      "simple_explanation": "Easy explanation",
      "analogy": "Real-world analogy"
    }}
  ],
  "learn_more": ["Resource 1", "Resource 2"]
}}

Return ONLY valid JSON."""

        response = self.generate_text(prompt, max_tokens=1500)
        if response:
            try:
                return json.loads(response)
            except:
                pass
        return None


# Made with Bob - Elite Edition