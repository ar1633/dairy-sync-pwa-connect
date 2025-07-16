
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BackupService, BackupMetadata } from "@/services/backupService";
import { DataService } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  Database,
  FileText,
  AlertCircle
} from "lucide-react";

const SystemBackupManager = () => {
  const [backups, setBackups] = useState<Array<{ id: string; metadata: BackupMetadata }>>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [fileInput, setFileInput] = useState<File | null>(null);
  
  const backupService = BackupService.getInstance();

  useEffect(() => {
    loadBackups();
    loadStats();
  }, []);

  const loadBackups = () => {
    const backupList = backupService.getBackupList();
    setBackups(backupList);
  };

  const loadStats = async () => {
    try {
      const systemStats = await DataService.getDatabaseStats();
      setStats(systemStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    
    try {
      const result = await backupService.createBackup(false);
      if (result.success) {
        loadBackups();
        loadStats();
        toast({
          title: "Backup Created",
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Backup creation error:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('This will restore all data from the selected backup. Current data will be replaced. Continue?')) {
      return;
    }

    setIsRestoring(true);
    
    try {
      const result = await backupService.restoreBackup(backupId);
      if (result.success) {
        toast({
          title: "Restore Successful",
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const result = await backupService.deleteBackup(backupId);
      if (result.success) {
        loadBackups();
        toast({
          title: "Backup Deleted",
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Delete backup error:', error);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    try {
      await backupService.exportBackupToFile(backupId);
    } catch (error) {
      console.error('Export backup error:', error);
    }
  };

  const handleImportBackup = async () => {
    if (!fileInput) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await backupService.importBackupFromFile(fileInput);
      if (result.success) {
        loadBackups();
        setFileInput(null);
        toast({
          title: "Import Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Import backup error:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* System Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([dbName, dbStats]: [string, any]) => (
              <div key={dbName} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {dbStats.doc_count || 0}
                </div>
                <div className="text-sm text-gray-600 capitalize">{dbName}</div>
                {dbStats.disk_size && (
                  <div className="text-xs text-gray-500">
                    {formatBytes(dbStats.disk_size)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup Management
          </CardTitle>
          <CardDescription>
            Create, restore, and manage system backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex items-center gap-2"
            >
              {isCreatingBackup ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <HardDrive className="h-4 w-4" />
              )}
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                className="w-auto"
              />
              <Button 
                onClick={handleImportBackup}
                variant="outline"
                disabled={!fileInput}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          {/* Automatic Backup Status */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Automatic Backup</span>
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-sm text-green-700">
              System automatically creates backups every 30 minutes while you're logged in.
              Last 10 backups are kept automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
          <CardDescription>
            {backups.length} backup(s) available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No backups available</p>
              <p className="text-sm text-gray-400">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(backup.metadata.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(backup.metadata.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatBytes(backup.metadata.dataSize)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {backup.metadata.tables.length} tables
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          v{backup.metadata.version}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={isRestoring}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportBackup(backup.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemBackupManager;
