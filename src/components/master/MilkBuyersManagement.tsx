import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MilkBuyer {
  id: string;
  buyerNumber: string;
  name: string;
  address: string;
  commission: number;
  saving: number;
  phoneNumber?: string;
  contactPerson?: string;
}

const MilkBuyersManagement = () => {
  const [buyers, setBuyers] = useState<MilkBuyer[]>([
    {
      id: '1',
      buyerNumber: 'MB001',
      name: 'Maharashtra Dairy',
      address: 'Kolhapur Industrial Area, Maharashtra',
      commission: 2.5,
      saving: 50000,
      phoneNumber: '9876543210',
      contactPerson: 'Suresh Patil'
    },
    {
      id: '2',
      buyerNumber: 'MB002',
      name: 'Local Dairy Co-op',
      address: 'Village Shirakhed, Kolhapur',
      commission: 1.8,
      saving: 25000,
      phoneNumber: '9876543211',
      contactPerson: 'Ramesh Kumar'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<MilkBuyer | null>(null);
  const [formData, setFormData] = useState({
    buyerNumber: '',
    name: '',
    address: '',
    commission: 0,
    saving: 0,
    phoneNumber: '',
    contactPerson: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    console.log('[MilkBuyersManagement] handleSubmit');
    e.preventDefault();
    
    if (editingBuyer) {
      setBuyers(buyers.map(buyer => 
        buyer.id === editingBuyer.id 
          ? { ...buyer, ...formData }
          : buyer
      ));
      toast({
        title: "Buyer Updated",
        description: "Milk buyer information has been updated successfully.",
      });
    } else {
      const newBuyer: MilkBuyer = {
        id: Date.now().toString(),
        ...formData
      };
      setBuyers([...buyers, newBuyer]);
      toast({
        title: "Buyer Added",
        description: "New milk buyer has been added successfully.",
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    console.log('[MilkBuyersManagement] resetForm');
    setFormData({
      buyerNumber: '',
      name: '',
      address: '',
      commission: 0,
      saving: 0,
      phoneNumber: '',
      contactPerson: ''
    });
    setShowForm(false);
    setEditingBuyer(null);
  };

  const handleEdit = (buyer: MilkBuyer) => {
    console.log('[MilkBuyersManagement] handleEdit', buyer);
    setFormData({
      buyerNumber: buyer.buyerNumber,
      name: buyer.name,
      address: buyer.address,
      commission: buyer.commission,
      saving: buyer.saving,
      phoneNumber: buyer.phoneNumber || '',
      contactPerson: buyer.contactPerson || ''
    });
    setEditingBuyer(buyer);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    console.log('[MilkBuyersManagement] handleDelete', id);
    setBuyers(buyers.filter(buyer => buyer.id !== id));
    toast({
      title: "Buyer Deleted",
      description: "Milk buyer has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Milk Buyers Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Buyer
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBuyer ? 'Edit Milk Buyer' : 'Add New Milk Buyer'}</CardTitle>
            <CardDescription>
              Enter the milk buyer details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerNumber">Buyer Number *</Label>
                  <Input
                    id="buyerNumber"
                    value={formData.buyerNumber}
                    onChange={(e) => setFormData({...formData, buyerNumber: e.target.value})}
                    placeholder="e.g., MB001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Buyer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Maharashtra Dairy"
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
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="Name of contact person"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="Contact phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission (% per liter)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    value={formData.commission}
                    onChange={(e) => setFormData({...formData, commission: Number(e.target.value)})}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saving">Current Saving (₹)</Label>
                  <Input
                    id="saving"
                    type="number"
                    value={formData.saving}
                    onChange={(e) => setFormData({...formData, saving: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
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
        {buyers.map((buyer) => (
          <Card key={buyer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    {buyer.name}
                  </CardTitle>
                  <CardDescription>Buyer No: {buyer.buyerNumber}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(buyer)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(buyer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Address:</strong> {buyer.address}</p>
                {buyer.contactPerson && (
                  <p><strong>Contact:</strong> {buyer.contactPerson}</p>
                )}
                {buyer.phoneNumber && (
                  <p><strong>Phone:</strong> {buyer.phoneNumber}</p>
                )}
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Commission</p>
                    <p className="text-lg font-semibold text-green-600">{buyer.commission}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Current Saving</p>
                    <p className="text-lg font-semibold text-blue-600">₹{buyer.saving.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {buyers.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No milk buyers added yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first milk buyer</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Buyer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MilkBuyersManagement;

console.log('[LOG] Loaded src/components/master/MilkBuyersManagement.tsx');
