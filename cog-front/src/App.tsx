import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoadBalancer from './components/LoadBalancer';
import InventoryOptimizer from './components/InventoryOptimizer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/load-balancer" element={<LoadBalancer />} />
          <Route path="/inventory-optimizer" element={<InventoryOptimizer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;