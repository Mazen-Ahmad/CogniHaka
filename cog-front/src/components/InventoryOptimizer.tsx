import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Upload, Download, TrendingUp, Plus, Minus, 
  Factory, Truck, AlertTriangle, Calendar, Target, Settings 
} from 'lucide-react';
import CSVUpload from './shared/CSVUpload';
import InventoryChart from './charts/InventoryChart';
import DemandChart from './charts/DemandChart';
import InsightsCard from './shared/InsightsCard';
import ResultsTable from './shared/ResultsTable';

interface EnhancedInventoryData {
  sku: string;
  warehouse: string;
  product_category: string;
  current_stock: number;
  forecast_demand: number;
  actual_demand: number;
  production_capacity: number;
  unit_cost: number;
  holding_cost_rate: number;
  stockout_penalty: number;
  lead_time_days: number;
  shelf_life_days: number;
  is_festival_sensitive: boolean;
}

interface ProductionConstraint {
  factory_location: string;
  weekly_capacity: number;
  efficiency_rate: number;
  production_cost_per_unit: number;
}

interface Supplier {
  supplier_id: string;
  material_type: string;
  reliability_score: number;
  lead_time_days: number;
  moq: number;
  unit_price: number;
  quality_rating: number;
}

const InventoryOptimizer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'csv' | 'manual'>('csv');
  const [activeTab, setActiveTab] = useState<'inventory' | 'production' | 'suppliers' | 'festival'>('inventory');
  
  // Enhanced inventory data
  const [inventoryData, setInventoryData] = useState<EnhancedInventoryData[]>([
    {
      sku: 'PC001', warehouse: 'Delhi', product_category: 'Snacks',
      current_stock: 10, forecast_demand: 40, actual_demand: 60,
      production_capacity: 30, unit_cost: 15.50, holding_cost_rate: 0.25,
      stockout_penalty: 50.0, lead_time_days: 7, shelf_life_days: 90,
      is_festival_sensitive: true
    },
    {
      sku: 'NC001', warehouse: 'Mumbai', product_category: 'Snacks',
      current_stock: 25, forecast_demand: 25, actual_demand: 20,
      production_capacity: 25, unit_cost: 18.20, holding_cost_rate: 0.25,
      stockout_penalty: 45.0, lead_time_days: 5, shelf_life_days: 120,
      is_festival_sensitive: false
    }
  ]);

  // Production constraints
  const [productionConstraints, setProductionConstraints] = useState<ProductionConstraint[]>([
    {
      factory_location: 'Delhi',
      weekly_capacity: 100,
      efficiency_rate: 0.85,
      production_cost_per_unit: 12.30
    },
    {
      factory_location: 'Pune',
      weekly_capacity: 80,
      efficiency_rate: 0.90,
      production_cost_per_unit: 11.90
    }
  ]);

  // Suppliers data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      supplier_id: 'SUP001',
      material_type: 'flour',
      reliability_score: 0.92,
      lead_time_days: 5,
      moq: 500,
      unit_price: 2.50,
      quality_rating: 8.5
    },
    {
      supplier_id: 'SUP002',
      material_type: 'oil',
      reliability_score: 0.78,
      lead_time_days: 8,
      moq: 200,
      unit_price: 5.80,
      quality_rating: 7.2
    }
  ]);

  // Analysis and optimization states
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [festivalPlan, setFestivalPlan] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Festival settings
  const [festivalMultiplier, setFestivalMultiplier] = useState(1.45);
  const [serviceLevelTarget, setServiceLevelTarget] = useState(0.95);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisData(null);
    setOptimizedData(null);
    // Parse CSV and populate inventoryData
    parseCSVFile(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const parsedData: EnhancedInventoryData[] = [];
      for (let i = 1; i < lines.length && i < 10; i++) { // Limit to 10 rows for demo
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
          parsedData.push({
            sku: values[0] || `SKU-${i}`,
            warehouse: values[1] || 'Delhi',
            product_category: values[2] || 'Snacks',
            current_stock: parseInt(values[3]) || 0,
            forecast_demand: parseInt(values[4]) || 0,
            actual_demand: parseInt(values[5]) || 0,
            production_capacity: parseInt(values[6]) || 0,
            unit_cost: parseFloat(values[7]) || 10.0,
            holding_cost_rate: parseFloat(values[8]) || 0.25,
            stockout_penalty: parseFloat(values[9]) || 50.0,
            lead_time_days: parseInt(values[10]) || 7,
            shelf_life_days: parseInt(values[11]) || 90,
            is_festival_sensitive: values[12] === 'true' || false
          });
        }
      }
      setInventoryData(parsedData);
    };
    reader.readAsText(file);
  };

  const handleSupplyChainAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call to /analyze-supply-chain
    setTimeout(() => {
      const mockAnalysis = {
        inventoryAnalysis: {
          totalForecastDemand: inventoryData.reduce((sum, item) => sum + item.forecast_demand, 0),
          totalActualDemand: inventoryData.reduce((sum, item) => sum + item.actual_demand, 0),
          totalStock: inventoryData.reduce((sum, item) => sum + item.current_stock, 0),
          forecastAccuracy: 78.5,
          criticalShortages: inventoryData.filter(item => item.current_stock < item.actual_demand * 0.5),
          warehousePerformance: [
            { warehouse: 'Delhi', stockCoverage: 1.2, serviceLevel: 95 },
            { warehouse: 'Mumbai', stockCoverage: 0.6, serviceLevel: 78 },
            { warehouse: 'Kolkata', stockCoverage: 1.8, serviceLevel: 98 }
          ]
        },
        demandForecast: {
          ensembleForecast: inventoryData.map(item => ({
            sku: item.sku,
            warehouse: item.warehouse,
            ensembleForecast: Math.round(item.actual_demand * 1.1),
            confidence: 0.85
          })),
          festivalAdjusted: inventoryData.map(item => ({
            sku: item.sku,
            festivalForecast: Math.round(item.actual_demand * (item.is_festival_sensitive ? festivalMultiplier : 1.1)),
            surgeFactor: item.is_festival_sensitive ? festivalMultiplier : 1.1
          }))
        },
        capacityAnalysis: {
          totalWeeklyCapacity: productionConstraints.reduce((sum, c) => sum + c.weekly_capacity, 0),
          averageEfficiency: productionConstraints.reduce((sum, c) => sum + c.efficiency_rate, 0) / productionConstraints.length,
          utilizationByFactory: productionConstraints.map(c => ({
            factory: c.factory_location,
            capacity: c.weekly_capacity,
            currentUtilization: 75 + Math.random() * 20
          }))
        },
        riskAssessment: {
          highRiskProducts: 2,
          unreliableSuppliers: 1,
          riskMitigationActions: [
            'Implement emergency replenishment for PC001',
            'Diversify supplier base for critical materials',
            'Establish safety stock buffers for Mumbai warehouse'
          ]
        }
      };
      
      setAnalysisData(mockAnalysis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleSupplyChainOptimization = async () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      const mockOptimization = {
        productionAllocation: productionConstraints.map(constraint => ({
          factory: constraint.factory_location,
          allocatedDemand: Math.round(constraint.weekly_capacity * 0.8),
          capacity: constraint.weekly_capacity,
          utilizationRate: 80 + Math.random() * 15
        })),
        inventoryOptimization: inventoryData.map(item => ({
          sku: item.sku,
          warehouse: item.warehouse,
          currentStock: item.current_stock,
          optimalInventory: Math.round(item.actual_demand * 1.2),
          safetyStock: Math.round(item.actual_demand * 0.3),
          reorderPoint: Math.round(item.actual_demand * 0.8),
          recommendation: item.current_stock < item.actual_demand ? 'INCREASE' : 'OPTIMIZE'
        })),
        procurementPlan: suppliers.map(supplier => ({
          supplierId: supplier.supplier_id,
          materialType: supplier.material_type,
          orderQuantity: supplier.moq,
          totalCost: supplier.moq * supplier.unit_price,
          deliveryDate: new Date(Date.now() + supplier.lead_time_days * 24 * 60 * 60 * 1000).toLocaleDateString()
        })),
        costAnalysis: {
          totalProductionCost: 45750,
          totalInventoryCost: 12300,
          totalProcurementCost: 8900,
          totalSupplyChainCost: 66950
        },
        performanceMetrics: {
          serviceLevel: 94.2,
          inventoryTurnover: 8.5,
          capacityUtilization: 82.3,
          costEfficiency: 91.7
        }
      };
      
      setOptimizedData(mockOptimization);
      setIsOptimizing(false);
    }, 3500);
  };

  const handleFestivalPlanning = async () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      const mockFestivalPlan = {
        demandForecast: inventoryData.map(item => ({
          sku: item.sku,
          baseDemand: item.actual_demand,
          festivalDemand: Math.round(item.actual_demand * (item.is_festival_sensitive ? festivalMultiplier : 1.1)),
          surgeFactor: item.is_festival_sensitive ? festivalMultiplier : 1.1
        })),
        productionSchedule: productionConstraints.map(constraint => ({
          factory: constraint.factory_location,
          weeklyCapacity: constraint.weekly_capacity,
          festivalCapacityNeeded: Math.round(constraint.weekly_capacity * 1.3),
          additionalShiftsRequired: 2
        })),
        inventoryBuildup: inventoryData.map(item => ({
          sku: item.sku,
          currentStock: item.current_stock,
          festivalRequirement: Math.round(item.actual_demand * (item.is_festival_sensitive ? festivalMultiplier : 1.1)),
          buildupNeeded: Math.max(0, Math.round(item.actual_demand * (item.is_festival_sensitive ? festivalMultiplier : 1.1)) - item.current_stock),
          startDate: '2025-09-15',
          targetDate: '2025-10-01'
        })),
        timeline: [
          { week: -6, phase: 'Planning', status: 'pending' },
          { week: -4, phase: 'Procurement', status: 'pending' },
          { week: -2, phase: 'Production Ramp-up', status: 'pending' },
          { week: 0, phase: 'Festival Period', status: 'pending' }
        ]
      };
      
      setFestivalPlan(mockFestivalPlan);
      setIsOptimizing(false);
    }, 2000);
  };

  const addInventoryItem = () => {
    const newItem: EnhancedInventoryData = {
      sku: `SKU-${inventoryData.length + 1}`,
      warehouse: 'Delhi',
      product_category: 'Snacks',
      current_stock: 0,
      forecast_demand: 0,
      actual_demand: 0,
      production_capacity: 0,
      unit_cost: 10.0,
      holding_cost_rate: 0.25,
      stockout_penalty: 50.0,
      lead_time_days: 7,
      shelf_life_days: 90,
      is_festival_sensitive: false
    };
    setInventoryData([...inventoryData, newItem]);
  };

  const updateInventoryItem = (index: number, field: keyof EnhancedInventoryData, value: any) => {
    const updated = [...inventoryData];
    (updated[index] as any)[field] = value;
    setInventoryData(updated);
  };

  const handleDownload = () => {
    if (!optimizedData) return;
    
    const csvContent = [
      'SKU,Warehouse,Current Stock,Optimal Inventory,Safety Stock,Reorder Point,Recommendation',
      ...optimizedData.inventoryOptimization.map((item: any) => 
        `${item.sku},${item.warehouse},${item.currentStock},${item.optimalInventory},${item.safetyStock},${item.reorderPoint},${item.recommendation}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supply_chain_optimization.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Supply Chain Intelligence Platform
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive inventory management with production planning, supplier optimization, and festival demand forecasting
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'inventory', label: 'Inventory Data', icon: Package },
                { id: 'production', label: 'Production Planning', icon: Factory },
                { id: 'suppliers', label: 'Supplier Management', icon: Truck },
                { id: 'festival', label: 'Festival Planning', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Inventory Data Tab */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory & Demand Data</h2>
              
              {/* Input Method Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setInputMethod('csv')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    inputMethod === 'csv' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  CSV Upload
                </button>
                <button
                  onClick={() => setInputMethod('manual')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    inputMethod === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manual Input
                </button>
              </div>

              {inputMethod === 'csv' ? (
                <div>
                  <CSVUpload
                    onFileUpload={handleFileUpload}
                    description="Upload CSV with columns: sku,warehouse,product_category,current_stock,forecast_demand,actual_demand,production_capacity,unit_cost,holding_cost_rate,stockout_penalty,lead_time_days,shelf_life_days,is_festival_sensitive"
                  />
                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">File Processed</h3>
                      <p className="text-blue-700">File: {uploadedFile.name}</p>
                      <p className="text-blue-700">SKUs Loaded: {inventoryData.length}</p>
                      <p className="text-blue-700">Warehouses: {new Set(inventoryData.map(item => item.warehouse)).size}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Manual Inventory Entry</h3>
                    <button
                      onClick={addInventoryItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add SKU
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Forecast</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Festival</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.sku}
                                onChange={(e) => updateInventoryItem(index, 'sku', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={item.warehouse}
                                onChange={(e) => updateInventoryItem(index, 'warehouse', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="Delhi">Delhi</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Kolkata">Kolkata</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={item.product_category}
                                onChange={(e) => updateInventoryItem(index, 'product_category', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="Snacks">Snacks</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Other">Other</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.current_stock}
                                onChange={(e) => updateInventoryItem(index, 'current_stock', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.forecast_demand}
                                onChange={(e) => updateInventoryItem(index, 'forecast_demand', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.actual_demand}
                                onChange={(e) => updateInventoryItem(index, 'actual_demand', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.production_capacity}
                                onChange={(e) => updateInventoryItem(index, 'production_capacity', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={item.is_festival_sensitive}
                                onChange={(e) => updateInventoryItem(index, 'is_festival_sensitive', e.target.checked)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-3 py-2">
                              {inventoryData.length > 1 && (
                                <button
                                  onClick={() => {
                                    const updated = inventoryData.filter((_, i) => i !== index);
                                    setInventoryData(updated);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Production Planning Tab */}
          {activeTab === 'production' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Production Constraints & Capacity Planning
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productionConstraints.map((constraint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">{constraint.factory_location} Factory</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Capacity (tons)</label>
                        <input
                          type="number"
                          value={constraint.weekly_capacity}
                          onChange={(e) => {
                            const updated = [...productionConstraints];
                            updated[index].weekly_capacity = parseInt(e.target.value) || 0;
                            setProductionConstraints(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency Rate</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={constraint.efficiency_rate}
                          onChange={(e) => {
                            const updated = [...productionConstraints];
                            updated[index].efficiency_rate = parseFloat(e.target.value) || 0;
                            setProductionConstraints(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Production Cost/Unit (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={constraint.production_cost_per_unit}
                          onChange={(e) => {
                            const updated = [...productionConstraints];
                            updated[index].production_cost_per_unit = parseFloat(e.target.value) || 0;
                            setProductionConstraints(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Production Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900">Total Capacity</h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {productionConstraints.reduce((sum, c) => sum + c.weekly_capacity, 0)} tons/week
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900">Avg Efficiency</h4>
                  <p className="text-2xl font-bold text-green-700">
                    {((productionConstraints.reduce((sum, c) => sum + c.efficiency_rate, 0) / productionConstraints.length) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900">Total Demand</h4>
                  <p className="text-2xl font-bold text-purple-700">
                    {inventoryData.reduce((sum, item) => sum + item.actual_demand, 0)} units
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Supplier Management & Reliability
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reliability</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MOQ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map((supplier, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.supplier_id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{supplier.material_type}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              supplier.reliability_score >= 0.9 ? 'bg-green-400' :
                              supplier.reliability_score >= 0.8 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                            {(supplier.reliability_score * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{supplier.lead_time_days} days</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{supplier.moq}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{supplier.unit_price}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{supplier.quality_rating}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => {
                  const newSupplier: Supplier = {
                    supplier_id: `SUP${String(suppliers.length + 1).padStart(3, '0')}`,
                    material_type: 'new_material',
                    reliability_score: 0.8,
                    lead_time_days: 7,
                    moq: 100,
                    unit_price: 10.0,
                    quality_rating: 8.0
                  };
                  setSuppliers([...suppliers, newSupplier]);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            </div>
          )}

          {/* Festival Planning Tab */}
          {activeTab === 'festival' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Festival Demand Planning
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Festival Demand Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={festivalMultiplier}
                    onChange={(e) => setFestivalMultiplier(parseFloat(e.target.value) || 1.45)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Multiply base demand by this factor for festival-sensitive products</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Level Target</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.8"
                    max="1.0"
                    value={serviceLevelTarget}
                    onChange={(e) => setServiceLevelTarget(parseFloat(e.target.value) || 0.95)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Target service level (95% = 95% demand fulfillment)</p>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleFestivalPlanning}
                    disabled={isOptimizing}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {isOptimizing ? 'Planning...' : 'Generate Festival Plan'}
                  </button>
                </div>
              </div>

              {festivalPlan && (
                <div className="space-y-6">
                  {/* Festival Demand Forecast */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Festival Demand Forecast</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Demand</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Festival Demand</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surge Factor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Additional Units</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {festivalPlan.demandForecast.map((item: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.baseDemand}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-orange-600">{item.festivalDemand}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.surgeFactor}x</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.festivalDemand - item.baseDemand}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Festival Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Festival Preparation Timeline</h3>
                    <div className="space-y-3">
                      {festivalPlan.timeline.map((phase: any, index: number) => (
                        <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                          <div className="w-16 text-center">
                            <div className="text-sm font-medium text-gray-900">Week {phase.week}</div>
                          </div>
                          <div className="flex-1 ml-4">
                            <div className="text-sm font-medium text-gray-900">{phase.phase}</div>
                            <div className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                              phase.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {phase.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis & Optimization Section */}
          {(inventoryData.length > 0 || uploadedFile) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Supply Chain Analysis & Optimization
              </h2>

              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={handleSupplyChainAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {isAnalyzing ? 'Analyzing Supply Chain...' : 'Analyze Supply Chain'}
                </button>

                {analysisData && (
                  <button
                    onClick={handleSupplyChainOptimization}
                    disabled={isOptimizing}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    {isOptimizing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    {isOptimizing ? 'Optimizing...' : 'Optimize Supply Chain'}
                  </button>
                )}

                {optimizedData && (
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Results (CSV)
                  </button>
                )}
              </div>

              {/* Analysis Results */}
              {analysisData && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supply Chain Analysis Results</h3>
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900">Total Demand</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          {analysisData.inventoryAnalysis.totalActualDemand}
                        </p>
                        <p className="text-sm text-blue-600">units</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900">Forecast Accuracy</h4>
                        <p className="text-2xl font-bold text-green-700">
                          {analysisData.inventoryAnalysis.forecastAccuracy}%
                        </p>
                        <p className="text-sm text-green-600">accuracy rate</p>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900">Critical Shortages</h4>
                        <p className="text-2xl font-bold text-yellow-700">
                          {analysisData.inventoryAnalysis.criticalShortages.length}
                        </p>
                        <p className="text-sm text-yellow-600">products at risk</p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900">Capacity Utilization</h4>
                        <p className="text-2xl font-bold text-purple-700">
                          {((analysisData.inventoryAnalysis.totalActualDemand / analysisData.capacityAnalysis.totalWeeklyCapacity) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-purple-600">of total capacity</p>
                      </div>
                    </div>

                    {/* Warehouse Performance */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Warehouse Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {analysisData.inventoryAnalysis.warehousePerformance.map((warehouse: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900">{warehouse.warehouse}</h5>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Stock Coverage:</span>
                                <span className="text-sm font-medium">{warehouse.stockCoverage}x</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Service Level:</span>
                                <span className="text-sm font-medium">{warehouse.serviceLevel}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <InsightsCard
                      title="Supply Chain Risk Assessment"
                      insights={analysisData.riskAssessment.riskMitigationActions}
                      type={analysisData.riskAssessment.highRiskProducts > 0 ? 'warning' : 'info'}
                    />
                  </div>
                </div>
              )}

              {/* Optimization Results */}
              {optimizedData && (
                <div className="mt-8 space-y-6">
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Results</h3>
                    
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900">Service Level</h4>
                        <p className="text-2xl font-bold text-green-700">
                          {optimizedData.performanceMetrics.serviceLevel}%
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900">Inventory Turnover</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          {optimizedData.performanceMetrics.inventoryTurnover}
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900">Capacity Utilization</h4>
                        <p className="text-2xl font-bold text-purple-700">
                          {optimizedData.performanceMetrics.capacityUtilization}%
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900">Total Cost</h4>
                        <p className="text-2xl font-bold text-orange-700">
                          ₹{optimizedData.costAnalysis.totalSupplyChainCost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Optimization Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <ResultsTable
                          title="Inventory Optimization"
                          data={optimizedData.inventoryOptimization}
                          columns={[
                            { key: 'sku', title: 'SKU' },
                            { key: 'warehouse', title: 'Warehouse' },
                            { key: 'currentStock', title: 'Current' },
                            { key: 'optimalInventory', title: 'Optimal' },
                            { key: 'recommendation', title: 'Action' }
                          ]}
                        />
                      </div>
                      
                      <div>
                        <ResultsTable
                          title="Production Allocation"
                          data={optimizedData.productionAllocation}
                          columns={[
                            { key: 'factory', title: 'Factory' },
                            { key: 'capacity', title: 'Capacity' },
                            { key: 'allocatedDemand', title: 'Allocated' },
                            { key: 'utilizationRate', title: 'Utilization %' }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryOptimizer;
