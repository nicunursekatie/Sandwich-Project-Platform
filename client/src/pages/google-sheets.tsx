import { GoogleSheetsViewer } from "@/components/google-sheets-viewer";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";

export default function GoogleSheetsPage() {
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.VIEW_SANDWICH_DATA);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">You don't have permission to view the sandwich data spreadsheet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Sandwich Totals Data Sheet</h1>
        <p className="text-gray-600 mt-2">
          Complete sandwich collection data from 2023-2025. This displays the latest version of the sandwich totals spreadsheet in read-only format.
        </p>
      </div>

      <GoogleSheetsViewer 
        title="Sandwich Totals Data Sheet"
        height={700}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About This Data Sheet:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Complete sandwich collection totals spanning 2023-2025</li>
          <li>• Shows the most recent version of the data spreadsheet</li>
          <li>• Automatically displays static backup if live version isn't accessible</li>
          <li>• Data is read-only for viewing and analysis purposes</li>
          <li>• Click "Open" to view in a new tab for better navigation</li>
        </ul>
      </div>
    </div>
  );
}