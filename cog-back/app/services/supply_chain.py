import numpy as np
import pandas as pd
import pulp
from typing import List, Dict, Any
from scipy import stats
from datetime import datetime, timedelta

def calculate_safety_stock(sku_data: List[Any], service_level_target: float = 0.95) -> List[Dict]:
    """
    Calculate optimal safety stock levels using statistical methods
    """
    safety_stocks = []
    z_score = stats.norm.ppf(service_level_target)  # Z-score for service level
    
    for sku in sku_data:
        sku_id = sku.sku if hasattr(sku, 'sku') else sku.get('sku', '')
        actual_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
        forecast_demand = sku.forecast_demand if hasattr(sku, 'forecast_demand') else sku.get('forecastDemand', 0)
        lead_time = getattr(sku, 'lead_time_days', 7)
        current_stock = sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0)
        
        # Calculate demand variability
        demand_variance = abs(actual_demand - forecast_demand)
        demand_std = max(1, demand_variance)  # Minimum std deviation of 1
        
        # Safety stock formula: Z * σ * √L
        lead_time_factor = np.sqrt(lead_time / 7)  # Normalize to weekly lead time
        safety_stock_level = z_score * demand_std * lead_time_factor
        
        # Reorder point calculation
        reorder_point = actual_demand * (lead_time / 7) + safety_stock_level
        
        # Stock status assessment
        stock_status = assess_stock_status(current_stock, reorder_point, safety_stock_level)
        
        safety_stocks.append({
            'sku': sku_id,
            'warehouse': sku.warehouse if hasattr(sku, 'warehouse') else sku.get('warehouse', 'Delhi'),
            'currentStock': current_stock,
            'safetyStockLevel': round(safety_stock_level, 0),
            'reorderPoint': round(reorder_point, 0),
            'demandStd': round(demand_std, 2),
            'leadTimeDays': lead_time,
            'serviceLevel': service_level_target,
            'stockStatus': stock_status,
            'recommendedAction': get_stock_recommendation(current_stock, reorder_point, safety_stock_level)
        })
    
    # Calculate aggregate metrics
    total_safety_stock = sum(item['safetyStockLevel'] for item in safety_stocks)
    critical_items = [item for item in safety_stocks if item['stockStatus'] == 'Critical']
    
    return {
        'safetyStockLevels': safety_stocks,
        'totalSafetyStock': total_safety_stock,
        'criticalItems': len(critical_items),
        'serviceLevel': service_level_target,
        'averageLeadTime': np.mean([item['leadTimeDays'] for item in safety_stocks]),
        'recommendations': generate_safety_stock_recommendations(safety_stocks)
    }

def assess_stock_status(current_stock: float, reorder_point: float, safety_stock: float) -> str:
    """Assess stock status based on safety stock levels"""
    if current_stock <= safety_stock:
        return 'Critical'
    elif current_stock <= reorder_point:
        return 'Reorder'
    elif current_stock <= reorder_point * 1.5:
        return 'Normal'
    else:
        return 'Excess'

def get_stock_recommendation(current_stock: float, reorder_point: float, safety_stock: float) -> str:
    """Get stock management recommendation"""
    if current_stock <= safety_stock:
        return 'URGENT: Emergency replenishment required'
    elif current_stock <= reorder_point:
        return 'Place order immediately'
    elif current_stock <= reorder_point * 1.5:
        return 'Monitor closely'
    else:
        return 'Consider reducing stock levels'

def generate_safety_stock_recommendations(safety_stocks: List[Dict]) -> List[str]:
    """Generate safety stock management recommendations"""
    recommendations = []
    
    critical_count = len([s for s in safety_stocks if s['stockStatus'] == 'Critical'])
    reorder_count = len([s for s in safety_stocks if s['stockStatus'] == 'Reorder'])
    excess_count = len([s for s in safety_stocks if s['stockStatus'] == 'Excess'])
    
    if critical_count > 0:
        recommendations.append(f"URGENT: {critical_count} items below safety stock - initiate emergency procurement")
    
    if reorder_count > 0:
        recommendations.append(f"{reorder_count} items need reordering - place orders this week")
    
    if excess_count > len(safety_stocks) * 0.3:
        recommendations.append("High excess inventory detected - review demand forecasts and reorder policies")
    
    recommendations.extend([
        "Implement automated reorder point monitoring",
        "Review safety stock levels quarterly",
        "Consider vendor-managed inventory for high-volume items"
    ])
    
    return recommendations

