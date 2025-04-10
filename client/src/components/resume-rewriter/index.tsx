import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, FileType, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateAndDownloadDocx, generateAndDownloadPdf } from '@/lib/document-generator';

interface ResumeRewriterProps {
  resumeText?: string;
  onRewriteComplete?: (rewrittenText: string) => void;
}

const ResumeRewriter: React.FC<ResumeRewriterProps> = ({ 
  resumeText = '',
  onRewriteComplete
}) => {
  const [text, setText] = useState<string>(resumeText);
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // If we have a previous rewrite, clear it when the text changes
    if (rewrittenText) {
      setRewrittenText('');
    }
  };

  const showErrorMessage = (title: string, message: string) => {
    setError({
      show: true,
      title,
      message,
    });
  };

  const handleRewrite = async () => {
    if (!text.trim()) {
      showErrorMessage('Missing Resume Text', 'Please enter or upload resume text to rewrite.');
      return;
    }

    setIsLoading(true);
    setError({ show: false, title: '', message: '' });
    setRewrittenText('');

    try {
      const originalFormat = localStorage.getItem('originalFileType');
      const response = await fetch('/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          originalFormat,
          preserveFormat: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to rewrite the resume. Please try again.');
      }

      const data = await response.json();
      setRewrittenText(data.rewrittenText);

      toast({
        title: "Resume rewritten!",
        description: "Your resume has been professionally rewritten.",
      });
      
      // Call the callback if provided
      if (onRewriteComplete) {
        onRewriteComplete(data.rewrittenText);
      }
    } catch (err) {
      let errorMessage = 'There was a problem rewriting your resume. Please try again.';
      let errorTitle = 'Rewrite failed';
      
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

  const clearRewrite = () => {
    setRewrittenText('');
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Rewriter</h2>
          <p className="text-gray-600 mb-6">
            Paste your resume text below to receive a professionally rewritten version with clear, 
            impactful language and ATS-friendly formatting.
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

            {/* Rewrite Button */}
            <div>
              <Button
                onClick={handleRewrite}
                className="w-full"
                disabled={!text.trim() || isLoading}
              >
                <span>{isLoading ? 'Rewriting...' : 'Rewrite My Resume'}</span>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>

            {/* Rewritten Result */}
            {rewrittenText && (
              <Card className="mt-6 border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-green-800">
                    Rewritten Resume
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Here's your professionally rewritten resume:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-800 font-medium">
                    {rewrittenText}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-700 hover:bg-green-100 flex gap-2 items-center"
                      >
                        <FileDown className="h-4 w-4" />
                        Download Resume
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {localStorage.getItem('originalFileName') && (
                        <DropdownMenuItem
                          onClick={() => {
                            try {
                              const originalFileName = localStorage.getItem('originalFileName') || 'resume';
                              const originalFileType = localStorage.getItem('originalFileType') || '';
                              const originalFileContent = localStorage.getItem('originalFileContent');
                              
                              if (originalFileContent) {
                                // For now, since actually modifying PDF/DOCX content requires server-side processing
                                // We'll create a modified version based on the input format
                                if (originalFileType === 'application/pdf') {
                                  // Generate a new PDF with the content
                                  generateAndDownloadPdf(rewrittenText, originalFileName.replace('.pdf', ''));
                                  
                                  toast({
                                    title: "Resume downloaded",
                                    description: "Your rewritten resume has been downloaded as a new PDF document. (Note: formatting from the original document could not be preserved)",
                                  });
                                } else if (originalFileType.includes('word')) {
                                  // Generate a new DOCX with the content
                                  generateAndDownloadDocx(rewrittenText, originalFileName.replace('.docx', ''));
                                  
                                  toast({
                                    title: "Resume downloaded",
                                    description: "Your rewritten resume has been downloaded as a new Word document. (Note: formatting from the original document could not be preserved)",
                                  });
                                } else {
                                  // Handle plain text
                                  const blob = new Blob([rewrittenText], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = originalFileName;
                                  document.body.appendChild(a);
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  
                                  toast({
                                    title: "Resume downloaded",
                                    description: "Your rewritten resume has been downloaded in the original format.",
                                  });
                                }
                              } else {
                                throw new Error("Original file content not found");
                              }
                            } catch (error) {
                              console.error("Error generating modified file:", error);
                              toast({
                                title: "Download failed",
                                description: "Failed to modify and download the original file. Try other formats below.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="flex gap-2 items-center"
                        >
                          <FileType className="h-4 w-4" />
                          <span>Download with Original Filename</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => {
                          // Create a blob with the rewritten text
                          const blob = new Blob([rewrittenText], { type: 'text/plain' });
                          // Create a download link
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'rewritten-resume.txt';
                          document.body.appendChild(a);
                          a.click();
                          // Clean up
                          URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          
                          toast({
                            title: "Resume downloaded",
                            description: "Your rewritten resume has been downloaded as a text file.",
                          });
                        }}
                        className="flex gap-2 items-center"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Download as Text (.txt)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={async () => {
                          try {
                            await generateAndDownloadDocx(rewrittenText, 'rewritten-resume');
                            toast({
                              title: "Resume downloaded",
                              description: "Your rewritten resume has been downloaded as a Word document.",
                            });
                          } catch (error) {
                            console.error("Error generating DOCX:", error);
                            toast({
                              title: "Download failed",
                              description: "Failed to generate Word document. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="flex gap-2 items-center"
                      >
                        <FileType className="h-4 w-4" />
                        <span>Download as Word (.docx)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          try {
                            generateAndDownloadPdf(rewrittenText, 'rewritten-resume');
                            toast({
                              title: "Resume downloaded",
                              description: "Your rewritten resume has been downloaded as a PDF document.",
                            });
                          } catch (error) {
                            console.error("Error generating PDF:", error);
                            toast({
                              title: "Download failed",
                              description: "Failed to generate PDF document. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="flex gap-2 items-center"
                      >
                        <FileType className="h-4 w-4" />
                        <span>Download as PDF (.pdf)</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearRewrite}
                    className="text-green-700 hover:bg-green-100"
                  >
                    Clear Result
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

export default ResumeRewriter;