import numpy as np
import pulp
from typing import List, Dict, Any
from datetime import datetime, timedelta

# ----------- LOAD BALANCER OPTIMIZER (UNCHANGED) ----------- #
def optimize_orders(orders, stations: int):
    """
    LPT (Longest Processing Time first) load balancing algorithm.
    Assign orders to stations by sorting jobs descending and
    always giving next largest job to least loaded station.
    """
    # Sort orders by packingTime (largest first)
    sorted_orders = sorted(orders, key=lambda x: x["packingTime"], reverse=True)
    station_loads = [0] * stations
    assignments = []

    for order in sorted_orders:
        # Find the station with minimum load
        min_station = int(np.argmin(station_loads))
        station_loads[min_station] += order["packingTime"]
        assignments.append({
            "orderId": order["id"],
            "station": min_station + 1
        })

    station_summary = [
        {"station": i+1, "totalTime": station_loads[i]}
        for i in range(stations)
    ]

    imbalance = round(
        (max(station_loads) - min(station_loads)) / (sum(station_loads)/stations) * 100,
        2
    )

    return {
        "assignments": assignments,
        "stationLoadSummary": station_summary,
        "imbalancePercent": imbalance,
        "insight": f"LPT scheduling reduced load imbalance to {imbalance}%."
    }

# ----------- ENHANCED INVENTORY OPTIMIZER ----------- #
def optimize_inventory(sku_data: List[Any], production_constraints: List[Any], scenario: Any) -> Dict:
    """
    Multi-objective inventory optimization with production constraints
    """
    try:
        # Create optimization model
        model = pulp.LpProblem("Supply_Chain_Optimization", pulp.LpMinimize)
        
        # Decision variables
        production_vars = {}
        inventory_vars = {}
        transport_vars = {}
        
        # Initialize decision variables
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            warehouse = sku.warehouse if hasattr(sku, 'warehouse') else sku.get('warehouse', 'Delhi')
            
            # Production variables for each factory
            for constraint in production_constraints:
                factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
                production_vars[f"{sku_id}_{factory}"] = pulp.LpVariable(
                    f"prod_{sku_id}_{factory}", lowBound=0, cat='Integer'
                )
            
            # Inventory variables
            inventory_vars[sku_id] = pulp.LpVariable(
                f"inv_{sku_id}", lowBound=0, cat='Integer'
            )
            
            # Transportation variables
            for constraint in production_constraints:
                factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
                transport_vars[f"{sku_id}_{factory}_{warehouse}"] = pulp.LpVariable(
                    f"trans_{sku_id}_{factory}_{warehouse}", lowBound=0, cat='Integer'
                )
        
        # Objective function: Minimize total cost
        total_cost = []
        
        # Production costs
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            unit_cost = sku.unit_cost if hasattr(sku, 'unit_cost') else 10.0
            
            for constraint in production_constraints:
                factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
                prod_cost = constraint.production_cost_per_unit if hasattr(constraint, 'production_cost_per_unit') else unit_cost
                total_cost.append(production_vars[f"{sku_id}_{factory}"] * prod_cost)
        
        # Holding costs
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            holding_rate = sku.holding_cost_rate if hasattr(sku, 'holding_cost_rate') else 0.25
            unit_cost = sku.unit_cost if hasattr(sku, 'unit_cost') else 10.0
            total_cost.append(inventory_vars[sku_id] * unit_cost * holding_rate)
        
        # Stockout penalties
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            actual_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
            stockout_penalty = sku.stockout_penalty if hasattr(sku, 'stockout_penalty') else 50.0
            
            shortage_var = pulp.LpVariable(f"shortage_{sku_id}", lowBound=0, cat='Integer')
            model += shortage_var >= actual_demand - inventory_vars[sku_id]
            total_cost.append(shortage_var * stockout_penalty)
        
        model += pulp.lpSum(total_cost), "Total_Supply_Chain_Cost"
        
        # Constraints
        
        # 1. Production capacity constraints
        for constraint in production_constraints:
            factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
            weekly_capacity = constraint.weekly_capacity if hasattr(constraint, 'weekly_capacity') else 100
            
            factory_production = []
            for sku in sku_data:
                sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
                factory_production.append(production_vars[f"{sku_id}_{factory}"])
            
            model += pulp.lpSum(factory_production) <= weekly_capacity * scenario.capacity_utilization_target
        
        # 2. Demand fulfillment constraints
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            actual_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
            
            # Adjust demand based on scenario
            adjusted_demand = actual_demand * scenario.demand_surge_factor
            
            # Production from all factories should meet demand
            total_production = []
            for constraint in production_constraints:
                factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
                total_production.append(production_vars[f"{sku_id}_{factory}"])
            
            model += pulp.lpSum(total_production) >= adjusted_demand * 0.9  # 90% service level minimum
        
        # 3. Inventory balance constraints
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            current_stock = sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0)
            
            # Inventory = Current Stock + Production - Demand
            total_production = []
            for constraint in production_constraints:
                factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
                total_production.append(production_vars[f"{sku_id}_{factory}"])
            
            actual_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
            adjusted_demand = actual_demand * scenario.demand_surge_factor
            
            model += inventory_vars[sku_id] == current_stock + pulp.lpSum(total_production) - adjusted_demand
        
        # Solve the model
        solver = pulp.PULP_CBC_CMD(msg=0)
        model.solve(solver)
        
        if model.status != pulp.LpStatusOptimal:
            return {
                "status": pulp.LpStatus[model.status],
                "message": "Optimization failed",
                "productionPlan": [],
                "inventoryPlan": [],
                "totalCost": 0
            }
        
        # Extract results
        production_plan = []
        inventory_plan = []
        total_cost_value = 0
        
        for sku in sku_data:
            sku_id = sku.sku if hasattr(sku, 'sku') else sku['sku']
            
            # Production plan
            factory_allocations = {}
            for constraint in production_constraints:
                factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
                allocation = int(production_vars[f"{sku_id}_{factory}"].varValue or 0)
                factory_allocations[factory] = allocation
            
            production_plan.append({
                "sku": sku_id,
                "factoryAllocations": factory_allocations,
                "totalProduction": sum(factory_allocations.values())
            })
            
            # Inventory plan
            optimal_inventory = int(inventory_vars[sku_id].varValue or 0)
            inventory_plan.append({
                "sku": sku_id,
                "optimalInventory": optimal_inventory,
                "currentStock": sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0),
                "recommendation": "Increase" if optimal_inventory > (sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0)) else "Decrease"
            })
        
        total_cost_value = model.objective.value()
        
        # Generate strategic recommendations
        recommendations = generate_optimization_recommendations(production_plan, inventory_plan, scenario)
        
        return {
            "status": "Optimal",
            "productionPlan": production_plan,
            "inventoryPlan": inventory_plan,
            "totalCost": round(total_cost_value, 2),
            "recommendations": recommendations,
            "scenarioAnalysis": analyze_scenario_impact(scenario),
            "kpis": calculate_optimization_kpis(production_plan, inventory_plan)
        }
        
    except Exception as e:
        return {
            "status": "Error",
            "message": str(e),
            "productionPlan": [],
            "inventoryPlan": [],
            "totalCost": 0
        }

