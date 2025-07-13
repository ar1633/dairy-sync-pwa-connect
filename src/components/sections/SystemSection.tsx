
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Database, Users, Calendar, HardDrive, FileSpreadsheet, Shield } from "lucide-react";

const SystemSection = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const systemFeatures = [
    {
      id: 'data-backup',
      title: 'Data Backup',
      description: 'Create and manage system backups',
      icon: HardDrive,
      color: 'bg-blue-100 text-blue-600',
      adminOnly: false
    },
    {
      id: 'data-import',
      title: 'Data Import/Export',
      description: 'Import from Excel, export to various formats',
      icon: FileSpreadsheet,
      color: 'bg-green-100 text-green-600',
      adminOnly: false
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      adminOnly: true
    },
    {
      id: 'year-change',
      title: 'Change Year',
      description: 'Switch between different financial years',
      icon: Calendar,
      color: 'bg-yellow-100 text-yellow-600',
      adminOnly: true
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Database maintenance and optimization',
      icon: Database,
      color: 'bg-red-100 text-red-600',
      adminOnly: true
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Configure security and access controls',
      icon: Shield,
      color: 'bg-gray-100 text-gray-600',
      adminOnly: true
    }
  ];

  const availableFeatures = systemFeatures.filter(feature => !feature.adminOnly || isAdmin);

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
      </Card>
    </div>
  );
};

export default SystemSection;
