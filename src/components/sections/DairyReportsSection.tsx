
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Receipt, Users, MessageSquare, Download, Send } from "lucide-react";
import { PDFService } from "@/services/pdfService";
import { toast } from "@/hooks/use-toast";

const DairyReportsSection = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [messageText, setMessageText] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const generateProfitLossReport = () => {
    const data = {
      totalRevenue: 245000,
      totalExpenses: 185000,
      profit: 60000,
      expenses: [
        { category: "Fodder", amount: 85000 },
        { category: "Transportation", amount: 35000 },
        { category: "Maintenance", amount: 25000 },
        { category: "Staff Salary", amount: 40000 }
      ]
    };

    PDFService.generateBusinessReportPDF(data, {
      title: "Profit & Loss Report",
      filename: `profit-loss-${new Date().toISOString().split('T')[0]}.pdf`
    });

    toast({
      title: "Report Generated",
      description: "Profit & Loss report downloaded successfully"
    });
  };

  const generateSalarySlips = () => {
    const employees = [
      { name: "John Doe", position: "Manager", salary: 25000, deductions: 2500 },
      { name: "Jane Smith", position: "Supervisor", salary: 18000, deductions: 1800 },
      { name: "Mike Johnson", position: "Operator", salary: 15000, deductions: 1500 }
    ];

    // Create salary slip PDF for each employee
    employees.forEach(emp => {
      PDFService.generateBusinessReportPDF({
        employeeName: emp.name,
        position: emp.position,
        basicSalary: emp.salary,
        deductions: emp.deductions,
        netSalary: emp.salary - emp.deductions
      }, {
        title: `Salary Slip - ${emp.name}`,
        filename: `salary-slip-${emp.name.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      });
    });

    toast({
      title: "Salary Slips Generated",
      description: `Generated salary slips for ${employees.length} employees`
    });
  };

  const sendGroupMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    // Simulate sending message
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedGroup === 'all' ? 'all employees' : selectedGroup} successfully`
      });
      setMessageText("");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dairy Reports</h1>
        <p className="text-gray-600">Specialized reports for dairy operations and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={generateProfitLossReport}>
          <CardContent className="p-6 text-center">
            <PieChart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Profit & Loss</h3>
            <p className="text-sm text-gray-600 mb-4">Generate detailed P&L analysis</p>
            <Button size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={generateSalarySlips}>
          <CardContent className="p-6 text-center">
            <Receipt className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Salary Slips</h3>
            <p className="text-sm text-gray-600 mb-4">Generate employee salary slips</p>
            <Button size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Slips
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Collection Details</h3>
            <p className="text-sm text-gray-600 mb-4">Detailed collection analysis</p>
            <Select onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Group Messages</h3>
            <p className="text-sm text-gray-600 mb-4">Send messages to teams</p>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="managers">Managers</SelectItem>
                <SelectItem value="operators">Operators</SelectItem>
                <SelectItem value="farmers">Farmers</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Today's Collection</span>
                <span className="font-bold">1,245 Liters</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Active Farmers</span>
                <span className="font-bold">45 Farmers</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Average Fat %</span>
                <span className="font-bold">4.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Monthly Revenue</span>
                <span className="font-bold text-green-600">₹2,45,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Group Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Message Text</Label>
              <textarea
                className="w-full p-3 border rounded-md resize-none h-24"
                placeholder="Enter your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <div>
              <Label>Send To</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="managers">Managers Only</SelectItem>
                  <SelectItem value="operators">Operators Only</SelectItem>
                  <SelectItem value="farmers">Farmers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={sendGroupMessage} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DairyReportsSection;
