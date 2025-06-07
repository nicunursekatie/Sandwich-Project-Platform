import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Building2, ExternalLink } from "lucide-react";

export default function Development() {
  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/documents/${filename}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
            <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Development & Resources</h1>
            <p className="text-gray-600 dark:text-gray-300">Organizational documents and development resources</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* 501c3 Tax Exempt Status */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                501(c)(3) Tax Exempt Status
              </CardTitle>
              <CardDescription>
                Official IRS determination letter confirming The Sandwich Project's tax-exempt status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
                      IRS Determination Letter
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      Official documentation of our 501(c)(3) tax-exempt status. This letter confirms that donations to The Sandwich Project are tax-deductible for donors.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                        onClick={() => handleDownload('501c3-determination-letter.pdf')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                        onClick={() => window.open('/documents/501c3-determination-letter.pdf', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Online
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">For Donors</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Donations to The Sandwich Project are tax-deductible to the full extent allowed by law. 
                  Please consult your tax advisor for specific guidance on your situation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organizational Documents */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Organizational Documents
              </CardTitle>
              <CardDescription>
                Additional organizational and governance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Articles of Incorporation</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Legal founding document</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                    className="opacity-50"
                  >
                    Coming Soon
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Bylaws</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Organizational governance rules</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                    className="opacity-50"
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Development Contact
              </CardTitle>
              <CardDescription>
                Questions about organizational documents or development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  For questions about organizational documents, tax-exempt status, or development resources, 
                  please contact the development team through the committee chat channels or reach out to leadership.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}