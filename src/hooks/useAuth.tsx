
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { AuthService, User, LoginCredentials, RegisterData } from "@/services/authService";
import { BackupService } from "@/services/backupService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
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
  const authService = AuthService.getInstance();
  const backupService = BackupService.getInstance();

  useEffect(() => {
    // Check for stored auth data
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      // Start automatic backup for logged in users
      backupService.startAutomaticBackup();
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    
    try {
      const result = await authService.loginUser(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // Start automatic backup
        backupService.startAutomaticBackup();
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name}!`,
        });
        
        setLoading(false);
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authService.registerUser(userData);
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = "Registration failed. Please try again.";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    // Stop automatic backup
    backupService.stopAutomaticBackup();
    
    // Clear user state
    setUser(null);
    
    // Clear from service
    authService.logout();
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update in localStorage
      localStorage.setItem('dairy_user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'User not logged in' };
    }
    
    try {
      const result = await authService.changePassword(user._id, currentPassword, newPassword);
      
      if (result.success) {
        toast({
          title: "Password Changed",
          description: result.message,
        });
      } else {
        toast({
          title: "Password Change Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Failed to change password' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser, 
      changePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
