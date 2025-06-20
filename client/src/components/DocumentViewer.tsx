import { useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  fileName: string;
  fileType: string;
  filePath?: string;
  mimeType?: string;
  className?: string;
}

export function DocumentViewer({ fileName, fileType, filePath, mimeType, className = "" }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!filePath || !fileName) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No document available to display</p>
      </div>
    );
  }

  // Extract filename from path for the API endpoint
  const apiFileName = filePath.split('/').pop() || fileName;
  const fileUrl = `/api/files/${apiFileName}`;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FileText className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load document</p>
        <div className="flex gap-2">
          <Button onClick={downloadFile} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={openInNewTab} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Document Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{fileName}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{fileType}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadFile} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={openInNewTab} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="relative" style={{ height: '600px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
            </div>
          </div>
        )}
        
        {fileType === 'pdf' ? (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0 rounded-b-lg"
            title={fileName}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : fileType === 'docx' || fileType === 'doc' ? (
          // For DOCX files, we'll use Office Online viewer if available, otherwise show download prompt
          <div className="flex flex-col items-center justify-center h-full p-8">
            <FileText className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Word Document
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Click the buttons above to download or open this document in a new tab for viewing.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              File: {fileName}
            </div>
          </div>
        ) : (
          // Generic file viewer
          <div className="flex flex-col items-center justify-center h-full p-8">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Document Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Use the buttons above to download or open this document.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              File: {fileName} ({fileType?.toUpperCase()})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}