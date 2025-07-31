import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich, Eye, BarChart3, Target, Activity, Users, Zap, Clock, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import { DocumentPreviewModal } from "@/components/document-preview-modal";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import { AnimatedCounter } from "@/components/modern-dashboard/animated-counter";
import { MiniChart } from "@/components/modern-dashboard/mini-chart";
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

  // Sample data for mini charts
  const chartData = [12, 19, 15, 25, 22, 18, 30, 28, 35, 32, 40, 38];
  const weeklyData = [5000, 6200, 7800, 9200, 8800, 10500, 12000, 15000, 18000, 22000, 25000, 28000];
  const growthData = [100, 120, 180, 250, 350, 480, 650, 850, 1200, 1500, 1800, 2100];

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
          <div className="glass-card hover-lift overlap-shadow mx-4 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-inter font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
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

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
          {/* Total Lifetime Impact - Hero Card */}
          <div className="lg:col-span-3 glass-card hover-lift overlap-shadow p-8 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <SandwichStackIcon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-inter">Total Lifetime Impact</h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">Sandwiches distributed since 2020</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-slate-900 dark:text-white font-inter">
                  <AnimatedCounter value={statsData?.completeTotalSandwiches || 0} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <GrowthTrendIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-semibold">Growing daily</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <MiniChart data={weeklyData} color="#8b5cf6" type="area" />
            </div>
          </div>

          {/* Individual Cards */}
          <div className="glass-card hover-lift overlap-shadow p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <MiniChart data={chartData} color="#f97316" type="line" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-inter mb-2">Individual Collections</h3>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-inter">
              <AnimatedCounter value={statsData?.individualSandwiches || 0} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">Personal contributions</p>
          </div>

          <div className="glass-card hover-lift overlap-shadow p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <CommunityIcon className="w-6 h-6 text-white" />
              </div>
              <MiniChart data={growthData} color="#3b82f6" type="bar" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-inter mb-2">Group Collections</h3>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-inter">
              <AnimatedCounter value={statsData ? ((statsData.completeTotalSandwiches || 0) - (statsData.individualSandwiches || 0)) : 0} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">Organization donations</p>
          </div>

          <div className="glass-card hover-lift overlap-shadow p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <NetworkIcon className="w-6 h-6 text-white" />
              </div>
              <MiniChart data={[1, 3, 8, 15, 25, 40, 60, 85, 120, 160, 210, 280]} color="#a855f7" type="area" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-inter mb-2">Total Entries</h3>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-inter">
              <AnimatedCounter value={statsData?.totalEntries || 0} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">Data submissions</p>
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

        {/* Important Documents - Modernized */}
        <div className="glass-card hover-lift overlap-shadow mx-4 mt-8 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-inter">Important Documents</h2>
              <p className="text-slate-600 dark:text-slate-300">Key organizational resources</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importantDocuments.map((doc, index) => (
              <div key={index} className="glass-card hover-lift p-4 group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {doc.category}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white font-inter mb-2 group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                  {doc.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex-1"
                    onClick={() => openPreviewModal(doc.path, doc.title, 'pdf')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 dark:border-slate-600"
                    onClick={() => window.open(doc.path, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help System */}
        <div className="mx-4 mt-8">
          <HelpBubble />
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal 
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        documentPath={previewModal.documentPath}
        documentTitle={previewModal.documentTitle}
        documentType={previewModal.documentType}
      />
    </div>
  );
}