import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeRoasterProps {
  resumeText?: string;
  onRoastComplete?: (roast: string) => void;
}

const ResumeRoaster: React.FC<ResumeRoasterProps> = ({ 
  resumeText = '',
  onRoastComplete 
}) => {
  const [text, setText] = useState<string>(resumeText);
  const [roast, setRoast] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // If we have a previous roast, clear it when the text changes
    if (roast) {
      setRoast('');
    }
  };

  const showErrorMessage = (title: string, message: string) => {
    setError({
      show: true,
      title,
      message,
    });
  };

  const handleRoast = async () => {
    if (!text.trim()) {
      showErrorMessage('Missing Resume Text', 'Please enter or upload resume text to roast.');
      return;
    }

    setIsLoading(true);
    setError({ show: false, title: '', message: '' });
    setRoast('');

    try {
      const response = await fetch('/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to roast the resume. Please try again.');
      }

      const data = await response.json();
      setRoast(data.roast);

      toast({
        title: "Roast generated!",
        description: "Your resume has been roasted. Hope you have a sense of humor!",
      });
      
      // Call the callback if provided
      if (onRoastComplete) {
        onRoastComplete(data.roast);
      }
    } catch (err) {
      let errorMessage = 'There was a problem roasting your resume. Please try again.';
      let errorTitle = 'Roast failed';
      
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

  const clearRoast = () => {
    setRoast('');
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Roaster</h2>
          <p className="text-gray-600 mb-6">
            Paste your resume text below and get a humorous, sarcastic critique. 
            Don't take it too seriously — it's meant to be fun!
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

            {/* Roast Button */}
            <div>
              <Button
                onClick={handleRoast}
                className="w-full"
                disabled={!text.trim() || isLoading}
              >
                <span>{isLoading ? 'Roasting...' : 'Roast My Resume'}</span>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>

            {/* Roast Result */}
            {roast && (
              <Card className="mt-6 border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-purple-800">
                    Roast Result
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Here's your sarcastic resume critique:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-800 font-medium">
                    {roast}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearRoast}
                    className="ml-auto text-purple-700 hover:bg-purple-100"
                  >
                    Clear Roast
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

export default ResumeRoaster;