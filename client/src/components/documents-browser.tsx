import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";

interface DocumentFile {
  name: string;
  path: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'txt' | 'other';
  category: string;
  description?: string;
}

const documentFiles: DocumentFile[] = [
  {
    name: "Summer Food Safety Guidelines",
    path: "/documents/Doc85(1).docx",
    type: "docx",
    category: "Safety",
    description: "Important summer food safety guidelines for home hosts"
  },
  {
    name: "Food Safety Volunteers Guide",
    path: "/documents/20230525-TSP-Food Safety Volunteers.pdf",
    type: "pdf",
    category: "Training",
    description: "Essential food safety guidelines for all volunteers"
  },
  {
    name: "Deli Sandwich Making 101",
    path: "/documents/20240622-TSP-Deli Sandwich Making 101.pdf", 
    type: "pdf",
    category: "Training",
    description: "Step-by-step guide for preparing deli sandwiches"
  },
  {
    name: "PBJ Sandwich Making 101",
    path: "/documents/20250622-TSP-PBJ Sandwich Making 101.pdf",
    type: "pdf", 
    category: "Training",
    description: "Instructions for peanut butter and jelly sandwich preparation"
  },
  {
    name: "Articles of Incorporation",
    path: "/documents/Articles of Incorporation.pdf",
    type: "pdf",
    category: "Legal",
    description: "Official Articles of Incorporation for The Sandwich Project"
  },
  {
    name: "IRS Tax Exempt Letter",
    path: "/documents/IRS Tax Exempt Letter.pdf",
    type: "pdf",
    category: "Legal",
    description: "IRS Tax Exempt determination letter containing EIN"
  },
  {
    name: "Deli Labels",
    path: "/documents/Deli labels.pdf",
    type: "pdf",
    category: "Resources",
    description: "Printable labels for deli sandwich packaging"
  },
  {
    name: "PBJ Labels", 
    path: "/documents/Pbj labels.pdf",
    type: "pdf",
    category: "Resources",
    description: "Printable labels for PBJ sandwich packaging"
  },
  {
    name: "Sandwich Inventory List",
    path: "/documents/TSP Sandwich Inventory List for 3 ozs.xlsx",
    type: "xlsx",
    category: "Operations",
    description: "Inventory tracking spreadsheet for 3oz sandwich portions"
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'xlsx':
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'txt':
      return <File className="h-5 w-5 text-gray-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Training':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Legal':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'Resources':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Operations':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'Safety':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export function DocumentsBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(documentFiles.map(doc => doc.category)))];
  
  const filteredDocs = selectedCategory === 'All' 
    ? documentFiles 
    : documentFiles.filter(doc => doc.category === selectedCategory);

  const handleDownload = (path: string, name: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = path;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Library</h2>
          <p className="text-muted-foreground">
            Training materials, forms, and resources for The Sandwich Project
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc.type)}
                  <CardTitle className="text-base leading-tight">{doc.name}</CardTitle>
                </div>
                <Badge className={getCategoryColor(doc.category)} variant="secondary">
                  {doc.category}
                </Badge>
              </div>
              {doc.description && (
                <CardDescription className="text-sm">
                  {doc.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => handleDownload(doc.path, doc.name)}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download {doc.type.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No documents found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try selecting a different category
          </p>
        </div>
      )}
    </div>
  );
}