
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCheck, UserX, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  username: string;
  role: 'employee';
  isActive: boolean;
  permissions: {
    master: boolean;
    transactions: boolean;
    reports: boolean;
    dairyReports: boolean;
    system: boolean;
  };
}

const PermissionManager = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '2',
      name: 'राम पाटील',
      username: 'employee1',
      role: 'employee',
      isActive: true,
      permissions: {
        master: true,
        transactions: true,
        reports: false,
        dairyReports: false,
        system: false
      }
    },
    {
      id: '3',
      name: 'सीता शर्मा',
      username: 'employee2',
      role: 'employee',
      isActive: false,
      permissions: {
        master: false,
        transactions: true,
        reports: true,
        dairyReports: false,
        system: false
      }
    }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    password: ''
  });

  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);

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

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.username || !newEmployee.password) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      username: newEmployee.username,
      role: 'employee',
      isActive: true,
      permissions: {
        master: false,
        transactions: false,
        reports: false,
        dairyReports: false,
        system: false
      }
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', username: '', password: '' });
    
    toast({
      title: "Success",
      description: `Employee ${employee.name} added successfully`
    });
  };

  const toggleEmployeeStatus = (employeeId: string) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId 
        ? { ...emp, isActive: !emp.isActive }
        : emp
    ));
    
    const employee = employees.find(emp => emp.id === employeeId);
    toast({
      title: "Status Updated",
      description: `${employee?.name} is now ${employee?.isActive ? 'inactive' : 'active'}`
    });
  };

  const updatePermission = (employeeId: string, permission: keyof Employee['permissions'], value: boolean) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId 
        ? { 
            ...emp, 
            permissions: { 
              ...emp.permissions, 
              [permission]: value 
            } 
          }
        : emp
    ));
  };

  const deleteEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEmployees(employees.filter(emp => emp.id !== employeeId));
    
    toast({
      title: "Employee Deleted",
      description: `${employee?.name} has been removed from the system`
    });
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">@{employee.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={employee.isActive}
                          onCheckedChange={() => toggleEmployeeStatus(employee.id)}
                        />
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={employee.permissions.master}
                        onCheckedChange={(value) => updatePermission(employee.id, 'master', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={employee.permissions.transactions}
                        onCheckedChange={(value) => updatePermission(employee.id, 'transactions', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={employee.permissions.reports}
                        onCheckedChange={(value) => updatePermission(employee.id, 'reports', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={employee.permissions.dairyReports}
                        onCheckedChange={(value) => updatePermission(employee.id, 'dairyReports', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={employee.permissions.system}
                        onCheckedChange={(value) => updatePermission(employee.id, 'system', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEmployee(employee.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
                emp.isActive && emp.permissions[permission as keyof Employee['permissions']]
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
