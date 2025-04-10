import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

interface ResumeAnalyzerProps {
  resumeText?: string;
  onAnalysisComplete?: (analysis: ResumeAnalysis) => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ 
  resumeText = '',
  onAnalysisComplete
}) => {
  const [text, setText] = useState<string>(resumeText);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // If we have a previous analysis, clear it when the text changes
    if (analysis) {
      setAnalysis(null);
    }
  };

  const showErrorMessage = (title: string, message: string) => {
    setError({
      show: true,
      title,
      message,
    });
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      showErrorMessage('Missing Resume Text', 'Please enter or upload resume text to analyze.');
      return;
    }

    setIsLoading(true);
    setError({ show: false, title: '', message: '' });
    setAnalysis(null);

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to analyze the resume. Please try again.');
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      toast({
        title: "Analysis complete!",
        description: "Your resume has been professionally analyzed.",
      });
      
      // Call the callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err) {
      let errorMessage = 'There was a problem analyzing your resume. Please try again.';
      let errorTitle = 'Analysis failed';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for specific error messages related to API quota
        if (errorMessage.includes('quota') || errorMessage.includes('API') || errorMessage.includes('OpenAI')) {
          errorTitle = 'AI Service Unavailable';
          errorMessage = 'The AI service quota has been exceeded. Please try again later or contact support.';
        }
      }
      
      showErrorMessage(errorTitle, errorMessage);
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
  };

  const scoreColor = (score: number): string => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const scoreText = (score: number): string => {
    if (score >= 8) return 'text-green-700';
    if (score >= 6) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Analyzer</h2>
          <p className="text-gray-600 mb-6">
            Paste your resume text below to receive a professional analysis, including scores
            for clarity, impact, formatting, relevance, and ATS compatibility.
          </p>

          {/* Error message */}
          {error.show && (
            <Alert variant="destructive" className="mb-4 flex items-start">
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Input text area */}
            <div>
              <Textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your resume text here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            {/* Analyze Button */}
            <div>
              <Button
                onClick={handleAnalyze}
                className="w-full"
                disabled={!text.trim() || isLoading}
              >
                <span>{isLoading ? 'Analyzing...' : 'Analyze My Resume'}</span>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>

            {/* Analysis Result */}
            {analysis && (
              <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-blue-800">
                    Resume Analysis
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Professional assessment of your resume:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scores */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">Scores (1-10)</h3>
                    
                    <div className="space-y-2">
                      {/* Clarity */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Clarity</span>
                          <span className={`font-bold ${scoreText(analysis.scores.clarity)}`}>{analysis.scores.clarity}/10</span>
                        </div>
                        <Progress value={analysis.scores.clarity * 10} className="h-2" indicatorClassName={scoreColor(analysis.scores.clarity)} />
                      </div>
                      
                      {/* Impact */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Impact</span>
                          <span className={`font-bold ${scoreText(analysis.scores.impact)}`}>{analysis.scores.impact}/10</span>
                        </div>
                        <Progress value={analysis.scores.impact * 10} className="h-2" indicatorClassName={scoreColor(analysis.scores.impact)} />
                      </div>
                      
                      {/* Formatting */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Formatting</span>
                          <span className={`font-bold ${scoreText(analysis.scores.formatting)}`}>{analysis.scores.formatting}/10</span>
                        </div>
                        <Progress value={analysis.scores.formatting * 10} className="h-2" indicatorClassName={scoreColor(analysis.scores.formatting)} />
                      </div>
                      
                      {/* Relevance */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Relevance</span>
                          <span className={`font-bold ${scoreText(analysis.scores.relevance)}`}>{analysis.scores.relevance}/10</span>
                        </div>
                        <Progress value={analysis.scores.relevance * 10} className="h-2" indicatorClassName={scoreColor(analysis.scores.relevance)} />
                      </div>
                      
                      {/* ATS Compatibility */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ATS Compatibility</span>
                          <span className={`font-bold ${scoreText(analysis.scores.atsCompatibility)}`}>{analysis.scores.atsCompatibility}/10</span>
                        </div>
                        <Progress value={analysis.scores.atsCompatibility * 10} className="h-2" indicatorClassName={scoreColor(analysis.scores.atsCompatibility)} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Feedback */}
                  <div className="pt-4 border-t border-blue-200">
                    <h3 className="font-medium text-gray-700 mb-2">Feedback & Suggestions</h3>
                    <div className="text-gray-800 whitespace-pre-line">
                      {analysis.feedback}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAnalysis}
                    className="ml-auto text-blue-700 hover:bg-blue-100"
                  >
                    Clear Analysis
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;