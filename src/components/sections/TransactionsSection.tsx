import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Sunset, Truck, DollarSign, Package2, Coins } from "lucide-react";
import TransactionForms from "@/components/transactions/TransactionForms";
import { useLanguage } from "@/contexts/LanguageContext";

console.log('[LOG] Loaded src/components/sections/TransactionsSection.tsx');

const TransactionsSection = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTransaction, setActiveTransaction] = useState<string | null>(null);

  const transactionTypes = [
    {
      id: 'morning-collection',
      title: t('milkCollection') + ' - ' + t('morning'),
      description: 'Record morning milk collection from farmers',
      icon: Sunrise,
      color: 'bg-yellow-100 text-yellow-600',
      status: 'Available'
    },
    {
      id: 'morning-delivery',
      title: t('milkDelivery') + ' - ' + t('morning'),
      description: 'Track milk delivery to dairy/buyers',
      icon: Truck,
      color: 'bg-blue-100 text-blue-600',
      status: 'Available'
    },
    {
      id: 'evening-collection',
      title: t('milkCollection') + ' - ' + t('evening'),
      description: 'Record evening milk collection from farmers',
      icon: Sunset,
      color: 'bg-orange-100 text-orange-600',
      status: 'Available'
    },
    {
      id: 'evening-delivery',
      title: t('milkDelivery') + ' - ' + t('evening'),
      description: 'Track evening milk delivery to dairy/buyers',
      icon: Truck,
      color: 'bg-purple-100 text-purple-600',
      status: 'Available'
    },
    {
      id: 'payment-adjust',
      title: t('paymentAdjustment'),
      description: 'Handle payment adjustments and deductions',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      status: 'Available'
    },
    {
      id: 'feed-sales',
      title: t('cattleFeedSale'),
      description: 'Record cattle feed sales to farmers',
      icon: Package2,
      color: 'bg-brown-100 text-brown-600',
      status: 'Available'
    },
    {
      id: 'balance-recovery',
      title: t('balanceRecovery'),
      description: 'Manage balance recovery and deposits',
      icon: Coins,
      color: 'bg-teal-100 text-teal-600',
      status: 'Available'
    }
  ];

  if (activeTransaction) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setActiveTransaction(null)}
          >
            ← Back to Transactions
          </Button>
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'mr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('mr')}
            >
              मराठी
            </Button>
          </div>
        </div>
        <TransactionForms language={language} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('transactions')} Management</h1>
          <p className="text-gray-600">Handle daily milk collection, delivery, and payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('en')}
          >
            English
          </Button>
          <Button
            variant={language === 'mr' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('mr')}
          >
            मराठी
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactionTypes.map((transaction) => {
          const Icon = transaction.icon;
          return (
            <Card 
              key={transaction.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
              onClick={() => setActiveTransaction(transaction.id)}
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
                Advanced Transaction Features Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Detailed transaction entry forms with milk quality testing, 
                automatic rate calculation, receipt generation, and PDF export 
                will be available in the next update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsSection;
