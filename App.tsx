import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import BidInputForm from './components/BidInputForm';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import AnalysisResults from './components/AnalysisResults';
import { BidAnalysis } from './types';
import { analyzeBid } from './services/geminiService';

const App: React.FC = () => {
  const [bidText, setBidText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BidAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetBidText = (text: string) => {
    setBidText(text);
    if (text) {
      setUploadedFile(null); // Clear file if text is entered
    }
  };

  const handleFileUpload = (file: { name: string; mimeType: string; data: string }) => {
    setUploadedFile(file);
    if (file) {
      setBidText(''); // Clear text if file is uploaded
    }
  };
  
  const clearUploadedFile = () => {
      setUploadedFile(null);
  };

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      if (!bidText.trim() && !uploadedFile) {
        throw new Error("Please paste bid text or upload a file to analyze.");
      }

      const contentToAnalyze = uploadedFile
        ? { file: { mimeType: uploadedFile.mimeType, data: uploadedFile.data } }
        : { text: bidText };

      const result = await analyzeBid(contentToAnalyze);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [bidText, uploadedFile]);

  const handleDownloadJson = useCallback(() => {
    if (!analysisResult) return;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analysisResult, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    const title = analysisResult.solicitationDetails.title?.replace(/\W+/g, '_') || 'bid_analysis';
    link.download = `${title}.json`;
    link.click();
  }, [analysisResult]);


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
            <BidInputForm 
              bidText={bidText} 
              setBidText={handleSetBidText}
              onFileUpload={handleFileUpload}
              uploadedFile={uploadedFile}
              clearUploadedFile={clearUploadedFile}
              onAnalyze={handleAnalyze} 
              isLoading={isLoading} 
            />
            <div className="mt-8">
              {isLoading && <LoadingSpinner />}
              {error && <ErrorMessage message={error} />}
              {analysisResult && <AnalysisResults data={analysisResult} onDownloadJson={handleDownloadJson} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;