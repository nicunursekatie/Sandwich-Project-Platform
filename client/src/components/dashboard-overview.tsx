import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export default function DashboardOverview({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const { user } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ["/api/sandwich-collections/stats"],
    queryFn: async () => {
      const response = await fetch('/api/sandwich-collections/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Key organizational documents from attached assets
  const importantDocuments = [
    {
      title: "Key Findings: Peak Collection Weeks",
      description: "Comprehensive analysis of peak performance and organizational growth",
      category: "Strategy",
      path: "/attached_assets/Key Findings_ Peak Sandwich Collection Weeks_1753498455636.pdf"
    },
    {
      title: "IRS Tax Exempt Letter",
      description: "Official tax-exempt status documentation with EIN",
      category: "Legal",
      path: "/attached_assets/IRS Tax Exempt Letter (Contains EIN).pdf"
    },
    {
      title: "Articles of Incorporation",
      description: "Legal founding documents and organizational structure",
      category: "Legal", 
      path: "/attached_assets/Articles of Incorporation.pdf"
    },
    {
      title: "Food Safety Guidelines",
      description: "Essential safety protocols for volunteers",
      category: "Operations",
      path: "/attached_assets/20230525-TSP-Food Safety Volunteers_1749341933308.pdf"
    }
  ];

  // Key statistics - Use actual database values instead of hardcoded ones
  const organizationalStats = {
    totalLifetimeSandwiches: statsData ? statsData.completeTotalSandwiches?.toLocaleString() : "Loading...",
    peakWeekRecord: "38,828",
    peakWeekDate: "November 15, 2023",
    currentAnnualCapacity: "~450,000",
    weeklyBaseline: "6,000-12,000",
    surgingCapacity: "25,000-40,000",
    operationalYears: "5",
    growthMultiplier: "107x"
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <img src={sandwichLogo} alt="The Sandwich Project" className="w-8 h-8 mr-3" />
          <h1 className="text-2xl font-bold text-slate-900">The Sandwich Project Dashboard</h1>
        </div>
        <p className="text-slate-600 text-sm">Community Impact Through Coordinated Action</p>
      </div>

      {/* Sandwich Collection Form - Primary Focus */}
      {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-slate-900">Submit Collection Data</h2>
              <HelpBubble
                title="Recording Collections"
                content="Every sandwich you record represents a meal for someone in need. Don't worry about making mistakes - you can always edit entries later!"
                position="bottom"
                trigger="hover"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange?.("collections")}
              className="text-sm"
            >
              View All Collections
            </Button>
          </div>
          <div className="p-4">
            <SandwichCollectionForm onSuccess={() => onSectionChange?.("collections")} />
          </div>
        </div>
      )}

      {/* Organizational Impact Statistics */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#236383]" />
            <h2 className="text-lg font-semibold text-slate-900">Organizational Impact</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-[#236383] font-roboto">Total Lifetime</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 font-roboto mb-1">{organizationalStats.totalLifetimeSandwiches}</p>
              <p className="text-xs text-gray-500 font-roboto">Since 2020</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-[#FBAD3F] font-roboto">Peak Week</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 font-roboto mb-1">{organizationalStats.peakWeekRecord}</p>
              <p className="text-xs text-gray-500 font-roboto">{organizationalStats.peakWeekDate}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-green-600 font-roboto">Annual Capacity</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 font-roboto mb-1">{organizationalStats.currentAnnualCapacity}</p>
              <p className="text-xs text-gray-500 font-roboto">Sustainable Level</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-blue-600 font-roboto">Growth</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 font-roboto mb-1">{organizationalStats.growthMultiplier}</p>
              <p className="text-xs text-gray-500 font-roboto">Since Launch</p>
            </div>
          </div>

          {/* Database Details */}
          {statsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-sm font-semibold text-blue-600 font-roboto mb-2">Individual Sandwiches</h3>
                <p className="text-sm font-medium text-gray-900 font-roboto">{statsData.individualSandwiches?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-sm font-semibold text-orange-600 font-roboto mb-2">Group Sandwiches</h3>
                <p className="text-sm font-medium text-gray-900 font-roboto">{((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-sm font-semibold text-gray-600 font-roboto mb-2">Total Entries</h3>
                <p className="text-sm font-medium text-gray-900 font-roboto">{statsData.totalEntries?.toLocaleString() || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Important Documents */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#236383]/10 rounded flex items-center justify-center shrink-0">
            <FileText className="h-3 w-3 text-[#236383]" />
          </div>
          <h2 className="text-lg font-semibold text-[#236383] font-roboto">Important Documents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importantDocuments.map((doc, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 bg-[#236383]/10 rounded flex items-center justify-center shrink-0">
                  <FileText className="h-3 w-3 text-[#236383]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 font-roboto mb-1">{doc.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    doc.category === 'Legal' ? 'bg-blue-100 text-blue-800' :
                    doc.category === 'Strategy' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {doc.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 font-roboto mb-3 leading-tight">{doc.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.path, '_blank')}
                  className="flex items-center gap-1 text-[#236383] border-[#236383]/30 hover:bg-[#236383]/10 text-xs h-7"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = doc.path;
                    link.download = doc.title;
                    link.click();
                  }}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Capacity Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#236383]/10 rounded flex items-center justify-center shrink-0">
            <Award className="h-3 w-3 text-[#236383]" />
          </div>
          <h2 className="text-lg font-semibold text-[#236383] font-roboto">Operational Capacity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-gray-600 font-roboto mb-2">Weekly Baseline</h3>
            <p className="text-sm font-medium text-gray-900 font-roboto mb-1">{organizationalStats.weeklyBaseline}</p>
            <p className="text-xs text-gray-500 font-roboto">Normal Operations</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-amber-600 font-roboto mb-2">Surge Capacity</h3>
            <p className="text-sm font-medium text-gray-900 font-roboto mb-1">{organizationalStats.surgingCapacity}</p>
            <p className="text-xs text-gray-500 font-roboto">Crisis Response</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-blue-600 font-roboto mb-2">Years Operating</h3>
            <p className="text-sm font-medium text-gray-900 font-roboto mb-1">{organizationalStats.operationalYears}</p>
            <p className="text-xs text-gray-500 font-roboto">Since April 2020</p>
          </div>
        </div>
      </div>
    </div>
  );
}