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
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(document.type)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {document.name}
              </CardTitle>
              <Badge variant="secondary" className={`mt-1 text-xs ${getCategoryColor(document.category)}`}>
                {document.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {document.description && (
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {document.description}
          </CardDescription>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(document)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(document.path, document.name)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(document.path, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(previewDocument.type)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {previewDocument.name}
              </h2>
              <Badge variant="secondary" className={`text-xs ${getCategoryColor(previewDocument.category)}`}>
                {previewDocument.category}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
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
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewDocument(null)}
            >
              Back to Toolkit
            </Button>
          </div>
        </div>
        <DocumentPreview 
          title={previewDocument.name}
          path={previewDocument.path}
          type={previewDocument.type}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#FBAD3F] rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-roboto">
            Toolkit & Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Essential documents, guidelines, and resources for volunteers and hosts
          </p>
        </div>
      </div>

      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="labels" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Labels
          </TabsTrigger>
          <TabsTrigger value="sandwich-making" className="flex items-center gap-2">
            <Sandwich className="h-4 w-4" />
            Sandwich Making
          </TabsTrigger>
        </TabsList>

        <TabsContent value="safety" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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