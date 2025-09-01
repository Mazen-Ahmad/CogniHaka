import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Package, TrendingUp, Users, Factory, Heart, Coffee, Truck } from "lucide-react";
import { Link } from "react-router-dom";

// Sample Data
const workloadData = [
  { station: "Station 1", orders: 120 },
  { station: "Station 2", orders: 90 },
  { station: "Station 3", orders: 160 },
  { station: "Station 4", orders: 80 },
];

const imbalanceTrend = [
  { iteration: "Before", imbalance: 62 },
  { iteration: "After", imbalance: 28 },
];

const faqs = [
  {
    q: "What data formats do you support?",
    a: "Currently CSV and Excel. API integration is on the roadmap.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we use encrypted transfer and do not store your data permanently.",
  },
  {
    q: "Do I need technical knowledge?",
    a: "No, our UI is beginner-friendly with guided insights.",
  },
  {
    q: "Can I export results?",
    a: "Yes, results can be exported as CSV or integrated via APIs.",
  },
  {
    q: "Is it free?",
    a: "Yes, Free Beta Access is available. Enterprise plans coming soon.",
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* ðŸ”µ Mesh Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-40 left-1/3 w-[600px] h-[600px] bg-blue-900 rounded-full mix-blend-multiply filter blur-[140px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-indigo-800 rounded-full mix-blend-multiply filter blur-[140px] opacity-40 animate-pulse"></div>
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 text-white py-20 shadow-xl relative overflow-hidden">
        <motion.div
          className="max-w-7xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            Industrial Analytics Platform
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Optimize operations with{" "}
            <span className="text-cyan-300 font-semibold">
              intelligent data analysis
            </span>{" "}
            & real-time insights.
          </p>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {/* ðŸ”¹ Feature Cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
          }}
        >
          {[
            {
              icon: <Users className="text-blue-600" size={32} />,
              title: "E1 â€“ Packing Station Load Balancer",
              subtitle: "Balance workloads efficiently",
              text: "Optimize packing station assignments to reduce bottlenecks and improve overall efficiency.",
            },
            {
              icon: <Package className="text-blue-600" size={32} />,
              title: "P1 â€“ Inventory Optimization",
              subtitle: "Perfect demand-supply balance",
              text: "Analyze demand patterns, reduce stock-outs, and minimize overstock with AI-powered recommendations.",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-xl">{card.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {card.title}
                  </h2>
                  <p className="text-blue-600 font-semibold">{card.subtitle}</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{card.text}</p>
              <Link
                to={idx === 0 ? "/load-balancer" : "/inventory-optimizer"}
                className="mt-6 inline-block px-5 py-3 bg-cyan-200 text-blue-900 font-bold rounded-lg hover:bg-cyan-300 transition"
              >
                Get Started â†’
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ðŸ”¹ Charts */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Analytics Preview
          </h3>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Workload Bar Chart */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-700">
                Workload Distribution
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Imbalance Trend */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-700">
                Imbalance Trend
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={imbalanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="imbalance"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <section className="py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Where Can It Be <span className="text-blue-600">Used?</span>
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the versatility of our platform across different industries and use cases
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1, 
                transition: { 
                  staggerChildren: 0.1,
                  duration: 0.8
                } 
              },
            }}
          >
            {/* Left Top - Warehouse */}
            <motion.div
              className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Package className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-bold mb-2">Warehouse Operations</h4>
                <p className="text-emerald-100 text-sm">Smart inventory management and logistics optimization</p>
              </div>
            </motion.div>

            {/* Center - Manufacturing Excellence (2x2) */}
            <motion.div
              className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Factory className="text-white" size={32} />
                </div>
                <h4 className="text-2xl font-bold mb-4">Manufacturing Excellence</h4>
                <p className="text-blue-100 leading-relaxed mb-6">
                  Optimize production lines, reduce bottlenecks, and maximize efficiency with 
                  intelligent workload distribution and real-time analytics.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Production</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Quality Control</span>
                </div>
              </div>
            </motion.div>

            {/* Right Top - Retail */}
            <motion.div
              className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-bold mb-2">Retail Analytics</h4>
                <p className="text-purple-100 text-sm">Customer behavior analysis and demand forecasting</p>
              </div>
            </motion.div>

            {/* Left Bottom - Healthcare */}
            <motion.div
              className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-bold mb-2">Healthcare</h4>
                <p className="text-pink-100 text-sm">Resource allocation and patient flow optimization</p>
              </div>
            </motion.div>

            {/* Right Bottom - Food & Beverage */}
            <motion.div
              className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Coffee className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-bold mb-2">Food & Beverage</h4>
                <p className="text-yellow-100 text-sm">Production planning and quality assurance</p>
              </div>
            </motion.div>

            {/* Bottom Wide - Supply Chain Management */}
            <motion.div
              className="md:col-span-2 md:row-span-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-5 -right-5 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Truck className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Supply Chain Management</h4>
                  <p className="text-orange-100">End-to-end visibility and optimization across your entire supply network</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Wide - Logistics & Transportation */}
            <motion.div
              className="md:col-span-2 md:row-span-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-xl"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="absolute -top-5 -right-5 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Logistics & Transportation</h4>
                  <p className="text-cyan-100">Route optimization and fleet management for efficient delivery operations</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { number: "50+", label: "Industries Served" },
              { number: "1000+", label: "Operations Optimized" },
              { number: "30%", label: "Average Efficiency Gain" },
              { number: "24/7", label: "Real-time Monitoring" },
            ].map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>


        {/* ðŸ”¹ FAQ */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((f, idx) => (
              <motion.details
                key={idx}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <summary className="font-semibold text-gray-800 cursor-pointer">
                  {f.q}
                </summary>
                <p className="mt-2 text-gray-600">{f.a}</p>
              </motion.details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div
          className="text-center py-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl shadow-lg text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to Optimize Your Operations?
          </h2>
          <p className="text-blue-100 mb-6">
            Start your first analysis today with free beta access.
          </p>
          <Link
            to="/load-balancer"
            className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition"
          >
            Get Started â†’
          </Link>
        </motion.div>
      </main>

      {/* ðŸ”¹ Smooth Auto-scroll Keyframes */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;