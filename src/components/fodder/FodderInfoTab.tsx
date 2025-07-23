import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

console.log('[LOG] Loaded src/components/fodder/FodderInfoTab.tsx');

const FodderInfoTab = () => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Fodder Information Management
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Manage fodder types, inventory tracking, and product information. 
              This section will include fodder catalog, specifications, and stock management.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FodderInfoTab;
