import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich, Eye, BarChart3, Target, Activity, Users, Zap, Clock, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system";
import { DocumentPreviewModal } from "@/components/document-preview-modal";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import { AnimatedCounter } from "@/components/modern-dashboard/animated-counter";

import { DarkModeToggle } from "@/components/modern-dashboard/dark-mode-toggle";
import { SandwichStackIcon, GrowthTrendIcon, CommunityIcon, TargetIcon, SparkleIcon, NetworkIcon } from "@/components/modern-dashboard/custom-svg-icons";
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

  // Remove fake mini chart data - only use real data

  return (
    <div className="min-h-screen bg-white relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="bg-white rounded-xl mx-4 mt-8 p-8 text-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="relative">
            <img 
              src={tspLogo} 
              alt="The Sandwich Project" 
              className="w-[250px] md:w-[400px] mb-6 mx-auto" 
            />
          </div>
          <p className="text-lg md:text-xl text-[#236383] font-medium">
            Community Impact Through Coordinated Action
          </p>
        </div>

        {/* Collection Call-to-Action */}
        {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
          <div className="bg-white rounded-xl mx-4 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#FBAD3F] rounded-lg flex items-center justify-center">
                  <Sandwich className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#236383]">
                    Record Collection Data
                  </h2>
                  <p className="text-gray-700 mt-1">
                    Submit your sandwich contributions to help our community
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="bg-[#FBAD3F] hover:bg-[#e09a36] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={() => setShowCollectionForm(!showCollectionForm)}
                >
                  {showCollectionForm ? "Hide Form" : "Enter New Collection Data"}
                </Button>
                <Button 
                  variant="outline" 
                  className="border border-[#47B3CB] text-[#47B3CB] hover:bg-[#47B3CB] hover:text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={() => onSectionChange?.('collections-log')}
                >
                  View Collection History
                </Button>
              </div>
            </div>

            {/* Embedded Collection Form */}
            {showCollectionForm && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
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

        {/* Hero Impact Section */}
        <div className="mx-4 mb-12">
          <div className="bg-white rounded-xl p-12 text-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
            <div className="mb-4">
              <h1 className="text-7xl md:text-8xl font-black text-[#FBAD3F] tracking-tight">
                <AnimatedCounter value={statsData?.completeTotalSandwiches || 0} />
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-2 h-2 bg-[#47B3CB] rounded-full"></div>
                <p className="text-xl text-[#236383] font-medium">
                  Total sandwiches distributed since 2020
                </p>
                <div className="w-2 h-2 bg-[#47B3CB] rounded-full"></div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t border-gray-200 pt-6 mt-6">
              Real data from verified collection records
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-[#236383] uppercase tracking-wide">
                Individual Collections
              </h3>
              <div className="w-8 h-8 bg-[#FBAD3F] rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-[#FBAD3F] mb-2">
              <AnimatedCounter value={statsData?.individualSandwiches || 0} />
            </div>
            <p className="text-sm text-gray-600">Personal contributions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-[#236383] uppercase tracking-wide">
                Group Collections
              </h3>
              <div className="w-8 h-8 bg-[#47B3CB] rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-[#47B3CB] mb-2">
              <AnimatedCounter value={statsData ? ((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)) : 0} />
            </div>
            <p className="text-sm text-gray-600">Organization donations</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-[#236383] uppercase tracking-wide">
                Collection Records
              </h3>
              <div className="w-8 h-8 bg-[#236383] rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-[#236383] mb-2">
              <AnimatedCounter value={statsData?.totalEntries || 0} />
            </div>
            <p className="text-sm text-gray-600">Data submissions</p>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="mx-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-semibold text-[#236383] mb-6">Operational Capacity</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#A31C41] mb-1">
                  {organizationalStats.peakWeekRecord}
                </div>
                <div className="text-sm text-[#236383] font-medium">Peak Week</div>
                <div className="text-xs text-gray-600 mt-1">Nov 15, 2023</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FBAD3F] mb-1">
                  {organizationalStats.currentAnnualCapacity}
                </div>
                <div className="text-sm text-[#236383] font-medium">Annual Target</div>
                <div className="text-xs text-gray-600 mt-1">Current year</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#47B3CB] mb-1">
                  {organizationalStats.weeklyBaseline}
                </div>
                <div className="text-sm text-[#236383] font-medium">Weekly Baseline</div>
                <div className="text-xs text-gray-600 mt-1">Regular ops</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#007E8C] mb-1">
                  {organizationalStats.surgingCapacity}
                </div>
                <div className="text-sm text-[#236383] font-medium">Surge Capacity</div>
                <div className="text-xs text-gray-600 mt-1">Peak mobilization</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mt-8">
          <button className="bg-white rounded-xl p-4 text-left group cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all" onClick={() => onSectionChange?.('collections-log')}>
            <div className="w-10 h-10 bg-[#47B3CB] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-[#236383]">Collections</h4>
            <p className="text-sm text-gray-600">View all data</p>
          </button>

          <button className="bg-white rounded-xl p-4 text-left group cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all" onClick={() => onSectionChange?.('analytics')}>
            <div className="w-10 h-10 bg-[#FBAD3F] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-[#236383]">Analytics</h4>
            <p className="text-sm text-gray-600">Deep insights</p>
          </button>

          <button className="bg-white rounded-xl p-4 text-left group cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all" onClick={() => onSectionChange?.('phone-directory')}>
            <div className="w-10 h-10 bg-[#007E8C] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-[#236383]">Directory</h4>
            <p className="text-sm text-gray-600">Contact info</p>
          </button>

          <button className="bg-white rounded-xl p-4 text-left group cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all" onClick={() => onSectionChange?.('messages')}>
            <div className="w-10 h-10 bg-[#A31C41] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-[#236383]">Messages</h4>
            <p className="text-sm text-gray-600">Communication</p>
          </button>
        </div>

        {/* Important Documents - Compact */}
        <div className="bg-white rounded-xl mx-4 mt-8 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FBAD3F] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#236383]">Important Documents</h2>
              <p className="text-sm text-gray-600">Key organizational resources</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {importantDocuments.map((doc, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-[#47B3CB] rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-[#236383] mb-1 group-hover:text-[#FBAD3F] transition-colors line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {doc.description}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-[#47B3CB] hover:bg-[#3a9bb4] text-white text-xs px-2 py-1 h-7 flex-1"
                    onClick={() => openPreviewModal(doc.path, doc.title, 'pdf')}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-2 py-1 h-7"
                    onClick={() => window.open(doc.path, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help System */}
        <div className="mx-4 mt-8">
          <HelpBubble
            title="Dashboard Overview"
            content="This dashboard shows your impact at a glance! These numbers represent real meals provided to community members in your area. Use the forms above to submit new collection data or browse documents for guidance."
            character="sandy"
            position="top"
            trigger="hover"
          >
            <div className="text-center text-sm text-gray-500 cursor-help">
              Need help? Hover here for guidance
            </div>
          </HelpBubble>
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