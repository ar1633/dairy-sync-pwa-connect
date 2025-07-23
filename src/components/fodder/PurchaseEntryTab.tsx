import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

console.log('[LOG] Loaded src/components/fodder/PurchaseEntryTab.tsx');

const PurchaseEntryTab = () => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Feed Purchase Entry
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Record feed purchases including purchase date, bill details, seller information, 
              feed types, quantities, rates, and payment tracking.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseEntryTab;
