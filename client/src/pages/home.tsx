import React, { useState } from 'react';
import ResumeUploader from '@/components/resume-uploader';
import TextExtractor from '@/components/text-extractor';
import ResumeRoaster from '@/components/resume-roaster';
import ResumeAnalyzer from '@/components/resume-analyzer';
import ResumeRewriter from '@/components/resume-rewriter';
import RoastResults from '@/components/roast-results';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResumeScore {
  clarity: number;
  impact: number;
  formatting: number;
  relevance: number;
  atsCompatibility: number;
}

interface ResumeAnalysis {
  scores: ResumeScore;
  feedback: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const [extractedText, setExtractedText] = useState('');
  const [roastText, setRoastText] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [rewrittenText, setRewrittenText] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    // Reset other states when new text is extracted
    setRoastText('');
    setAnalysis(null);
    setRewrittenText('');
    setShowResults(false);
  };

  const handleRoastGenerated = (text: string) => {
    setRoastText(text);
    checkAndShowResults();
  };

  const handleAnalysisGenerated = (analysisData: ResumeAnalysis) => {
    setAnalysis(analysisData);
    checkAndShowResults();
  };

  const handleRewriteComplete = (text: string) => {
    setRewrittenText(text);
    checkAndShowResults();
  };

  // Check if we have enough data to show combined results
  const checkAndShowResults = () => {
    if ((roastText || analysis || rewrittenText) && !showResults) {
      setShowResults(true);
      setActiveTab('results');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-100 p-4 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Roast My Resume</h1>
      
      <Tabs 
        defaultValue="upload" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full max-w-3xl"
      >
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="extract">Extract</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="roast">Roast</TabsTrigger>
          <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
          <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="flex justify-center">
          <ResumeUploader 
            onSubmitSuccess={() => setActiveTab('extract')}
          />
        </TabsContent>
        
        <TabsContent value="extract" className="flex justify-center">
          <TextExtractor 
            onExtractSuccess={handleTextExtracted}
          />
        </TabsContent>

        <TabsContent value="analyze" className="flex justify-center">
          <ResumeAnalyzer 
            resumeText={extractedText}
            onAnalysisComplete={handleAnalysisGenerated}
          />
        </TabsContent>

        <TabsContent value="roast" className="flex justify-center">
          <ResumeRoaster 
            resumeText={extractedText}
            onRoastComplete={handleRoastGenerated}
          />
        </TabsContent>

        <TabsContent value="rewrite" className="flex justify-center">
          <ResumeRewriter 
            resumeText={extractedText}
            onRewriteComplete={handleRewriteComplete}
          />
        </TabsContent>

        <TabsContent value="results" className="flex justify-center">
          {showResults && (
            <RoastResults 
              roastText={roastText} 
              analysis={analysis || undefined}
              resumeText={extractedText}
              rewrittenText={rewrittenText}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
