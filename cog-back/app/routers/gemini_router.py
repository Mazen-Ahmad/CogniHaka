from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.gemini_service import gemini_service

router = APIRouter()

class GeminiQuery(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class GeminiResponse(BaseModel):
    response: str
    query: str

@router.post("/gemini/query", response_model=GeminiResponse)
async def query_gemini(request: GeminiQuery):
    """
    Query Gemini AI with supply chain context
    """
    try:
        response = await gemini_service.generate_response(
            request.query, 
            request.context
        )
        
        return GeminiResponse(
            response=response,
            query=request.query
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

@router.post("/gemini/analyze-optimization")
async def analyze_optimization_with_gemini(request: Dict[str, Any]):
    """
    Get Gemini analysis of optimization results
    """
    try:
        # Extract key metrics from optimization results
        context = {
            "capacity_utilization": request.get("capacityUtilization", 0),
            "forecast_accuracy": request.get("forecastAccuracy", 0),
            "critical_shortages": request.get("criticalShortages", []),
            "excess_inventory": request.get("excessInventory", [])
        }
        
        analysis_prompt = """Analyze these supply chain optimization results and provide:
        1. Key insights about performance
        2. Potential risks or bottlenecks
        3. Specific recommendations for improvement
        4. Priority actions to take"""
        
        response = await gemini_service.generate_response(analysis_prompt, context)
        
        return {"analysis": response, "context": context}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
