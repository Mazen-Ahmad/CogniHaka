import numpy as np
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

def generate_demand_forecast(sku_data: List[Any], festival_multiplier: float = 1.45) -> Dict:
    """
    Generate demand forecasts using multiple methods including festival surge prediction
    """
    if not sku_data:
        return {"message": "No SKU data provided"}
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            'sku': sku.sku if hasattr(sku, 'sku') else sku.get('sku', ''),
            'warehouse': sku.warehouse if hasattr(sku, 'warehouse') else sku.get('warehouse', 'Delhi'),
            'current_stock': sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0),
            'forecast_demand': sku.forecast_demand if hasattr(sku, 'forecast_demand') else sku.get('forecastDemand', 0),
            'actual_demand': sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0),
            'is_festival_sensitive': getattr(sku, 'is_festival_sensitive', False),
            'product_category': getattr(sku, 'product_category', 'Unknown')
        }
        for sku in sku_data
    ])
    
    # Generate time series forecasts
    base_forecasts = generate_base_forecasts(df)
    seasonal_adjustments = calculate_seasonal_patterns(df)
    festival_forecasts = apply_festival_surge(base_forecasts, df, festival_multiplier)
    
    # ML-based demand sensing
    ml_forecasts = machine_learning_forecast(df)
    
    # Ensemble forecast combining multiple methods
    ensemble_forecasts = create_ensemble_forecast(base_forecasts, festival_forecasts, ml_forecasts)
    
    # Calculate forecast confidence intervals
    confidence_intervals = calculate_forecast_confidence(df, ensemble_forecasts)
    
    return {
        "baseForecast": base_forecasts,
        "festivalAdjusted": festival_forecasts,
        "mlForecast": ml_forecasts,
        "ensembleForecast": ensemble_forecasts,
        "seasonalPatterns": seasonal_adjustments,
        "confidenceIntervals": confidence_intervals,
        "forecastAccuracy": calculate_forecast_accuracy(df),
        "demandVolatility": calculate_demand_volatility(df),
        "recommendations": generate_forecast_recommendations(df, ensemble_forecasts)
    }

def generate_base_forecasts(df: pd.DataFrame) -> List[Dict]:
    """Generate base forecasts using trend analysis"""
    forecasts = []
    
    for _, row in df.iterrows():
        # Simple trend analysis
        current_demand = row['actual_demand']
        forecast_demand = row['forecast_demand']
        
        # Calculate trend
        if forecast_demand > 0:
            trend_factor = current_demand / forecast_demand
        else:
            trend_factor = 1.0
        
        # Project next period demand
        next_period_base = current_demand * trend_factor
        
        # Apply smoothing
        smoothed_forecast = 0.7 * current_demand + 0.3 * forecast_demand
        
        forecasts.append({
            'sku': row['sku'],
            'warehouse': row['warehouse'],
            'baseForecast': round(smoothed_forecast, 0),
            'trendFactor': round(trend_factor, 3),
            'nextPeriodForecast': round(next_period_base, 0)
        })
    
    return forecasts

def calculate_seasonal_patterns(df: pd.DataFrame) -> Dict:
    """Calculate seasonal demand patterns"""
    # Simulate seasonal patterns based on product categories
    seasonal_factors = {
        'Snacks': {
            'Q1': 0.9, 'Q2': 1.1, 'Q3': 1.2, 'Q4': 0.8,
            'festival_boost': 1.5
        },
        'Beverages': {
            'Q1': 0.8, 'Q2': 1.3, 'Q3': 1.4, 'Q4': 0.5,
            'festival_boost': 1.2
        },
        'Unknown': {
            'Q1': 1.0, 'Q2': 1.0, 'Q3': 1.0, 'Q4': 1.0,
            'festival_boost': 1.3
        }
    }
    
    # Current quarter (assuming Q3 for September)
    current_quarter = 'Q3'
    
    patterns = {}
    for category in df['product_category'].unique():
        if category in seasonal_factors:
            patterns[category] = {
                'currentSeasonality': seasonal_factors[category][current_quarter],
                'festivalImpact': seasonal_factors[category]['festival_boost'],
                'yearlyPattern': seasonal_factors[category]
            }
        else:
            patterns[category] = patterns.get('Unknown', seasonal_factors['Unknown'])
    
    return {
        'patterns': patterns,
        'currentQuarter': current_quarter,
        'peakSeason': 'Q3',
        'lowSeason': 'Q4'
    }

