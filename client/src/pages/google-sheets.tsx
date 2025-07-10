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
        <h1 className="text-2xl font-bold text-gray-900">Project Data Sheet</h1>
        <p className="text-gray-600 mt-2">
          Live view of the official project data spreadsheet. Data is read-only and updates automatically when the source sheet changes.
        </p>
      </div>

      <GoogleSheetsViewer 
        title="Project Data Sheet"
        height={700}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About This Data Sheet:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• This displays the official project data spreadsheet in real-time</li>
          <li>• If you can't access Google Sheets, the system automatically shows a static version</li>
          <li>• Use the refresh button to get the latest data updates</li>
          <li>• Click the "Open" button to view the sheet in a new tab</li>
          <li>• The data is read-only - to make changes, you'll need proper permissions on the original sheet</li>
        </ul>
      </div>
    </div>
  );
}