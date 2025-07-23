import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, ShoppingCart, DollarSign, Truck, Package } from "lucide-react";
import CentreManagement from "@/components/master/CentreManagement";
import FarmerManagement from "@/components/master/FarmerManagement";
import MilkBuyersManagement from "@/components/master/MilkBuyersManagement";
import MilkPriceManagement from "@/components/master/MilkPriceManagement";
import FodderManagement from "@/components/master/FodderManagement";
import OtherMasterData from "@/components/master/OtherMasterData";

type MasterSubSection = 'overview' | 'centres' | 'farmers' | 'buyers' | 'pricing' | 'fodder' | 'other';

const MasterSection = () => {
  const [activeSubSection, setActiveSubSection] = useState<MasterSubSection>('overview');

  const subSections = [
    { 
      id: 'centres' as MasterSubSection, 
      name: 'Centre Information', 
      icon: Building2, 
      description: 'Manage dairy centres and locations',
      count: '3 centres'
    },
    { 
      id: 'farmers' as MasterSubSection, 
      name: 'Farmer Information', 
      icon: Users, 
      description: 'Add and manage farmer details',
      count: '245 farmers'
    },
    { 
      id: 'buyers' as MasterSubSection, 
      name: 'Milk Buyers', 
      icon: ShoppingCart, 
      description: 'Manage milk buyers and commission',
      count: '12 buyers'
    },
    { 
      id: 'pricing' as MasterSubSection, 
      name: 'Milk Pricing', 
      icon: DollarSign, 
      description: 'Set milk rates by fat, SNF and time',
      count: 'Updated today'
    },
    { 
      id: 'fodder' as MasterSubSection, 
      name: 'Animal Fodder', 
      icon: Package, 
      description: 'Manage fodder providers and inventory',
      count: '8 providers'
    },
    { 
      id: 'other' as MasterSubSection, 
      name: 'Other Master Data', 
      icon: Truck, 
      description: 'Additional master data management',
      count: 'Various entries'
    },
  ];

  const renderSubSection = () => {
    console.log('[MasterSection] renderSubSection', activeSubSection);
    switch (activeSubSection) {
      case 'centres':
        return <CentreManagement />;
      case 'farmers':
        return <FarmerManagement />;
      case 'buyers':
        return <MilkBuyersManagement />;
      case 'pricing':
        return <MilkPriceManagement />;
      case 'fodder':
        return <FodderManagement />;
      case 'other':
        return <OtherMasterData />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
                  onClick={() => setActiveSubSection(section.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.name}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{section.count}</span>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Data Management</h1>
          <p className="text-gray-600">Configure and manage all master data for your dairy operations</p>
        </div>
        
        {activeSubSection !== 'overview' && (
          <Button 
            variant="outline"
            onClick={() => setActiveSubSection('overview')}
          >
            Back to Overview
          </Button>
        )}
      </div>

      {renderSubSection()}
    </div>
  );
};

export default MasterSection;

console.log('[LOG] Loaded src/components/sections/MasterSection.tsx');