def optimize_production_allocation(sku_data: List[Any], production_constraints: List[Any], capacity_target: float) -> Dict:
    """
    Optimize production allocation across factories
    """
    if not production_constraints:
        return {"message": "No production constraints provided"}
    
    # Calculate optimal allocation using capacity balancing
    total_capacity = sum(
        (c.weekly_capacity if hasattr(c, 'weekly_capacity') else 100) * capacity_target 
        for c in production_constraints
    )
    
    total_demand = sum(
        sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
        for sku in sku_data
    )
    
    allocation_plan = []
    
    for constraint in production_constraints:
        factory = constraint.factory_location if hasattr(constraint, 'factory_location') else 'Delhi'
        factory_capacity = (constraint.weekly_capacity if hasattr(constraint, 'weekly_capacity') else 100) * capacity_target
        factory_allocation = (factory_capacity / total_capacity) * total_demand if total_capacity > 0 else 0
        
        allocation_plan.append({
            "factory": factory,
            "allocatedDemand": round(factory_allocation),
            "capacity": factory_capacity,
            "utilizationRate": round((factory_allocation / factory_capacity * 100), 2) if factory_capacity > 0 else 0
        })
    
    return {
        "allocationPlan": allocation_plan,
        "totalCapacity": total_capacity,
        "totalDemand": total_demand,
        "overallUtilization": round((total_demand / total_capacity * 100), 2) if total_capacity > 0 else 0,
        "recommendations": generate_capacity_recommendations(allocation_plan)
    }

def generate_optimization_recommendations(production_plan: List[Dict], inventory_plan: List[Dict], scenario: Any) -> List[str]:
    """Generate optimization recommendations"""
    recommendations = []
    
    # Production recommendations
    total_production = sum(p["totalProduction"] for p in production_plan)
    if total_production == 0:
        recommendations.append("No production scheduled. Review demand forecasts and capacity constraints.")
    
    # Inventory recommendations
    increase_count = len([p for p in inventory_plan if p["recommendation"] == "Increase"])
    if increase_count > len(inventory_plan) * 0.5:
        recommendations.append("Majority of products need inventory increase. Consider capacity expansion.")
    
    # Scenario-specific recommendations
    if scenario.demand_surge_factor > 1.2:
        recommendations.append("High demand surge detected. Consider emergency procurement and subcontracting.")
    
    if not scenario.include_subcontracting:
        recommendations.append("Enable subcontracting option for better demand fulfillment during peaks.")
    
    return recommendations

def analyze_scenario_impact(scenario: Any) -> Dict:
    """Analyze the impact of the optimization scenario"""
    return {
        "scenarioName": scenario.scenario_name,
        "demandImpact": f"{((scenario.demand_surge_factor - 1) * 100):.1f}% demand change",
        "capacityTarget": f"{(scenario.capacity_utilization_target * 100):.1f}% utilization target",
        "riskLevel": "High" if scenario.demand_surge_factor > 1.4 else "Medium" if scenario.demand_surge_factor > 1.1 else "Low",
        "recommendations": [
            "Monitor demand patterns closely" if scenario.demand_surge_factor > 1.3 else "Standard monitoring sufficient",
            "Activate contingency plans" if scenario.demand_surge_factor > 1.5 else "Normal operations",
            "Consider emergency procurement" if scenario.emergency_procurement else "Standard procurement"
        ]
    }

def calculate_optimization_kpis(production_plan: List[Dict], inventory_plan: List[Dict]) -> Dict:
    """Calculate key performance indicators for the optimization"""
    total_production = sum(p["totalProduction"] for p in production_plan)
    total_optimal_inventory = sum(p["optimalInventory"] for p in inventory_plan)
    total_current_stock = sum(p["currentStock"] for p in inventory_plan)
    
    return {
        "totalPlannedProduction": total_production,
        "inventoryOptimizationGain": round(((total_optimal_inventory - total_current_stock) / total_current_stock * 100), 2) if total_current_stock > 0 else 0,
        "productionEfficiency": round((total_production / max(1, len(production_plan))), 2),
        "inventoryTurnover": round((total_production / max(1, total_optimal_inventory)), 2) if total_optimal_inventory > 0 else 0
    }
