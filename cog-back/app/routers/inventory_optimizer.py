from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.services.analyzer import analyze_inventory, analyze_supplier_performance
from app.services.optimizer import optimize_inventory, optimize_production_allocation
from app.services.forecasting import generate_demand_forecast
from app.services.supply_chain import calculate_safety_stock, optimize_procurement

router = APIRouter()

# -------------------- ENHANCED MODELS -------------------- #

class SKU(BaseModel):
    sku: str
    warehouse: str = Field(..., description="Delhi, Mumbai, or Kolkata")
    product_category: str = Field(..., description="Product category")
    current_stock: int = Field(..., ge=0)
    forecast_demand: int = Field(..., ge=0)
    actual_demand: int = Field(..., ge=0)
    production_capacity: int = Field(..., ge=0)
    unit_cost: float = Field(..., ge=0)
    holding_cost_rate: float = Field(default=0.25, ge=0, le=1)
    stockout_penalty: float = Field(default=50.0, ge=0)
    lead_time_days: int = Field(default=7, ge=1)
    shelf_life_days: int = Field(default=90, ge=1)
    is_festival_sensitive: bool = Field(default=False)

class Supplier(BaseModel):
    supplier_id: str
    material_type: str
    reliability_score: float = Field(..., ge=0, le=1)
    lead_time_days: int = Field(..., ge=1)
    moq: int = Field(..., ge=1)
    unit_price: float = Field(..., ge=0)
    quality_rating: float = Field(..., ge=0, le=10)

class ProductionConstraint(BaseModel):
    factory_location: str = Field(..., description="Delhi or Pune")
    weekly_capacity: int = Field(..., ge=0)
    efficiency_rate: float = Field(..., ge=0, le=1)
    production_cost_per_unit: float = Field(..., ge=0)

class InventoryRequest(BaseModel):
    sku_data: List[SKU]
    suppliers: List[Supplier] = []
    production_constraints: List[ProductionConstraint] = []
    festival_demand_multiplier: float = Field(default=1.45, ge=1.0, le=2.0)
    service_level_target: float = Field(default=0.95, ge=0.8, le=1.0)

class OptimizationScenario(BaseModel):
    scenario_name: str
    demand_surge_factor: float = Field(default=1.0, ge=0.5, le=3.0)
    capacity_utilization_target: float = Field(default=0.85, ge=0.5, le=1.0)
    include_subcontracting: bool = Field(default=True)
    emergency_procurement: bool = Field(default=False)

# -------------------- ENHANCED ROUTES -------------------- #

@router.post("/analyze-supply-chain")
def analyze_supply_chain_route(req: InventoryRequest):
    """Comprehensive supply chain analysis"""
    try:
        analysis = analyze_inventory(req.sku_data)
        supplier_analysis = analyze_supplier_performance(req.suppliers) if req.suppliers else None
        
        # Enhanced demand forecasting
        demand_forecast = generate_demand_forecast(
            req.sku_data, 
            req.festival_demand_multiplier
        )
        
        # Safety stock calculations
        safety_stocks = calculate_safety_stock(
            req.sku_data, 
            req.service_level_target
        )
        
        return {
            "inventory_analysis": analysis,
            "supplier_performance": supplier_analysis,
            "demand_forecast": demand_forecast,
            "safety_stock_recommendations": safety_stocks,
            "capacity_analysis": analyze_production_capacity(req.production_constraints),
            "risk_assessment": assess_supply_chain_risks(req.sku_data, req.suppliers)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize-supply-chain")
def optimize_supply_chain_route(req: InventoryRequest, scenario: OptimizationScenario):
    """Multi-objective supply chain optimization"""
    try:
        # Production allocation optimization
        production_plan = optimize_production_allocation(
            req.sku_data, 
            req.production_constraints,
            scenario.capacity_utilization_target
        )
        
        # Inventory optimization
        inventory_optimization = optimize_inventory(
            req.sku_data, 
            req.production_constraints,
            scenario
        )
        
        # Procurement optimization
        procurement_plan = optimize_procurement(
            req.suppliers,
            req.sku_data,
            scenario.emergency_procurement
        )
        
        return {
            "production_allocation": production_plan,
            "inventory_optimization": inventory_optimization,
            "procurement_plan": procurement_plan,
            "cost_analysis": calculate_total_costs(production_plan, inventory_optimization),
            "performance_metrics": calculate_kpis(req.sku_data, inventory_optimization),
            "recommendations": generate_strategic_recommendations(req, scenario)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/festival-planning")
def festival_demand_planning(req: InventoryRequest):
    """Festival demand surge planning"""
    try:
        festival_plan = plan_festival_demand(
            req.sku_data,
            req.festival_demand_multiplier,
            req.production_constraints
        )
        
        return {
            "festival_forecast": festival_plan["demand_forecast"],
            "production_schedule": festival_plan["production_plan"],
            "inventory_buildup": festival_plan["inventory_strategy"],
            "subcontracting_needs": festival_plan["subcontracting"],
            "material_requirements": festival_plan["raw_materials"],
            "timeline": festival_plan["execution_timeline"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def analyze_production_capacity(constraints: List[ProductionConstraint]) -> Dict:
    total_capacity = sum(c.weekly_capacity for c in constraints)
    avg_efficiency = sum(c.efficiency_rate for c in constraints) / len(constraints) if constraints else 0
    
    return {
        "total_weekly_capacity": total_capacity,
        "average_efficiency": round(avg_efficiency, 2),
        "capacity_utilization_recommendations": generate_capacity_recommendations(constraints)
    }

def assess_supply_chain_risks(sku_data: List[SKU], suppliers: List[Supplier]) -> Dict:
    high_risk_skus = [sku for sku in sku_data if sku.current_stock < sku.forecast_demand * 0.5]
    unreliable_suppliers = [s for s in suppliers if s.reliability_score < 0.8]
    
    return {
        "high_risk_products": len(high_risk_skus),
        "unreliable_suppliers": len(unreliable_suppliers),
        "risk_mitigation_actions": generate_risk_mitigation_plan(high_risk_skus, unreliable_suppliers)
    }

def generate_capacity_recommendations(constraints: List[ProductionConstraint]) -> List[str]:
    recommendations = []
    for constraint in constraints:
        if constraint.efficiency_rate < 0.8:
            recommendations.append(f"Improve efficiency at {constraint.factory_location} factory")
        if constraint.weekly_capacity < 80:
            recommendations.append(f"Consider capacity expansion at {constraint.factory_location}")
    return recommendations

def generate_risk_mitigation_plan(high_risk_skus: List[SKU], unreliable_suppliers: List[Supplier]) -> List[str]:
    actions = []
    if high_risk_skus:
        actions.append("Implement emergency replenishment for high-risk SKUs")
    if unreliable_suppliers:
        actions.append("Diversify supplier base for critical materials")
    actions.append("Establish safety stock buffers")
    actions.append("Implement demand sensing technology")
    return actions
