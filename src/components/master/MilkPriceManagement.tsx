import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, Download } from "lucide-react";
import { DataService } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { PDFService } from "@/services/pdfService";

type MilkType = "cow" | "buffalo";
type ShiftTime = "morning" | "evening";

interface MilkPrice {
  id: string;
  centreId: string;
  centreName: string;
  milkType: MilkType;
  fat: number;
  degree: number;
  snf: number;
  rate: number;
  time: ShiftTime;
}

const MilkPriceManagement = () => {
  const [prices, setPrices] = useState<MilkPrice[]>([]);
  const [formData, setFormData] = useState({
    centreId: "",
    centreName: "",
    milkType: "cow" as MilkType,
    fat: "",
    degree: "",
    snf: "",
    rate: "",
    time: "morning" as ShiftTime
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"english" | "marathi">("english");
  const [centres, setCentres] = useState<any[]>([]);

  // Fetch prices and centres from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      const [priceList, centresList] = await Promise.all([
        DataService.getMilkPrices(),
        DataService.getCentres()
      ]);
      setPrices(priceList);
      setCentres(centresList);
    };
    fetchData();
  }, []);

  // Save to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      const updatedPrice = {
        ...formData,
        id: editingId,
        fat: parseFloat(formData.fat),
        degree: parseFloat(formData.degree),
        snf: parseFloat(formData.snf),
        rate: parseFloat(formData.rate)
      };
      await DataService.saveMilkPrice({ ...updatedPrice, _id: editingId });
      setPrices(prices.map(price =>
        price.id === editingId ? updatedPrice : price
      ));
      toast({
        title: language === "english" ? "Price Updated" : "दर अपडेट केला",
        description: language === "english" ? "Milk price updated successfully" : "दूध दर यशस्वीरित्या अपडेट केला"
      });
    } else {
      const newPrice: MilkPrice = {
        ...formData,
        id: `milkprice_${Date.now()}`,
        fat: parseFloat(formData.fat),
        degree: parseFloat(formData.degree),
        snf: parseFloat(formData.snf),
        rate: parseFloat(formData.rate)
      };
      await DataService.saveMilkPrice({ ...newPrice, _id: newPrice.id });
      setPrices([...prices, newPrice]);
      toast({
        title: language === "english" ? "Price Added" : "दर जोडला",
        description: language === "english" ? "New milk price added successfully" : "नवीन दूध दर यशस्वीरित्या जोडला"
      });
    }

    setFormData({
      centreId: "",
      centreName: "",
      milkType: "cow",
      fat: "",
      degree: "",
      snf: "",
      rate: "",
      time: "morning"
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (price: MilkPrice) => {
    setFormData({
      ...price,
      fat: price.fat.toString(),
      degree: price.degree.toString(),
      snf: price.snf.toString(),
      rate: price.rate.toString()
    });
    setIsEditing(true);
    setEditingId(price.id);
  };

  // Delete from backend
  const handleDelete = async (id: string) => {
    await DataService.deleteMilkPrice(id);
    setPrices(prices.filter(price => price.id !== id));
    toast({
      title: language === "english" ? "Price Deleted" : "दर हटवला",
      description: language === "english" ? "Milk price removed successfully" : "दूध दर यशस्वीरित्या काढला"
    });
  };

  const downloadPDF = async () => {
    try {
      await PDFService.generatePDF({ prices }, {
        title: language === "english" ? "Milk Price List" : "दूध दर यादी",
        orientation: 'landscape',
        filename: `milk-prices-${new Date().toISOString().split('T')[0]}.pdf`
      });
      
      toast({
        title: language === "english" ? "PDF Downloaded" : "पीडीएफ डाउनलोड केला",
        description: language === "english" ? "Milk price list downloaded successfully" : "दूध दर यादी यशस्वीरित्या डाउनलोड केली"
      });
    } catch (error) {
      toast({
        title: language === "english" ? "Download Failed" : "डाउनलोड अयशस्वी",
        description: language === "english" ? "Failed to generate PDF" : "पीडीएफ तयार करण्यात अयशस्वी",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {language === "english" ? "Milk Price Management" : "दूध दर व्यवस्थापन"}
          </h2>
          <p className="text-gray-600">
            {language === "english" ? "Set milk rates based on fat content and quality" : "चरबी सामग्री आणि गुणवत्तेवर आधारित दूध दर सेट करा"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "english" ? "marathi" : "english")}
          >
            {language === "english" ? "मराठी" : "English"}
          </Button>
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {language === "english" ? "Download PDF" : "पीडीएफ डाउनलोड"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing 
                ? (language === "english" ? "Edit Milk Price" : "दूध दर संपादित करा")
                : (language === "english" ? "Add New Price" : "नवीन दर जोडा")
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "english" ? "Centre" : "केंद्र"}</Label>
                  <Select 
                    value={formData.centreId} 
                    onValueChange={(value) => {
                      const selectedCentre = centres.find(c => c._id === value);
                      setFormData({
                        ...formData, 
                        centreId: value,
                        centreName: selectedCentre?.name || selectedCentre?.centerName || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === "english" ? "Select centre" : "केंद्र निवडा"} />
                    </SelectTrigger>
                    <SelectContent>
                      {centres.map((centre) => (
                        <SelectItem key={centre._id} value={centre._id}>
                          {centre.centerCode || centre._id} - {centre.name || centre.centerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === "english" ? "Centre Name" : "केंद्राचे नाव"}</Label>
                  <Input
                    value={formData.centreName}
                    readOnly
                    placeholder={language === "english" ? "Centre Name" : "केंद्राचे नाव"}
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "english" ? "Milk Type" : "दूधाचा प्रकार"}</Label>
                  <Select
                    value={formData.milkType}
                    onValueChange={(value: MilkType) => setFormData({...formData, milkType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cow">
                        {language === "english" ? "Cow" : "गाय"}
                      </SelectItem>
                      <SelectItem value="buffalo">
                        {language === "english" ? "Buffalo" : "म्हैस"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === "english" ? "Shift Time" : "शिफ्ट वेळ"}</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value: ShiftTime) => setFormData({...formData, time: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        {language === "english" ? "Morning" : "सकाळ"}
                      </SelectItem>
                      <SelectItem value="evening">
                        {language === "english" ? "Evening" : "संध्याकाळ"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{language === "english" ? "Fat %" : "चरबी %"}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) => setFormData({...formData, fat: e.target.value})}
                    placeholder={language === "english" ? "Fat %" : "चरबी %"}
                    required
                  />
                </div>
                <div>
                  <Label>{language === "english" ? "Degree" : "डिग्री"}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    placeholder={language === "english" ? "Degree" : "डिग्री"}
                    required
                  />
                </div>
                <div>
                  <Label>{language === "english" ? "SNF %" : "एसएनएफ %"}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.snf}
                    onChange={(e) => setFormData({...formData, snf: e.target.value})}
                    placeholder={language === "english" ? "SNF %" : "एसएनएफ %"}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>{language === "english" ? "Rate (₹/Liter)" : "दर (₹/लिटर)"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  placeholder={language === "english" ? "Rate per liter" : "प्रति लिटर दर"}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isEditing 
                  ? (language === "english" ? "Update Price" : "दर अपडेट करा")
                  : (language === "english" ? "Add Price" : "दर जोडा")
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === "english" ? "Price List" : "दर यादी"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "english" ? "Centre" : "केंद्र"}</TableHead>
                    <TableHead>{language === "english" ? "Type" : "प्रकार"}</TableHead>
                    <TableHead>{language === "english" ? "Fat%" : "चरबी%"}</TableHead>
                    <TableHead>{language === "english" ? "SNF%" : "एसएनएफ%"}</TableHead>
                    <TableHead>{language === "english" ? "Rate" : "दर"}</TableHead>
                    <TableHead>{language === "english" ? "Time" : "वेळ"}</TableHead>
                    <TableHead>{language === "english" ? "Actions" : "क्रिया"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((price) => (
                    <TableRow key={price.id}>
                      <TableCell>{price.centreId}</TableCell>
                      <TableCell>
                        {language === "english" 
                          ? (price.milkType === "cow" ? "Cow" : "Buffalo")
                          : (price.milkType === "cow" ? "गाय" : "म्हैस")
                        }
                      </TableCell>
                      <TableCell>{price.fat}%</TableCell>
                      <TableCell>{price.snf}%</TableCell>
                      <TableCell>₹{price.rate}</TableCell>
                      <TableCell>
                        {language === "english" 
                          ? (price.time === "morning" ? "Morning" : "Evening")
                          : (price.time === "morning" ? "सकाळ" : "संध्याकाळ")
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(price)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(price.id)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MilkPriceManagement;

console.log('[LOG] Loaded src/components/master/MilkPriceManagement.tsx');
console.log('[LOG] Loaded src/components/master/MilkPriceManagement.tsx');
