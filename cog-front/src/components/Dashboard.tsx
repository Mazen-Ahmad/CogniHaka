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
import { BarChart3, Package, TrendingUp, Users, Quote } from "lucide-react";
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

const testimonials = [
  {
    name: "FreshBites Logistics",
    quote: "Reduced workload imbalance by 40%. Game changer!",
  },
  {
    name: "Mid-size Factory",
    quote: "Optimized resource usage and cut delays by 25%.",
  },
  {
    name: "Retail Partner",
    quote: "Seamless demand forecasting boosted sales accuracy.",
  },
  {
    name: "TechOps Inc.",
    quote: "Brilliant analytics. Saved us hours weekly.",
  },

  // --- Added 50+ more ---
  {
    name: "Metro Supply Chain",
    quote: "Balanced workloads improved delivery timelines drastically.",
  },
  {
    name: "BlueLine Manufacturing",
    quote: "Cut machine downtime by 18% with predictive insights.",
  },
  {
    name: "UrbanGrocer",
    quote: "Inventory optimization reduced stockouts by 22%.",
  },
  {
    name: "PharmaPlus",
    quote: "Ensured critical drug stock was always available across centers.",
  },
  {
    name: "FinCore Systems",
    quote: "Optimized IT operations saved us 12 hours weekly.",
  },
  {
    name: "AutoWorks Ltd.",
    quote: "Assembly line scheduling improved throughput by 15%.",
  },
  {
    name: "Global Textiles",
    quote: "Balanced production across units with minimal waste.",
  },
  {
    name: "FoodChain Co.",
    quote: "Order balancing improved efficiency during peak hours.",
  },
  {
    name: "MediCare Logistics",
    quote: "Reduced emergency supply imbalance by 30%.",
  },
  {
    name: "EcoMart",
    quote: "Helped reduce food waste with accurate demand forecasts.",
  },
  {
    name: "RetailPro",
    quote: "Improved delivery promises and customer satisfaction.",
  },
  {
    name: "SteelForge Inc.",
    quote: "Shift balancing helped reduce worker overtime.",
  },
  {
    name: "AgriWorld",
    quote: "Crop distribution optimization improved farmer payouts.",
  },
  { name: "Urban Transit", quote: "Route balancing cut fuel costs by 12%." },
  {
    name: "Alpha Hardware",
    quote: "Optimized shipments saved $50k in logistics costs.",
  },
  {
    name: "BrightFoods",
    quote: "Balanced workloads improved holiday season handling.",
  },
  {
    name: "EduServe",
    quote: "Classroom scheduling efficiency improved by 20%.",
  },
  {
    name: "CleanCity Ops",
    quote: "Waste pickup routes optimized, saving 8% fuel.",
  },
  {
    name: "NextGen Labs",
    quote: "Resource balancing reduced experiment downtime.",
  },
  {
    name: "EcoLogistics",
    quote: "Carbon footprint reduced by smarter allocation.",
  },
  {
    name: "BuildMax Constructions",
    quote: "Optimized workforce scheduling boosted speed.",
  },
  { name: "FreshMart", quote: "Cut stock-outs in fresh produce by 19%." },
  {
    name: "PharmaChain",
    quote: "Balanced distribution across pharmacies effectively.",
  },
  {
    name: "QuickServe",
    quote: "Improved kitchen efficiency by balancing order flow.",
  },
  {
    name: "AeroParts",
    quote: "Supply chain resilience improved with workload balancing.",
  },
  {
    name: "PowerGrid Ltd.",
    quote: "Balanced maintenance workloads across sites.",
  },
  { name: "UrbanFoods", quote: "Warehouse workload imbalance reduced by 35%." },
  {
    name: "Medico Supplies",
    quote: "Ensured ventilators reached hospitals on time.",
  },
  {
    name: "TechRetail",
    quote: "Delivery SLA improvements boosted NPS scores.",
  },
  { name: "GreenEnergy", quote: "Optimized plant operations saved 7% energy." },
  {
    name: "TransportHub",
    quote: "Fleet workload balance improved utilization.",
  },
  {
    name: "BioCare Labs",
    quote: "Distribution optimization saved critical hours.",
  },
  {
    name: "AgriChain",
    quote: "Fair balancing improved farmer logistics experience.",
  },
  {
    name: "SmartCity Ops",
    quote: "Cut traffic rerouting delays with AI balancing.",
  },
  {
    name: "RetailOne",
    quote: "Holiday rush handled smoothly with balanced orders.",
  },
  { name: "FarmFresh Foods", quote: "Warehouse throughput improved by 18%." },
  {
    name: "ShipMate Logistics",
    quote: "Global shipments balanced effectively.",
  },
  { name: "MediTrust", quote: "Pharma supply chain delays reduced by 27%." },
  { name: "AutoTrack", quote: "Assembly line idle time cut down drastically." },
  {
    name: "QuickCart",
    quote: "Balanced last-mile deliveries cut delays by 14%.",
  },
  {
    name: "MegaFoods",
    quote: "Reduced wastage in perishable goods distribution.",
  },
  { name: "Urban Logistics", quote: "Reduced order backlog by 30%." },
  {
    name: "TechFab",
    quote: "Optimized workforce allocation boosted efficiency.",
  },
  {
    name: "BioMed Pharma",
    quote: "Supply allocation balanced across multiple states.",
  },
  {
    name: "CoolChain",
    quote: "Cold storage utilization improved significantly.",
  },
  {
    name: "PackPro",
    quote: "Cut warehouse packing delays with smarter allocation.",
  },
  {
    name: "SteelWorks",
    quote: "Balanced workload improved production line flow.",
  },
  {
    name: "FreshDirect",
    quote: "Daily order balancing improved customer satisfaction.",
  },
  { name: "CityTransport", quote: "Fleet balancing reduced downtime." },
  { name: "RetailMax", quote: "Optimized inventory flow improved margins." },
  { name: "BrightLogistics", quote: "Reduced workload spikes by 22%." },
  { name: "AgroChain", quote: "Distribution balance improved farmer incomes." },
  {
    name: "MediFlow",
    quote: "Hospital supplies reached faster via balanced allocation.",
  },
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
      {/* 🔵 Mesh Background */}
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
        {/* 🔹 Feature Cards */}
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
              title: "E1 – Packing Station Load Balancer",
              subtitle: "Balance workloads efficiently",
              text: "Optimize packing station assignments to reduce bottlenecks and improve overall efficiency.",
            },
            {
              icon: <Package className="text-blue-600" size={32} />,
              title: "P1 – Inventory Optimization",
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
                Get Started →
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* 🔹 Charts */}
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

        {/* 🔹 Testimonials Auto-Scroll */}
        <section className="overflow-hidden relative">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            What Our Clients Say
          </h3>
          <motion.div
            className="flex gap-8 animate-marquee"
            style={{ animation: "marquee 20s linear infinite" }}
          >
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded-xl p-6 w-80 flex-shrink-0"
              >
                <Quote className="text-blue-600 mb-3" size={24} />
                <p className="text-gray-700 italic mb-3">"{t.quote}"</p>
                <h4 className="text-sm font-bold text-gray-900">— {t.name}</h4>
              </div>
            ))}
          </motion.div>
        </section>

        {/* 🔹 FAQ */}
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
            Get Started →
          </Link>
        </motion.div>
      </main>

      {/* 🔹 Smooth Auto-scroll Keyframes */}
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
