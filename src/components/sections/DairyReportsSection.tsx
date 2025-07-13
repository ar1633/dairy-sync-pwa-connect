
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Receipt, Users, MessageSquare } from "lucide-react";

const DairyReportsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dairy Reports</h1>
        <p className="text-gray-600">Specialized reports for dairy operations and management</p>
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <PieChart className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Dairy-Specific Reporting
              </h3>
              <p className="text-gray-500 max-w-lg mx-auto mb-6">
                Specialized dairy reports including profit/loss analysis, salary slips, 
                milk collection details, center-wise comparisons, and group messaging capabilities.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: PieChart, label: 'Profit & Loss' },
                  { icon: Receipt, label: 'Salary Slips' },
                  { icon: Users, label: 'Collection Details' },
                  { icon: MessageSquare, label: 'Group Messages' }
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

export default DairyReportsSection;
