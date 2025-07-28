import { useState } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentPath: string;
  documentName: string;
  documentType: string;
}

export function DocumentPreviewModal({ 
  isOpen, 
  onClose, 
  documentPath, 
  documentName, 
  documentType 
}: DocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentPath;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(documentPath, '_blank');
  };

  const renderPreview = () => {
    switch (documentType?.toLowerCase()) {
      case 'pdf':
        return (
          <iframe
            src={documentPath}
            className="w-full h-full border-0 rounded-lg"
            onLoad={() => setIsLoading(false)}
            title={documentName}
            style={{ minHeight: '600px' }}
          />
        );
      case 'docx':
        return (
          <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
            <div className="mb-4">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{documentName}</h3>
              <p className="text-gray-600 mb-6">
                Word documents require download to view. Click the download button to save the file to your device.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Document
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        );
      case 'xlsx':
        return (
          <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
            <div className="mb-4">
              <FileText className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{documentName}</h3>
              <p className="text-gray-600 mb-6">
                Excel files require download to view. Click the download button to save the file to your device.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Document
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <iframe
            src={documentPath}
            className="w-full h-full border-0 rounded-lg"
            onLoad={() => setIsLoading(false)}
            title={documentName}
            style={{ minHeight: '600px' }}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {documentName}
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                New Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {isLoading && documentType?.toLowerCase() === 'pdf' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-500">Loading document...</p>
              </div>
            </div>
          )}
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}