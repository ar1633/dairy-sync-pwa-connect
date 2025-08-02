import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Users, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DataService } from "@/services/dataService";

interface Farmer {
  id: string;
  centreNumber: string;
  centreName: string;
  farmerId: string;
  name: string;
  address: string;
  bankName: string;
  accountNumber: string;
  aadharNumber: string;
  ifscCode: string;
  phoneNumber: string;
  animals: number;
  totalAmount: number;
  saving: number;
  difference: number;
  interest: number;
  pashuId?: string;
  utpaId?: string;
}

const FarmerManagement = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [centres, setCentres] = useState<{ number: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCentre, setSelectedCentre] = useState('all');
  
  useEffect(() => {
    // Fetch farmers and centres from backend
    const fetchData = async () => {
      // Already fetching from backend via DataService
      const farmerList = await DataService.getFarmers();
      setFarmers(
        farmerList.map((f: any) => ({
          id: f._id,
          centreNumber: f.centerCode,
          centreName: f.centerName || "",
          farmerId: f.farmerId || f.code,
          name: f.name,
          address: f.address,
          bankName: f.bankName,
          accountNumber: f.accountNumber,
          aadharNumber: f.aadharNumber,
          ifscCode: f.ifscCode,
          phoneNumber: f.phoneNumber,
          animals: f.animals || 0,
          totalAmount: f.totalAmount || 0,
          saving: f.saving || 0,
          difference: f.difference || 0,
          interest: f.interest || 0,
          pashuId: f.pashuId,
          utpaId: f.utpaId
        }))
      );
      const centreList = await DataService.getCentres();
      setCentres(
        centreList.map((c: any) => ({
          number: c.centerCode || c.number,
          name: c.centerName || c.name,
          _id: c._id
        }))
      );
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    centreNumber: '',
    farmerId: '',
    name: '',
    address: '',
    bankName: '',
    accountNumber: '',
    aadharNumber: '',
    ifscCode: '',
    phoneNumber: '',
    animals: 0,
    totalAmount: 0,
    saving: 0,
    difference: 0,
    interest: 0,
    pashuId: '',
    utpaId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[FarmerManagement] handleSubmit');
    e.preventDefault();
    
    const selectedCentreData = centres.find(c => c.number === formData.centreNumber);

    const farmerPayload = {
      _id: editingFarmer ? editingFarmer.id : `farmer_${Date.now()}`,
      centerCode: formData.centreNumber,
      centerName: selectedCentreData?.name || "",
      farmerId: formData.farmerId,
      name: formData.name,
      address: formData.address,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      aadharNumber: formData.aadharNumber,
      ifscCode: formData.ifscCode,
      phoneNumber: formData.phoneNumber,
      animals: formData.animals,
      totalAmount: formData.totalAmount,
      saving: formData.saving,
      difference: formData.difference,
      interest: formData.interest,
      pashuId: formData.pashuId,
      utpaId: formData.utpaId
    };

    if (editingFarmer) {
      await DataService.saveFarmer(farmerPayload);
      setFarmers(farmers.map(farmer =>
        farmer.id === editingFarmer.id
          ? { ...farmer, ...formData, centreName: selectedCentreData?.name || "" }
          : farmer
      ));
      toast({
        title: "Farmer Updated",
        description: "Farmer information has been updated successfully.",
      });
    } else {
      await DataService.saveFarmer(farmerPayload);
      setFarmers([...farmers, { ...farmerPayload, id: farmerPayload._id } as any]);
      toast({
        title: "Farmer Added",
        description: "New farmer has been added successfully.",
      });
    }
    resetForm();
  };

  const resetForm = () => {
    console.log('[FarmerManagement] resetForm');
    setFormData({
      centreNumber: '',
      farmerId: '',
      name: '',
      address: '',
      bankName: '',
      accountNumber: '',
      aadharNumber: '',
      ifscCode: '',
      phoneNumber: '',
      animals: 0,
      totalAmount: 0,
      saving: 0,
      difference: 0,
      interest: 0,
      pashuId: '',
      utpaId: ''
    });
    setShowForm(false);
    setEditingFarmer(null);
  };

  const handleEdit = (farmer: Farmer) => {
    console.log('[FarmerManagement] handleEdit', farmer);
    setFormData({
      centreNumber: farmer.centreNumber,
      farmerId: farmer.farmerId,
      name: farmer.name,
      address: farmer.address,
      bankName: farmer.bankName,
      accountNumber: farmer.accountNumber,
      aadharNumber: farmer.aadharNumber,
      ifscCode: farmer.ifscCode,
      phoneNumber: farmer.phoneNumber,
      animals: farmer.animals,
      totalAmount: farmer.totalAmount,
      saving: farmer.saving,
      difference: farmer.difference,
      interest: farmer.interest,
      pashuId: farmer.pashuId || '',
      utpaId: farmer.utpaId || ''
    });
    setEditingFarmer(farmer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await DataService.deleteFarmer(id);
    setFarmers(farmers.filter(farmer => farmer.id !== id));
    toast({
      title: "Farmer Deleted",
      description: "Farmer has been removed successfully.",
    });
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.farmerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCentre = selectedCentre === 'all' || farmer.centreNumber === selectedCentre;
    return matchesSearch && matchesCentre;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Farmer Information Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Farmer
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by farmer name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCentre} onValueChange={setSelectedCentre}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centres</SelectItem>
                {centres.map(centre => (
                  <SelectItem key={(centre as any)._id || centre.number} value={centre.number}>
                    {centre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}</CardTitle>
            <CardDescription>
              Enter the farmer details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="centreNumber">Centre *</Label>
                    <Select
                      value={formData.centreNumber}
                      onValueChange={(value) => setFormData({...formData, centreNumber: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Centre" />
                      </SelectTrigger>
                      <SelectContent>
                        {centres.map(centre => (
                          <SelectItem key={centre.number} value={centre.number}>
                            {centre.number} - {centre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmerId">Farmer ID *</Label>
                    <Input
                      id="farmerId"
                      value={formData.farmerId}
                      onChange={(e) => setFormData({...formData, farmerId: e.target.value})}
                      placeholder="e.g., F001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Full name"
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
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      placeholder="Bank name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      placeholder="Bank account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                      placeholder="IFSC code"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="animals">Number of Animals</Label>
                    <Input
                      id="animals"
                      type="number"
                      value={formData.animals}
                      onChange={(e) => setFormData({...formData, animals: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pashuId">Pashu ID</Label>
                    <Input
                      id="pashuId"
                      value={formData.pashuId}
                      onChange={(e) => setFormData({...formData, pashuId: e.target.value})}
                      placeholder="Pashu ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utpaId">UTPA ID</Label>
                    <Input
                      id="utpaId"
                      value={formData.utpaId}
                      onChange={(e) => setFormData({...formData, utpaId: e.target.value})}
                      placeholder="UTPA ID"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingFarmer ? 'Update Farmer' : 'Add Farmer'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Farmers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFarmers.map((farmer) => (
          <Card key={farmer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    {farmer.name}
                  </CardTitle>
                  <CardDescription>
                    ID: {farmer.farmerId} | Centre: {farmer.centreName}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(farmer)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(farmer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Address:</strong> {farmer.address}</p>
                <p><strong>Phone:</strong> {farmer.phoneNumber}</p>
                <p><strong>Animals:</strong> {farmer.animals}</p>
                {farmer.bankName && (
                  <p><strong>Bank:</strong> {farmer.bankName} ({farmer.accountNumber})</p>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Balance: ₹{farmer.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Savings: ₹{farmer.saving.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFarmers.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCentre !== 'all' ? 'No farmers found' : 'No farmers added yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCentre !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by adding your first farmer'
              }
            </p>
            {!searchTerm && selectedCentre === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Farmer
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerManagement;

console.log('[LOG] Loaded src/components/master/FarmerManagement.tsx');
