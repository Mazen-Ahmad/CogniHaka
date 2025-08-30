// Mock data for Load Balancer
export const mockLoadBalancerAnalysis = {
  workloadData: [
    { station: 'Station A', workload: 45 },
    { station: 'Station B', workload: 32 },
    { station: 'Station C', workload: 67 },
    { station: 'Station D', workload: 23 },
    { station: 'Station E', workload: 58 },
  ],
  insights: [
    'Station C is overloaded with 67 orders (34% above average)',
    'Station D is underutilized with only 23 orders',
    'Current efficiency is at 72% due to workload imbalance',
    '3 stations are operating above optimal capacity'
  ],
  metrics: [
    'Average processing time: 12.4 minutes per order',
    'Peak station utilization: 89%',
    'Minimum station utilization: 34%',
    'Total orders processed: 225'
  ]
};

export const mockLoadBalancerOptimization = {
  assignments: [
    { orderId: 'ORD-001', originalStation: 'Station C', newStation: 'Station D', packingTime: '8.2' },
    { orderId: 'ORD-002', originalStation: 'Station C', newStation: 'Station B', packingTime: '6.5' },
    { orderId: 'ORD-003', originalStation: 'Station E', newStation: 'Station D', packingTime: '7.8' },
    { orderId: 'ORD-004', originalStation: 'Station C', newStation: 'Station A', packingTime: '9.1' },
    { orderId: 'ORD-005', originalStation: 'Station E', newStation: 'Station B', packingTime: '5.9' },
    { orderId: 'ORD-006', originalStation: 'Station C', newStation: 'Station D', packingTime: '8.7' },
    { orderId: 'ORD-007', originalStation: 'Station E', newStation: 'Station A', packingTime: '7.3' },
    { orderId: 'ORD-008', originalStation: 'Station C', newStation: 'Station B', packingTime: '6.8' },
  ],
  newWorkloadData: [
    { station: 'Station A', workload: 48 },
    { station: 'Station B', workload: 46 },
    { station: 'Station C', workload: 47 },
    { station: 'Station D', workload: 42 },
    { station: 'Station E', workload: 42 },
  ],
  results: [
    'Workload variance reduced by 78%',
    'All stations now within 15% of average',
    'Bottlenecks eliminated at Station C',
    '18 orders successfully reassigned'
  ],
  efficiency: [
    'Overall efficiency improved to 94%',
    'Average processing time: 9.7 minutes',
    'Peak utilization reduced to 76%',
    'Capacity utilization balanced across all stations'
  ],
  bottlenecks: [
    'Station C overload resolved',
    'Station D underutilization addressed',
    'Processing time variance reduced by 45%',
    'Queue lengths normalized'
  ]
};

// Mock data for Inventory Optimizer
export const mockInventoryAnalysis = {
  stockLevels: [
    { region: 'North', currentStock: 1200, optimalStock: 1450 },
    { region: 'South', currentStock: 890, optimalStock: 750 },
    { region: 'East', currentStock: 650, optimalStock: 900 },
    { region: 'West', currentStock: 1100, optimalStock: 980 },
    { region: 'Central', currentStock: 760, optimalStock: 820 },
  ],
  demandData: [
    { week: 'W1', forecast: 340, actual: 385 },
    { week: 'W2', forecast: 420, actual: 390 },
    { week: 'W3', forecast: 380, actual: 445 },
    { week: 'W4', forecast: 450, actual: 420 },
    { week: 'W5', forecast: 390, actual: 410 },
    { week: 'W6', forecast: 480, actual: 520 },
  ],
  stockIssues: [
    'North region: 250 units short (17% stock-out risk)',
    'South region: 140 units overstock (19% excess)',
    'East region: Critical stock shortage of 250 units',
    '12 SKUs experiencing stock-out conditions'
  ],
  demandInsights: [
    'Demand surge of 15% above forecast in Week 6',
    'East region showing consistent underestimation',
    'Seasonal pattern detected in fresh produce categories',
    'Weekend demand spikes not properly accounted for'
  ],
  capacityMetrics: [
    'Plant capacity utilization: 78%',
    'Distribution network efficiency: 84%',
    'Cross-dock operations at 92% capacity',
    'Transportation costs 12% above optimal'
  ]
};

export const mockInventoryOptimization = {
  allocations: [
    { sku: 'FB-001', region: 'North', forecast: 120, currentStock: 85, suggestedAllocation: 135 },
    { sku: 'FB-002', region: 'South', forecast: 90, currentStock: 110, suggestedAllocation: 95 },
    { sku: 'FB-003', region: 'East', forecast: 150, currentStock: 95, suggestedAllocation: 160 },
    { sku: 'FB-004', region: 'West', forecast: 80, currentStock: 120, suggestedAllocation: 85 },
    { sku: 'FB-005', region: 'Central', forecast: 110, currentStock: 90, suggestedAllocation: 115 },
    { sku: 'FB-006', region: 'North', forecast: 200, currentStock: 180, suggestedAllocation: 210 },
    { sku: 'FB-007', region: 'East', forecast: 75, currentStock: 45, suggestedAllocation: 80 },
    { sku: 'FB-008', region: 'West', forecast: 95, currentStock: 85, suggestedAllocation: 100 },
  ],
  optimizedStockLevels: [
    { region: 'North', currentStock: 1200, optimalStock: 1450 },
    { region: 'South', currentStock: 890, optimalStock: 750 },
    { region: 'East', currentStock: 650, optimalStock: 900 },
    { region: 'West', currentStock: 1100, optimalStock: 980 },
    { region: 'Central', currentStock: 760, optimalStock: 820 },
  ],
  results: [
    'Stock-out risk reduced by 67%',
    'Overstock reduced by 45%',
    '89% demand coverage achieved',
    'Inventory turnover improved by 23%'
  ],
  improvements: [
    'Overall efficiency increased to 91%',
    'Distribution costs reduced by 15%',
    'Service level improved to 96.5%',
    'Working capital requirement reduced by $1.2M'
  ],
  risks: [
    'Demand volatility buffer maintained',
    'Supply chain disruption tolerance: 85%',
    'Seasonal demand variations accounted for',
    'Safety stock levels optimized'
  ]
};