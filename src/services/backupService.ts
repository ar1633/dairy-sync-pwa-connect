
import { DataService } from './dataService';
import { toast } from '@/hooks/use-toast';

export interface BackupMetadata {
  timestamp: Date;
  version: string;
  dataSize: number;
  tables: string[];
  checksum: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: any;
}

export class BackupService {
  private static instance: BackupService;
  private backupInterval: NodeJS.Timeout | null = null;
  private readonly BACKUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_BACKUPS = 10; // Keep last 10 backups

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Initialize automatic backup
  startAutomaticBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(async () => {
      await this.createBackup(true);
    }, this.BACKUP_INTERVAL);

    console.log('Automatic backup started - every 30 minutes');
  }

  // Stop automatic backup
  stopAutomaticBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('Automatic backup stopped');
    }
  }

  // Create backup
  async createBackup(isAutomatic: boolean = false): Promise<{ success: boolean; message: string; backupId?: string }> {
    try {
      console.log('Creating backup...');
      
      // Export all data
      const exportedData = await DataService.exportData();
      
      // Create backup metadata
      const metadata: BackupMetadata = {
        timestamp: new Date(),
        version: '1.0',
        dataSize: JSON.stringify(exportedData).length,
        tables: Object.keys(exportedData.data),
        checksum: this.generateChecksum(exportedData)
      };

      const backupData: BackupData = {
        metadata,
        data: exportedData
      };

      // Generate backup ID
      const backupId = `backup_${Date.now()}`;
      
      // Save backup to localStorage
      const backupKey = `dairy_backup_${backupId}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Update backup list
      await this.updateBackupList(backupId, metadata);
      
      // Cleanup old backups
      await this.cleanupOldBackups();

      const message = `Backup created successfully - ${metadata.dataSize} bytes`;
      
      if (!isAutomatic) {
        toast({
          title: "Backup Created",
          description: message,
        });
      }

      console.log(message);
      
      return { 
        success: true, 
        message, 
        backupId 
      };
    } catch (error) {
      console.error('Backup creation failed:', error);
      const message = 'Backup creation failed';
      
      if (!isAutomatic) {
        toast({
          title: "Backup Failed",
          description: message,
          variant: "destructive"
        });
      }
      
      return { success: false, message };
    }
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const backupKey = `dairy_backup_${backupId}`;
      const backupDataStr = localStorage.getItem(backupKey);
      
      if (!backupDataStr) {
        return { success: false, message: 'Backup not found' };
      }

      const backupData: BackupData = JSON.parse(backupDataStr);
      
      // Verify backup integrity
      const currentChecksum = this.generateChecksum(backupData.data);
      if (currentChecksum !== backupData.metadata.checksum) {
        return { success: false, message: 'Backup data is corrupted' };
      }

      // Import data
      await DataService.importData(backupData.data);
      
      const message = `Data restored from backup (${backupData.metadata.timestamp.toLocaleString()})`;
      
      toast({
        title: "Restore Successful",
        description: message,
      });

      // Refresh the application
      window.location.reload();
      
      return { success: true, message };
    } catch (error) {
      console.error('Restore failed:', error);
      const message = 'Restore failed';
      
      toast({
        title: "Restore Failed",
        description: message,
        variant: "destructive"
      });
      
      return { success: false, message };
    }
  }

  // Get backup list
  getBackupList(): Array<{ id: string; metadata: BackupMetadata }> {
    try {
      const backupListStr = localStorage.getItem('dairy_backup_list');
      if (!backupListStr) {
        return [];
      }

      const backupList = JSON.parse(backupListStr);
      return backupList.sort((a: any, b: any) => 
        new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting backup list:', error);
      return [];
    }
  }

  // Delete backup
  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const backupKey = `dairy_backup_${backupId}`;
      localStorage.removeItem(backupKey);
      
      // Update backup list
      const backupList = this.getBackupList().filter(backup => backup.id !== backupId);
      localStorage.setItem('dairy_backup_list', JSON.stringify(backupList));
      
      return { success: true, message: 'Backup deleted successfully' };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return { success: false, message: 'Failed to delete backup' };
    }
  }

  // Update backup list
  private async updateBackupList(backupId: string, metadata: BackupMetadata): Promise<void> {
    try {
      const backupList = this.getBackupList();
      backupList.push({ id: backupId, metadata });
      localStorage.setItem('dairy_backup_list', JSON.stringify(backupList));
    } catch (error) {
      console.error('Error updating backup list:', error);
    }
  }

  // Cleanup old backups
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupList = this.getBackupList();
      
      if (backupList.length > this.MAX_BACKUPS) {
        const backupsToDelete = backupList.slice(this.MAX_BACKUPS);
        
        for (const backup of backupsToDelete) {
          const backupKey = `dairy_backup_${backup.id}`;
          localStorage.removeItem(backupKey);
        }
        
        // Update backup list
        const remainingBackups = backupList.slice(0, this.MAX_BACKUPS);
        localStorage.setItem('dairy_backup_list', JSON.stringify(remainingBackups));
        
        console.log(`Cleaned up ${backupsToDelete.length} old backups`);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  // Generate checksum for data integrity
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  // Export backup to file
  async exportBackupToFile(backupId: string): Promise<void> {
    try {
      const backupKey = `dairy_backup_${backupId}`;
      const backupDataStr = localStorage.getItem(backupKey);
      
      if (!backupDataStr) {
        throw new Error('Backup not found');
      }

      const backupData: BackupData = JSON.parse(backupDataStr);
      const filename = `dairy_backup_${backupData.metadata.timestamp.toISOString().split('T')[0]}_${backupId}.json`;
      
      const blob = new Blob([backupDataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Exported",
        description: `Backup exported as ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting backup:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export backup file",
        variant: "destructive"
      });
    }
  }

  // Import backup from file
  async importBackupFromFile(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);
      
      // Verify data structure
      if (!backupData.metadata || !backupData.data) {
        return { success: false, message: 'Invalid backup file format' };
      }

      // Verify checksum
      const currentChecksum = this.generateChecksum(backupData.data);
      if (currentChecksum !== backupData.metadata.checksum) {
        return { success: false, message: 'Backup file is corrupted' };
      }

      // Generate new backup ID
      const backupId = `imported_backup_${Date.now()}`;
      const backupKey = `dairy_backup_${backupId}`;
      
      // Save imported backup
      localStorage.setItem(backupKey, fileContent);
      
      // Update backup list
      await this.updateBackupList(backupId, backupData.metadata);
      
      return { 
        success: true, 
        message: `Backup imported successfully from ${file.name}` 
      };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { 
        success: false, 
        message: 'Failed to import backup file' 
      };
    }
  }
}
