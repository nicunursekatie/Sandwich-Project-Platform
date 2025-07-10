import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Eye, FileSpreadsheet, AlertCircle, RefreshCw, Upload, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@shared/auth-utils";

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
  const [sheetLoadError, setSheetLoadError] = useState(false);
  const { user } = useAuth();

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
    setSheetLoadError(true);
    if (fallbackFileStatus?.hasFile) {
      setShowFallback(true);
      setError("Google Sheets access restricted. Showing static version instead.");
    } else {
      setError("Unable to load Google Sheet and no fallback file is available.");
    }
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
            Displays the most recent copy of our sandwich totals spreadsheet. This is a static file that shows our complete collection data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Sandwich Totals Spreadsheet</p>
              <p className="text-xs text-gray-500">Complete collection data from 2023-2025</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={downloadFallbackFile}
                title="Download spreadsheet"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline"
                onClick={downloadFallbackFile}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </div>
          </div>

          {!fallbackFileStatus?.hasFile && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sandwich data file is currently available. Please contact an administrator to upload the latest spreadsheet.
              </AlertDescription>
            </Alert>
          )}

          {/* File upload section - only for admins */}
          {hasPermission(user, 'manage_files') && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">Update Sandwich Data</p>
                  <p className="text-xs text-gray-500">Upload the latest sandwich totals spreadsheet</p>
                </div>
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
                      {uploading ? 'Uploading...' : 'Upload New File'}
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
                    Current: {fallbackFileStatus.fileName}
                  </span>
                )}
              </div>
              
              {error && uploading && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sandwich Totals Data Sheet</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Read-only view</span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fallbackFileStatus?.hasFile ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src="/api/project-data/current"
                  width="100%"
                  height={height}
                  style={{ border: 'none' }}
                  title="Sandwich Totals Data Sheet"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-sm text-blue-600">
                  File: {fallbackFileStatus.fileName}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sandwich data file available</p>
                <p className="text-sm text-gray-400 mt-1">Contact an administrator to upload the spreadsheet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GoogleSheetsViewer;