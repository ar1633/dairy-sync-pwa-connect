
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Centre {
  id: string;
  centreNumber: string;
  centreName: string;
  address: string;
  paymentCycle: 'weekly' | 'bi-weekly' | 'monthly';
  contactPerson?: string;
  phoneNumber?: string;
  createdAt: string;
}

const CentreManagement = () => {
  const [centres, setCentres] = useState<Centre[]>([
    {
      id: '1',
      centreNumber: 'C001',
      centreName: 'Shirakhed Centre',
      address: 'Village Shirakhed, Tal. Karveer, Dist. Kolhapur',
      paymentCycle: 'weekly',
      contactPerson: 'Ramesh Patil',
      phoneNumber: '9876543210',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      centreNumber: 'C002',
      centreName: 'Kagal Centre',
      address: 'Village Kagal, Tal. Kagal, Dist. Kolhapur',
      paymentCycle: 'bi-weekly',
      contactPerson: 'Suresh Kumar',
      phoneNumber: '9876543211',
      createdAt: '2024-01-20'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [formData, setFormData] = useState({
    centreNumber: '',
    centreName: '',
    address: '',
    paymentCycle: 'weekly' as const,
    contactPerson: '',
    phoneNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCentre) {
      setCentres(centres.map(centre => 
        centre.id === editingCentre.id 
          ? { ...centre, ...formData }
          : centre
      ));
      toast({
        title: "Centre Updated",
        description: "Centre information has been updated successfully.",
      });
    } else {
      const newCentre: Centre = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCentres([...centres, newCentre]);
      toast({
        title: "Centre Added",
        description: "New centre has been added successfully.",
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      centreNumber: '',
      centreName: '',
      address: '',
      paymentCycle: 'weekly',
      contactPerson: '',
      phoneNumber: ''
    });
    setShowForm(false);
    setEditingCentre(null);
  };

  const handleEdit = (centre: Centre) => {
    setFormData({
      centreNumber: centre.centreNumber,
      centreName: centre.centreName,
      address: centre.address,
      paymentCycle: centre.paymentCycle,
      contactPerson: centre.contactPerson || '',
      phoneNumber: centre.phoneNumber || ''
    });
    setEditingCentre(centre);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCentres(centres.filter(centre => centre.id !== id));
    toast({
      title: "Centre Deleted",
      description: "Centre has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Centre Information Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Centre
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCentre ? 'Edit Centre' : 'Add New Centre'}</CardTitle>
            <CardDescription>
              Enter the centre details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="centreNumber">Centre Number *</Label>
                  <Input
                    id="centreNumber"
                    value={formData.centreNumber}
                    onChange={(e) => setFormData({...formData, centreNumber: e.target.value})}
                    placeholder="e.g., C001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="centreName">Centre Name *</Label>
                  <Input
                    id="centreName"
                    value={formData.centreName}
                    onChange={(e) => setFormData({...formData, centreName: e.target.value})}
                    placeholder="e.g., Shirakhed Centre"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Complete address with village, taluka, district"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentCycle">Payment Cycle</Label>
                  <Select
                    value={formData.paymentCycle}
                    onValueChange={(value: 'weekly' | 'bi-weekly' | 'monthly') => 
                      setFormData({...formData, paymentCycle: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingCentre ? 'Update Centre' : 'Add Centre'}
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
        {centres.map((centre) => (
          <Card key={centre.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    {centre.centreName}
                  </CardTitle>
                  <CardDescription>Centre No: {centre.centreNumber}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(centre)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(centre.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Address:</strong> {centre.address}</p>
                <p><strong>Payment Cycle:</strong> 
                  <span className="capitalize ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {centre.paymentCycle}
                  </span>
                </p>
                {centre.contactPerson && (
                  <p><strong>Contact:</strong> {centre.contactPerson}</p>
                )}
                {centre.phoneNumber && (
                  <p><strong>Phone:</strong> {centre.phoneNumber}</p>
                )}
                <p className="text-gray-500"><strong>Created:</strong> {centre.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {centres.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No centres added yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first dairy centre</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Centre
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CentreManagement;
