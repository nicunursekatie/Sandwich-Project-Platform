import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich } from "lucide-react";
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
    <div className="space-y-8">
      {/* Welcome Header - Enhanced Professional Design */}
      <div className="text-center py-8 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 rounded-2xl border border-slate-200 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-[#FBAD3F] rounded-2xl flex items-center justify-center mr-6 shadow-lg">
            <img src={sandwichLogo} alt="The Sandwich Project" className="w-10 h-10" />
          </div>
          <div className="text-left">
            <h1 className="font-roboto tracking-tight leading-none" style={{ fontSize: '36px', fontWeight: '700', color: '#922B21' }}>The Sandwich Project</h1>
            <p className="font-roboto" style={{ fontSize: '20px', fontWeight: '500', color: '#236383', marginTop: '8px' }}>Operations Dashboard</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <p className="font-roboto leading-relaxed" style={{ fontSize: '16px', fontWeight: '400', color: '#7F8C8D', marginTop: '12px' }}>Community Impact Through Coordinated Action</p>
          <div className="flex items-center justify-center" style={{ gap: '16px', marginTop: '20px' }}>
            <div className="text-center bg-[#922B21] text-white rounded-lg shadow-lg" style={{ padding: '12px', borderRadius: '8px' }}>
              <p className="font-roboto" style={{ fontSize: '32px', fontWeight: '700' }}>5+</p>
              <p className="uppercase tracking-wider" style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>Years Active</p>
            </div>
            <div className="text-center bg-[#FBAD3F] text-white rounded-lg shadow-lg" style={{ padding: '12px', borderRadius: '8px' }}>
              <p className="font-roboto" style={{ fontSize: '32px', fontWeight: '700' }}>25+</p>
              <p className="uppercase tracking-wider" style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>Host Locations</p>
            </div>
            <div className="text-center bg-[#236383] text-white rounded-lg shadow-lg" style={{ padding: '12px', borderRadius: '8px' }}>
              <p className="font-roboto" style={{ fontSize: '32px', fontWeight: '700' }}>1.8M+</p>
              <p className="uppercase tracking-wider" style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>Total Impact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sandwich Collection Form - Primary Focus */}
      {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-[#FBAD3F]/5 via-white to-[#236383]/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded-xl flex items-center justify-center shadow-lg">
                <Sandwich className="h-6 w-6 text-white" />
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

      {/* Organizational Impact Statistics - Enhanced Professional Design */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#236383] to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-roboto tracking-tight">Organizational Impact</h2>
              <p className="text-sm font-medium text-slate-500 font-roboto mt-1">Key performance metrics and operational data</p>
            </div>
          </div>
        </div>
        <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#236383] to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Total Impact</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">LIFETIME</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.totalLifetimeSandwiches}</p>
              <p className="text-sm font-semibold text-[#236383] font-roboto">Since 2020 Launch</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FBAD3F] to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Peak Performance</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">RECORD</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.peakWeekRecord}</p>
              <p className="text-sm font-semibold text-[#FBAD3F] font-roboto">{organizationalStats.peakWeekDate}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Annual Capacity</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">SUSTAINABLE</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.currentAnnualCapacity}</p>
              <p className="text-sm font-semibold text-emerald-600 font-roboto">Current Operations</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Growth Factor</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">EXPANSION</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-slate-900 font-roboto tracking-tight">{organizationalStats.growthMultiplier}</p>
              <p className="text-sm font-semibold text-purple-600 font-roboto">Since Launch</p>
            </div>
          </div>
        </div>

        {/* Database Details - Enhanced Professional Design */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#236383]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#236383] to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Individual Collections</h3>
                </div>
                <span className="bg-gradient-to-r from-[#236383]/10 to-blue-100 text-[#236383] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#236383]/20">ACTIVE</span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-slate-900 font-roboto tracking-tight">{statsData.individualSandwiches?.toLocaleString() || 0}</p>
                <p className="text-sm font-medium text-slate-500 font-roboto">Direct volunteer contributions</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#FBAD3F]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FBAD3F] to-orange-500 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Group Collections</h3>
                </div>
                <span className="bg-gradient-to-r from-[#FBAD3F]/10 to-orange-100 text-[#FBAD3F] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#FBAD3F]/20">PRIORITY</span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-slate-900 font-roboto tracking-tight">{((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)).toLocaleString()}</p>
                <p className="text-sm font-medium text-slate-500 font-roboto">Organization partnerships</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-400/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-roboto">Total Records</h3>
                </div>
                <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-300">DATABASE</span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-slate-900 font-roboto tracking-tight">{statsData.totalEntries?.toLocaleString() || 0}</p>
                <p className="text-sm font-medium text-slate-500 font-roboto">Historical data points</p>
              </div>
            </div>
          </div>
        )}
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