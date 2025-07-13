
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sunset, Truck, DollarSign, Package2, Coins } from "lucide-react";

const TransactionsSection = () => {
  const transactionTypes = [
    {
      id: 'morning-collection',
      title: 'Morning Milk Collection',
      description: 'Record morning milk collection from farmers',
      icon: Sunrise,
      color: 'bg-yellow-100 text-yellow-600',
      status: 'Available'
    },
    {
      id: 'morning-delivery',
      title: 'Morning Milk Delivery',
      description: 'Track milk delivery to dairy/buyers',
      icon: Truck,
      color: 'bg-blue-100 text-blue-600',
      status: 'Available'
    },
    {
      id: 'evening-collection',
      title: 'Evening Milk Collection',
      description: 'Record evening milk collection from farmers',
      icon: Sunset,
      color: 'bg-orange-100 text-orange-600',
      status: 'Available'
    },
    {
      id: 'evening-delivery',
      title: 'Evening Milk Delivery',
      description: 'Track evening milk delivery to dairy/buyers',
      icon: Truck,
      color: 'bg-purple-100 text-purple-600',
      status: 'Available'
    },
    {
      id: 'payment-adjust',
      title: 'Payment Adjustments',
      description: 'Handle payment adjustments and deductions',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      status: 'Available'
    },
    {
      id: 'feed-sales',
      title: 'Cattle Feed Sales',
      description: 'Record cattle feed sales to farmers',
      icon: Package2,
      color: 'bg-brown-100 text-brown-600',
      status: 'Available'
    },
    {
      id: 'balance-recovery',
      title: 'Balance Recovery',
      description: 'Manage balance recovery and deposits',
      icon: Coins,
      color: 'bg-teal-100 text-teal-600',
      status: 'Available'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Transaction Management</h1>
        <p className="text-gray-600">Handle daily milk collection, delivery, and payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactionTypes.map((transaction) => {
          const Icon = transaction.icon;
          return (
            <Card 
              key={transaction.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${transaction.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{transaction.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {transaction.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </span>
                  <span className="text-sm text-gray-600">Click to open</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Transaction Forms Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Detailed transaction entry forms with milk quality testing, 
                automatic rate calculation, and receipt generation will be available in the next update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsSection;
