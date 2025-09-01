import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SupplyChainChartProps {
  data: any[];
  title: string;
}

const SupplyChainChart: React.FC<SupplyChainChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="demand" fill="#3B82F6" name="Demand" />
          <Bar dataKey="capacity" fill="#10B981" name="Capacity" />
          <Line type="monotone" dataKey="utilization" stroke="#F59E0B" strokeWidth={3} name="Utilization %" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupplyChainChart;
