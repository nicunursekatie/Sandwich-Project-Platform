import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich, Eye, Heart, Users, Target, Sparkles, ArrowUp } from "lucide-react";
import { TSPCard, TSPCardHeader, TSPCardTitle, TSPCardContent, TSPStatCard } from "@/components/ui/tsp-card";
import { TSPButton } from "@/components/ui/tsp-button";
import { Heading, Text, Highlight } from "@/components/ui/tsp-typography";
import { TSPBadge } from "@/components/ui/tsp-badge";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import { DocumentPreviewModal } from "@/components/document-preview-modal";
import SandwichCollectionForm from "@/components/sandwich-collection-form-tsp";
import tspLogo from "@assets/LOGOS/TSP_transparent.png";

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export default function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCollectionForm, setShowCollectionForm] = useState(false);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="text-center py-8">
        <img src={tspLogo} alt="The Sandwich Project" className="w-96 mx-auto mb-6" />
        <Text variant="lead" className="text-tsp-charcoal">
          Community Impact Through Coordinated Action
        </Text>
      </div>

      {/* Collection Call-to-Action */}
      {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
        <TSPCard variant="elevated" className="overflow-hidden hover-lift">
          <div className="px-8 py-6 bg-gradient-to-r from-tsp-gold/10 via-white to-tsp-navy/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-tsp rounded-xl flex items-center justify-center shadow-md">
                  <Sandwich className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Heading as="h2" className="text-tsp-navy">Record Collection Data</Heading>
                  <Text variant="muted">Submit your sandwich contributions to help our community</Text>
                </div>
              </div>
              <div className="flex gap-3">
                <TSPButton 
                  onClick={() => setShowCollectionForm(!showCollectionForm)}
                  variant="secondary"
                  leftIcon={showCollectionForm ? <Eye /> : <Sandwich />}
                >
                  {showCollectionForm ? 'Hide Form' : 'Enter New Collection'}
                </TSPButton>
                <TSPButton 
                  variant="outline" 
                  onClick={() => onSectionChange?.("collections")}
                >
                  View All Collections
                </TSPButton>
              </div>
            </div>
          </div>

          {showCollectionForm && (
            <div className="px-8 py-6 bg-gradient-to-br from-tsp-gold/5 via-white to-tsp-navy/5 border-t border-tsp-gold/20">
              <SandwichCollectionForm 
                onSuccess={() => {
                  setShowCollectionForm(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections/stats"] });
                }} 
              />
            </div>
          )}
        </TSPCard>
      )}

      {/* Impact Statistics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-tsp rounded-lg flex items-center justify-center shadow-md">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <Heading as="h2" className="text-tsp-navy">Organizational Impact</Heading>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <TSPStatCard
            title="Total Lifetime"
            value={organizationalStats.totalLifetimeSandwiches}
            description="Since 2020"
            icon={<Heart className="h-6 w-6" />}
            color="navy"
            trend={{ value: 12, isPositive: true }}
          />
          <TSPStatCard
            title="Peak Week"
            value={organizationalStats.peakWeekRecord}
            description={organizationalStats.peakWeekDate}
            icon={<ArrowUp className="h-6 w-6" />}
            color="gold"
          />
          <TSPStatCard
            title="Annual Capacity"
            value={organizationalStats.currentAnnualCapacity}
            description="Sustainable Level"
            icon={<Target className="h-6 w-6" />}
            color="teal"
          />
          <TSPStatCard
            title="Growth"
            value={organizationalStats.growthMultiplier}
            description="Since Launch"
            icon={<Sparkles className="h-6 w-6" />}
            color="burgundy"
            trend={{ value: 107, isPositive: true }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TSPCard variant="bordered" className="hover-lift">
            <TSPCardContent className="p-6">
              <Text variant="muted" className="mb-2">Individual Sandwiches</Text>
              <Heading as="h3" className="text-tsp-navy">
                {organizationalStats.individualSandwiches}
              </Heading>
            </TSPCardContent>
          </TSPCard>
          <TSPCard variant="bordered" className="hover-lift">
            <TSPCardContent className="p-6">
              <Text variant="muted" className="mb-2">Group Sandwiches</Text>
              <Heading as="h3" className="text-tsp-gold">
                {organizationalStats.groupSandwiches}
              </Heading>
            </TSPCardContent>
          </TSPCard>
          <TSPCard variant="bordered" className="hover-lift">
            <TSPCardContent className="p-6">
              <Text variant="muted" className="mb-2">Total Entries</Text>
              <Heading as="h3" className="text-tsp-charcoal">
                {organizationalStats.totalEntries}
              </Heading>
            </TSPCardContent>
          </TSPCard>
        </div>
      </div>

      {/* Important Documents */}
      <TSPCard variant="gradient" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-warm rounded-lg flex items-center justify-center shadow-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <Heading as="h2" className="text-tsp-navy">Important Documents</Heading>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importantDocuments.map((doc, index) => (
            <TSPCard key={index} variant="elevated" className="p-4 hover-lift">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="h-5 w-5 text-tsp-gold mt-1" />
                <div className="flex-1">
                  <Heading as="h4" className="text-tsp-charcoal mb-2">{doc.title}</Heading>
                  <TSPBadge variant={
                    doc.category === 'Legal' ? 'default' :
                    doc.category === 'Strategy' ? 'accent' :
                    'secondary'
                  } size="sm">
                    {doc.category}
                  </TSPBadge>
                </div>
              </div>
              <Text variant="small" className="mb-4">{doc.description}</Text>
              <div className="flex gap-2">
                <TSPButton
                  variant="ghost"
                  size="sm"
                  onClick={() => openPreviewModal(doc.path, doc.title, doc.path.split('.').pop() || 'pdf')}
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  Preview
                </TSPButton>
                <TSPButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = doc.path;
                    link.download = doc.title;
                    link.click();
                  }}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download
                </TSPButton>
              </div>
            </TSPCard>
          ))}
        </div>
      </TSPCard>

      {/* Operational Capacity */}
      <TSPCard variant="elevated" className="overflow-hidden">
        <TSPCardHeader accent>
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5" />
            <TSPCardTitle className="text-white">Operational Capacity</TSPCardTitle>
          </div>
        </TSPCardHeader>
        <TSPCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Highlight variant="info" icon={<Users className="h-5 w-5 text-tsp-teal-dark" />}>
              <Heading as="h4" className="mb-2">Weekly Baseline</Heading>
              <Text>{organizationalStats.weeklyBaseline} sandwiches during regular operations</Text>
            </Highlight>
            <Highlight variant="warning" icon={<Sparkles className="h-5 w-5 text-amber-700" />}>
              <Heading as="h4" className="mb-2">Surging Capacity</Heading>
              <Text>{organizationalStats.surgingCapacity} sandwiches during peak mobilization</Text>
            </Highlight>
          </div>
        </TSPCardContent>
      </TSPCard>

      {/* Help Section */}
      <TSPCard variant="bordered" className="bg-tsp-navy-light">
        <TSPCardContent className="p-6 text-center">
          <Heart className="h-12 w-12 text-tsp-burgundy mx-auto mb-4" />
          <Heading as="h3" className="mb-2">Making a Difference Together</Heading>
          <Text variant="muted">
            Every sandwich represents hope for someone in need. Thank you for being part of this mission.
          </Text>
          <TSPButton 
            variant="primary" 
            className="mt-4"
            onClick={() => onSectionChange?.("projects")}
          >
            Explore Volunteer Opportunities
          </TSPButton>
        </TSPCardContent>
      </TSPCard>

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