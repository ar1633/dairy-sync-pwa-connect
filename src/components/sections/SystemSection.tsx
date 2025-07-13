
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Database, Users, Calendar, HardDrive, FileSpreadsheet, Shield, Settings2, Usb } from "lucide-react";
import PermissionManager from "@/components/access-control/PermissionManager";
import EverestDataImport from "@/components/data-integration/EverestDataImport";
import { useState } from "react";

const SystemSection = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  const systemFeatures = [
    {
      id: 'permission-management',
      title: 'Permission Management',
      titleMarathi: 'परवानगी व्यवस्थापन',
      description: 'Control employee access to system modules',
      descriptionMarathi: 'सिस्टम मॉड्यूलमध्ये कर्मचारी प्रवेश नियंत्रित करा',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
      adminOnly: true
    },
    {
      id: 'everest-integration',
      title: 'Everest Ekomilk Integration',
      titleMarathi: 'एव्हरेस्ट इकॉमिल्क एकीकरण',
      description: 'Import data from Everest Ekomilk machine',
      descriptionMarathi: 'एव्हरेस्ट इकॉमिल्क मशीनमधून डेटा आयात करा',
      icon: Usb,
      color: 'bg-purple-100 text-purple-600',
      adminOnly: false
    },
    {
      id: 'data-backup',
      title: 'Data Backup',
      titleMarathi: 'डेटा बॅकअप',
      description: 'Create and manage system backups',
      descriptionMarathi: 'सिस्टम बॅकअप तयार करा आणि व्यवस्थापित करा',
      icon: HardDrive,
      color: 'bg-blue-100 text-blue-600',
      adminOnly: false
    },
    {
      id: 'data-import',
      title: 'Data Import/Export',
      titleMarathi: 'डेटा आयात/निर्यात',
      description: 'Import from Excel, export to various formats',
      descriptionMarathi: 'एक्सेलमधून आयात करा, विविध फॉर्मॅटमध्ये निर्यात करा',
      icon: FileSpreadsheet,
      color: 'bg-green-100 text-green-600',
      adminOnly: false
    },
    {
      id: 'user-management',
      title: 'User Management',
      titleMarathi: 'वापरकर्ता व्यवस्थापन',
      description: 'Manage system users and permissions',
      descriptionMarathi: 'सिस्टम वापरकर्ते आणि परवानग्या व्यवस्थापित करा',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      adminOnly: true
    },
    {
      id: 'year-change',
      title: 'Change Year',
      titleMarathi: 'वर्ष बदला',
      description: 'Switch between different financial years',
      descriptionMarathi: 'विविध आर्थिक वर्षांमध्ये स्विच करा',
      icon: Calendar,
      color: 'bg-yellow-100 text-yellow-600',
      adminOnly: true
    },
    {
      id: 'database',
      title: 'Database Management',
      titleMarathi: 'डेटाबेस व्यवस्थापन',
      description: 'Database maintenance and optimization',
      descriptionMarathi: 'डेटाबेस देखभाल आणि ऑप्टिमायझेशन',
      icon: Database,
      color: 'bg-red-100 text-red-600',
      adminOnly: true
    },
    {
      id: 'security',
      title: 'Security Settings',
      titleMarathi: 'सुरक्षा सेटिंग्ज',
      description: 'Configure security and access controls',
      descriptionMarathi: 'सुरक्षा आणि प्रवेश नियंत्रणे कॉन्फिगर करा',
      icon: Settings2,
      color: 'bg-gray-100 text-gray-600',
      adminOnly: true
    }
  ];

  const availableFeatures = systemFeatures.filter(feature => !feature.adminOnly || isAdmin);

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'permission-management' || featureId === 'everest-integration') {
      setActiveSubSection(featureId);
    } else {
      // Handle other features
      console.log(`Feature clicked: ${featureId}`);
    }
  };

  if (activeSubSection === 'permission-management') {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setActiveSubSection(null)}
          className="mb-4"
        >
          ← Back to System Management
        </Button>
        <PermissionManager />
      </div>
    );
  }

  if (activeSubSection === 'everest-integration') {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setActiveSubSection(null)}
          className="mb-4"
        >
          ← Back to System Management
        </Button>
        <EverestDataImport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">System Management</h1>
        <p className="text-gray-600">System configuration, data management, and user controls</p>
      </div>

      {!isAdmin && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">
                <strong>Limited Access:</strong> Some system features require administrator privileges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => handleFeatureClick(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {feature.title}
                      {feature.adminOnly && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Click to configure</span>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
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
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Advanced System Features Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Comprehensive system management tools including automated backups, 
                advanced user management, data migration utilities, and security controls 
                will be available in upcoming updates.
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default SystemSection;
