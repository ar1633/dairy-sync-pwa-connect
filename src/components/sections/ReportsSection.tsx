
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, BarChart3, TrendingUp, Calculator, Download, Calendar } from "lucide-react";
import { PDFService } from "@/services/pdfService";
import { DataService } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";

const ReportsSection = () => {
  const [reportType, setReportType] = useState("milk-collection");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "Missing Information",
        description: "Please select date range for the report",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      switch (reportType) {
        case "milk-collection":
          const milkData = await DataService.getMilkSummary(dateFrom, centerCode);
          PDFService.generateMilkCollectionReportPDF(milkData, {
            title: "Milk Collection Report",
            filename: `milk-collection-${dateFrom}-to-${dateTo}.pdf`
          });
          break;
          
        case "farmer-list":
          const farmers = await DataService.getFarmers();
          PDFService.generateFarmerReportPDF(farmers, {
            title: "Farmer List Report",
            filename: `farmer-list-${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
          
        case "business-analytics":
          // Generate business analytics data
          const businessData = {
            totalRevenue: 150000,
            totalExpenses: 120000,
            activeFarmers: 45,
            avgFat: 4.2,
            monthlyGrowth: 8.5
          };
          PDFService.generateBusinessReportPDF(businessData, {
            title: "Business Analytics Report",
            filename: `business-analytics-${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
          
        default:
          throw new Error("Unknown report type");
      }
      
      toast({
        title: "Report Generated",
        description: "Report has been downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
        <p className="text-gray-600">Generate comprehensive business and operational reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milk-collection">Milk Collection Report</SelectItem>
                  <SelectItem value="farmer-list">Farmer List</SelectItem>
                  <SelectItem value="business-analytics">Business Analytics</SelectItem>
                  <SelectItem value="payment-summary">Payment Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Centre Code (Optional)</Label>
              <Input
                placeholder="Enter centre code"
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value)}
              />
            </div>

            <Button 
              onClick={generateReport} 
              className="w-full"
              disabled={isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate & Download Report"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Quick access to commonly used reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  icon: FileText, 
                  label: 'Milk Collection', 
                  description: 'Daily milk collection summary',
                  type: 'milk-collection'
                },
                { 
                  icon: BarChart3, 
                  label: 'Business Analytics', 
                  description: 'Revenue, profit & growth metrics',
                  type: 'business-analytics'
                },
                { 
                  icon: TrendingUp, 
                  label: 'Farmer Performance', 
                  description: 'Farmer-wise collection trends',
                  type: 'farmer-list'
                },
                { 
                  icon: Calculator, 
                  label: 'Payment Summary', 
                  description: 'Payment calculations & summaries',
                  type: 'payment-summary'
                }
              ].map((item, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setReportType(item.type)}
                >
                  <CardContent className="p-4 text-center">
                    <item.icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Recently generated reports and quick stats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">Today's Collection</div>
              <div className="text-2xl font-bold text-green-600">1,245 L</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">Active Farmers</div>
              <div className="text-2xl font-bold text-blue-600">45</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">This Month</div>
              <div className="text-2xl font-bold text-purple-600">₹1,25,000</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calculator className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold">Avg Fat %</div>
              <div className="text-2xl font-bold text-orange-600">4.2%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSection;
