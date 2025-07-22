import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, ExternalLink } from 'lucide-react';
import { DocumentPreview } from '@/components/document-preview';

interface AdminDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  type: 'pdf' | 'docx' | 'xlsx';
  size?: string;
  lastModified?: string;
  importance: 'critical' | 'high' | 'normal';
}

const adminDocuments: AdminDocument[] = [
  {
    id: 'tax-exempt-letter',
    name: 'IRS Tax Exempt Letter',
    description: 'Official 501(c)(3) tax-exempt status documentation (Contains EIN)',
    category: 'Legal & Tax',
    path: '/attached_assets/IRS Tax Exempt Letter (Contains EIN).pdf',
    type: 'pdf',
    importance: 'critical'
  },
  {
    id: 'articles-incorporation',
    name: 'Articles of Incorporation',
    description: 'Official corporate charter and founding documents',
    category: 'Legal & Tax',
    path: '/attached_assets/Articles of Incorporation.pdf',
    type: 'pdf',
    importance: 'critical'
  },
  {
    id: 'georgia-code',
    name: '2020 Georgia Code Title 51',
    description: 'Georgia state legal code reference for nonprofit operations',
    category: 'Legal & Tax',
    path: '/attached_assets/2020 Georgia Code Title 51.pdf',
    type: 'pdf',
    importance: 'high'
  },
  {
    id: 'bylaws-2024',
    name: 'TSP Bylaws 2024',
    description: 'Current organizational bylaws and governance structure',
    category: 'Governance',
    path: '/attached_assets/The Sandwich Project Bylaws 2024(1)_1750871081277.pdf',
    type: 'pdf',
    importance: 'critical'
  }
];

const categories = ['All', 'Legal & Tax', 'Governance'];

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewDocument, setPreviewDocument] = useState<AdminDocument | null>(null);

  const filteredDocuments = adminDocuments.filter(doc => 
    selectedCategory === 'All' || doc.category === selectedCategory
  );

  const handleDownload = (doc: AdminDocument) => {
    const link = document.createElement('a');
    link.href = doc.path;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (doc: AdminDocument) => {
    setPreviewDocument(doc);
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">HIGH</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">NORMAL</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administrative Documents
          </h1>
          <p className="text-gray-600">
            Critical organizational documents including tax files, incorporation papers, 
            and governance documentation for The Sandwich Project.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg leading-tight">
                      {doc.name}
                    </CardTitle>
                  </div>
                  {getImportanceBadge(doc.importance)}
                </div>
                <CardDescription className="text-sm text-gray-600 mt-2">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {doc.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs uppercase">
                      {doc.type}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                      className="flex-1 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Preview Modal */}
        {previewDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{previewDocument.name}</h3>
                    <p className="text-sm text-gray-500">{previewDocument.description}</p>
                  </div>
                  {getImportanceBadge(previewDocument.importance)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(previewDocument)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewDocument.path, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewDocument(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
              
              <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <DocumentPreview
                  documentName={previewDocument.name}
                  documentPath={previewDocument.path}
                  documentType={previewDocument.type}
                  onClose={() => setPreviewDocument(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-700 space-y-2">
              <p>
                <strong>CONFIDENTIAL:</strong> These documents contain sensitive organizational 
                information including tax identification numbers and legal incorporation details.
              </p>
              <p>
                Access is restricted to authorized administrators only. Do not share, distribute, 
                or discuss the contents of these documents outside of official organizational business.
              </p>
              <ul className="list-disc list-inside text-sm mt-3 space-y-1">
                <li>IRS Tax Exempt Letter contains the official EIN number</li>
                <li>Articles of Incorporation include founding details and registered addresses</li>
                <li>Georgia Code provides legal reference for compliance requirements</li>
                <li>Bylaws contain governance structure and operational procedures</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}