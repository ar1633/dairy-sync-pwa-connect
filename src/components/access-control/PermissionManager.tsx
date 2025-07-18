import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Edit, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { AuthService, User } from "@/services/authService";
import { DataService } from "@/services/dataService";

const PermissionManager = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const authService = AuthService.getInstance();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const allUsers = await DataService.getAllUsers();
      // Filter out admin users, only show employees
      const employeeUsers = allUsers.filter(u => u.role === 'employee');
      setEmployees(employeeUsers);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>Only administrators can manage user permissions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.username || !newEmployee.email || !newEmployee.password) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await authService.registerUser({
        username: newEmployee.username,
        email: newEmployee.email,
        password: newEmployee.password,
        name: newEmployee.name,
        role: 'employee'
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Employee ${newEmployee.name} added successfully`
        });
        
        setNewEmployee({ name: '', username: '', email: '', password: '' });
        await loadEmployees(); // Reload the employees list
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  const toggleEmployeeStatus = async (employeeId: string) => {
    try {
      const success = await authService.toggleUserStatus(employeeId);
      if (success) {
        await loadEmployees(); // Reload to get updated status
        const employee = employees.find(emp => emp._id === employeeId);
        toast({
          title: "Status Updated",
          description: `${employee?.name} status has been updated`
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update employee status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive"
      });
    }
  };

  const updatePermission = async (employeeId: string, permission: keyof User['permissions'], value: boolean) => {
    try {
      const employee = employees.find(emp => emp._id === employeeId);
      if (!employee) return;

      const updatedPermissions = {
        ...employee.permissions,
        [permission]: value
      };

      const success = await authService.updateUserPermissions(employeeId, updatedPermissions);
      if (success) {
        await loadEmployees(); // Reload to get updated permissions
      } else {
        toast({
          title: "Error",
          description: "Failed to update permissions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Permission Management</h1>
        <p className="text-gray-600">Manage employee access and permissions</p>
      </div>

      {/* Add New Employee */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add New Employee
          </CardTitle>
          <CardDescription>Create new employee account with custom permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Employee Name</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newEmployee.username}
                onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                placeholder="Enter password"
              />
            </div>
          </div>
          <Button onClick={handleAddEmployee} className="mt-4">
            Add Employee
          </Button>
        </CardContent>
      </Card>

      {/* Employee List and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Permissions</CardTitle>
          <CardDescription>Manage access levels for each employee</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found. Add your first employee above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Master</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Dairy Reports</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">@{employee.username}</div>
                          <div className="text-xs text-gray-400">{employee.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={employee.isActive}
                            onCheckedChange={() => toggleEmployeeStatus(employee._id)}
                          />
                          <Badge variant={employee.isActive ? "default" : "secondary"}>
                            {employee.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={employee.permissions.master}
                          onCheckedChange={(value) => updatePermission(employee._id, 'master', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={employee.permissions.transactions}
                          onCheckedChange={(value) => updatePermission(employee._id, 'transactions', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={employee.permissions.reports}
                          onCheckedChange={(value) => updatePermission(employee._id, 'reports', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={employee.permissions.dairyReports}
                          onCheckedChange={(value) => updatePermission(employee._id, 'dairyReports', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={employee.permissions.system}
                          onCheckedChange={(value) => updatePermission(employee._id, 'system', value)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Edit functionality can be added later */}}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['master', 'transactions', 'reports', 'dairyReports', 'system'].map((permission) => {
              const count = employees.filter(emp => 
                emp.isActive && emp.permissions[permission as keyof User['permissions']]
              ).length;
              
              return (
                <div key={permission} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{permission}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManager;