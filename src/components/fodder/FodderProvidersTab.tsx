
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FodderProvider {
  id: string;
  sellerId: string;
  name: string;
  address: string;
  phoneNumber: string;
  contactPerson?: string;
}

const FodderProvidersTab = () => {
  const [providers, setProviders] = useState<FodderProvider[]>([
    {
      id: '1',
      sellerId: 'FP001',
      name: 'Maharashtra Feed Supply',
      address: 'Kolhapur, Maharashtra',
      phoneNumber: '9876543210',
      contactPerson: 'Suresh Patil'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<FodderProvider | null>(null);
  const [formData, setFormData] = useState({
    sellerId: '',
    name: '',
    address: '',
    phoneNumber: '',
    contactPerson: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProvider) {
      setProviders(providers.map(provider => 
        provider.id === editingProvider.id 
          ? { ...provider, ...formData }
          : provider
      ));
      toast({
        title: "Provider Updated",
        description: "Fodder provider has been updated successfully.",
      });
    } else {
      const newProvider: FodderProvider = {
        id: Date.now().toString(),
        ...formData
      };
      setProviders([...providers, newProvider]);
      toast({
        title: "Provider Added",
        description: "New fodder provider has been added successfully.",
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      sellerId: '',
      name: '',
      address: '',
      phoneNumber: '',
      contactPerson: ''
    });
    setShowForm(false);
    setEditingProvider(null);
  };

  const handleEdit = (provider: FodderProvider) => {
    setFormData({
      sellerId: provider.sellerId,
      name: provider.name,
      address: provider.address,
      phoneNumber: provider.phoneNumber,
      contactPerson: provider.contactPerson || ''
    });
    setEditingProvider(provider);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setProviders(providers.filter(provider => provider.id !== id));
    toast({
      title: "Provider Deleted",
      description: "Fodder provider has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Animal Fodder Providers</h3>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProvider ? 'Edit Provider' : 'Add New Provider'}</CardTitle>
            <CardDescription>Enter the fodder provider details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerId">Seller ID *</Label>
                  <Input
                    id="sellerId"
                    value={formData.sellerId}
                    onChange={(e) => setFormData({...formData, sellerId: e.target.value})}
                    placeholder="e.g., FP001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Provider company name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Complete address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="Contact phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="Name of contact person"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingProvider ? 'Update Provider' : 'Add Provider'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    {provider.name}
                  </CardTitle>
                  <CardDescription>ID: {provider.sellerId}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(provider)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(provider.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Address:</strong> {provider.address}</p>
                <p><strong>Phone:</strong> {provider.phoneNumber}</p>
                {provider.contactPerson && (
                  <p><strong>Contact:</strong> {provider.contactPerson}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers added yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first fodder provider</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Provider
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FodderProvidersTab;