def apply_festival_surge(base_forecasts: List[Dict], df: pd.DataFrame, festival_multiplier: float) -> List[Dict]:
    """Apply festival surge adjustments to base forecasts"""
    festival_forecasts = []
    
    for forecast in base_forecasts:
        sku_row = df[df['sku'] == forecast['sku']].iloc[0]
        is_festival_sensitive = sku_row['is_festival_sensitive']
        
        if is_festival_sensitive:
            festival_demand = forecast['baseForecast'] * festival_multiplier
            surge_factor = festival_multiplier
        else:
            # Non-festival sensitive products get minimal boost
            festival_demand = forecast['baseForecast'] * 1.1
            surge_factor = 1.1
        
        festival_forecasts.append({
            'sku': forecast['sku'],
            'warehouse': forecast['warehouse'],
            'festivalForecast': round(festival_demand, 0),
            'surgeFactor': round(surge_factor, 2),
            'isFestivalSensitive': is_festival_sensitive,
            'baseForecast': forecast['baseForecast']
        })
    
    return festival_forecasts

def machine_learning_forecast(df: pd.DataFrame) -> List[Dict]:
    """Generate ML-based forecasts using Random Forest"""
    ml_forecasts = []
    
    try:
        # Prepare features
        features = []
        targets = []
        
        for _, row in df.iterrows():
            # Create feature vector
            feature_vector = [
                row['current_stock'],
                row['forecast_demand'],
                1 if row['is_festival_sensitive'] else 0,
                hash(row['warehouse']) % 1000,  # Warehouse encoding
                hash(row['product_category']) % 1000  # Category encoding
            ]
            features.append(feature_vector)
            targets.append(row['actual_demand'])
        
        if len(features) > 2:  # Need minimum samples for ML
            X = np.array(features)
            y = np.array(targets)
            
            # Simple Random Forest model
            rf_model = RandomForestRegressor(n_estimators=10, random_state=42)
            rf_model.fit(X, y)
            
            # Generate predictions
            predictions = rf_model.predict(X)
            
            for i, (_, row) in enumerate(df.iterrows()):
                ml_forecasts.append({
                    'sku': row['sku'],
                    'warehouse': row['warehouse'],
                    'mlForecast': round(max(0, predictions[i]), 0),
                    'confidence': round(min(0.95, max(0.6, 1 - abs(predictions[i] - targets[i]) / max(1, targets[i]))), 2)
                })
        else:
            # Fallback for insufficient data
            for _, row in df.iterrows():
                ml_forecasts.append({
                    'sku': row['sku'],
                    'warehouse': row['warehouse'],
                    'mlForecast': row['actual_demand'],
                    'confidence': 0.7
                })
    
    except Exception as e:
        # Fallback on error
        for _, row in df.iterrows():
            ml_forecasts.append({
                'sku': row['sku'],
                'warehouse': row['warehouse'],
                'mlForecast': row['actual_demand'],
                'confidence': 0.5
            })
    
    return ml_forecasts

def create_ensemble_forecast(base_forecasts: List[Dict], festival_forecasts: List[Dict], ml_forecasts: List[Dict]) -> List[Dict]:
    """Create ensemble forecast combining multiple methods"""
    ensemble_forecasts = []
    
    # Create lookup dictionaries
    festival_dict = {f['sku']: f for f in festival_forecasts}
    ml_dict = {f['sku']: f for f in ml_forecasts}
    
    for base in base_forecasts:
        sku = base['sku']
        
        # Get corresponding forecasts
        festival = festival_dict.get(sku, {})
        ml = ml_dict.get(sku, {})
        
        # Weighted ensemble
        base_weight = 0.3
        festival_weight = 0.4
        ml_weight = 0.3
        
        base_val = base.get('baseForecast', 0)
        festival_val = festival.get('festivalForecast', base_val)
        ml_val = ml.get('mlForecast', base_val)
        
        ensemble_value = (
            base_val * base_weight +
            festival_val * festival_weight +
            ml_val * ml_weight
        )
        
        ensemble_forecasts.append({
            'sku': sku,
            'warehouse': base['warehouse'],
            'ensembleForecast': round(ensemble_value, 0),
            'baseWeight': base_weight,
            'festivalWeight': festival_weight,
            'mlWeight': ml_weight,
            'components': {
                'base': base_val,
                'festival': festival_val,
                'ml': ml_val
            }
        })
    
    return ensemble_forecasts

