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
  const [uploadedFiles, setUploadedFiles] = useState<({ name: string; text: string }[])>([]);
  const [analysisResult, setAnalysisResult] = useState<BidAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetBidText = (text: string) => {
    setBidText(text);
    if (text) {
      setUploadedFiles([]); // Clear files if text is entered
    }
  };

  const handleFileUploads = (files: { name: string; text: string }[]) => {
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    if (files.length > 0) {
      setBidText(''); // Clear text if files are uploaded
    }
  };
  
  const removeUploadedFile = (indexToRemove: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const clearAllUploadedFiles = () => {
    setUploadedFiles([]);
  };

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      if (!bidText.trim() && uploadedFiles.length === 0) {
        throw new Error("Please paste bid text or upload one or more files to analyze.");
      }

      let combinedText = bidText;
      if (uploadedFiles.length > 0) {
        combinedText = uploadedFiles
          .map(f => `--- START OF DOCUMENT: ${f.name} ---\n\n${f.text}\n\n--- END OF DOCUMENT: ${f.name} ---`)
          .join('\n\n');
      }

      const result = await analyzeBid({ text: combinedText });
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
  }, [bidText, uploadedFiles]);

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
              onFileUploads={handleFileUploads}
              uploadedFiles={uploadedFiles.map(f => ({ name: f.name }))}
              removeUploadedFile={removeUploadedFile}
              clearAllUploadedFiles={clearAllUploadedFiles}
              onAnalyze={handleAnalyze} 
              isLoading={isLoading} 
              setError={setError}
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