import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import tspLogo from "@assets/sandwich_project_transparent_1753668698851.png";
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
    <div className="space-y-8">
      {/* Simple Header with Large Logo */}
      <div className="text-center py-8">
        <img src={tspLogo} alt="The Sandwich Project" className="w-[500px] mb-6 mx-auto" />
        <p className="text-lg text-gray-600 font-roboto">Community Impact Through Coordinated Action</p>
      </div>

      {/* Sandwich Collection Form - Primary Focus */}
      {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-[#FBAD3F]/5 via-white to-[#236383]/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
                <img src={sandwichLogo} alt="Sandwich" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-roboto tracking-tight">Submit Collection Data</h2>
                <p className="text-sm font-medium text-slate-500 font-roboto mt-1">Record your sandwich contributions to the community</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onSectionChange?.("collections")}
              className="text-sm font-semibold border-2 border-[#FBAD3F]/30 text-[#FBAD3F] hover:bg-[#FBAD3F]/10 hover:border-[#FBAD3F]/50 transition-all duration-200 px-6"
            >
              View All Collections
            </Button>
          </div>
          <div className="p-8 bg-gradient-to-br from-slate-50/30 to-white">
            <SandwichCollectionForm onSuccess={() => onSectionChange?.("collections")} />
          </div>
        </div>
      )}

      {/* Organizational Impact - Card Based Layout */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FBAD3F] rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 font-roboto">Organizational Impact</h2>
          </div>
        </div>
        <div className="p-6">
          {/* Top Row - Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#236383]">Total Lifetime</span>
                <span className="px-2 py-1 bg-[#236383] text-white text-xs rounded-full">active</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{organizationalStats.totalLifetimeSandwiches}</div>
              <div className="text-sm text-slate-500">Since 2020</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#FBAD3F]">Peak Week</span>
                <span className="px-2 py-1 bg-[#FBAD3F] text-white text-xs rounded-full">high priority</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{organizationalStats.peakWeekRecord}</div>
              <div className="text-sm text-slate-500">{organizationalStats.peakWeekDate}</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-emerald-600">Annual Capacity</span>
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">sustainable</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{organizationalStats.currentAnnualCapacity}</div>
              <div className="text-sm text-slate-500">Sustainable Level</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#922B21]">Growth</span>
                <span className="px-2 py-1 bg-[#922B21] text-white text-xs rounded-full">expanding</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{organizationalStats.growthMultiplier}x</div>
              <div className="text-sm text-slate-500">Since Launch</div>
            </div>
          </div>

          {/* Bottom Row - Breakdown Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#236383]">Individual Sandwiches</span>
                <span className="px-2 py-1 bg-[#236383] text-white text-xs rounded-full">active</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{statsData?.individualSandwiches?.toLocaleString() || organizationalStats.individualSandwiches}</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#FBAD3F]">Group Sandwiches</span>
                <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">medium priority</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{statsData ? ((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)).toLocaleString() : organizationalStats.groupSandwiches}</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Total Entries</span>
                <span className="px-2 py-1 bg-slate-500 text-white text-xs rounded-full">database</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{statsData?.totalEntries?.toLocaleString() || organizationalStats.totalEntries}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Documents */}
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50 rounded-lg border border-amber-200/50 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded-lg flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#236383] font-roboto">Important Documents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importantDocuments.map((doc, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-amber-50/60 border border-amber-200/40 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-amber-300/60">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded flex items-center justify-center shrink-0">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 font-roboto mb-2">{doc.title}</h3>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                    doc.category === 'Legal' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' :
                    doc.category === 'Strategy' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800' :
                    'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                  }`}>
                    {doc.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-roboto mb-4 leading-tight">{doc.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.path, '_blank')}
                  className="flex items-center gap-1 text-[#236383] border-[#FBAD3F]/40 hover:bg-[#FBAD3F]/10 hover:border-[#FBAD3F]/60 text-xs h-8 transition-all duration-200"
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
                  className="flex items-center gap-1 text-xs h-8 border-amber-300/50 hover:bg-amber-50 hover:border-amber-400/60 transition-all duration-200"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Capacity Information - Enhanced Professional Design */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-roboto tracking-tight">Operational Capacity</h2>
              <p className="text-sm font-medium text-slate-500 font-roboto mt-1">Current operational performance and capacity metrics</p>
            </div>
          </div>
        </div>
        <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Weekly Baseline</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">NORMAL OPS</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.weeklyBaseline}</p>
              <p className="text-sm font-semibold text-emerald-600 font-roboto">Standard Operations</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FBAD3F] to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Surge Capacity</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">EMERGENCY</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.surgingCapacity}</p>
              <p className="text-sm font-semibold text-[#FBAD3F] font-roboto">Crisis Response</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#236383] to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Experience</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ESTABLISHED</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.operationalYears} Years</p>
              <p className="text-sm font-semibold text-[#236383] font-roboto">Since April 2020</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}