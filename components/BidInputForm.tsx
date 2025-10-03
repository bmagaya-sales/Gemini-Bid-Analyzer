import React, { useRef } from 'react';
import { parseFile } from '../utils/fileParser';

interface BidInputFormProps {
  bidText: string;
  setBidText: (text: string) => void;
  onFileUploads: (files: { name: string; text: string }[]) => void;
  uploadedFiles: { name: string }[];
  removeUploadedFile: (index: number) => void;
  clearAllUploadedFiles: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
  setError: (message: string | null) => void;
}

const BidInputForm: React.FC<BidInputFormProps> = ({ bidText, setBidText, onFileUploads, uploadedFiles, removeUploadedFile, clearAllUploadedFiles, onAnalyze, isLoading, setError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setError(null); // Clear previous errors
      // FIX: Use a for...of loop to iterate over the FileList.
      // This correctly infers the type of `file` as `File`, resolving the 'unknown' type error.
      const filePromises = [];
      for (const file of files) {
        filePromises.push(
          parseFile(file).catch(err => {
            console.error(`Error parsing file ${file.name}:`, err);
            setError(`Could not parse ${file.name}: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
            return null;
          })
        );
      }
      
      const results = await Promise.all(filePromises);
      const successfulFiles = results.filter((result): result is { name: string; text: string } => result !== null);
      
      if (successfulFiles.length > 0) {
        onFileUploads(successfulFiles);
      }
    }
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Paste Bid Solicitation or Upload File(s)</h2>
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Document(s)
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.xlsx,.xls,.txt,.md"
          aria-label="Upload bid documents"
          multiple
          onClick={(event) => { (event.target as HTMLInputElement).value = '' }}
        />
      </div>
       {uploadedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-600">Uploaded Files:</h3>
            <button
              onClick={clearAllUploadedFiles}
              disabled={isLoading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              Clear All
            </button>
          </div>
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="ml-2 flex-1 w-0 truncate" title={file.name}>{file.name}</span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => removeUploadedFile(index)}
                    disabled={isLoading}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <textarea
        value={bidText}
        onChange={(e) => setBidText(e.target.value)}
        placeholder="Paste the full text of the government bid solicitation here, or upload one or more documents."
        className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-700 leading-relaxed disabled:bg-gray-100 disabled:cursor-not-allowed"
        disabled={isLoading || uploadedFiles.length > 0}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={onAnalyze}
          disabled={isLoading || (!bidText.trim() && uploadedFiles.length === 0)}
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
