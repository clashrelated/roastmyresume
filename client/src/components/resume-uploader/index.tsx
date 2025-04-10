import React, { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import FileDropzone from './file-dropzone';
import FilePreview from './file-preview';
import { apiRequest } from '@/lib/queryClient';

interface ResumeUploaderProps {
  onSubmitSuccess?: (file?: File) => void;
  apiEndpoint?: string;
  maxFileSize?: number;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onSubmitSuccess,
  apiEndpoint = '/api/resume',
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const acceptedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleFileSelect = (selectedFile: File) => {
    // Reset states
    setError({ show: false, title: '', message: '' });
    setSuccess(false);
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
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
    setSuccess(false);
    
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
        throw new Error(errorData?.message || 'Upload failed. Please try again.');
      }
      
      setSuccess(true);
      setFile(null);
      toast({
        title: "Upload successful!",
        description: "Your resume has been successfully uploaded.",
      });
      
      if (onSubmitSuccess) {
        // Pass the file to the callback so it can be used for text extraction
        const uploadedFile = file;
        onSubmitSuccess(uploadedFile);
      }
    } catch (err) {
      let errorMessage = 'There was a problem uploading your file. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      showErrorMessage('Upload failed', errorMessage);
      toast({
        title: "Upload failed",
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success message */}
        {success && (
          <Alert variant="success" className="mb-4">
            <AlertTitle>Upload successful!</AlertTitle>
            <AlertDescription>Your resume has been successfully uploaded.</AlertDescription>
          </Alert>
        )}
        
        {/* Error message */}
        {error.show && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        
        {/* Main Upload Area */}
        <div className={`
          w-full 
          min-h-[300px] 
          border-2 
          border-dashed 
          rounded-lg 
          ${file ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:border-purple-400'} 
          transition-colors 
          duration-200
          flex 
          flex-col 
          items-center 
          justify-center 
          p-8
          relative
        `}>
          {!file ? (
            <FileDropzone 
              onFileSelect={handleFileDrop}
              acceptedFileTypes={acceptedFileTypes}
              maxFileSize={maxFileSize}
            />
          ) : (
            <div className="w-full max-w-md">
              <FilePreview 
                file={file} 
                onRemove={handleRemoveFile}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-6 text-lg"
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload and Analyze
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResumeUploader;
