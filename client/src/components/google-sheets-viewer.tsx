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
  // Fixed URL for the specific spreadsheet
  const FIXED_SHEET_URL = "https://docs.google.com/spreadsheets/d/1mjx5o6boluo8mNx8tzAV76NBGS6tF0um2Rq9bIdxPo8/edit?gid=1218710353#gid=1218710353";
  const FIXED_VIEWER_URL = "https://docs.google.com/spreadsheets/d/1mjx5o6boluo8mNx8tzAV76NBGS6tF0um2Rq9bIdxPo8/edit?usp=sharing&embedded=true";
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRefresh = () => {
    setIsLoading(true);
    // Force refresh by updating the URL with a timestamp
    const refreshUrl = `${FIXED_VIEWER_URL}&t=${Date.now()}`;
    setTimeout(() => setIsLoading(false), 1000);
  };

  const openInNewTab = () => {
    window.open(FIXED_SHEET_URL, '_blank');
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            <iframe
              src={FIXED_VIEWER_URL}
              width="100%"
              height={height}
              style={{ border: 'none' }}
              title="Project Data Sheet"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError("Failed to load the sheet. Please check your internet connection.");
                setIsLoading(false);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GoogleSheetsViewer;