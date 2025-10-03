import React from 'react';
import { BidAnalysis } from '../types';

// Helper component for summary sections
const SummarySection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`py-4 ${className}`}>
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

// Helper for key-value pairs
const SummaryDetail: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div>
    <p className="font-bold text-gray-800 text-lg">{value || 'N/A'}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const ExecutiveSummary: React.FC<{ data: BidAnalysis; }> = ({ data }) => {
  const { 
    solicitationDetails,
    submissionInstructions,
    financials,
    keyRequirements,
    flags_for_human_review,
    relevanceAnalysis
  } = data;

  return (
    <div id="executive-summary-content" className="printable-summary bg-white p-8 rounded-lg shadow-lg font-serif">
      {/* Header */}
      <header className="text-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{solicitationDetails.title || 'Untitled Solicitation'}</h1>
        <p className="text-lg text-gray-600 mt-1">{solicitationDetails.agency || 'Unknown Agency'}</p>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-4">
          <SummarySection title="Relevance & Summary">
            <div className={`p-4 rounded-md ${relevanceAnalysis.isRelevant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <p className={`text-xl font-bold ${relevanceAnalysis.isRelevant ? 'text-green-800' : 'text-red-800'}`}>
                {relevanceAnalysis.isRelevant ? 'Deemed Relevant' : 'Deemed Not Relevant'}
              </p>
              <p className="text-sm text-gray-600 mt-1">{relevanceAnalysis.reason}</p>
            </div>
            <p className="text-gray-700 italic pt-2 leading-relaxed">{solicitationDetails.summary}</p>
          </SummarySection>

          <SummarySection title="Key Line Items" className="border-t pt-4">
             {keyRequirements.lineItems.length > 0 ? (
                <ul className="space-y-2">
                    {keyRequirements.lineItems.slice(0, 5).map((item, index) => (
                        <li key={index} className="flex justify-between items-baseline p-2 rounded-md hover:bg-gray-50 border-b">
                            <span className="font-medium text-gray-800">{item.name}</span>
                            <span className="text-sm text-gray-500 font-sans">Qty: {item.quantity || 'N/A'}</span>
                        </li>
                    ))}
                    {keyRequirements.lineItems.length > 5 && (
                        <li className="text-sm text-center text-gray-500 pt-2 font-sans">... and {keyRequirements.lineItems.length - 5} more items.</li>
                    )}
                </ul>
             ) : (
                <p className="text-gray-600 font-sans">No specific line items identified.</p>
             )}
          </SummarySection>
        </div>

        {/* Right Column (Sidebar) */}
        <aside className="md:col-span-1 bg-gray-50 p-4 rounded-lg border">
          <SummarySection title="Critical Info">
            <SummaryDetail label="Submission Deadline" value={submissionInstructions.deadline} />
            <SummaryDetail label="Contract Term" value={financials.contractTerm} />
            <SummaryDetail label="Budget Range" value={financials.budgetRange} />
          </SummarySection>

          {flags_for_human_review.length > 0 && (
            <SummarySection title="Flags for Review" className="border-t mt-4">
               <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md font-sans">
                  {flags_for_human_review.map((flag, index) => (
                      <li key={index}>{flag}</li>
                  ))}
               </ul>
            </SummarySection>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ExecutiveSummary;