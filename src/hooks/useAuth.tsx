
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  name: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('dairy_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('dairy_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call - In real app, this would be actual authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Default users for demo
    const users = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const, name: 'Admin User', isActive: true },
      { id: '2', username: 'employee1', password: 'emp123', role: 'employee' as const, name: 'Employee One', isActive: true },
    ];
    
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser && foundUser.isActive) {
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        isActive: foundUser.isActive
      };
      
      setUser(userData);
      localStorage.setItem('dairy_user', JSON.stringify(userData));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      setLoading(false);
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or account inactive",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dairy_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
