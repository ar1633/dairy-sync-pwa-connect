import { AuthService } from './authService';

export class InitializationService {
  private static initialized = false;

  static async initializeSystem(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure admin user exists with default credentials
      await this.ensureAdminUser();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing system:', error);
    }
  }

  private static async ensureAdminUser(): Promise<void> {
    const authService = AuthService.getInstance();
    
    // Try to login with admin credentials to check if admin exists
    const loginResult = await authService.loginUser({ 
      username: 'admin', 
      password: 'admin123' 
    });

    if (!loginResult.success) {
      // Admin user doesn't exist, create it
      const registerResult = await authService.registerUser({
        username: 'admin',
        email: 'admin@dairysync.local',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin'
      });

      if (registerResult.success) {
        console.log('Admin user created successfully');
      } else {
        console.error('Failed to create admin user:', registerResult.message);
      }
    } else {
      // Admin exists, logout to avoid staying logged in during initialization
      authService.logout();
    }
  }
}