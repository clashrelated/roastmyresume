import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes: string[];
  maxFileSize: number;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  acceptedFileTypes,
  maxFileSize,
}) => {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): { valid: boolean; message?: string } => {
    // Check file type
    if (!acceptedFileTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Invalid file type. Please upload a PDF or DOCX file.',
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        message: `File too large. Please upload a file smaller than ${Math.round(maxFileSize / (1024 * 1024))}MB.`,
      };
    }

    return { valid: true };
  };

  const handleFiles = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (validation.valid) {
        onFileSelect(file);
      } else {
        // Return the validation error so the parent component can display it
        throw new Error(validation.message);
      }
    },
    [onFileSelect, acceptedFileTypes, maxFileSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles?.length) {
        handleFiles(droppedFiles[0]);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files?.length) {
        handleFiles(e.target.files[0]);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    []
  );

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:bg-gray-50'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="space-y-3">
        <Upload className="h-8 w-8 mx-auto text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-700">
            Drag and drop your resume here or{' '}
            <span className="text-primary-600">browse files</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, DOCX (Max {Math.round(maxFileSize / (1024 * 1024))}MB)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={acceptedFileTypes.join(',')}
      />
    </div>
  );
};

export default FileDropzone;
