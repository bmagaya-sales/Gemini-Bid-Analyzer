import React, { useRef } from 'react';

interface BidInputFormProps {
  bidText: string;
  setBidText: (text: string) => void;
  onFileUpload: (file: { name: string; mimeType: string; data: string }) => void;
  uploadedFile: { name: string } | null;
  clearUploadedFile: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

// FIX: Corrected typo from BidInputF_ormProps to BidInputFormProps
const BidInputForm: React.FC<BidInputFormProps> = ({ bidText, setBidText, onFileUpload, uploadedFile, clearUploadedFile, onAnalyze, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
        onFileUpload({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
        });
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Paste Bid Solicitation or Upload File</h2>
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Document
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
          aria-label="Upload bid document"
          onClick={(event) => { (event.target as HTMLInputElement).value = '' }}
        />
      </div>
       {uploadedFile && (
        <div className="mb-4 flex items-center justify-between bg-gray-100 p-3 rounded-md border border-gray-200">
          <div className="flex items-center space-x-3 text-gray-700 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium truncate" title={uploadedFile.name}>{uploadedFile.name}</span>
          </div>
          <button
            onClick={clearUploadedFile}
            disabled={isLoading}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Remove uploaded file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <textarea
        value={bidText}
        onChange={(e) => setBidText(e.target.value)}
        placeholder="Paste the full text of the government bid solicitation here, or upload a document."
        className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-700 leading-relaxed disabled:bg-gray-100 disabled:cursor-not-allowed"
        disabled={isLoading || !!uploadedFile}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={onAnalyze}
          disabled={isLoading || (!bidText.trim() && !uploadedFile)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Bid'
          )}
        </button>
      </div>
    </div>
  );
};

export default BidInputForm;