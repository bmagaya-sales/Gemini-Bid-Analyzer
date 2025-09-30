
import React from 'react';

interface HumanReviewFlagsProps {
  flags: string[];
}

const HumanReviewFlags: React.FC<HumanReviewFlagsProps> = ({ flags }) => {
  if (flags.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-lg">
       <div className="flex items-start">
        <div className="flex-shrink-0">
           <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold text-yellow-800">Flags for Human Review</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 text-yellow-700">
            {flags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HumanReviewFlags;