def optimize_procurement(suppliers: List[Any], sku_data: List[Any], emergency_mode: bool = False) -> Dict:
    """
    Optimize procurement decisions considering supplier reliability, MOQ, and costs
    """
    if not suppliers:
        return {"message": "No supplier data provided"}
    
    # Create procurement optimization model
    procurement_plan = create_procurement_model(suppliers, sku_data, emergency_mode)
    
    # Supplier allocation optimization
    supplier_allocation = optimize_supplier_allocation(suppliers, sku_data)
    
    # MOQ optimization
    moq_optimization = optimize_moq_decisions(suppliers, sku_data)
    
    # Risk assessment
    supply_risk_assessment = assess_supply_risks(suppliers, sku_data)
    
    return {
        'procurementPlan': procurement_plan,
        'supplierAllocation': supplier_allocation,
        'moqOptimization': moq_optimization,
        'riskAssessment': supply_risk_assessment,
        'totalProcurementCost': calculate_total_procurement_cost(procurement_plan),
        'recommendations': generate_procurement_recommendations(suppliers, emergency_mode)
    }

def create_procurement_model(suppliers: List[Any], sku_data: List[Any], emergency_mode: bool) -> Dict:
    """Create linear programming model for procurement optimization"""
    try:
        # Create LP model
        model = pulp.LpProblem("Procurement_Optimization", pulp.LpMinimize)
        
        # Decision variables: quantity to order from each supplier for each material
        order_vars = {}
        
        # Map SKUs to required materials (simplified mapping)
        material_requirements = calculate_material_requirements_for_skus(sku_data)
        
        # Create decision variables
        for supplier in suppliers:
            supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
            material_type = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
            
            order_vars[f"{supplier_id}_{material_type}"] = pulp.LpVariable(
                f"order_{supplier_id}_{material_type}", 
                lowBound=0, 
                cat='Integer'
            )
        
        # Objective function: minimize total cost
        total_cost = []
        
        for supplier in suppliers:
            supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
            material_type = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
            unit_price = supplier.unit_price if hasattr(supplier, 'unit_price') else 10.0
            
            var_key = f"{supplier_id}_{material_type}"
            if var_key in order_vars:
                # Base cost
                total_cost.append(order_vars[var_key] * unit_price)
                
                # Emergency premium
                if emergency_mode:
                    emergency_premium = unit_price * 0.2  # 20% emergency premium
                    total_cost.append(order_vars[var_key] * emergency_premium)
        
        model += pulp.lpSum(total_cost), "Total_Procurement_Cost"
        
        # Constraints
        
        # 1. Material demand constraints
        for material, required_qty in material_requirements.items():
            material_supply = []
            for supplier in suppliers:
                supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
                supplier_material = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
                
                if supplier_material == material:
                    var_key = f"{supplier_id}_{material}"
                    if var_key in order_vars:
                        material_supply.append(order_vars[var_key])
            
            if material_supply:
                model += pulp.lpSum(material_supply) >= required_qty
        
        # 2. MOQ constraints
        for supplier in suppliers:
            supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
            material_type = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
            moq = supplier.moq if hasattr(supplier, 'moq') else 100
            
            var_key = f"{supplier_id}_{material_type}"
            if var_key in order_vars:
                # Binary variable for ordering decision
                order_decision = pulp.LpVariable(f"decision_{supplier_id}_{material_type}", cat='Binary')
                
                # If we order, must be at least MOQ
                model += order_vars[var_key] >= moq * order_decision
                model += order_vars[var_key] <= 10000 * order_decision  # Upper bound
        
        # 3. Supplier reliability constraints (in emergency mode, prefer reliable suppliers)
        if emergency_mode:
            for supplier in suppliers:
                reliability = supplier.reliability_score if hasattr(supplier, 'reliability_score') else 0.8
                if reliability < 0.7:  # Penalize unreliable suppliers in emergency
                    supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
                    material_type = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
                    var_key = f"{supplier_id}_{material_type}"
                    
                    if var_key in order_vars:
                        # Limit orders from unreliable suppliers
                        model += order_vars[var_key] <= 500
        
        # Solve the model
        solver = pulp.PULP_CBC_CMD(msg=0)
        model.solve(solver)
        
        # Extract results
        procurement_orders = []
        total_cost_value = 0
        
        if model.status == pulp.LpStatusOptimal:
            for supplier in suppliers:
                supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
                material_type = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
                var_key = f"{supplier_id}_{material_type}"
                
                if var_key in order_vars:
                    order_qty = int(order_vars[var_key].varValue or 0)
                    if order_qty > 0:
                        unit_price = supplier.unit_price if hasattr(supplier, 'unit_price') else 10.0
                        order_cost = order_qty * unit_price
                        total_cost_value += order_cost
                        
                        procurement_orders.append({
                            'supplierId': supplier_id,
                            'materialType': material_type,
                            'orderQuantity': order_qty,
                            'unitPrice': unit_price,
                            'totalCost': order_cost,
                            'leadTime': getattr(supplier, 'lead_time_days', 7),
                            'reliability': getattr(supplier, 'reliability_score', 0.8)
                        })
            
            total_cost_value = model.objective.value()
        
        return {
            'status': pulp.LpStatus[model.status],
            'procurementOrders': procurement_orders,
            'totalCost': round(total_cost_value, 2),
            'emergencyMode': emergency_mode,
            'orderCount': len(procurement_orders)
        }
        
    except Exception as e:
        return {
            'status': 'Error',
            'message': str(e),
            'procurementOrders': [],
            'totalCost': 0
        }

def calculate_material_requirements_for_skus(sku_data: List[Any]) -> Dict[str, float]:
    """Calculate material requirements based on SKU demand"""
    material_requirements = {}
    
    # Simplified material mapping (would be more detailed in real implementation)
    sku_to_material = {
        'Snacks': {'flour': 0.6, 'oil': 0.2, 'seasoning': 0.1, 'packaging': 0.1},
        'Beverages': {'water': 0.8, 'concentrate': 0.15, 'packaging': 0.05},
        'Unknown': {'raw_material': 0.7, 'packaging': 0.3}
    }
    
    for sku in sku_data:
        actual_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
        category = getattr(sku, 'product_category', 'Unknown')
        
        if category in sku_to_material:
            materials = sku_to_material[category]
        else:
            materials = sku_to_material['Unknown']
        
        for material, ratio in materials.items():
            if material not in material_requirements:
                material_requirements[material] = 0
            material_requirements[material] += actual_demand * ratio
    
    return material_requirements

def optimize_supplier_allocation(suppliers: List[Any], sku_data: List[Any]) -> Dict:
    """Optimize allocation across suppliers"""
    if not suppliers:
        return {"message": "No suppliers available"}
    
    # Calculate supplier scores
    supplier_scores = []
    for supplier in suppliers:
        reliability = supplier.reliability_score if hasattr(supplier, 'reliability_score') else 0.8
        quality = supplier.quality_rating if hasattr(supplier, 'quality_rating') else 7.0
        price_score = 1 / (supplier.unit_price if hasattr(supplier, 'unit_price') else 10.0)
        lead_time_score = 1 / (supplier.lead_time_days if hasattr(supplier, 'lead_time_days') else 7)
        
        # Weighted scoring
        overall_score = (
            reliability * 0.3 +
            (quality / 10) * 0.25 +
            price_score * 0.25 +
            lead_time_score * 0.2
        )
        
        supplier_scores.append({
            'supplierId': supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001',
            'materialType': supplier.material_type if hasattr(supplier, 'material_type') else 'general',
            'overallScore': round(overall_score, 3),
            'reliability': reliability,
            'quality': quality,
            'unitPrice': supplier.unit_price if hasattr(supplier, 'unit_price') else 10.0,
            'leadTime': supplier.lead_time_days if hasattr(supplier, 'lead_time_days') else 7,
            'moq': supplier.moq if hasattr(supplier, 'moq') else 100
        })
    
    # Sort by score
    supplier_scores.sort(key=lambda x: x['overallScore'], reverse=True)
    
    # Allocation strategy
    primary_suppliers = supplier_scores[:2]  # Top 2 suppliers
    backup_suppliers = supplier_scores[2:4] if len(supplier_scores) > 2 else []
    
    return {
        'supplierRanking': supplier_scores,
        'primarySuppliers': primary_suppliers,
        'backupSuppliers': backup_suppliers,
        'allocationStrategy': '80-20 rule: 80% from primary, 20% from backup',
        'diversificationLevel': len(set(s['materialType'] for s in supplier_scores))
    }

