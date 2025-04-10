import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResumeUploader from '@/components/resume-uploader';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Function to extract text from the uploaded resume file
  const extractTextFromFile = async (resumeFile: File) => {
    setIsExtracting(true);
    setExtractError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract text from the resume.');
      }
      
      const data = await response.json();
      setResumeText(data.text);
      
      // Store resume text in localStorage
      localStorage.setItem('resumeText', data.text);
      
      // Store original file information for later use
      localStorage.setItem('originalFileName', resumeFile.name);
      localStorage.setItem('originalFileType', resumeFile.type);
      
      // Store the original file for later modification
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // Store as base64 to handle binary data
          const base64Content = e.target.result.toString();
          localStorage.setItem('originalFileContent', base64Content);
        }
      };
      
      // Read the file as appropriate for the file type
      if (resumeFile.type === 'application/pdf') {
        reader.readAsDataURL(resumeFile);
      } else if (resumeFile.type.includes('word')) {
        reader.readAsDataURL(resumeFile);
      } else {
        reader.readAsText(resumeFile);
      }
      
      toast({
        title: "Text extraction successful",
        description: "Your resume has been processed successfully.",
      });
      
      // Navigate to results page
      navigate('/results');
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractError(error instanceof Error ? error.message : 'Failed to extract text from the resume.');
      
      toast({
        title: "Text extraction failed",
        description: "There was a problem processing your resume.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleUploadSuccess = async (file?: File) => {
    if (file) {
      // If we have the file, extract the text
      await extractTextFromFile(file);
    } else {
      // Otherwise just navigate to results (file should be on server)
      navigate('/results');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Upload Your Resume</h1>
          <p className="text-xl text-gray-600">
            Get instant AI-powered feedback on your resume
          </p>
        </div>
        
        <Card className="border-2">
          <CardContent className="p-8">
            <ResumeUploader 
              onSubmitSuccess={handleUploadSuccess} 
              apiEndpoint="/api/resume" 
              maxFileSize={5 * 1024 * 1024} // 5MB
            />
          </CardContent>
        </Card>
        
        <div className="text-center space-y-2 text-sm text-gray-500">
          <p>Supported formats: PDF and DOCX (Max 5MB)</p>
          <p>Your resume data is processed securely and not stored permanently</p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;