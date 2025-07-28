import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Eye, ExternalLink, Shield, Tag, Sandwich } from "lucide-react";
import { DocumentPreview } from "./document-preview";

interface ToolkitDocument {
  name: string;
  path: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'txt' | 'other';
  category: string;
  description?: string;
}

const safetyDocuments: ToolkitDocument[] = [
  {
    name: "Summer Food Safety Guidelines",
    path: "/attached_assets/Summer Food Safety Guidelines_1751569876472.pdf",
    type: "pdf",
    category: "Safety Guidelines",
    description: "Updated guidelines for no cooler collections, proper refrigeration temperatures (33-36°F), and summer heat safety protocols for home hosts"
  },
  {
    name: "Food Safety Volunteers Guide",
    path: "/attached_assets/20230525-TSP-Food Safety Volunteers_1749341933308.pdf",
    type: "pdf",
    category: "Safety Guidelines",
    description: "Comprehensive safety protocols for volunteers preparing and delivering sandwiches"
  },
  {
    name: "Food Safety Hosts Guide",
    path: "/attached_assets/20230525-TSP-Food Safety Hosts (1)_1753670644140.pdf",
    type: "pdf",
    category: "Safety Guidelines",
    description: "Safety standards and procedures for hosts collecting and storing sandwiches"
  },
  {
    name: "Food Safety Volunteers Guide (Alternate)",
    path: "/attached_assets/20230525-TSP-Food Safety Volunteers (1)_1753670644140.pdf",
    type: "pdf",
    category: "Safety Guidelines",
    description: "Additional volunteer safety guidelines for sandwich preparation, storage, and delivery"
  },
  {
    name: "Food Safety Recipients Guide",
    path: "/attached_assets/20250205-TSP-Food Safety Recipients_1753670644140.pdf",
    type: "pdf",
    category: "Safety Guidelines",
    description: "Safety standards for recipient organizations handling perishable food donations"
  },
  {
    name: "Food Safety Recipients (Alternate)",
    path: "/attached_assets/Copy of Copy of Food Safety TSP.RECIPIENTS.04042023_1753670644141.pdf",
    type: "pdf",
    category: "Safety Guidelines",
    description: "Additional safety guidelines for 501(c)(3) recipient organizations"
  }
];

const labelDocuments: ToolkitDocument[] = [
  {
    name: "Deli Labels",
    path: "/attached_assets/Deli labels_1749341916236.pdf",
    type: "pdf",
    category: "Labels",
    description: "Official TSP labels for deli sandwich identification and tracking"
  },
  {
    name: "PBJ Labels",
    path: "/attached_assets/20250622-TSP-PBJ Sandwich Making 101_1749341916236.pdf",
    type: "pdf",
    category: "Labels",
    description: "Labels and guidelines for peanut butter and jelly sandwiches"
  }
];

const sandwichMakingDocuments: ToolkitDocument[] = [
  {
    name: "Deli Sandwich Making 101",
    path: "/attached_assets/20240622-TSP-Deli Sandwich Making 101_1749341916236.pdf",
    type: "pdf",
    category: "Sandwich Making",
    description: "Complete guide to preparing deli sandwiches according to TSP standards"
  },
  {
    name: "PBJ Sandwich Making 101",
    path: "/attached_assets/20250622-TSP-PBJ Sandwich Making 101_1749341916236.pdf",
    type: "pdf",
    category: "Sandwich Making",
    description: "Step-by-step instructions for making peanut butter and jelly sandwiches"
  },
  {
    name: "Sandwich Inventory List",
    path: "/attached_assets/CLEANED UP Sandwich Totals_1753480177827.pdf",
    type: "pdf",
    category: "Sandwich Making",
    description: "Comprehensive inventory tracking system for sandwich collections"
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'xlsx':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'txt':
      return <FileText className="h-5 w-5 text-gray-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Safety Guidelines':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Labels':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Sandwich Making':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

function DocumentCard({ document, onPreview }: { document: ToolkitDocument; onPreview: (doc: ToolkitDocument) => void }) {
  const handleDownload = (path: string, name: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(document.type)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
                {document.name}
              </CardTitle>
              <Badge variant="secondary" className={`mt-1 text-xs ${getCategoryColor(document.category)}`}>
                {document.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        {document.description && (
          <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
            {document.description}
          </CardDescription>
        )}
        {/* Mobile: Stack buttons vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(document)}
            className="flex-1 text-xs sm:text-sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Preview
          </Button>
          <div className="flex gap-2 sm:flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(document.path, document.name)}
              className="flex-1 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">DL</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.path, '_blank')}
              className="px-2 sm:px-3"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolkitTabs() {
  const [previewDocument, setPreviewDocument] = useState<ToolkitDocument | null>(null);

  if (previewDocument) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            {getFileIcon(previewDocument.type)}
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                {previewDocument.name}
              </h2>
              <Badge variant="secondary" className={`text-xs ${getCategoryColor(previewDocument.category)}`}>
                {previewDocument.category}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = previewDocument.path;
                link.download = previewDocument.name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">DL</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewDocument(null)}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Back to Toolkit</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
        <DocumentPreview 
          documentPath={previewDocument.path}
          documentName={previewDocument.name}
          documentType={previewDocument.type}
          onClose={() => setPreviewDocument(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#FBAD3F] rounded-lg flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 font-roboto break-words">
            Toolkit & Resources
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words">
            Essential documents, guidelines, and resources for volunteers and hosts
          </p>
        </div>
      </div>

      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="safety" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Safety</span>
            <span className="sm:hidden">Safe</span>
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm">
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span>Labels</span>
          </TabsTrigger>
          <TabsTrigger value="sandwich-making" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm">
            <Sandwich className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Sandwich Making</span>
            <span className="sm:hidden">Making</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="safety" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {safetyDocuments.map((document, index) => (
              <DocumentCard
                key={index}
                document={document}
                onPreview={setPreviewDocument}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="labels" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {labelDocuments.map((document, index) => (
              <DocumentCard
                key={index}
                document={document}
                onPreview={setPreviewDocument}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sandwich-making" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {sandwichMakingDocuments.map((document, index) => (
              <DocumentCard
                key={index}
                document={document}
                onPreview={setPreviewDocument}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}