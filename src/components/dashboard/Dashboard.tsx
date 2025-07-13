
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import MasterSection from "@/components/sections/MasterSection";
import TransactionsSection from "@/components/sections/TransactionsSection";
import ReportsSection from "@/components/sections/ReportsSection";
import DairyReportsSection from "@/components/sections/DairyReportsSection";
import SystemSection from "@/components/sections/SystemSection";
import { LogOut, Menu, X, Milk, Database, FileText, BarChart3, Settings, Receipt } from "lucide-react";

type Section = 'master' | 'transactions' | 'reports' | 'dairy-reports' | 'system';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('master');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    { id: 'master' as Section, name: 'Master', icon: Database, description: 'Manage centres, farmers, buyers' },
    { id: 'transactions' as Section, name: 'Transactions', icon: Receipt, description: 'Milk collection & payments' },
    { id: 'reports' as Section, name: 'Reports', icon: FileText, description: 'Business reports' },
    { id: 'dairy-reports' as Section, name: 'Dairy Reports', icon: BarChart3, description: 'Dairy specific reports' },
    { id: 'system' as Section, name: 'System', icon: Settings, description: 'System management' },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'master':
        return <MasterSection />;
      case 'transactions':
        return <TransactionsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'dairy-reports':
        return <DairyReportsSection />;
      case 'system':
        return <SystemSection />;
      default:
        return <MasterSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Milk className="h-6 w-6 text-green-600" />
              <span className="font-bold text-gray-800">Krishi DairySync</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static z-20 bg-white w-64 h-screen shadow-lg border-r`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Navigation</h2>
          </div>
          
          <nav className="p-4 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full justify-start h-auto p-3 ${
                    isActive 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{section.name}</div>
                    <div className={`text-xs ${isActive ? 'text-green-100' : 'text-gray-500'}`}>
                      {section.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-6">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
