import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import FileDropzone from '../resume-uploader/file-dropzone';
import FilePreview from '../resume-uploader/file-preview';
import { Textarea } from '@/components/ui/textarea';

interface TextExtractorProps {
  onExtractSuccess?: (text: string) => void;
  apiEndpoint?: string;
  maxFileSize?: number;
}

const TextExtractor: React.FC<TextExtractorProps> = ({
  onExtractSuccess,
  apiEndpoint = '/api/extract-text',
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });
  const { toast } = useToast();

  const acceptedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleFileSelect = (selectedFile: File) => {
    // Reset states
    setError({ show: false, title: '', message: '' });
    setExtractedText('');
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setExtractedText('');
  };

  const showErrorMessage = (title: string, message: string) => {
    setError({
      show: true,
      title,
      message,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    setIsLoading(true);
    setError({ show: false, title: '', message: '' });
    setExtractedText('');
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Text extraction failed. Please try again.');
      }
      
      const data = await response.json();
      setExtractedText(data.text);
      
      toast({
        title: "Text extraction successful!",
        description: "The resume text has been successfully extracted.",
      });
      
      if (onExtractSuccess) {
        onExtractSuccess(data.text);
      }
    } catch (err) {
      let errorMessage = 'There was a problem extracting text from your file. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      showErrorMessage('Extraction failed', errorMessage);
      toast({
        title: "Extraction failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileDrop = (file: File) => {
    try {
      handleFileSelect(file);
    } catch (err) {
      if (err instanceof Error) {
        showErrorMessage('Invalid file', err.message);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Extract Text from Resume</h2>
          
          {/* Error message */}
          {error.show && (
            <Alert variant="destructive" className="mb-4 flex items-start">
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Area */}
            {!extractedText && (
              <>
                <FileDropzone 
                  onFileSelect={handleFileDrop}
                  acceptedFileTypes={acceptedFileTypes}
                  maxFileSize={maxFileSize}
                />
                
                {/* File Preview */}
                {file && (
                  <FilePreview 
                    file={file} 
                    onRemove={handleRemoveFile}
                  />
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!file || isLoading}
                  >
                    <span>{isLoading ? 'Extracting Text...' : 'Extract Text'}</span>
                    {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </Button>
                </div>
              </>
            )}
            
            {/* Extracted Text Display */}
            {extractedText && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-700">Extracted Text</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemoveFile}
                  >
                    Upload Another File
                  </Button>
                </div>
                <Textarea 
                  value={extractedText} 
                  readOnly 
                  className="h-96 font-mono text-sm"
                />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;