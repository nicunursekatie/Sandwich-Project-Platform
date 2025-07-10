import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Eye, FileSpreadsheet, AlertCircle, RefreshCw } from "lucide-react";

interface GoogleSheetsViewerProps {
  initialUrl?: string;
  title?: string;
  height?: number;
}

export function GoogleSheetsViewer({ initialUrl = "", title = "Google Sheets Viewer", height = 600 }: GoogleSheetsViewerProps) {
  const [sheetUrl, setSheetUrl] = useState(initialUrl);
  const [viewerUrl, setViewerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const convertToViewerUrl = (url: string) => {
    try {
      // Extract sheet ID from various Google Sheets URL formats
      let sheetId = "";
      
      // Format 1: https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0
      const editMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/);
      if (editMatch) {
        sheetId = editMatch[1];
      }
      
      // Format 2: https://docs.google.com/spreadsheets/d/SHEET_ID/
      const docMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (docMatch && !sheetId) {
        sheetId = docMatch[1];
      }

      if (!sheetId) {
        throw new Error("Could not extract Sheet ID from URL");
      }

      // Convert to embedded viewer format
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&embedded=true`;
    } catch (err) {
      throw new Error("Invalid Google Sheets URL format");
    }
  };

  const handleLoadSheet = () => {
    if (!sheetUrl.trim()) {
      setError("Please enter a Google Sheets URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const converted = convertToViewerUrl(sheetUrl);
      setViewerUrl(converted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sheet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (viewerUrl) {
      setIsLoading(true);
      // Force refresh by updating the URL with a timestamp
      const refreshUrl = viewerUrl.includes('?') 
        ? `${viewerUrl}&t=${Date.now()}`
        : `${viewerUrl}?t=${Date.now()}`;
      setViewerUrl(refreshUrl);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const openInNewTab = () => {
    if (sheetUrl) {
      window.open(sheetUrl, '_blank');
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
            Enter a Google Sheets URL to view it in read-only mode. The sheet must be publicly accessible or shared with view permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLoadSheet()}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleLoadSheet}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Load Sheet
              </Button>
              {viewerUrl && (
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  title="Refresh sheet data"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {sheetUrl && (
                <Button 
                  variant="outline"
                  onClick={openInNewTab}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Supported URL formats:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0</li>
              <li>https://docs.google.com/spreadsheets/d/SHEET_ID/</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2">
              <strong>Note:</strong> The sheet must be publicly accessible or shared with "Anyone with the link can view" permissions.
            </p>
          </div>
        </CardContent>
      </Card>

      {viewerUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sheet Viewer</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Read-only view</span>
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={viewerUrl}
                width="100%"
                height={height}
                style={{ border: 'none' }}
                title="Google Sheets Viewer"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError("Failed to load the sheet. Please check the URL and permissions.");
                  setIsLoading(false);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GoogleSheetsViewer;