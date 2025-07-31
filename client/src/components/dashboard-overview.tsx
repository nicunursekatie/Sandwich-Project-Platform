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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="relative z-10 space-y-8 pb-8">
        {/* Modern Header with Glassmorphism */}
        <div className="glass-card overlap-shadow mx-4 mt-8 p-8 text-center">
          <div className="relative">
            <img 
              src={tspLogo} 
              alt="The Sandwich Project" 
              className="w-[250px] md:w-[400px] mb-6 mx-auto animate-float" 
            />
            <div className="absolute -top-2 -right-2 animate-pulse">
              <SparkleIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-inter font-medium">
            Community Impact Through Coordinated Action
          </p>
          <div className="mt-4 flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <NetworkIcon className="w-4 h-4" />
            <span>Powered by modern technology • 2025</span>
          </div>
        </div>

        {/* Modern Collection Call-to-Action */}
        {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
          <div className="glass-card hover-lift overlap-shadow mx-4 p-6 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-orange-500/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <SandwichStackIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">
                    Record Collection Data
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 font-medium mt-1 flex items-center gap-2">
                    <TargetIcon className="w-4 h-4" />
                    Submit your sandwich contributions to help our community
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-inter font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
                  onClick={() => setShowCollectionForm(!showCollectionForm)}
                >
                  {showCollectionForm ? "Hide Form" : "Enter New Collection Data"}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-inter font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
                  onClick={() => onSectionChange?.('collections-log')}
                >
                  View Collection History
                </Button>
              </div>
            </div>

            {/* Embedded Collection Form */}
            {showCollectionForm && (
              <div className="mt-6 p-6 glass-card">
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
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="mb-4">
              <h1 className="text-7xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={statsData?.completeTotalSandwiches || 0} />
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                  Total sandwiches distributed since 2020
                </p>
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 pt-6 mt-6">
              Real data from verified collection records
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-4 mb-8">
          <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Individual Collections
              </h3>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              <AnimatedCounter value={statsData?.individualSandwiches || 0} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Personal contributions</p>
          </div>

          <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Group Collections
              </h3>
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              <AnimatedCounter value={statsData ? ((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)) : 0} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Organization donations</p>
          </div>

          <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Collection Records
              </h3>
              <div className="w-8 h-8 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              <AnimatedCounter value={statsData?.totalEntries || 0} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Data submissions</p>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="mx-4 mb-8">
          <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Operational Capacity</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {organizationalStats.peakWeekRecord}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Peak Week</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Nov 15, 2023</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {organizationalStats.currentAnnualCapacity}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Annual Target</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Current year</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {organizationalStats.weeklyBaseline}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Weekly Baseline</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Regular ops</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {organizationalStats.surgingCapacity}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Surge Capacity</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Peak mobilization</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mt-8">
          <button className="glass-card hover-lift p-4 text-left group cursor-pointer" onClick={() => onSectionChange?.('collections-log')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white font-inter">Collections</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">View all data</p>
          </button>

          <button className="glass-card hover-lift p-4 text-left group cursor-pointer" onClick={() => onSectionChange?.('analytics')}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white font-inter">Analytics</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Deep insights</p>
          </button>

          <button className="glass-card hover-lift p-4 text-left group cursor-pointer" onClick={() => onSectionChange?.('phone-directory')}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white font-inter">Directory</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Contact info</p>
          </button>

          <button className="glass-card hover-lift p-4 text-left group cursor-pointer" onClick={() => onSectionChange?.('messages')}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white font-inter">Messages</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Communication</p>
          </button>
        </div>

        {/* Important Documents - Compact */}
        <div className="glass-card hover-lift overlap-shadow mx-4 mt-8 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-inter">Important Documents</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Key organizational resources</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {importantDocuments.map((doc, index) => (
              <div key={index} className="bg-white/40 dark:bg-slate-800/40 rounded-lg p-3 group hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white font-inter mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-1">
                  {doc.description}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white text-xs px-2 py-1 h-7 flex-1"
                    onClick={() => openPreviewModal(doc.path, doc.title, 'pdf')}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 dark:border-slate-600 text-xs px-2 py-1 h-7"
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
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 cursor-help">
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