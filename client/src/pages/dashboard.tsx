import { Sandwich, LogOut } from "lucide-react";
import ProjectList from "@/components/project-list";
import WeeklySandwichForm from "@/components/weekly-sandwich-form";
import MessageLog from "@/components/message-log";
import MeetingMinutes from "@/components/meeting-minutes";
import GoogleDriveLinks from "@/components/google-drive-links";

export default function Dashboard() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sandwich className="text-amber-500 text-xl w-6 h-6" />
            <h1 className="text-xl font-semibold text-slate-900">Marcy's Sandwich Project</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">Welcome, John</span>
            <button className="text-slate-400 hover:text-slate-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List - takes 2/3 width */}
          <div className="lg:col-span-2">
            <ProjectList />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <WeeklySandwichForm />
            <MessageLog />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <MeetingMinutes />
          <GoogleDriveLinks />
        </div>
      </main>
    </div>
  );
}
