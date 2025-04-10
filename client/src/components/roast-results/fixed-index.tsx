import React, { useRef, useState, useEffect } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  Printer, 
  Check, 
  Loader2,
  ImageIcon,
  Quote,
  FileText,
  FileType
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateAndDownloadDocx, generateAndDownloadPdf } from '@/lib/document-generator';

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

interface RoastResultsProps {
  roastText: string;
  analysis?: ResumeAnalysis;
  resumeText?: string;
  rewrittenText?: string;
}

const RoastResults: React.FC<RoastResultsProps> = ({ 
  roastText, 
  analysis,
  resumeText = '',
  rewrittenText = ''
}) => {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingShareImage, setIsGeneratingShareImage] = useState<boolean>(false);
  const [quoteText, setQuoteText] = useState<string>('');
  const [isQuoteCopied, setIsQuoteCopied] = useState<boolean>(false);
  
  // Generate quote text on mount
  useEffect(() => {
    generateShareQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, roastText, rewrittenText]);

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

  const averageScore = analysis 
    ? (
        analysis.scores.clarity + 
        analysis.scores.impact + 
        analysis.scores.formatting + 
        analysis.scores.relevance + 
        analysis.scores.atsCompatibility
      ) / 5
    : 0;

  const getShareableContent = (): string => {
    let content = "Resume Roast & Analysis Results\n\n";
    
    if (roastText) {
      content += "ROAST:\n";
      content += roastText + "\n\n";
    }
    
    if (analysis) {
      content += "ANALYSIS:\n";
      content += `Overall Score: ${averageScore.toFixed(1)}/10\n\n`;
      content += `Clarity: ${analysis.scores.clarity}/10\n`;
      content += `Impact: ${analysis.scores.impact}/10\n`;
      content += `Formatting: ${analysis.scores.formatting}/10\n`;
      content += `Relevance: ${analysis.scores.relevance}/10\n`;
      content += `ATS Compatibility: ${analysis.scores.atsCompatibility}/10\n\n`;
      content += `Feedback: ${analysis.feedback}\n\n`;
    }
    
    if (rewrittenText) {
      content += "REWRITTEN RESUME:\n";
      content += rewrittenText + "\n";
    }
    
    return content;
  };

  const copyToClipboard = async () => {
    try {
      const text = getShareableContent();
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Resume analysis has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or use another share method.",
        variant: "destructive",
      });
    }
  };

  const exportAsPNG = async () => {
    if (!resultsRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = 'resume-analysis.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "Downloaded as PNG",
        description: "Your resume analysis has been saved as an image.",
      });
    } catch (err) {
      toast({
        title: "Failed to download",
        description: "Please try again or use another share method.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!resultsRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });
      
      // Calculate the PDF dimensions based on the canvas aspect ratio
      const imgWidth = 210; // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('resume-analysis.pdf');
      
      toast({
        title: "Downloaded as PDF",
        description: "Your resume analysis has been saved as a PDF document.",
      });
    } catch (err) {
      toast({
        title: "Failed to download",
        description: "Please try again or use another share method.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const printResults = () => {
    window.print();
  };
  
  // Generate the shareable social media quote
  const generateShareQuote = () => {
    if (analysis) {
      const score = Math.round(averageScore * 10); // Convert to scale of 100
      setQuoteText(`AI roasted my resume and gave it a ${score}/100. Career crisis loading...`);
    } else if (roastText) {
      setQuoteText(`AI roasted my resume today and I'm questioning my entire career path now...`);
    } else if (rewrittenText) {
      setQuoteText(`AI just transformed my resume. Game changer for my job search!`);
    } else {
      setQuoteText(`AI Roast My Resume just changed how I see my career path...`);
    }
  };

  // Copy the quote to clipboard
  const copyQuoteToClipboard = async () => {
    if (!quoteText) {
      generateShareQuote();
    }
    
    try {
      await navigator.clipboard.writeText(quoteText);
      setIsQuoteCopied(true);
      toast({
        title: "Social Quote Copied!",
        description: "Share it on social media with your screenshot.",
      });
      setTimeout(() => setIsQuoteCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy quote",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generate a shareable image specifically for social media
  const generateShareImage = async () => {
    if (!resultsRef.current) return;
    
    setIsGeneratingShareImage(true);
    try {
      // Create a clone of the results div to modify for social sharing
      const originalDiv = resultsRef.current;
      const clone = originalDiv.cloneNode(true) as HTMLDivElement;
      
      // Apply specific styling for social media image
      clone.style.backgroundColor = '#ffffff';
      clone.style.padding = '20px';
      clone.style.borderRadius = '10px';
      clone.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
      clone.style.maxWidth = '1200px';
      clone.style.width = '100%';
      
      // Temporarily append to body but hide it
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      // Generate canvas from the clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      // Remove the clone from DOM
      document.body.removeChild(clone);
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'resume-analysis-social.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Generate quote if not already done
      if (!quoteText) {
        generateShareQuote();
      }
      
      toast({
        title: "Share Image Generated!",
        description: "Your social share image has been downloaded. Don't forget to copy the quote text to use as your caption!",
      });
    } catch (err) {
      toast({
        title: "Failed to generate share image",
        description: "Please try again or use another share method.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingShareImage(false);
    }
  };

  // Function to download rewritten resume as DOCX
  const downloadRewrittenResumeAsDocx = async () => {
    if (!rewrittenText) {
      toast({
        title: "No rewritten resume",
        description: "You need to rewrite your resume first.",
        variant: "destructive",
      });
      return;
    }

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
  };

  // Function to download rewritten resume as PDF
  const downloadRewrittenResumeAsPdf = () => {
    if (!rewrittenText) {
      toast({
        title: "No rewritten resume",
        description: "You need to rewrite your resume first.",
        variant: "destructive",
      });
      return;
    }

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
  };

  // Function to download rewritten resume as plain text
  const downloadRewrittenResumeAsText = () => {
    if (!rewrittenText) {
      toast({
        title: "No rewritten resume",
        description: "You need to rewrite your resume first.",
        variant: "destructive",
      });
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error generating text file:", error);
      toast({
        title: "Download failed",
        description: "Failed to generate text file. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="w-full max-w-3xl print:max-w-none print:w-full">
      <Card className="relative bg-white shadow-lg">
        <div className="absolute top-4 right-4 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Share Results</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyToClipboard} disabled={isCopied}>
                <Copy className="h-4 w-4 mr-2" />
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                {isCopied && <Check className="h-4 w-4 ml-2 text-green-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPNG} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Save as Image'}
                {isExporting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Save as PDF'}
                {isExporting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={printResults}>
                <Printer className="h-4 w-4 mr-2" />
                Print Results
              </DropdownMenuItem>
              {rewrittenText && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Download Rewritten Resume</DropdownMenuLabel>
                  <DropdownMenuItem onClick={downloadRewrittenResumeAsText}>
                    <FileText className="h-4 w-4 mr-2" />
                    Download as Text (.txt)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadRewrittenResumeAsDocx}>
                    <FileType className="h-4 w-4 mr-2" />
                    Download as Word (.docx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadRewrittenResumeAsPdf}>
                    <FileType className="h-4 w-4 mr-2" />
                    Download as PDF (.pdf)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div ref={resultsRef} className="p-6 print:p-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Resume Evaluation Results
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              A combination of humor and professional feedback
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Roast Section */}
            {roastText && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-2">Roast</h3>
                <div className="text-gray-800 italic whitespace-pre-line">
                  "{roastText}"
                </div>
              </div>
            )}
            
            {/* Analysis Section */}
            {analysis && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-800">Professional Analysis</h3>
                
                {/* Overall Score */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Overall Score</span>
                    <span className={`text-xl font-bold ${scoreText(averageScore)}`}>
                      {averageScore.toFixed(1)}/10
                    </span>
                  </div>
                  <Progress 
                    value={averageScore * 10} 
                    className="h-3"
                    indicatorClassName={scoreColor(averageScore)}
                  />
                </div>
                
                {/* Individual Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Clarity */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Clarity</span>
                      <span className={`font-bold ${scoreText(analysis.scores.clarity)}`}>
                        {analysis.scores.clarity}/10
                      </span>
                    </div>
                    <Progress 
                      value={analysis.scores.clarity * 10} 
                      className="h-2"
                      indicatorClassName={scoreColor(analysis.scores.clarity)}
                    />
                  </div>
                  
                  {/* Impact */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Impact</span>
                      <span className={`font-bold ${scoreText(analysis.scores.impact)}`}>
                        {analysis.scores.impact}/10
                      </span>
                    </div>
                    <Progress 
                      value={analysis.scores.impact * 10} 
                      className="h-2"
                      indicatorClassName={scoreColor(analysis.scores.impact)}
                    />
                  </div>
                  
                  {/* Formatting */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Formatting</span>
                      <span className={`font-bold ${scoreText(analysis.scores.formatting)}`}>
                        {analysis.scores.formatting}/10
                      </span>
                    </div>
                    <Progress 
                      value={analysis.scores.formatting * 10} 
                      className="h-2"
                      indicatorClassName={scoreColor(analysis.scores.formatting)}
                    />
                  </div>
                  
                  {/* Relevance */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Relevance</span>
                      <span className={`font-bold ${scoreText(analysis.scores.relevance)}`}>
                        {analysis.scores.relevance}/10
                      </span>
                    </div>
                    <Progress 
                      value={analysis.scores.relevance * 10} 
                      className="h-2"
                      indicatorClassName={scoreColor(analysis.scores.relevance)}
                    />
                  </div>
                  
                  {/* ATS Compatibility */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">ATS Compatibility</span>
                      <span className={`font-bold ${scoreText(analysis.scores.atsCompatibility)}`}>
                        {analysis.scores.atsCompatibility}/10
                      </span>
                    </div>
                    <Progress 
                      value={analysis.scores.atsCompatibility * 10} 
                      className="h-2"
                      indicatorClassName={scoreColor(analysis.scores.atsCompatibility)}
                    />
                  </div>
                </div>
                
                {/* Feedback */}
                <div className="pt-4 border-t border-blue-200">
                  <h3 className="font-medium text-gray-700 mb-2">Feedback & Suggestions</h3>
                  <div className="text-gray-800 whitespace-pre-line">
                    {analysis.feedback}
                  </div>
                </div>
              </div>
            )}
            
            {/* Rewritten Resume */}
            {rewrittenText && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-green-800">Rewritten Resume</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-gray-800 whitespace-pre-line font-medium">
                    {rewrittenText}
                  </div>
                </div>
              </div>
            )}
            
            {/* Social Media Quote */}
            <div className="mt-6 pt-6 border-t border-gray-200 print:hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Share on Social Media</h3>
                <Button variant="outline" size="sm" onClick={copyQuoteToClipboard} disabled={isQuoteCopied}>
                  <Quote className="h-3 w-3 mr-1" />
                  {isQuoteCopied ? 'Copied!' : 'Copy Quote'}
                  {isQuoteCopied && <Check className="h-3 w-3 ml-1 text-green-500" />}
                </Button>
              </div>
              <div className="mt-2 bg-gray-100 p-3 rounded-md text-gray-700 italic text-sm">
                "{quoteText}"
              </div>
              <div className="mt-3 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateShareImage} 
                  disabled={isGeneratingShareImage}
                  className="text-blue-600"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {isGeneratingShareImage ? 'Generating...' : 'Generate Social Image'}
                  {isGeneratingShareImage && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default RoastResults;