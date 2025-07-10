import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Eye, FileSpreadsheet, AlertCircle, RefreshCw, Upload, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface GoogleSheetsViewerProps {
  initialUrl?: string;
  title?: string;
  height?: number;
}

export function GoogleSheetsViewer({ initialUrl = "", title = "Google Sheets Viewer", height = 600 }: GoogleSheetsViewerProps) {
  // Fixed URL for the specific spreadsheet
  const FIXED_SHEET_URL = "https://docs.google.com/spreadsheets/d/1mjx5o6boluo8mNx8tzAV76NBGS6tF0um2Rq9bIdxPo8/edit?gid=1218710353#gid=1218710353";
  const FIXED_VIEWER_URL = "https://docs.google.com/spreadsheets/d/1mjx5o6boluo8mNx8tzAV76NBGS6tF0um2Rq9bIdxPo8/edit?usp=sharing&embedded=true";
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackFileStatus, setFallbackFileStatus] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Check fallback file status on component mount
  useEffect(() => {
    checkFallbackStatus();
  }, []);

  const checkFallbackStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/project-data/status');
      setFallbackFileStatus(response);
    } catch (error) {
      console.error('Failed to check fallback status:', error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Force refresh by updating the URL with a timestamp
    const refreshUrl = `${FIXED_VIEWER_URL}&t=${Date.now()}`;
    setTimeout(() => setIsLoading(false), 1000);
  };

  const openInNewTab = () => {
    window.open(FIXED_SHEET_URL, '_blank');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiRequest('POST', '/api/project-data/upload', formData);
      await checkFallbackStatus(); // Refresh status
      setError("");
    } catch (error) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadFallbackFile = () => {
    window.open('/api/project-data/current', '_blank');
  };

  const handleSheetError = () => {
    setError("Unable to load Google Sheet. This may be due to access restrictions.");
    setShowFallback(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Enter a Google Sheets URL to view it in read-only mode. The sheet must be publicly accessible or shared with view permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Live Data Sheet</p>
              <p className="text-xs text-gray-500">Displaying the official project data spreadsheet</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh sheet data"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline"
                onClick={openInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {showFallback && fallbackFileStatus?.hasFile && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFallback(true)}
                      className="mr-2"
                    >
                      View Fallback File
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* File upload section for admins */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">Fallback File Management</p>
                <p className="text-xs text-gray-500">Upload a backup file for when Google Sheets is inaccessible</p>
              </div>
              {fallbackFileStatus?.hasFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadFallbackFile}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  variant="outline" 
                  size="sm"
                  disabled={uploading}
                  className="flex items-center gap-2"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              {fallbackFileStatus?.hasFile && (
                <span className="text-xs text-green-600">
                  Latest: {fallbackFileStatus.fileName}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Data Sheet</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Read-only view</span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {showFallback && fallbackFileStatus?.hasFile ? (
              <iframe
                src="/api/project-data/current"
                width="100%"
                height={height}
                style={{ border: 'none' }}
                title="Project Data Sheet (Fallback)"
                onLoad={() => setIsLoading(false)}
              />
            ) : (
              <iframe
                src={FIXED_VIEWER_URL}
                width="100%"
                height={height}
                style={{ border: 'none' }}
                title="Project Data Sheet"
                onLoad={() => setIsLoading(false)}
                onError={handleSheetError}
              />
            )}
          </div>
          
          {showFallback && fallbackFileStatus?.hasFile && (
            <div className="mt-2 text-center">
              <p className="text-sm text-amber-600">
                Showing fallback file: {fallbackFileStatus.fileName}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFallback(false)}
                className="mt-1"
              >
                Try Google Sheets Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GoogleSheetsViewer;