def calculate_forecast_confidence(df: pd.DataFrame, ensemble_forecasts: List[Dict]) -> List[Dict]:
    """Calculate confidence intervals for forecasts"""
    confidence_intervals = []
    
    # Calculate historical forecast errors
    df['forecast_error'] = abs(df['forecast_demand'] - df['actual_demand'])
    df['mape'] = df['forecast_error'] / np.maximum(df['actual_demand'], 1) * 100
    
    overall_mape = df['mape'].mean()
    
    for forecast in ensemble_forecasts:
        sku = forecast['sku']
        forecast_value = forecast['ensembleForecast']
        
        # Calculate confidence based on historical accuracy
        sku_row = df[df['sku'] == sku]
        if not sku_row.empty:
            sku_mape = sku_row['mape'].iloc[0]
        else:
            sku_mape = overall_mape
        
        # Confidence interval (assuming normal distribution)
        error_margin = forecast_value * (sku_mape / 100) * 1.96  # 95% CI
        
        confidence_intervals.append({
            'sku': sku,
            'forecast': forecast_value,
            'upperBound': round(forecast_value + error_margin, 0),
            'lowerBound': round(max(0, forecast_value - error_margin), 0),
            'confidenceLevel': round(max(0.5, 1 - sku_mape / 100), 2),
            'mape': round(sku_mape, 2)
        })
    
    return confidence_intervals

def calculate_forecast_accuracy(df: pd.DataFrame) -> Dict:
    """Calculate various forecast accuracy metrics"""
    if df.empty or (df['forecast_demand'] == 0).all():
        return {"message": "No valid forecast data"}
    
    # Calculate accuracy metrics
    df['abs_error'] = abs(df['forecast_demand'] - df['actual_demand'])
    df['percent_error'] = df['abs_error'] / np.maximum(df['actual_demand'], 1) * 100
    df['squared_error'] = (df['forecast_demand'] - df['actual_demand']) ** 2
    
    mae = df['abs_error'].mean()
    mape = df['percent_error'].mean()
    rmse = np.sqrt(df['squared_error'].mean())
    
    # Bias calculation
    bias = (df['forecast_demand'] - df['actual_demand']).mean()
    
    return {
        'mae': round(mae, 2),
        'mape': round(mape, 2),
        'rmse': round(rmse, 2),
        'bias': round(bias, 2),
        'accuracy': round(max(0, 100 - mape), 2),
        'forecastQuality': 'Excellent' if mape < 10 else 'Good' if mape < 20 else 'Fair' if mape < 30 else 'Poor'
    }

def calculate_demand_volatility(df: pd.DataFrame) -> Dict:
    """Calculate demand volatility metrics"""
    if df.empty:
        return {"message": "No data available"}
    
    # Calculate coefficient of variation
    df['demand_cv'] = abs(df['forecast_demand'] - df['actual_demand']) / np.maximum(df['forecast_demand'], 1)
    
    volatility_stats = {
        'averageVolatility': round(df['demand_cv'].mean(), 3),
        'maxVolatility': round(df['demand_cv'].max(), 3),
        'minVolatility': round(df['demand_cv'].min(), 3),
        'volatileProducts': df[df['demand_cv'] > 0.3]['sku'].tolist(),
        'stableProducts': df[df['demand_cv'] < 0.1]['sku'].tolist(),
        'volatilityDistribution': {
            'low': len(df[df['demand_cv'] < 0.1]),
            'medium': len(df[(df['demand_cv'] >= 0.1) & (df['demand_cv'] < 0.3)]),
            'high': len(df[df['demand_cv'] >= 0.3])
        }
    }
    
    return volatility_stats

def generate_forecast_recommendations(df: pd.DataFrame, ensemble_forecasts: List[Dict]) -> List[str]:
    """Generate actionable forecasting recommendations"""
    recommendations = []
    
    # Accuracy recommendations
    df['forecast_error'] = abs(df['forecast_demand'] - df['actual_demand'])
    high_error_count = len(df[df['forecast_error'] > df['actual_demand'] * 0.3])
    
    if high_error_count > len(df) * 0.3:
        recommendations.append("Implement advanced forecasting algorithms - high forecast errors detected")
    
    # Volatility recommendations
    df['demand_cv'] = abs(df['forecast_demand'] - df['actual_demand']) / np.maximum(df['forecast_demand'], 1)
    volatile_count = len(df[df['demand_cv'] > 0.3])
    
    if volatile_count > 0:
        recommendations.append(f"Implement demand sensing for {volatile_count} high-volatility products")
    
    # Festival recommendations
    festival_sensitive_count = len(df[df['is_festival_sensitive'] == True])
    if festival_sensitive_count > 0:
        recommendations.append(f"Activate festival planning for {festival_sensitive_count} sensitive products")
    
    # Data quality recommendations
    zero_demand_count = len(df[df['actual_demand'] == 0])
    if zero_demand_count > 0:
        recommendations.append("Review data quality - zero demand values detected")
    
    # General recommendations
    recommendations.extend([
        "Implement collaborative forecasting with sales teams",
        "Consider external factors (weather, events) in forecasting",
        "Establish forecast review and adjustment processes",
        "Monitor forecast accuracy KPIs weekly"
    ])
    
    return recommendations

