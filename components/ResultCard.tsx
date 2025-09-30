
import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        {icon && <div className="mr-3 text-indigo-500">{icon}</div>}
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3 text-gray-700">{children}</div>
    </div>
  );
};

export default ResultCard;
