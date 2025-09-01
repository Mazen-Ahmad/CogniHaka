import numpy as np
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta

# ----------- LOAD BALANCER ANALYZER (UNCHANGED) ----------- #
def analyze_orders(orders, stations: int):
    """
    Analyze packing orders before running optimizer.
    Returns summary stats for visualization, including imbalance %.
    """
    # --- FIX: Handle empty or invalid input gracefully ---
    if not orders or stations <= 0:
        return {
            "totalOrders": 0,
            "totalTime": 0,
            "avgLoadPerStation": 0,
            "maxOrderTime": 0,
            "stationLoadSummary": [],
            "imbalancePercent": 0,
            "insight": "No order data provided or invalid number of stations."
        }

    df = pd.DataFrame(orders)
    
    # Ensure packingTime column exists and is numeric
    if "packingTime" not in df.columns:
        return {
            "totalOrders": 0, "totalTime": 0, "avgLoadPerStation": 0, "maxOrderTime": 0,
            "stationLoadSummary": [], "imbalancePercent": 0,
            "insight": "CSV must include a 'packingTime' column."
        }

    df["packingTime"] = pd.to_numeric(df["packingTime"], errors='coerce').fillna(0)
    total_time = df["packingTime"].sum()
    avg_load = total_time / stations
    max_order = df["packingTime"].max()

    # Random distribution baseline (before optimization)
    random_loads = np.random.choice(range(1, stations + 1), size=len(df))
    df["assignedStation"] = random_loads

    station_summary = (
        df.groupby("assignedStation")
        .agg(totalTime=("packingTime", "sum"), orders=("id", lambda x: list(x)))
        .reset_index()
        .rename(columns={"assignedStation": "station"})
        .to_dict(orient="records")
    )

    assignments = df[["id", "packingTime", "assignedStation"]].to_dict(orient="records")

    # Compute imbalance %
    station_totals = [s["totalTime"] for s in station_summary]
    if station_totals:
        imbalance = round(
            (max(station_totals) - min(station_totals)) / avg_load * 100, 2
        )
    else:
        imbalance = 0.0

    return {
        "totalOrders": len(orders),
        "totalTime": float(total_time),
        "avgLoadPerStation": float(avg_load),
        "maxOrderTime": float(max_order),
        "stationLoadSummary": station_summary,
        "assignments": assignments,
        "imbalancePercent": imbalance,
        "insight": f"Expected bottleneck: station(s) above {avg_load:.2f} mins avg load."
    }

# ----------- ENHANCED INVENTORY ANALYZER ----------- #
def analyze_inventory(skuData: List[Any]) -> Dict:
    """
    Enhanced inventory analysis with supply chain intelligence
    """
    if not skuData:
        return {
            "totalForecastDemand": 0, "totalActualDemand": 0, "totalStock": 0,
            "forecastAccuracy": 0, "criticalShortages": [], "excessInventory": [],
            "warehousePerformance": {}, "categoryAnalysis": {},
            "insight": "No SKU data provided."
        }

    # Convert to DataFrame for analysis
    df = pd.DataFrame([
        {
            'sku': sku.sku if hasattr(sku, 'sku') else sku.get('sku', ''),
            'warehouse': sku.warehouse if hasattr(sku, 'warehouse') else sku.get('warehouse', 'Unknown'),
            'product_category': sku.product_category if hasattr(sku, 'product_category') else sku.get('product_category', 'Unknown'),
            'current_stock': sku.current_stock if hasattr(sku, 'current_stock') else sku.get('stock', 0),
            'forecast_demand': sku.forecast_demand if hasattr(sku, 'forecast_demand') else sku.get('forecastDemand', 0),
            'actual_demand': sku.actual_demand if hasattr(sku, 'actual_demand') else sku.get('actualDemand', 0),
            'production_capacity': getattr(sku, 'production_capacity', 0),
            'is_festival_sensitive': getattr(sku, 'is_festival_sensitive', False)
        }
        for sku in skuData
    ])

    # Basic metrics
    total_forecast = df["forecast_demand"].sum()
    total_actual = df["actual_demand"].sum()
    total_stock = df["current_stock"].sum()

    # Forecast accuracy calculation
    df["forecast_error"] = abs(df["forecast_demand"] - df["actual_demand"])
    forecast_accuracy = round(100 * (1 - df["forecast_error"].sum() / total_forecast), 2) if total_forecast > 0 else 100.0

    # Advanced analytics
    warehouse_performance = analyze_warehouse_performance(df)
    category_analysis = analyze_category_performance(df)
    shortage_analysis = identify_critical_shortages(df)
    excess_analysis = identify_excess_inventory(df)
    demand_variability = calculate_demand_variability(df)
    
    # ABC Classification
    abc_classification = perform_abc_analysis(df)
    
    # Service level analysis
    service_levels = calculate_service_levels(df)

    return {
        "totalForecastDemand": int(total_forecast),
        "totalActualDemand": int(total_actual),
        "totalStock": int(total_stock),
        "forecastAccuracy": forecast_accuracy,
        "criticalShortages": shortage_analysis,
        "excessInventory": excess_analysis,
        "warehousePerformance": warehouse_performance,
        "categoryAnalysis": category_analysis,
        "demandVariability": demand_variability,
        "abcClassification": abc_classification,
        "serviceLevels": service_levels,
        "stockRotation": calculate_stock_rotation(df),
        "capacityUtilization": calculate_capacity_utilization(df),
        "insight": generate_strategic_insights(df, forecast_accuracy)
    }

def analyze_warehouse_performance(df: pd.DataFrame) -> Dict:
    """Analyze performance by warehouse"""
    warehouse_stats = df.groupby('warehouse').agg({
        'current_stock': 'sum',
        'forecast_demand': 'sum',
        'actual_demand': 'sum',
        'forecast_error': 'sum'
    }).reset_index()
    
    warehouse_stats['stock_coverage'] = (
        warehouse_stats['current_stock'] / warehouse_stats['actual_demand']
    ).round(2)
    
    warehouse_stats['forecast_accuracy'] = (
        100 * (1 - warehouse_stats['forecast_error'] / warehouse_stats['forecast_demand'])
    ).round(2)
    
    return warehouse_stats.to_dict('records')

def analyze_category_performance(df: pd.DataFrame) -> Dict:
    """Analyze performance by product category"""
    category_stats = df.groupby('product_category').agg({
        'current_stock': 'sum',
        'forecast_demand': 'sum',
        'actual_demand': 'sum',
        'production_capacity': 'sum'
    }).reset_index()
    
    category_stats['capacity_utilization'] = (
        category_stats['actual_demand'] / category_stats['production_capacity'] * 100
    ).round(2)
    
    return category_stats.to_dict('records')

def identify_critical_shortages(df: pd.DataFrame) -> List[Dict]:
    """Identify products with critical shortages"""
    shortage_threshold = 0.2  # 20% of demand
    critical = df[df['current_stock'] < df['actual_demand'] * shortage_threshold]
    
    return critical[['sku', 'warehouse', 'current_stock', 'actual_demand']].to_dict('records')

def identify_excess_inventory(df: pd.DataFrame) -> List[Dict]:
    """Identify products with excess inventory"""
    excess_threshold = 2.0  # 200% of demand
    excess = df[df['current_stock'] > df['actual_demand'] * excess_threshold]
    
    return excess[['sku', 'warehouse', 'current_stock', 'actual_demand']].to_dict('records')

def calculate_demand_variability(df: pd.DataFrame) -> Dict:
    """Calculate demand variability metrics"""
    df['demand_variance'] = abs(df['forecast_demand'] - df['actual_demand'])
    df['cv'] = df['demand_variance'] / df['forecast_demand']  # Coefficient of variation
    
    return {
        'averageVariability': df['cv'].mean().round(4),
        'highVariabilityProducts': df[df['cv'] > 0.3]['sku'].tolist(),
        'stableProducts': df[df['cv'] < 0.1]['sku'].tolist()
    }

def perform_abc_analysis(df: pd.DataFrame) -> Dict:
    """Perform ABC analysis based on demand value"""
    df['demand_value'] = df['actual_demand'] * 100  # Assuming unit value
    df_sorted = df.sort_values('demand_value', ascending=False)
    
    total_value = df_sorted['demand_value'].sum()
    df_sorted['cumulative_value'] = df_sorted['demand_value'].cumsum()
    df_sorted['cumulative_percentage'] = (df_sorted['cumulative_value'] / total_value * 100).round(2)
    
    # Classify items
    df_sorted['abc_class'] = 'C'
    df_sorted.loc[df_sorted['cumulative_percentage'] <= 80, 'abc_class'] = 'A'
    df_sorted.loc[(df_sorted['cumulative_percentage'] > 80) & (df_sorted['cumulative_percentage'] <= 95), 'abc_class'] = 'B'
    
    abc_summary = df_sorted.groupby('abc_class').agg({
        'sku': 'count',
        'demand_value': 'sum'
    }).reset_index()
    
    return {
        'classification': df_sorted[['sku', 'abc_class', 'cumulative_percentage']].to_dict('records'),
        'summary': abc_summary.to_dict('records')
    }

def calculate_service_levels(df: pd.DataFrame) -> Dict:
    """Calculate service levels by warehouse and category"""
    df['service_level'] = np.minimum(df['current_stock'] / df['actual_demand'], 1.0) * 100
    
    warehouse_service = df.groupby('warehouse')['service_level'].mean().round(2).to_dict()
    category_service = df.groupby('product_category')['service_level'].mean().round(2).to_dict()
    
    return {
        'byWarehouse': warehouse_service,
        'byCategory': category_service,
        'overall': df['service_level'].mean().round(2)
    }

