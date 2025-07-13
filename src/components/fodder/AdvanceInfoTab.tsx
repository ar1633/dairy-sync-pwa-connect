
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const AdvanceInfoTab = () => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Advance Information Management
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Track advances given to farmers, payment schedules, and balance management. 
              This section will handle advance payments and recovery tracking.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvanceInfoTab;
