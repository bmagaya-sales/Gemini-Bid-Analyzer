
import React from 'react';
import { BidAnalysis } from '../types';

type LineItem = BidAnalysis['keyRequirements']['lineItems'][0];

interface LineItemsTableProps {
  items: LineItem[];
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div>
        <h4 className="text-md font-semibold text-gray-800">Required Items/Services</h4>
        <p className="text-gray-600 italic mt-2">No specific line items were identified in the document.</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-800 mb-3">Required Items/Services</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item / Service
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{item.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.quantity || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.partNumber || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.description || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineItemsTable;