def optimize_moq_decisions(suppliers: List[Any], sku_data: List[Any]) -> Dict:
    """Optimize MOQ decisions to minimize total cost"""
    moq_analysis = []
    
    # Calculate total material requirements
    material_requirements = calculate_material_requirements_for_skus(sku_data)
    
    for supplier in suppliers:
        supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
        material_type = supplier.material_type if hasattr(supplier, 'material_type') else 'general'
        moq = supplier.moq if hasattr(supplier, 'moq') else 100
        unit_price = supplier.unit_price if hasattr(supplier, 'unit_price') else 10.0
        
        required_qty = material_requirements.get(material_type, 0)
        
        if required_qty > 0:
            # Calculate optimal order quantity
            if required_qty <= moq:
                # Must order MOQ
                order_qty = moq
                excess_qty = moq - required_qty
                holding_cost = excess_qty * unit_price * 0.25  # 25% holding cost rate
            else:
                # Order exact requirement or round up to MOQ multiples
                moq_multiplier = np.ceil(required_qty / moq)
                order_qty = moq_multiplier * moq
                excess_qty = order_qty - required_qty
                holding_cost = excess_qty * unit_price * 0.25
            
            total_cost = order_qty * unit_price + holding_cost
            
            moq_analysis.append({
                'supplierId': supplier_id,
                'materialType': material_type,
                'requiredQty': required_qty,
                'moq': moq,
                'recommendedOrderQty': int(order_qty),
                'excessQty': int(excess_qty),
                'unitPrice': unit_price,
                'totalCost': round(total_cost, 2),
                'holdingCost': round(holding_cost, 2),
                'costEfficiency': round(required_qty / order_qty, 3)  # Efficiency ratio
            })
    
    # Sort by cost efficiency
    moq_analysis.sort(key=lambda x: x['costEfficiency'], reverse=True)
    
    return {
        'moqAnalysis': moq_analysis,
        'totalOptimalCost': sum(item['totalCost'] for item in moq_analysis),
        'totalExcessInventory': sum(item['excessQty'] for item in moq_analysis),
        'recommendations': generate_moq_recommendations(moq_analysis)
    }

def generate_moq_recommendations(moq_analysis: List[Dict]) -> List[str]:
    """Generate MOQ optimization recommendations"""
    recommendations = []
    
    high_excess_items = [item for item in moq_analysis if item['excessQty'] > item['requiredQty'] * 0.5]
    low_efficiency_items = [item for item in moq_analysis if item['costEfficiency'] < 0.7]
    
    if high_excess_items:
        recommendations.append(f"Negotiate lower MOQ with {len(high_excess_items)} suppliers to reduce excess inventory")
    
    if low_efficiency_items:
        recommendations.append(f"Review {len(low_efficiency_items)} suppliers with poor cost efficiency")
    
    recommendations.extend([
        "Consider consolidating orders to achieve better MOQ efficiency",
        "Explore group purchasing with other companies",
        "Implement vendor-managed inventory for high-volume materials"
    ])
    
    return recommendations

def assess_supply_risks(suppliers: List[Any], sku_data: List[Any]) -> Dict:
    """Assess supply chain risks"""
    risk_factors = []
    
    for supplier in suppliers:
        supplier_id = supplier.supplier_id if hasattr(supplier, 'supplier_id') else 'SUP001'
        reliability = supplier.reliability_score if hasattr(supplier, 'reliability_score') else 0.8
        lead_time = supplier.lead_time_days if hasattr(supplier, 'lead_time_days') else 7
        quality = supplier.quality_rating if hasattr(supplier, 'quality_rating') else 7.0
        
        # Risk scoring
        reliability_risk = 1 - reliability
        lead_time_risk = min(1.0, lead_time / 14)  # Normalize to 14 days max
        quality_risk = max(0, (7 - quality) / 7)  # Quality below 7 is risky
        
        overall_risk = (reliability_risk * 0.4 + lead_time_risk * 0.3 + quality_risk * 0.3)
        
        risk_level = 'High' if overall_risk > 0.6 else 'Medium' if overall_risk > 0.3 else 'Low'
        
        risk_factors.append({
            'supplierId': supplier_id,
            'materialType': supplier.material_type if hasattr(supplier, 'material_type') else 'general',
            'overallRisk': round(overall_risk, 3),
            'riskLevel': risk_level,
            'reliabilityRisk': round(reliability_risk, 3),
            'leadTimeRisk': round(lead_time_risk, 3),
            'qualityRisk': round(quality_risk, 3),
            'mitigationActions': generate_risk_mitigation_actions(overall_risk, supplier_id)
        })
    
    # Aggregate risk assessment
    high_risk_suppliers = [r for r in risk_factors if r['riskLevel'] == 'High']
    medium_risk_suppliers = [r for r in risk_factors if r['riskLevel'] == 'Medium']
    
    return {
        'riskFactors': risk_factors,
        'highRiskSuppliers': len(high_risk_suppliers),
        'mediumRiskSuppliers': len(medium_risk_suppliers),
        'overallRiskLevel': assess_overall_supply_risk(risk_factors),
        'criticalMaterials': identify_critical_materials(risk_factors, sku_data),
        'recommendations': generate_supply_risk_recommendations(risk_factors)
    }

