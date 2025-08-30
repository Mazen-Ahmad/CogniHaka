import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Upload, Download, TrendingUp, Plus, Minus } from 'lucide-react';
import CSVUpload from './shared/CSVUpload';
import InventoryChart from './charts/InventoryChart';
import DemandChart from './charts/DemandChart';
import InsightsCard from './shared/InsightsCard';
import ResultsTable from './shared/ResultsTable';
import { mockInventoryAnalysis, mockInventoryOptimization } from '../utils/mockData';

interface InventoryData {
  sku: string;
  region: string;
  currentStock: number;
  forecastDemand: number;
}

const InventoryOptimizer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'csv' | 'manual'>('csv');
  const [manualInventory, setManualInventory] = useState<InventoryData[]>([
    { sku: 'FB-001', region: 'North', currentStock: 0, forecastDemand: 0 },
    { sku: 'FB-002', region: 'South', currentStock: 0, forecastDemand: 0 },
    { sku: 'FB-003', region: 'East', currentStock: 0, forecastDemand: 0 }
  ]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisData(null);
    setOptimizedData(null);
  };

  const addInventoryItem = () => {
    const newItemNumber = manualInventory.length + 1;
    setManualInventory([...manualInventory, { 
      sku: `FB-${String(newItemNumber).padStart(3, '0')}`, 
      region: 'North',
      currentStock: 0,
      forecastDemand: 0
    }]);
  };

  const removeInventoryItem = (index: number) => {
    if (manualInventory.length > 2) {
      setManualInventory(manualInventory.filter((_, i) => i !== index));
    }
  };

  const updateInventoryItem = (index: number, field: keyof InventoryData, value: string | number) => {
    const updated = [...manualInventory];
    if (field === 'currentStock' || field === 'forecastDemand') {
      updated[index][field] = Math.max(0, Number(value));
    } else {
      updated[index][field] = value as string;
    }
    setManualInventory(updated);
  };

  const handleAnalyze = async () => {
    if (inputMethod === 'csv' && !uploadedFile) return;
    if (inputMethod === 'manual' && manualInventory.every(item => item.currentStock === 0 && item.forecastDemand === 0)) return;
    
    setIsAnalyzing(true);
    // Simulate backend analysis
    setTimeout(() => {
      if (inputMethod === 'manual') {
        // Generate analysis based on manual input
        const regions = [...new Set(manualInventory.map(item => item.region))];
        const stockLevels = regions.map(region => {
          const regionItems = manualInventory.filter(item => item.region === region);
          const currentStock = regionItems.reduce((sum, item) => sum + item.currentStock, 0);
          const totalDemand = regionItems.reduce((sum, item) => sum + item.forecastDemand, 0);
          return {
            region,
            currentStock,
            optimalStock: Math.round(totalDemand * 1.1) // 10% buffer
          };
        });
        
        const stockIssues = manualInventory
          .filter(item => item.currentStock < item.forecastDemand * 0.9)
          .map(item => `${item.sku} in ${item.region}: ${item.forecastDemand - item.currentStock} units short`);
        
        setAnalysisData({
          stockLevels,
          demandData: mockInventoryAnalysis.demandData, // Use mock data for demand chart
          stockIssues: stockIssues.length > 0 ? stockIssues : ['No critical stock issues detected'],
          demandInsights: [
            `${manualInventory.length} SKUs analyzed across ${regions.length} regions`,
            `Total forecast demand: ${manualInventory.reduce((sum, item) => sum + item.forecastDemand, 0)} units`,
            `Total current stock: ${manualInventory.reduce((sum, item) => sum + item.currentStock, 0)} units`,
            `Average stock coverage: ${((manualInventory.reduce((sum, item) => sum + item.currentStock, 0) / manualInventory.reduce((sum, item) => sum + item.forecastDemand, 0)) * 100).toFixed(1)}%`
          ],
          capacityMetrics: [
            'Manual input mode - capacity metrics estimated',
            'Distribution efficiency calculated from input data',
            'Regional balance assessment completed',
            'Optimization recommendations generated'
          ]
        });
      } else {
        setAnalysisData(mockInventoryAnalysis);
      }
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleOptimize = async () => {
    if (!analysisData) return;
    
    setIsOptimizing(true);
    // Simulate backend optimization
    setTimeout(() => {
      setOptimizedData(mockInventoryOptimization);
      setIsOptimizing(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (!optimizedData) return;
    
    const csvContent = optimizedData.allocations.map((row: any) => 
      Object.values(row).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized_inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Package size={28} />
                P1 – Inventory Optimization at FreshBites
              </h1>
              <p className="text-blue-100 mt-1">Achieve perfect demand-supply balance across all regions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Data Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Input Inventory Data</h2>
          
          {/* Input Method Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMethod('csv')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'csv' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CSV Upload
            </button>
            <button
              onClick={() => setInputMethod('manual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'manual' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manual Input
            </button>
          </div>

          {inputMethod === 'csv' ? (
            <>
              <CSVUpload 
                onFileUpload={handleFileUpload}
                acceptedFileTypes=".csv"
                description="Upload your SKU, region, and plant capacity data in CSV format"
              />
              
              {uploadedFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">File Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File:</span>
                      <span className="ml-2 font-medium">{uploadedFile.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estimated SKUs:</span>
                      <span className="ml-2 font-medium">1,247</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Regions:</span>
                      <span className="ml-2 font-medium">5</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Enter inventory data for each SKU and region:</p>
              
              {manualInventory.map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg items-center">
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => updateInventoryItem(index, 'sku', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SKU"
                  />
                  <select
                    value={item.region}
                    onChange={(e) => updateInventoryItem(index, 'region', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                  </select>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Current Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={item.currentStock}
                      onChange={(e) => updateInventoryItem(index, 'currentStock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Forecast Demand</label>
                    <input
                      type="number"
                      min="0"
                      value={item.forecastDemand}
                      onChange={(e) => updateInventoryItem(index, 'forecastDemand', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    />
                  </div>
                  <div className="flex gap-2">
                    {manualInventory.length > 2 && (
                      <button
                        onClick={() => removeInventoryItem(index)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                onClick={addInventoryItem}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add SKU
              </button>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total SKUs:</span>
                    <span className="ml-2 font-medium">{manualInventory.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Stock:</span>
                    <span className="ml-2 font-medium">{manualInventory.reduce((sum, item) => sum + item.currentStock, 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Demand:</span>
                    <span className="ml-2 font-medium">{manualInventory.reduce((sum, item) => sum + item.forecastDemand, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {(uploadedFile || (inputMethod === 'manual' && manualInventory.some(item => item.currentStock > 0 || item.forecastDemand > 0))) && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Inventory Analysis</h2>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (inputMethod === 'manual' && manualInventory.every(item => item.currentStock === 0 && item.forecastDemand === 0))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Package size={20} />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Current Inventory'}
              </button>
            </div>

            {analysisData && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <InventoryChart 
                    data={analysisData.stockLevels} 
                    title="Current Stock Levels by Region"
                  />
                  <DemandChart 
                    data={analysisData.demandData} 
                    title="Forecast vs Actual Demand"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <InsightsCard
                    title="Stock Issues"
                    insights={analysisData.stockIssues}
                    type="warning"
                  />
                  <InsightsCard
                    title="Demand Analysis"
                    insights={analysisData.demandInsights}
                    type="info"
                  />
                  <InsightsCard
                    title="Capacity Utilization"
                    insights={analysisData.capacityMetrics}
                    type="info"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimization Section */}
        {analysisData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Inventory Optimization</h2>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isOptimizing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <TrendingUp size={20} />
                )}
                {isOptimizing ? 'Optimizing...' : 'Run Optimizer'}
              </button>
            </div>

            {optimizedData && (
              <div className="space-y-8">
                <ResultsTable 
                  data={optimizedData.allocations}
                  columns={[
                    { key: 'sku', title: 'SKU' },
                    { key: 'region', title: 'Region' },
                    { key: 'forecast', title: 'Forecast Demand' },
                    { key: 'currentStock', title: 'Current Stock' },
                    { key: 'suggestedAllocation', title: 'Suggested Allocation' }
                  ]}
                />

                <InventoryChart 
                  data={optimizedData.optimizedStockLevels} 
                  title="Optimized Stock Distribution"
                />

                <div className="grid md:grid-cols-3 gap-6">
                  <InsightsCard
                    title="Optimization Results"
                    insights={optimizedData.results}
                    type="success"
                  />
                  <InsightsCard
                    title="Efficiency Improvements"
                    insights={optimizedData.improvements}
                    type="success"
                  />
                  <InsightsCard
                    title="Risk Mitigation"
                    insights={optimizedData.risks}
                    type="info"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download Optimized Allocation (CSV)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryOptimizer;