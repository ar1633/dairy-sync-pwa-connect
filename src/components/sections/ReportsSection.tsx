
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, TrendingUp, Calculator } from "lucide-react";

const ReportsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
        <p className="text-gray-600">Generate comprehensive business and operational reports</p>
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Comprehensive Reporting System
              </h3>
              <p className="text-gray-500 max-w-lg mx-auto mb-6">
                Advanced reporting features including financial reports, milk collection analytics, 
                farmer payment summaries, and business intelligence dashboards will be available soon.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: FileText, label: 'Detailed Reports' },
                  { icon: BarChart3, label: 'Analytics' },
                  { icon: TrendingUp, label: 'Trends' },
                  { icon: Calculator, label: 'Calculations' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSection;
