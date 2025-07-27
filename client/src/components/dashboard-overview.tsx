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
            <div className="bg-gradient-to-br from-[#236383] to-[#1e5472] text-white rounded-lg p-4">
              <h3 className="text-base font-semibold font-roboto mb-2">Total Lifetime</h3>
              <p className="text-2xl font-bold font-roboto mb-1">{organizationalStats.totalLifetimeSandwiches}</p>
              <p className="text-sm text-blue-100 font-roboto">Since 2020</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] text-white rounded-lg p-4">
              <h3 className="text-base font-semibold font-roboto mb-2">Peak Week</h3>
              <p className="text-2xl font-bold font-roboto mb-1">{organizationalStats.peakWeekRecord}</p>
              <p className="text-sm text-orange-100 font-roboto">{organizationalStats.peakWeekDate}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
              <h3 className="text-base font-semibold font-roboto mb-2">Annual Capacity</h3>
              <p className="text-2xl font-bold font-roboto mb-1">{organizationalStats.currentAnnualCapacity}</p>
              <p className="text-sm text-green-100 font-roboto">Sustainable Level</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
              <h3 className="text-base font-semibold font-roboto mb-2">Growth</h3>
              <p className="text-2xl font-bold font-roboto mb-1">{organizationalStats.growthMultiplier}</p>
              <p className="text-sm text-blue-100 font-roboto">Since Launch</p>
            </div>
          </div>

          {/* Database Details */}
          {statsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-lg p-3">
                <h3 className="text-sm font-semibold font-roboto mb-2">Individual Sandwiches</h3>
                <p className="text-lg font-bold font-roboto">{statsData.individualSandwiches?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-lg p-3">
                <h3 className="text-sm font-semibold font-roboto mb-2">Group Sandwiches</h3>
                <p className="text-lg font-bold font-roboto">{((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg p-3">
                <h3 className="text-sm font-semibold font-roboto mb-2">Total Entries</h3>
                <p className="text-lg font-bold font-roboto">{statsData.totalEntries?.toLocaleString() || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Important Documents */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#236383]" />
            <h2 className="text-lg font-semibold text-slate-900">Important Documents</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importantDocuments.map((doc, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="w-8 h-8 text-[#236383] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900 mb-1">{doc.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        doc.category === 'Legal' ? 'bg-blue-100 text-blue-800' :
                        doc.category === 'Strategy' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {doc.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{doc.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.path, '_blank')}
                    className="flex items-center gap-2 text-[#236383] border-[#236383]/30 hover:bg-[#236383]/10"
                  >
                    <ExternalLink className="w-4 h-4" />
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
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Capacity Information */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#236383]" />
            <h2 className="text-lg font-semibold text-slate-900">Operational Capacity</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-lg font-bold text-slate-700">{organizationalStats.weeklyBaseline}</div>
              <div className="text-sm text-slate-600">Weekly Baseline</div>
              <div className="text-xs text-slate-500 mt-1">Normal Operations</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-lg font-bold text-amber-700">{organizationalStats.surgingCapacity}</div>
              <div className="text-sm text-slate-600">Surge Capacity</div>
              <div className="text-xs text-slate-500 mt-1">Crisis Response</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">{organizationalStats.operationalYears}</div>
              <div className="text-sm text-slate-600">Years Operating</div>
              <div className="text-xs text-slate-500 mt-1">Since April 2020</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}