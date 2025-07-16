
import bcrypt from 'bcryptjs';
import { DataService } from './dataService';
import { toast } from '@/hooks/use-toast';

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  name: string;
  isActive: boolean;
  permissions: {
    master: boolean;
    transactions: boolean;
    reports: boolean;
    dairyReports: boolean;
    system: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'employee';
}

export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Hash password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  async registerUser(userData: RegisterData): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Check if username already exists
      const existingUser = await DataService.getUserByUsername(userData.username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Check if email already exists
      const existingEmail = await DataService.getUserByEmail(userData.email);
      if (existingEmail) {
        return { success: false, message: 'Email already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user object
      const newUser: User = {
        _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        name: userData.name,
        isActive: true,
        permissions: this.getDefaultPermissions(userData.role),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save user to database
      const userId = await DataService.saveUser(newUser);

      return { 
        success: true, 
        message: 'User registered successfully', 
        userId 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      };
    }
  }

  // Login user
  async loginUser(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // Get user by username
      const user = await DataService.getUserByUsername(credentials.username);
      
      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      if (!user.isActive) {
        return { success: false, message: 'Account is inactive. Contact administrator.' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Update last login time
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      await DataService.saveUser(user);

      // Remove password from user object before returning
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).password;

      // Store user in localStorage for persistent login
      localStorage.setItem('dairy_user', JSON.stringify(userWithoutPassword));

      return { 
        success: true, 
        user: userWithoutPassword as User, 
        message: 'Login successful' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Login failed. Please try again.' 
      };
    }
  }

  // Update user permissions
  async updateUserPermissions(userId: string, permissions: User['permissions']): Promise<boolean> {
    try {
      const user = await DataService.getUserById(userId);
      if (!user) {
        return false;
      }

      user.permissions = permissions;
      user.updatedAt = new Date();
      
      await DataService.saveUser(user);
      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      return false;
    }
  }

  // Toggle user active status
  async toggleUserStatus(userId: string): Promise<boolean> {
    try {
      const user = await DataService.getUserById(userId);
      if (!user) {
        return false;
      }

      user.isActive = !user.isActive;
      user.updatedAt = new Date();
      
      await DataService.saveUser(user);
      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      return false;
    }
  }

  // Get default permissions based on role
  private getDefaultPermissions(role: 'admin' | 'employee'): User['permissions'] {
    if (role === 'admin') {
      return {
        master: true,
        transactions: true,
        reports: true,
        dairyReports: true,
        system: true
      };
    } else {
      return {
        master: false,
        transactions: true,
        reports: false,
        dairyReports: false,
        system: false
      };
    }
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('dairy_user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('dairy_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await DataService.getUserById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);
      
      // Update password
      user.password = hashedNewPassword;
      user.updatedAt = new Date();
      
      await DataService.saveUser(user);
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }
}
