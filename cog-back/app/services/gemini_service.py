import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_response(self, query: str, context: Dict[str, Any] = None) -> str:
        try:
            # Create context-aware prompt for supply chain optimization
            system_prompt = """You are a supply chain optimization expert assistant. 
            You help analyze inventory data, production planning, demand forecasting, and procurement decisions.
            Provide practical, actionable insights based on the data provided."""
            
            if context:
                context_str = f"Current system context: {context}"
                full_prompt = f"{system_prompt}\n\nContext: {context_str}\n\nUser Query: {query}"
            else:
                full_prompt = f"{system_prompt}\n\nUser Query: {query}"
            
            response = self.model.generate_content(full_prompt)
            return response.text
        
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"

gemini_service = GeminiService()
