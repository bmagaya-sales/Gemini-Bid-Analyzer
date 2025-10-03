import React, { useState } from 'react';
import { BidAnalysis } from '../types';
import ResultCard from './ResultCard';
import HumanReviewFlags from './HumanReviewFlags';
import LineItemsTable from './LineItemsTable';
import ExecutiveSummary from './ExecutiveSummary';

interface AnalysisResultsProps {
  data: BidAnalysis;
  onDownloadJson: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div>
    <p className="font-semibold text-gray-600">{label}</p>
    <p className="text-gray-800 break-words">{value || 'N/A'}</p>
  </div>
);

const DetailList: React.FC<{ label: string; items: string[] }> = ({ label, items }) => (
  <div>
    <p className="font-semibold text-gray-600">{label}</p>
    {items.length > 0 ? (
      <ul className="list-disc list-inside pl-2 space-y-1">
        {items.map((item, index) => <li key={index} className="text-gray-800">{item}</li>)}
      </ul>
    ) : (
      <p className="text-gray-800">None specified</p>
    )}
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            active
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);

const JsonViewToggle: React.FC<{ isJsonVisible: boolean, setJsonVisible: (visible: boolean) => void }> = ({ isJsonVisible, setJsonVisible }) => (
    <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Show Raw JSON</span>
        <button
            onClick={() => setJsonVisible(!isJsonVisible)}
            type="button"
            className={`${
                isJsonVisible ? 'bg-indigo-600' : 'bg-gray-200'
            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            role="switch"
            aria-checked={isJsonVisible}
        >
            <span
                aria-hidden="true"
                className={`${
                    isJsonVisible ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            />
        </button>
    </div>
);


const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, onDownloadJson }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isJsonVisible, setJsonVisible] = useState(false);

  const TABS = {
    summary: 'Executive Summary',
    requirements: 'Key Requirements',
    details: 'Solicitation Details',
    submission: 'Submission & Financials',
    contact: 'Contact & Compliance',
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!data || data.keyRequirements.lineItems.length === 0) return;

    const items = data.keyRequirements.lineItems;
    const headers = ['Item / Service', 'Quantity', 'Part #', 'Description'];
    const csvRows = [
      headers.join(','),
      ...items.map(item => [
        `"${item.name?.replace(/"/g, '""') || ''}"`,
        `"${item.quantity?.toString().replace(/"/g, '""') || ''}"`,
        `"${item.partNumber?.replace(/"/g, '""') || ''}"`,
        `"${item.description?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8,' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const title = data.solicitationDetails.title?.replace(/\W+/g, '_') || 'bid_line_items';
    link.setAttribute('download', `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <ExecutiveSummary data={data} />;
      case 'details':
        return (
          <ResultCard title="Solicitation Details">
            <DetailItem label="Title" value={data.solicitationDetails.title} />
            <DetailItem label="Agency" value={data.solicitationDetails.agency} />
            <div>
              <p className="font-semibold text-gray-600">Summary</p>
              <p className="text-gray-800 text-sm italic">{data.solicitationDetails.summary || 'N/A'}</p>
            </div>
          </ResultCard>
        );
      case 'requirements':
        return (
          <ResultCard title="Key Requirements">
            <div className="space-y-6">
                <LineItemsTable items={data.keyRequirements.lineItems} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                    <div className="space-y-4">
                      <DetailList label="Eligibility" items={data.keyRequirements.eligibility} />
                      <DetailList label="Objectives" items={data.keyRequirements.objectives} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="font-semibold text-gray-600 mb-2">Product Fit</p>
                        <div className="space-y-3">
                            <DetailItem label="Type" value={data.keyRequirements.productFit.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />
                            <DetailItem label="Details" value={data.keyRequirements.productFit.details} />
                            <DetailItem label="Carried Brand?" value={data.keyRequirements.productFit.isCarriedBrand === null ? 'N/A' : data.keyRequirements.productFit.isCarriedBrand ? 'Yes' : 'No'} />
                        </div>
                    </div>
                </div>
            </div>
          </ResultCard>
        );
      case 'submission':
        return (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultCard title="Submission Instructions">
                <DetailItem label="Deadline" value={data.submissionInstructions.deadline} />
                <DetailList label="Formatting & Delivery" items={data.submissionInstructions.formattingAndDelivery} />
              </ResultCard>
              <ResultCard title="Financials">
                <DetailItem label="Budget Range" value={data.financials.budgetRange} />
                <DetailItem label="Contract Term" value={data.financials.contractTerm} />
              </ResultCard>
           </div>
        );
      case 'contact':
        return (
          <ResultCard title="Contact & Compliance">
            <DetailItem label="Point of Contact" value={data.contactAndCompliance.pointOfContact} />
            <DetailList label="Compliance Requirements" items={data.contactAndCompliance.complianceRequirements} />
          </ResultCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <HumanReviewFlags flags={data.flags_for_human_review} />

      <ResultCard
        title="Relevance Analysis"
        icon={ data.relevanceAnalysis.isRelevant 
                ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
      >
        <div className="flex items-center space-x-3">
          <p className={`text-lg font-bold ${data.relevanceAnalysis.isRelevant ? 'text-green-700' : 'text-red-700'}`}>
            {data.relevanceAnalysis.isRelevant ? 'Relevant' : 'Not Relevant'}
          </p>
          <p className="text-gray-600">({data.relevanceAnalysis.reason})</p>
        </div>
      </ResultCard>

      {!data.relevanceAnalysis.isRelevant && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
            <p>Further analysis has been skipped as the bid was determined to be not relevant.</p>
        </div>
      )}

      {data.relevanceAnalysis.isRelevant && (
         <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b pb-4">
                 <JsonViewToggle isJsonVisible={isJsonVisible} setJsonVisible={setJsonVisible} />
                 <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                     <button
                         onClick={handlePrintSummary}
                         className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm2-9V5a2 2 0 012-2h2a2 2 0 012 2v3" />
                          </svg>
                          Print Summary
                      </button>
                      <button
                         onClick={handleDownloadCsv}
                         className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          Line Items (CSV)
                      </button>
                     <button
                         onClick={onDownloadJson}
                         className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download JSON
                      </button>
                 </div>
            </div>
        
            {isJsonVisible ? (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Raw JSON Output</h3>
                    <pre className="bg-gray-800 text-white p-4 rounded-md text-sm overflow-x-auto">
                        <code>{JSON.stringify(data, null, 2)}</code>
                    </pre>
                </div>
            ) : (
                <div>
                     <div className="mb-4">
                        <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                           {Object.entries(TABS).map(([key, title]) => (
                                <TabButton
                                    key={key}
                                    active={activeTab === key}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {title}
                                </TabButton>
                           ))}
                        </nav>
                     </div>
                     <div className="mt-4">
                         {renderTabContent()}
                     </div>
                </div>
            )}
         </div>
      )}
    </div>
  );
};

export default AnalysisResults;