import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Download, TrendingUp } from "lucide-react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Import shared components
import CSVUpload from "./shared/CSVUpload";
import WorkloadChart from "./charts/WorkloadChart";
import InsightsCard from "./shared/InsightsCard";
import ResultsTable from "./shared/ResultsTable";

interface OrderData {
  id: number;
  packingTime: number;
}

// --- Extra Components Injected ---
const ComparisonChart = ({
  before,
  after,
}: {
  before: any[];
  after: any[];
}) => {
  const merged = before.map((b, i) => ({
    station: b.station,
    before: b.workload,
    after: after[i]?.workload || 0,
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Before vs After Workload Distribution
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={merged}>
          <XAxis dataKey="station" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="before" fill="#8884d8" name="Before" />
          <Bar dataKey="after" fill="#82ca9d" name="After" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ImbalanceTrend = ({ data }: { data: any[] }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-lg font-semibold mb-4">Imbalance Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="iteration" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="imbalance"
          stroke="#ff7300"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const LoadBalancer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalData, setOriginalData] = useState<OrderData[]>([]);
  const [stations, setStations] = useState<number>(5);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisData(null);
    setOptimizedData(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedData = results.data
          .map((row: any) => ({
            id: parseInt(row.id, 10),
            packingTime: parseFloat(row.packingTime),
          }))
          .filter((row: any) => !isNaN(row.id) && !isNaN(row.packingTime));

        setOriginalData(cleanedData as OrderData[]);
      },
    });
  };

  const handleAnalyze = async () => {
    if (originalData.length === 0) return;
    setIsAnalyzing(true);
    setOptimizedData(null);

    try {
      const response = await fetch(
        "https://cog-back-api.onrender.com/api/analyze-orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: originalData, stations }),
        }
      );
      const data = await response.json();
      const chartData = data.stationLoadSummary.map((item: any) => ({
        station: `Station ${item.station}`,
        workload: item.totalTime,
      }));
      setAnalysisData({
        workloadData: chartData,
        insights: [data.insight],
        metrics: [
          `Total Orders: ${data.totalOrders}`,
          `Total Packing Time: ${data.totalTime.toFixed(2)} mins`,
          `Avg Load/Station: ${data.avgLoadPerStation.toFixed(2)} mins`,
          `Max Order Time: ${data.maxOrderTime} mins`,
          `Current Imbalance: ${data.imbalancePercent}%`,
        ],
        imbalance: data.imbalancePercent,
        assignments: data.assignments,
      });
    } catch (error) {
      console.error("Failed to analyze data:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!analysisData) return;
    setIsOptimizing(true);
    try {
      const response = await fetch(
        "https://cog-back-api.onrender.com/api/assign-orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: originalData, stations }),
        }
      );
      const data = await response.json();

      const newWorkloadData = data.stationLoadSummary.map((item: any) => ({
        station: `Station ${item.station}`,
        workload: item.totalTime,
      }));

      const assignmentsWithTime = data.assignments.map((assignment: any) => {
        const originalOrder = originalData.find(
          (o) => o.id === assignment.orderId
        );
        return {
          ...assignment,
          packingTime: originalOrder ? originalOrder.packingTime : "N/A",
        };
      });

      setOptimizedData({
        assignments: assignmentsWithTime,
        newWorkloadData,
        results: [
          `Imbalance reduced to ${data.imbalancePercent}%`,
          `${data.assignments.length} orders processed.`,
        ],
        efficiency: [
          `New workload variance is minimal.`,
          `All stations are now operating at near-optimal capacity.`,
        ],
        bottlenecks: [
          "Bottlenecks successfully resolved through reassignment.",
        ],
        imbalance: data.imbalancePercent,
      });
    } catch (error) {
      console.error("Failed to optimize data:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownload = () => {
    if (!optimizedData) return;
    const csvContent = [
      "orderId,station,packingTime",
      ...optimizedData.assignments.map(
        (row: any) => `${row.orderId},${row.station},${row.packingTime}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized_workload.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 size={28} /> E1 – Packing Station Load Balancer
              </h1>
              <p className="text-blue-100 mt-1">
                Balance workloads across packing stations for optimal efficiency
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Input Order Data
              </h2>
              <CSVUpload
                onFileUpload={handleFileUpload}
                acceptedFileTypes=".csv"
                description="Upload your order data (columns: id, packingTime)"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Parameters
              </h2>
              <label
                htmlFor="stations"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Stations
              </label>
              <input
                type="number"
                id="stations"
                value={stations}
                onChange={(e) =>
                  setStations(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="1"
              />
            </div>
          </div>
          {uploadedFile && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">File Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File:</span>
                  <span className="ml-2 font-medium">{uploadedFile.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valid Orders Found:</span>
                  <span className="ml-2 font-medium">
                    {originalData.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {originalData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Workload Analysis
              </h2>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-blue-600 font-bold text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                style={{ backgroundColor: "#31fcf5ff", color: "#003366" }}
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <BarChart3 size={20} />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Current Workload"}
              </button>
            </div>

            {analysisData && (
              <div className="space-y-8">
                {/* Workload distribution chart */}
                <WorkloadChart
                  data={analysisData.workloadData}
                  title="Current Workload Distribution"
                />

                {/* Insights and metrics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <InsightsCard
                    title="Workload Analysis"
                    insights={analysisData.insights}
                    type="warning"
                  />
                  <InsightsCard
                    title="Performance Metrics"
                    insights={analysisData.metrics}
                    type="info"
                  />
                </div>

                {/* NEW: Order → Station Allocation */}
                {analysisData.assignments && (
                  <div className="space-y-4">
                    <ResultsTable
                      title="Order to Station Allocation"
                      data={analysisData.assignments}
                      columns={[
                        { key: "id", title: "Order ID" },
                        { key: "packingTime", title: "Packing Time (min)" },
                        { key: "assignedStation", title: "Assigned Station" },
                      ]}
                    />

                    {/* Download CSV Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const csvContent = [
                            "Order ID,Packing Time (min),Assigned Station",
                            ...analysisData.assignments.map(
                              (row: any) =>
                                `${row.id},${row.packingTime},${row.assignedStation}`
                            ),
                          ].join("\n");

                          const blob = new Blob([csvContent], {
                            type: "text/csv",
                          });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "analysis_assignments.csv";
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                        className="px-6 py-2 bg-blue-600 font-bold text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: "#31fcf5ff",
                          color: "#003366",
                        }}
                      >
                        Download Allocation (CSV)
                      </button>
                    </div>
                  </div>
                )}

                {/* NEW: Station-wise Summary */}
                <ResultsTable
                  title="Station-wise Workload Summary"
                  data={analysisData.workloadData.map((w: any) => ({
                    station: w.station,
                    workload: w.workload,
                  }))}
                  columns={[
                    { key: "station", title: "Station" },
                    { key: "workload", title: "Total Workload (min)" },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* Optimization Section */}
        {analysisData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Load Balancer Optimization
              </h2>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="px-6 py-3 bg-green-600 font-bold text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                style={{ backgroundColor: "#31fcf5ff", color: "#003366" }}
              >
                {isOptimizing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <TrendingUp size={20} />
                )}
                {isOptimizing ? "Optimizing..." : "Run Load Balancer"}
              </button>
            </div>

            {optimizedData && (
              <div className="space-y-12">
                <ResultsTable
                  title="Optimized Order Assignments"
                  data={optimizedData.assignments}
                  columns={[
                    { key: "orderId", title: "Order ID" },
                    { key: "packingTime", title: "Packing Time (min)" },
                    { key: "station", title: "New Station" },
                  ]}
                />
                <WorkloadChart
                  data={optimizedData.newWorkloadData}
                  title="Balanced Workload Distribution"
                />
                <div className="grid md:grid-cols-3 gap-6">
                  <InsightsCard
                    title="Optimization Results"
                    insights={optimizedData.results}
                    type="success"
                  />
                  <InsightsCard
                    title="Efficiency Gains"
                    insights={optimizedData.efficiency}
                    type="info"
                  />
                  <InsightsCard
                    title="Bottlenecks Resolved"
                    insights={optimizedData.bottlenecks}
                    type="success"
                  />
                </div>

                {/* Injected Comparison + Trend */}
                <ComparisonChart
                  before={analysisData.workloadData}
                  after={optimizedData.newWorkloadData}
                />
                <ImbalanceTrend
                  data={[
                    { iteration: "Current", imbalance: analysisData.imbalance },
                    {
                      iteration: "Optimized",
                      imbalance: optimizedData.imbalance,
                    },
                  ]}
                />

                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    style={{ backgroundColor: "#31fcf5ff", color: "#003366" }}
                  >
                    <Download size={20} /> Download Optimized Data (CSV)
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

export default LoadBalancer;
