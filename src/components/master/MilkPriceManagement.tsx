
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, DollarSign, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MilkPrice {
  id: string;
  centreNumber: string;
  centreName: string;
  milkType: 'cow' | 'buffalo';
  fatMin: number;
  fatMax: number;
  snfMin: number;
  snfMax: number;
  rate: number;
  shift: 'morning' | 'evening';
  isActive: boolean;
}

const MilkPriceManagement = () => {
  const [prices, setPrices] = useState<MilkPrice[]>([
    {
      id: '1',
      centreNumber: 'C001',
      centreName: 'Shirakhed Centre',
      milkType: 'cow',
      fatMin: 3.0,
      fatMax: 4.0,
      snfMin: 8.0,
      snfMax: 9.0,
      rate: 28.50,
      shift: 'morning',
      isActive: true
    },
    {
      id: '2',
      centreNumber: 'C001',
      centreName: 'Shirakhed Centre',
      milkType: 'cow',
      fatMin: 3.0,
      fatMax: 4.0,
      snfMin: 8.0,
      snfMax: 9.0,
      rate: 27.50,
      shift: 'evening',
      isActive: true
    },
    {
      id: '3',
      centreNumber: 'C001',
      centreName: 'Shirakhed Centre',
      milkType: 'buffalo',
      fatMin: 6.0,
      fatMax: 7.0,
      snfMin: 9.0,
      snfMax: 10.0,
      rate: 42.00,
      shift: 'morning',
      isActive: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<MilkPrice | null>(null);
  const [selectedCentre, setSelectedCentre] = useState('all');
  
  // Mock centres
  const centres = [
    { number: 'C001', name: 'Shirakhed Centre' },
    { number: 'C002', name: 'Kagal Centre' }
  ];

  const [formData, setFormData] = useState({
    centreNumber: '',
    milkType: 'cow' as const,
    fatMin: 0,
    fatMax: 0,
    snfMin: 0,
    snfMax: 0,
    rate: 0,
    shift: 'morning' as const,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCentreData = centres.find(c => c.number === formData.centreNumber);
    
    if (editingPrice) {
      setPrices(prices.map(price => 
        price.id === editingPrice.id 
          ? { 
              ...price, 
              ...formData, 
              centreName: selectedCentreData?.name || ''
            }
          : price
      ));
      toast({
        title: "Price Updated",
        description: "Milk price has been updated successfully.",
      });
    } else {
      const newPrice: MilkPrice = {
        id: Date.now().toString(),
        ...formData,
        centreName: selectedCentreData?.name || ''
      };
      setPrices([...prices, newPrice]);
      toast({
        title: "Price Added",
        description: "New milk price has been added successfully.",
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      centreNumber: '',
      milkType: 'cow',
      fatMin: 0,
      fatMax: 0,
      snfMin: 0,
      snfMax: 0,
      rate: 0,
      shift: 'morning',
      isActive: true
    });
    setShowForm(false);
    setEditingPrice(null);
  };

  const handleEdit = (price: MilkPrice) => {
    setFormData({
      centreNumber: price.centreNumber,
      milkType: price.milkType,
      fatMin: price.fatMin,
      fatMax: price.fatMax,
      snfMin: price.snfMin,
      snfMax: price.snfMax,
      rate: price.rate,
      shift: price.shift,
      isActive: price.isActive
    });
    setEditingPrice(price);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPrices(prices.filter(price => price.id !== id));
    toast({
      title: "Price Deleted",
      description: "Milk price has been removed successfully.",
    });
  };

  const copyToAllCentres = (priceId: string) => {
    const sourcePrice = prices.find(p => p.id === priceId);
    if (!sourcePrice) return;

    const newPrices: MilkPrice[] = [];
    centres.forEach(centre => {
      if (centre.number !== sourcePrice.centreNumber) {
        const newPrice: MilkPrice = {
          id: `${Date.now()}-${centre.number}`,
          ...sourcePrice,
          centreNumber: centre.number,
          centreName: centre.name
        };
        newPrices.push(newPrice);
      }
    });

    setPrices([...prices, ...newPrices]);
    toast({
      title: "Prices Copied",
      description: `Price structure copied to ${newPrices.length} centres.`,
    });
  };

  const filteredPrices = selectedCentre === 'all' 
    ? prices 
    : prices.filter(price => price.centreNumber === selectedCentre);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Milk Price Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Price
        </Button>
      </div>

      {/* Centre Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>Filter by Centre:</Label>
            <Select value={selectedCentre} onValueChange={setSelectedCentre}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centres</SelectItem>
                {centres.map(centre => (
                  <SelectItem key={centre.number} value={centre.number}>
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
            <CardTitle>{editingPrice ? 'Edit Milk Price' : 'Add New Milk Price'}</CardTitle>
            <CardDescription>
              Set milk price based on fat, SNF content and shift timing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="milkType">Milk Type *</Label>
                  <Select
                    value={formData.milkType}
                    onValueChange={(value: 'cow' | 'buffalo') => setFormData({...formData, milkType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cow">Cow Milk</SelectItem>
                      <SelectItem value="buffalo">Buffalo Milk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift">Shift *</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value: 'morning' | 'evening') => setFormData({...formData, shift: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatMin">Fat Min %</Label>
                  <Input
                    id="fatMin"
                    type="number"
                    step="0.1"
                    value={formData.fatMin}
                    onChange={(e) => setFormData({...formData, fatMin: Number(e.target.value)})}
                    placeholder="3.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatMax">Fat Max %</Label>
                  <Input
                    id="fatMax"
                    type="number"
                    step="0.1"
                    value={formData.fatMax}
                    onChange={(e) => setFormData({...formData, fatMax: Number(e.target.value)})}
                    placeholder="4.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="snfMin">SNF Min %</Label>
                  <Input
                    id="snfMin"
                    type="number"
                    step="0.1"
                    value={formData.snfMin}
                    onChange={(e) => setFormData({...formData, snfMin: Number(e.target.value)})}
                    placeholder="8.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="snfMax">SNF Max %</Label>
                  <Input
                    id="snfMax"
                    type="number"
                    step="0.1"
                    value={formData.snfMax}
                    onChange={(e) => setFormData({...formData, snfMax: Number(e.target.value)})}
                    placeholder="9.0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Liter (₹) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: Number(e.target.value)})}
                    placeholder="28.50"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingPrice ? 'Update Price' : 'Add Price'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Prices List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPrices.map((price) => (
          <Card key={price.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    ₹{price.rate}/L
                  </CardTitle>
                  <CardDescription>
                    {price.centreName} - {price.milkType} ({price.shift})
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToAllCentres(price.id)}
                    title="Copy to all centres"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(price)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(price.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Fat Range</p>
                    <p className="font-medium">{price.fatMin}% - {price.fatMax}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">SNF Range</p>
                    <p className="font-medium">{price.snfMin}% - {price.snfMax}%</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    price.shift === 'morning' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {price.shift}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    price.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {price.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrices.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No milk prices set</h3>
            <p className="text-gray-500 mb-4">Configure milk pricing based on quality parameters</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Set Your First Price
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MilkPriceManagement;