def calculate_stock_rotation(df: pd.DataFrame) -> Dict:
    """Calculate stock rotation metrics"""
    df['stock_turns'] = df['actual_demand'] / df['current_stock']
    df['days_of_stock'] = 365 / df['stock_turns']
    
    return {
        'averageStockTurns': df['stock_turns'].mean().round(2),
        'averageDaysOfStock': df['days_of_stock'].mean().round(0),
        'slowMovingProducts': df[df['days_of_stock'] > 180]['sku'].tolist()
    }

def calculate_capacity_utilization(df: pd.DataFrame) -> Dict:
    """Calculate production capacity utilization"""
    total_capacity = df['production_capacity'].sum()
    total_demand = df['actual_demand'].sum()
    
    utilization = (total_demand / total_capacity * 100) if total_capacity > 0 else 0
    
    return {
        'overallUtilization': round(utilization, 2),
        'underUtilizedCapacity': max(0, total_capacity - total_demand),
        'capacityConstraints': df[df['actual_demand'] > df['production_capacity']]['sku'].tolist()
    }

def generate_strategic_insights(df: pd.DataFrame, forecast_accuracy: float) -> List[str]:
    """Generate strategic insights from the analysis"""
    insights = []
    
    # Forecast accuracy insights
    if forecast_accuracy < 70:
        insights.append("Poor forecast accuracy detected. Consider implementing advanced forecasting methods.")
    elif forecast_accuracy > 90:
        insights.append("Excellent forecast accuracy. Current forecasting methods are performing well.")
    
    # Capacity insights
    capacity_constrained = len(df[df['actual_demand'] > df['production_capacity']])
    if capacity_constrained > 0:
        insights.append(f"{capacity_constrained} products facing capacity constraints. Consider production optimization.")
    
    # Stock insights
    shortage_count = len(df[df['current_stock'] < df['actual_demand'] * 0.5])
    if shortage_count > 0:
        insights.append(f"{shortage_count} products at risk of stockout. Implement safety stock policies.")
    
    # Warehouse insights
    mumbai_performance = df[df['warehouse'] == 'Mumbai']
    if len(mumbai_performance) > 0 and (mumbai_performance['current_stock'] < mumbai_performance['actual_demand']).any():
        insights.append("Mumbai warehouse showing stock shortage patterns. Consider inventory redistribution.")
    
    return insights

def analyze_supplier_performance(suppliers: List[Any]) -> Dict:
    """Analyze supplier performance and reliability"""
    if not suppliers:
        return {"message": "No supplier data provided"}
    
    supplier_df = pd.DataFrame([
        {
            'supplier_id': s.supplier_id,
            'material_type': s.material_type,
            'reliability_score': s.reliability_score,
            'lead_time_days': s.lead_time_days,
            'moq': s.moq,
            'unit_price': s.unit_price,
            'quality_rating': s.quality_rating
        }
        for s in suppliers
    ])
    
    # Calculate supplier rankings
    supplier_df['overall_score'] = (
        supplier_df['reliability_score'] * 0.4 +
        (supplier_df['quality_rating'] / 10) * 0.3 +
        (1 / supplier_df['lead_time_days']) * 0.2 +
        (1 / supplier_df['unit_price']) * 0.1
    )
    
    # Identify problematic suppliers
    unreliable_suppliers = supplier_df[supplier_df['reliability_score'] < 0.8]
    high_lead_time = supplier_df[supplier_df['lead_time_days'] > 14]
    
    return {
        'supplierRankings': supplier_df.sort_values('overall_score', ascending=False).to_dict('records'),
        'unreliableSuppliers': unreliable_suppliers['supplier_id'].tolist(),
        'highLeadTimeSuppliers': high_lead_time['supplier_id'].tolist(),
        'averageReliability': supplier_df['reliability_score'].mean().round(3),
        'averageLeadTime': supplier_df['lead_time_days'].mean().round(1),
        'recommendations': generate_supplier_recommendations(supplier_df)
    }

def generate_supplier_recommendations(supplier_df: pd.DataFrame) -> List[str]:
    """Generate supplier management recommendations"""
    recommendations = []
    
    low_reliability = supplier_df[supplier_df['reliability_score'] < 0.8]
    if len(low_reliability) > 0:
        recommendations.append("Develop alternate suppliers for unreliable partners")
    
    high_moq = supplier_df[supplier_df['moq'] > 1000]
    if len(high_moq) > 0:
        recommendations.append("Negotiate lower MOQ with high-volume suppliers")
    
    recommendations.append("Implement supplier scorecards for continuous monitoring")
    recommendations.append("Consider long-term contracts with top-performing suppliers")
    
    return recommendations
