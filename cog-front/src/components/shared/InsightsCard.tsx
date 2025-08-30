import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface InsightsCardProps {
  title: string;
  insights: string[];
  type?: 'success' | 'warning' | 'info';
}

const InsightsCard: React.FC<InsightsCardProps> = ({ title, insights, type = 'info' }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckCircle className="text-green-600" size={24} />,
          titleColor: 'text-green-800',
          textColor: 'text-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertTriangle className="text-yellow-600" size={24} />,
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="text-blue-600" size={24} />,
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`rounded-xl border p-6 ${styles.bg}`}>
      <div className="flex items-center gap-3 mb-4">
        {styles.icon}
        <h3 className={`font-bold text-lg ${styles.titleColor}`}>{title}</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, index) => (
          <li key={index} className={`text-sm ${styles.textColor} flex items-start gap-2`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0"></span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsCard;