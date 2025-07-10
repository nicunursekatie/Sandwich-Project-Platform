import { GoogleSheetsViewer } from "@/components/google-sheets-viewer";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";

export default function GoogleSheetsPage() {
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.VIEW_REPORTS);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view Google Sheets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Google Sheets Viewer</h1>
        <p className="text-gray-600 mt-2">
          View live Google Sheets in read-only mode. Perfect for monitoring data, reports, and collaborative documents.
        </p>
      </div>

      <GoogleSheetsViewer 
        title="Live Sheet Viewer"
        height={700}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Tips for Using Google Sheets Viewer:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make sure the sheet is shared with "Anyone with the link can view" permissions</li>
          <li>• Use the refresh button to get the latest data from the sheet</li>
          <li>• Click the external link icon to open the sheet in a new tab for editing</li>
          <li>• The viewer updates automatically when the original sheet changes</li>
        </ul>
      </div>
    </div>
  );
}