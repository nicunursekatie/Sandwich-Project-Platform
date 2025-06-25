import { Building2 } from "lucide-react";
import { DocumentsBrowser } from "@/components/documents-browser";

export default function Development() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
            <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Development & Resources</h1>
            <p className="text-gray-600 dark:text-gray-300">Organizational documents and development resources</p>
          </div>
        </div>

        <div className="max-w-6xl">
          <DocumentsBrowser />
        </div>
      </div>
    </div>
  );
}