def plan_festival_demand(sku_data: List[Any], festival_multiplier: float, production_constraints: List[Any]) -> Dict:
    """
    Comprehensive festival demand planning
    """
    # Generate festival-specific forecasts
    festival_forecasts = generate_demand_forecast(sku_data, festival_multiplier)
    
    # Calculate production requirements
    production_requirements = calculate_festival_production_needs(sku_data, festival_multiplier, production_constraints)
    
    # Inventory buildup strategy
    inventory_strategy = plan_inventory_buildup(sku_data, festival_multiplier)
    
    # Material requirements
    material_requirements = calculate_material_requirements(sku_data, festival_multiplier)
    
    # Timeline planning
    execution_timeline = create_festival_timeline(sku_data, festival_multiplier)
    
    return {
        "demand_forecast": festival_forecasts,
        "production_plan": production_requirements,
        "inventory_strategy": inventory_strategy,
        "subcontracting": assess_subcontracting_needs(production_requirements),
        "raw_materials": material_requirements,
        "execution_timeline": execution_timeline
    }

def calculate_festival_production_needs(sku_data: List[Any], festival_multiplier: float, production_constraints: List[Any]) -> Dict:
    """Calculate production needs for festival demand"""
    total_capacity = sum(
        (c.weekly_capacity if hasattr(c, 'weekly_capacity') else 100) 
        for c in production_constraints
    ) if production_constraints else 200
    
    production_needs = []
    total_festival_demand = 0
    
    for sku in sku_data:
        base_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
        is_festival_sensitive = getattr(sku, 'is_festival_sensitive', False)
        
        if is_festival_sensitive:
            festival_demand = base_demand * festival_multiplier
        else:
            festival_demand = base_demand * 1.1
        
        total_festival_demand += festival_demand
        
        production_needs.append({
            'sku': sku.sku if hasattr(sku, 'sku') else sku.get('sku', ''),
            'baseDemand': base_demand,
            'festivalDemand': round(festival_demand, 0),
            'additionalProduction': round(festival_demand - base_demand, 0),
            'isFestivalSensitive': is_festival_sensitive
        })
    
    capacity_utilization = (total_festival_demand / total_capacity) * 100 if total_capacity > 0 else 0
    
    return {
        'productionNeeds': production_needs,
        'totalFestivalDemand': round(total_festival_demand, 0),
        'totalCapacity': total_capacity,
        'capacityUtilization': round(capacity_utilization, 2),
        'capacityShortfall': max(0, total_festival_demand - total_capacity),
        'recommendedActions': generate_capacity_actions(capacity_utilization, total_festival_demand, total_capacity)
    }

def plan_inventory_buildup(sku_data: List[Any], festival_multiplier: float) -> Dict:
    """Plan inventory buildup strategy for festival"""
    buildup_plan = []
    
    for sku in sku_data:
        current_stock = sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0)
        base_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
        is_festival_sensitive = getattr(sku, 'is_festival_sensitive', False)
        
        if is_festival_sensitive:
            festival_demand = base_demand * festival_multiplier
            safety_buffer = festival_demand * 0.2  # 20% safety buffer
        else:
            festival_demand = base_demand * 1.1
            safety_buffer = festival_demand * 0.1  # 10% safety buffer
        
        required_inventory = festival_demand + safety_buffer
        inventory_gap = max(0, required_inventory - current_stock)
        
        buildup_plan.append({
            'sku': sku.sku if hasattr(sku, 'sku') else sku.get('sku', ''),
            'currentStock': current_stock,
            'festivalDemand': round(festival_demand, 0),
            'requiredInventory': round(required_inventory, 0),
            'inventoryGap': round(inventory_gap, 0),
            'buildupWeeks': 4 if is_festival_sensitive else 2,
            'weeklyBuildupTarget': round(inventory_gap / (4 if is_festival_sensitive else 2), 0) if inventory_gap > 0 else 0
        })
    
    return {
        'buildupPlan': buildup_plan,
        'totalInventoryGap': sum(item['inventoryGap'] for item in buildup_plan),
        'highPriorityItems': [item for item in buildup_plan if item['inventoryGap'] > item['festivalDemand'] * 0.5],
        'timelineRecommendation': "Start inventory buildup 4-6 weeks before festival"
    }

