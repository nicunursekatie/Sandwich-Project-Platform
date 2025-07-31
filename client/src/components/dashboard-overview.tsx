import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich, Eye, BarChart3, Target, Activity, Users, Zap, Clock, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import { DocumentPreviewModal } from "@/components/document-preview-modal";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import tspLogo from "@assets/sandwich_project_transparent_1753668698851.png";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export default function DashboardOverview({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  
  // Modal state for document preview
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    documentPath: '',
    documentName: '',
    documentType: ''
  });

  const openPreviewModal = (path: string, name: string, type: string) => {
    setPreviewModal({
      isOpen: true,
      documentPath: path,
      documentName: name,
      documentType: type
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      documentPath: '',
      documentName: '',
      documentType: ''
    });
  };

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
    growthMultiplier: "107x",
    individualSandwiches: statsData?.individualSandwiches?.toLocaleString() || "Loading...",
    groupSandwiches: statsData ? ((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)).toLocaleString() : "Loading...",
    totalEntries: statsData?.totalEntries?.toLocaleString() || "Loading..."
  };

  return (
    <div className="space-y-8">
      {/* Responsive Header with Logo */}
      <div className="text-center py-4 md:py-8">
        <img src={tspLogo} alt="The Sandwich Project" className="w-[300px] md:w-[500px] mb-4 md:mb-6 mx-auto" />
        <p className="text-sm md:text-lg text-gray-600 font-roboto px-4">Community Impact Through Coordinated Action</p>
      </div>

      {/* Collection Call-to-Action */}
      {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-4 md:px-8 py-4 md:py-6 bg-gradient-to-r from-[#FBAD3F]/5 via-white to-[#236383]/5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
                  <img src={sandwichLogo} alt="Sandwich" className="h-6 w-6 md:h-8 md:w-8 object-contain" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 font-roboto tracking-tight">Record Collection Data</h2>
                  <p className="text-xs md:text-sm font-medium text-slate-500 font-roboto mt-1">Submit your sandwich contributions to help our community</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={() => setShowCollectionForm(!showCollectionForm)}
                  className="bg-gradient-to-r from-[#FBAD3F] to-[#e89b2e] hover:from-[#e89b2e] hover:to-[#d88a1e] text-white font-semibold px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm shadow-lg shadow-[#FBAD3F]/25 transition-all duration-200 w-full sm:w-auto"
                >
                  {showCollectionForm ? 'Hide Form' : 'Enter New Collection Data'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onSectionChange?.("collections")}
                  className="text-xs md:text-sm font-semibold border-2 border-[#236383]/30 text-[#236383] hover:bg-[#236383]/10 hover:border-[#236383]/50 transition-all duration-200 px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
                >
                  View All Collections
                </Button>
              </div>
            </div>
          </div>

          {/* Embedded Collection Form */}
          {showCollectionForm && (
            <div className="px-8 py-6 bg-gradient-to-br from-[#FBAD3F]/5 via-white to-[#236383]/5 border-t border-[#FBAD3F]/20">
              <SandwichCollectionForm 
                onSuccess={() => {
                  setShowCollectionForm(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections/stats"] });
                }} 
              />
            </div>
          )}
        </div>
      )}

      {/* Organizational Impact - Enhanced with TSP Brand Colors and Better Visual Hierarchy */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#236383]/5 to-[#007E8C]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#236383] to-[#007E8C] rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-roboto">Organizational Impact</h2>
              <p className="text-sm text-slate-600 font-roboto">Community reach and sandwich distribution metrics</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Primary Metric - Featured Size */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-[#236383] to-[#007E8C] rounded-2xl p-4 md:p-6 text-white shadow-[0_4px_16px_rgba(35,99,131,0.25)] hover:shadow-[0_6px_20px_rgba(35,99,131,0.35)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white/90 leading-tight">Total Lifetime Impact</h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-tight">Sandwiches distributed since 2020</p>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight break-all">{organizationalStats.totalLifetimeSandwiches}</div>
              <div className="text-white/80 text-xs sm:text-sm font-medium leading-tight">Feeding families across Georgia communities</div>
            </div>
          </div>

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#FBAD3F]/10 to-[#FBAD3F]/5 rounded-xl border border-[#FBAD3F]/20 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(251,173,63,0.15)] hover:border-[#FBAD3F]/30 transition-all duration-300 transform hover:-translate-y-1 min-h-[120px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#FBAD3F] leading-tight">Peak Performance</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-slate-900 mb-1 leading-tight">{organizationalStats.peakWeekRecord}</div>
              <div className="text-xs text-slate-600 font-medium leading-tight">{organizationalStats.peakWeekDate}</div>
            </div>

            <div className="bg-gradient-to-br from-[#007E8C]/10 to-[#47B3CB]/5 rounded-xl border border-[#007E8C]/20 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,126,140,0.15)] hover:border-[#007E8C]/30 transition-all duration-300 transform hover:-translate-y-1 min-h-[120px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#007E8C] to-[#47B3CB] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#007E8C] leading-tight">Annual Capacity</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-slate-900 mb-1 leading-tight">{organizationalStats.currentAnnualCapacity}</div>
              <div className="text-xs text-slate-600 font-medium leading-tight">Sustainable Output</div>
            </div>

            <div className="bg-gradient-to-br from-[#A31C41]/10 to-[#A31C41]/5 rounded-xl border border-[#A31C41]/20 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(163,28,65,0.15)] hover:border-[#A31C41]/30 transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1 min-h-[120px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A31C41] to-[#8b1635] rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[#A31C41] leading-tight">Growth Rate</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-slate-900 mb-1 leading-tight">{organizationalStats.growthMultiplier}</div>
              <div className="text-xs text-slate-600 font-medium leading-tight">Since Foundation</div>
            </div>
          </div>

          {/* Data Breakdown - Better Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 min-h-[100px]">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-[#236383] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 leading-tight">Individual</span>
              </div>
              <div className="text-lg lg:text-xl font-bold text-slate-900 leading-tight break-all">{organizationalStats.individualSandwiches}</div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 min-h-[100px]">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-[#FBAD3F] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 leading-tight">Groups</span>
              </div>
              <div className="text-lg lg:text-xl font-bold text-slate-900 leading-tight break-all">{organizationalStats.groupSandwiches}</div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 sm:col-span-2 lg:col-span-1 min-h-[100px]">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-[#007E8C] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 leading-tight">Total Entries</span>
              </div>
              <div className="text-lg lg:text-xl font-bold text-slate-900 leading-tight break-all">{organizationalStats.totalEntries}</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {importantDocuments.map((doc, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-amber-50/60 border border-amber-200/40 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-amber-300/60 min-h-[160px]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 font-roboto mb-2 leading-tight break-words">{doc.title}</h3>
                  <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                    doc.category === 'Legal' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' :
                    doc.category === 'Strategy' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800' :
                    'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                  }`}>
                    {doc.category}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-roboto mb-4 leading-tight break-words">{doc.description}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreviewModal(doc.path, doc.title, doc.path.split('.').pop() || 'pdf')}
                  className="flex items-center justify-center gap-1 text-[#236383] border-[#FBAD3F]/40 hover:bg-[#FBAD3F]/10 hover:border-[#FBAD3F]/60 text-xs h-8 transition-all duration-200 w-full sm:w-auto"
                >
                  <Eye className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Preview</span>
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
                  className="flex items-center justify-center gap-1 text-xs h-8 border-amber-300/50 hover:bg-amber-50 hover:border-amber-400/60 transition-all duration-200 w-full sm:w-auto"
                >
                  <Download className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Download</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Capacity - Enhanced with TSP Brand Colors */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-[#47B3CB]/5 to-[#D1D3D4]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#47B3CB] to-[#007E8C] rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-roboto">Operational Capacity</h2>
              <p className="text-sm text-slate-600 font-roboto">Current performance levels and response capabilities</p>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-[#47B3CB]/10 to-[#47B3CB]/5 rounded-xl border border-[#47B3CB]/20 p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(71,179,203,0.15)] hover:border-[#47B3CB]/30 transition-all duration-300 transform hover:-translate-y-1 min-h-[140px]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#47B3CB] to-[#007E8C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg font-semibold text-[#47B3CB] leading-tight break-words">Weekly Baseline</span>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight break-all">{organizationalStats.weeklyBaseline}</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">Standard Operations</div>
            </div>

            <div className="bg-gradient-to-br from-[#FBAD3F]/10 to-[#FBAD3F]/5 rounded-xl border border-[#FBAD3F]/20 p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(251,173,63,0.15)] hover:border-[#FBAD3F]/30 transition-all duration-300 transform hover:-translate-y-1 min-h-[140px]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg font-semibold text-[#FBAD3F] leading-tight break-words">Surge Capacity</span>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight break-all">{organizationalStats.surgingCapacity}</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">Crisis Response</div>
            </div>

            <div className="bg-gradient-to-br from-[#D1D3D4]/20 to-[#D1D3D4]/10 rounded-xl border border-[#D1D3D4]/30 p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(209,211,212,0.15)] hover:border-[#D1D3D4]/40 transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1 min-h-[140px]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#D1D3D4] to-[#9ca3af] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg font-semibold text-[#6b7280] leading-tight break-words">Experience</span>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight break-all">{organizationalStats.operationalYears} Years</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">Since April 2020</div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        documentPath={previewModal.documentPath}
        documentName={previewModal.documentName}
        documentType={previewModal.documentType}
      />
    </div>
  );
}