def generate_risk_mitigation_actions(risk_score: float, supplier_id: str) -> List[str]:
    """Generate risk mitigation actions for suppliers"""
    actions = []
    
    if risk_score > 0.6:
        actions.extend([
            f"Develop alternative suppliers for {supplier_id}",
            "Increase safety stock for materials from this supplier",
            "Implement more frequent supplier audits"
        ])
    elif risk_score > 0.3:
        actions.extend([
            f"Monitor {supplier_id} performance closely",
            "Maintain backup supplier relationships",
            "Consider dual sourcing"
        ])
    else:
        actions.extend([
            f"Continue current relationship with {supplier_id}",
            "Standard monitoring procedures"
        ])
    
    return actions

def assess_overall_supply_risk(risk_factors: List[Dict]) -> str:
    """Assess overall supply chain risk level"""
    if not risk_factors:
        return 'Unknown'
    
    avg_risk = np.mean([r['overallRisk'] for r in risk_factors])
    high_risk_count = len([r for r in risk_factors if r['riskLevel'] == 'High'])
    
    if avg_risk > 0.6 or high_risk_count > len(risk_factors) * 0.3:
        return 'High'
    elif avg_risk > 0.3 or high_risk_count > 0:
        return 'Medium'
    else:
        return 'Low'

def identify_critical_materials(risk_factors: List[Dict], sku_data: List[Any]) -> List[str]:
    """Identify materials critical to production"""
    # Simplified - would be more complex in reality
    high_risk_materials = [r['materialType'] for r in risk_factors if r['riskLevel'] == 'High']
    
    # Materials used in high-demand SKUs
    high_demand_skus = [
        sku for sku in sku_data 
        if (sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)) > 50
    ]
    
    critical_materials = list(set(high_risk_materials))
    
    return critical_materials

def generate_supply_risk_recommendations(risk_factors: List[Dict]) -> List[str]:
    """Generate supply risk management recommendations"""
    recommendations = []
    
    high_risk_count = len([r for r in risk_factors if r['riskLevel'] == 'High'])
    
    if high_risk_count > 0:
        recommendations.append(f"URGENT: Address {high_risk_count} high-risk suppliers immediately")
    
    recommendations.extend([
        "Implement supplier diversity program",
        "Establish strategic safety stock for critical materials",
        "Develop supplier performance scorecards",
        "Create supply chain contingency plans",
        "Consider supply chain insurance for critical materials"
    ])
    
    return recommendations

def calculate_total_procurement_cost(procurement_plan: Dict) -> float:
    """Calculate total procurement cost"""
    if 'procurementOrders' not in procurement_plan:
        return 0.0
    
    return sum(order.get('totalCost', 0) for order in procurement_plan['procurementOrders'])

def generate_procurement_recommendations(suppliers: List[Any], emergency_mode: bool) -> List[str]:
    """Generate procurement strategy recommendations"""
    recommendations = []
    
    if emergency_mode:
        recommendations.extend([
            "Activate emergency procurement protocols",
            "Contact backup suppliers immediately",
            "Consider air freight for critical materials",
            "Implement daily supplier communication"
        ])
    else:
        recommendations.extend([
            "Maintain strategic supplier relationships",
            "Optimize order quantities for cost efficiency",
            "Monitor supplier performance continuously",
            "Plan procurement 4-6 weeks in advance"
        ])
    
    # Supplier-specific recommendations
    if suppliers:
        avg_reliability = np.mean([
            s.reliability_score if hasattr(s, 'reliability_score') else 0.8 
            for s in suppliers
        ])
        
        if avg_reliability < 0.8:
            recommendations.append("Improve supplier reliability through development programs")
        
        long_lead_time_suppliers = [
            s for s in suppliers 
            if (s.lead_time_days if hasattr(s, 'lead_time_days') else 7) > 10
        ]
        
        if long_lead_time_suppliers:
            recommendations.append(f"Work with {len(long_lead_time_suppliers)} suppliers to reduce lead times")
    
    return recommendations
