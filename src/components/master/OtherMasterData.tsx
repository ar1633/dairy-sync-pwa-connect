
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, CreditCard, Receipt, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { useState } from "react";
import SMSConfigForm from "./forms/SMSConfigForm";
import BankInfoForm from "./forms/BankInfoForm";
import DebitCreditForm from "./forms/DebitCreditForm";
import InflowForm from "./forms/InflowForm";
import OutflowForm from "./forms/OutflowForm";

const OtherMasterData = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const masterDataSections = [
    {
      id: 'sms-config',
      title: 'SMS Configuration',
      description: 'Configure owner phone number for SMS notifications',
      icon: Phone,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'bank-info',
      title: 'Customer Bank Information',
      description: 'Manage bank details - bank name, IFSC code, branch information',
      icon: CreditCard,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'debit-credit',
      title: 'Other Debit/Credit',
      description: 'Manage vouchers, variations, and adjustment entries',
      icon: Receipt,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'inflow',
      title: 'Inflow (Income)',
      description: 'Configure income sources and account management',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'outflow',
      title: 'Outflow (Expense)',
      description: 'Configure expense categories and account management',
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'sms-config':
        return <SMSConfigForm />;
      case 'bank-info':
        return <BankInfoForm />;
      case 'debit-credit':
        return <DebitCreditForm />;
      case 'inflow':
        return <InflowForm />;
      case 'outflow':
        return <OutflowForm />;
      default:
        return null;
    }
  };

  if (activeSection) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setActiveSection(null)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Other Master Data
        </Button>
        {renderActiveSection()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Other Master Data</h2>
        <p className="text-gray-600">Additional configuration and master data management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masterDataSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => handleSectionClick(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Click to configure</span>
                  <Button variant="outline" size="sm" onClick={() => handleSectionClick(section.id)}>
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Success Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-900 mb-2">
                All Master Data Forms Available
              </h3>
              <p className="text-green-700 max-w-md mx-auto">
                Complete configuration forms for SMS settings, bank information, 
                debit/credit entries, and income/expense management are now fully functional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtherMasterData;
