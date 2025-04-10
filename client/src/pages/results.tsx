import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import ResumeRoaster from '@/components/resume-roaster';
import ResumeAnalyzer from '@/components/resume-analyzer';
import RoastResults from '@/components/roast-results';

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

const ResultsPage: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>('');
  const [roastText, setRoastText] = useState<string>('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('results');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedResumeText = localStorage.getItem('resumeText');
    if (storedResumeText) {
      setResumeText(storedResumeText);
      setIsLoading(false);
    } else {
      setError('No resume text found. Please upload a resume first.');
      setIsLoading(false);
    }

    const storedRoast = localStorage.getItem('roastText');
    const storedAnalysis = localStorage.getItem('analysisResults');

    if (storedRoast) setRoastText(storedRoast);
    if (storedAnalysis) setAnalysis(JSON.parse(storedAnalysis));

    return () => {
      localStorage.removeItem('roastText');
      localStorage.removeItem('analysisResults');
      localStorage.removeItem('resumeText');
    };
  }, []);

  const handleRoastComplete = (roast: string) => {
    setRoastText(roast);
    localStorage.setItem('roastText', roast);
    setActiveTab('results');
  };

  const handleAnalysisComplete = (analysisData: ResumeAnalysis) => {
    setAnalysis(analysisData);
    localStorage.setItem('analysisResults', JSON.stringify(analysisData));
    setActiveTab('results');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg">Loading your resume data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Resume Analysis</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="roast">Roast</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="flex justify-center">
          {(roastText || analysis) ? (
            <RoastResults
              roastText={roastText}
              analysis={analysis}
              resumeText={resumeText}
            />
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>No Results Yet</CardTitle>
                <CardDescription>
                  Use the tabs above to roast or analyze your resume.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Select one of the processing options to generate results:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Roast: Get a humorous critique of your resume</li>
                  <li>Analyze: Get professional scores and feedback</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roast">
          <ResumeRoaster
            resumeText={resumeText}
            onRoastComplete={handleRoastComplete}
          />
        </TabsContent>

        <TabsContent value="analyze">
          <ResumeAnalyzer
            resumeText={resumeText}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsPage;