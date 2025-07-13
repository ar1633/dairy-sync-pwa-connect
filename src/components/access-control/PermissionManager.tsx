
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, Lock } from "lucide-react";

interface Permission {
  module: string;
  moduleMarathi: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
}

interface UserPermissions {
  userId: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
  isActive: boolean;
  permissions: Permission[];
}

const PermissionManager = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<"english" | "marathi">("english");
  const [selectedUser, setSelectedUser] = useState<string>("");

  const [users, setUsers] = useState<UserPermissions[]>([
    {
      userId: "2",
      username: "employee1",
      name: "Employee One",
      role: "employee",
      isActive: true,
      permissions: [
        {
          module: "Centre Management",
          moduleMarathi: "केंद्र व्यवस्थापन",
          canView: true,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canDownload: true
        },
        {
          module: "Farmer Management",
          moduleMarathi: "शेतकरी व्यवस्थापन",
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: false,
          canDownload: true
        },
        {
          module: "Milk Collection",
          moduleMarathi: "दूध संकलन",
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: false,
          canDownload: false
        },
        {
          module: "Reports",
          moduleMarathi: "अहवाल",
          canView: true,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canDownload: true
        },
        {
          module: "System Management",
          moduleMarathi: "सिस्टम व्यवस्थापन",
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canDownload: false
        }
      ]
    }
  ]);

  const modules = [
    { name: "Centre Management", nameMarathi: "केंद्र व्यवस्थापन" },
    { name: "Farmer Management", nameMarathi: "शेतकरी व्यवस्थापन" },
    { name: "Milk Buyers", nameMarathi: "दूध खरेदीदार" },
    { name: "Milk Pricing", nameMarathi: "दूध किंमत" },
    { name: "Fodder Management", nameMarathi: "खाद्य व्यवस्थापन" },
    { name: "Milk Collection", nameMarathi: "दूध संकलन" },
    { name: "Milk Delivery", nameMarathi: "दूध वितरण" },
    { name: "Payment Management", nameMarathi: "पेमेंट व्यवस्थापन" },
    { name: "Reports", nameMarathi: "अहवाल" },
    { name: "Dairy Reports", nameMarathi: "डेअरी अहवाल" },
    { name: "System Management", nameMarathi: "सिस्टम व्यवस्थापन" }
  ];

  const updatePermission = (userId: string, module: string, permission: keyof Omit<Permission, 'module' | 'moduleMarathi'>, value: boolean) => {
    setUsers(users.map(user => {
      if (user.userId === userId) {
        return {
          ...user,
          permissions: user.permissions.map(perm => 
            perm.module === module 
              ? { ...perm, [permission]: value }
              : perm
          )
        };
      }
      return user;
    }));

    toast({
      title: language === "english" ? "Permission Updated" : "परवानगी अपडेट केली",
      description: language === "english" ? "User permissions updated successfully" : "वापरकर्ता परवानग्या यशस्वीरित्या अपडेट केल्या"
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.userId === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));

    const targetUser = users.find(u => u.userId === userId);
    toast({
      title: language === "english" ? "User Status Updated" : "वापरकर्ता स्थिती अपडेट केली",
      description: language === "english" 
        ? `User ${targetUser?.isActive ? 'deactivated' : 'activated'} successfully`
        : `वापरकर्ता ${targetUser?.isActive ? 'निष्क्रिय' : 'सक्रिय'} यशस्वीरित्या केला`
    });
  };

  if (user?.role !== 'admin') {
    return (
      <Card className="border-red-200">
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {language === "english" ? "Access Denied" : "प्रवेश नाकारला"}
          </h3>
          <p className="text-red-600">
            {language === "english" 
              ? "Only administrators can manage user permissions"
              : "केवळ प्रशासक वापरकर्ता परवानग्या व्यवस्थापित करू शकतात"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedUserData = users.find(u => u.userId === selectedUser);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === "english" ? "Permission Management" : "परवानगी व्यवस्थापन"}
          </h2>
          <p className="text-gray-600">
            {language === "english" ? "Control employee access to system modules" : "सिस्टम मॉड्यूलमध्ये कर्मचारी प्रवेश नियंत्रित करा"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "english" ? "marathi" : "english")}
        >
          {language === "english" ? "मराठी" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "english" ? "Users" : "वापरकर्ते"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((userData) => (
                <div
                  key={userData.userId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser === userData.userId ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(userData.userId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{userData.name}</p>
                      <p className="text-sm text-gray-600">@{userData.username}</p>
                      <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                        {userData.role === 'admin' 
                          ? (language === "english" ? "Admin" : "प्रशासक")
                          : (language === "english" ? "Employee" : "कर्मचारी")
                        }
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                        {userData.isActive 
                          ? (language === "english" ? "Active" : "सक्रिय")
                          : (language === "english" ? "Inactive" : "निष्क्रिय")
                        }
                      </Badge>
                      <Switch
                        checked={userData.isActive}
                        onCheckedChange={() => toggleUserStatus(userData.userId)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permission Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {language === "english" ? "Module Permissions" : "मॉड्यूल परवानग्या"}
            </CardTitle>
            {selectedUserData && (
              <p className="text-sm text-gray-600">
                {language === "english" ? "Managing permissions for" : "यासाठी परवानग्या व्यवस्थापित करत आहे"}: {selectedUserData.name}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!selectedUser ? (
              <div className="text-center py-8 text-gray-500">
                {language === "english" ? "Select a user to manage permissions" : "परवानग्या व्यवस्थापित करण्यासाठी वापरकर्ता निवडा"}
              </div>
            ) : selectedUserData ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === "english" ? "Module" : "मॉड्यूल"}</TableHead>
                      <TableHead className="text-center">{language === "english" ? "View" : "पहा"}</TableHead>
                      <TableHead className="text-center">{language === "english" ? "Add" : "जोडा"}</TableHead>
                      <TableHead className="text-center">{language === "english" ? "Edit" : "संपादित"}</TableHead>
                      <TableHead className="text-center">{language === "english" ? "Delete" : "हटवा"}</TableHead>
                      <TableHead className="text-center">{language === "english" ? "Download" : "डाउनलोड"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUserData.permissions.map((permission, index) => (
                      <TableRow key={permission.module}>
                        <TableCell className="font-medium">
                          {language === "english" ? permission.module : permission.moduleMarathi}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.canView}
                            onCheckedChange={(value) => updatePermission(selectedUser, permission.module, 'canView', value)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.canAdd}
                            onCheckedChange={(value) => updatePermission(selectedUser, permission.module, 'canAdd', value)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.canEdit}
                            onCheckedChange={(value) => updatePermission(selectedUser, permission.module, 'canEdit', value)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.canDelete}
                            onCheckedChange={(value) => updatePermission(selectedUser, permission.module, 'canDelete', value)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.canDownload}
                            onCheckedChange={(value) => updatePermission(selectedUser, permission.module, 'canDownload', value)}
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionManager;
