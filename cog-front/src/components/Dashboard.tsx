import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Package, TrendingUp, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 size={32} />
            Industrial Analytics Platform
          </h1>
          <p className="text-blue-100 mt-2">Optimize your operations with intelligent data analysis</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <Link to="/load-balancer" className="group">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Users className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">E1 – Packing Station Load Balancer</h2>
                  <p className="text-blue-600 font-semibold">Balance workloads efficiently</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Optimize packing station assignments to reduce bottlenecks and improve overall efficiency. 
                Upload your order data and get intelligent workload distribution recommendations.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                <span>Get Started</span>
                <TrendingUp className="ml-2" size={16} />
              </div>
            </div>
          </Link>

          <Link to="/inventory-optimizer" className="group">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Package className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">P1 – Inventory Optimization</h2>
                  <p className="text-blue-600 font-semibold">Perfect demand-supply balance</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Optimize inventory allocation across regions for FreshBites. Analyze demand patterns, 
                reduce stock-outs, and minimize overstock with AI-powered recommendations.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                <span>Get Started</span>
                <TrendingUp className="ml-2" size={16} />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Platform Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Advanced Analytics</h4>
              <p className="text-gray-600 text-sm">Comprehensive data analysis with interactive visualizations</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Real-time Optimization</h4>
              <p className="text-gray-600 text-sm">Intelligent algorithms for immediate performance improvements</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Package className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Export & Integration</h4>
              <p className="text-gray-600 text-sm">Seamless CSV export and system integration capabilities</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;