def calculate_material_requirements(sku_data: List[Any], festival_multiplier: float) -> Dict:
    """Calculate raw material requirements for festival production"""
    # Simplified material requirements (would be more complex in reality)
    material_map = {
        'Snacks': {'flour': 0.6, 'oil': 0.2, 'seasoning': 0.1},
        'Beverages': {'water': 0.8, 'concentrate': 0.15, 'packaging': 0.05},
        'Unknown': {'raw_material': 0.5, 'packaging': 0.3}
    }
    
    material_requirements = {}
    
    for sku in sku_data:
        base_demand = sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0)
        category = getattr(sku, 'product_category', 'Unknown')
        is_festival_sensitive = getattr(sku, 'is_festival_sensitive', False)
        
        festival_demand = base_demand * (festival_multiplier if is_festival_sensitive else 1.1)
        
        if category in material_map:
            materials = material_map[category]
        else:
            materials = material_map['Unknown']
        
        for material, ratio in materials.items():
            if material not in material_requirements:
                material_requirements[material] = 0
            material_requirements[material] += festival_demand * ratio
    
    return {
        'materialRequirements': {k: round(v, 0) for k, v in material_requirements.items()},
        'procurementLead': "2-3 weeks for critical materials",
        'supplierActivation': "Activate backup suppliers for peak demand",
        'inventoryBuffer': "Maintain 15% buffer for critical materials"
    }

def create_festival_timeline(sku_data: List[Any], festival_multiplier: float) -> List[Dict]:
    """Create festival preparation timeline"""
    timeline = [
        {
            'week': -6,
            'phase': 'Planning',
            'activities': [
                'Finalize demand forecasts',
                'Confirm supplier commitments',
                'Review production capacity'
            ],
            'priority': 'High'
        },
        {
            'week': -5,
            'phase': 'Procurement',
            'activities': [
                'Place raw material orders',
                'Activate backup suppliers',
                'Schedule material deliveries'
            ],
            'priority': 'Critical'
        },
        {
            'week': -4,
            'phase': 'Production Ramp-up',
            'activities': [
                'Start inventory buildup',
                'Increase production shifts',
                'Monitor quality metrics'
            ],
            'priority': 'High'
        },
        {
            'week': -3,
            'phase': 'Inventory Build',
            'activities': [
                'Continue production scaling',
                'Monitor stock levels',
                'Prepare distribution centers'
            ],
            'priority': 'High'
        },
        {
            'week': -2,
            'phase': 'Final Preparations',
            'activities': [
                'Complete inventory targets',
                'Pre-position stock',
                'Activate contingency plans'
            ],
            'priority': 'Critical'
        },
        {
            'week': -1,
            'phase': 'Pre-Festival',
            'activities': [
                'Final stock verification',
                'Distribution readiness',
                'Monitor early demand signals'
            ],
            'priority': 'Critical'
        },
        {
            'week': 0,
            'phase': 'Festival Period',
            'activities': [
                'Real-time demand monitoring',
                'Emergency replenishment',
                'Performance tracking'
            ],
            'priority': 'Critical'
        }
    ]
    
    return timeline

def assess_subcontracting_needs(production_requirements: Dict) -> Dict:
    """Assess subcontracting requirements"""
    capacity_shortfall = production_requirements.get('capacityShortfall', 0)
    
    if capacity_shortfall > 0:
        subcontracting_recommendations = {
            'isRequired': True,
            'shortfallVolume': capacity_shortfall,
            'recommendedPartners': ['Partner A', 'Partner B', 'Partner C'],
            'leadTimeRequired': '3-4 weeks',
            'qualityChecks': 'Enhanced QC protocols required',
            'costImpact': f'Estimated 15-20% cost increase for {capacity_shortfall} units'
        }
    else:
        subcontracting_recommendations = {
            'isRequired': False,
            'message': 'Internal capacity sufficient for festival demand',
            'contingencyPlan': 'Keep subcontractors on standby'
        }
    
    return subcontracting_recommendations

def generate_capacity_actions(utilization: float, demand: float, capacity: float) -> List[str]:
    """Generate capacity management actions"""
    actions = []
    
    if utilization > 100:
        actions.extend([
            'Immediate subcontracting required',
            'Consider emergency capacity expansion',
            'Activate all available production lines'
        ])
    elif utilization > 85:
        actions.extend([
            'Prepare subcontracting agreements',
            'Optimize production schedules',
            'Monitor capacity closely'
        ])
    else:
        actions.extend([
            'Internal capacity sufficient',
            'Maintain production flexibility',
            'Monitor demand changes'
        ])
    
    return actions
