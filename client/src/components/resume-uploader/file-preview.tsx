import React from 'react';
import { FileIcon, File, FileText, X } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    const sizeInKB = Math.round(bytes / 1024);
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Determine icon based on file type
  const getFileIcon = () => {
    switch (file.type) {
      case 'application/pdf':
        return <File className="h-5 w-5 text-primary-600" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="h-5 w-5 text-primary-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-primary-600" />;
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            {getFileIcon()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
