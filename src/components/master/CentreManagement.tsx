import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PaymentCycle = "weekly" | "bi-weekly" | "monthly";

interface Centre {
  id: string;
  number: string;
  name: string;
  nameMarathi: string;
  address: string;
  addressMarathi: string;
  paymentCycle: PaymentCycle;
}

const CentreManagement = () => {
  console.log('[LOG] Loaded src/components/master/CentreManagement.tsx');

  const [centres, setCentres] = useState<Centre[]>([
    {
      id: "1",
      number: "001",
      name: "Main Dairy Centre",
      nameMarathi: "मुख्य डेअरी केंद्र",
      address: "Village Road, Pune",
      addressMarathi: "गाव रोड, पुणे",
      paymentCycle: "weekly"
    }
  ]);

  const [formData, setFormData] = useState({
    number: "",
    name: "",
    nameMarathi: "",
    address: "",
    addressMarathi: "",
    paymentCycle: "weekly" as PaymentCycle
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"english" | "marathi">("english");

  const handleSubmit = (e: React.FormEvent) => {
    console.log('[CentreManagement] handleSubmit');
    e.preventDefault();
    
    if (isEditing && editingId) {
      setCentres(centres.map(centre => 
        centre.id === editingId 
          ? { ...formData, id: editingId }
          : centre
      ));
      toast({
        title: language === "english" ? "Centre Updated" : "केंद्र अपडेट केले",
        description: language === "english" ? "Centre information updated successfully" : "केंद्र माहिती यशस्वीरित्या अपडेट केली"
      });
    } else {
      const newCentre: Centre = {
        ...formData,
        id: Date.now().toString()
      };
      setCentres([...centres, newCentre]);
      toast({
        title: language === "english" ? "Centre Added" : "केंद्र जोडले",
        description: language === "english" ? "New centre added successfully" : "नवीन केंद्र यशस्वीरित्या जोडले"
      });
    }

    setFormData({
      number: "",
      name: "",
      nameMarathi: "",
      address: "",
      addressMarathi: "",
      paymentCycle: "weekly"
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (centre: Centre) => {
    console.log('[CentreManagement] handleEdit', centre);
    setFormData(centre);
    setIsEditing(true);
    setEditingId(centre.id);
  };

  const handleDelete = (id: string) => {
    console.log('[CentreManagement] handleDelete', id);
    setCentres(centres.filter(centre => centre.id !== id));
    toast({
      title: language === "english" ? "Centre Deleted" : "केंद्र हटवले",
      description: language === "english" ? "Centre removed successfully" : "केंद्र यशस्वीरित्या काढले"
    });
  };

  const downloadPDF = () => {
    console.log('[CentreManagement] downloadPDF');
    toast({
      title: language === "english" ? "PDF Download" : "पीडीएफ डाउनलोड",
      description: language === "english" ? "PDF generation feature coming soon" : "पीडीएफ तयार करण्याचे वैशिष्ट्य लवकरच येत आहे"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {language === "english" ? "Centre Management" : "केंद्र व्यवस्थापन"}
          </h2>
          <p className="text-gray-600">
            {language === "english" ? "Manage dairy collection centres" : "डेअरी संकलन केंद्रे व्यवस्थापित करा"}
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
                ? (language === "english" ? "Edit Centre" : "केंद्र संपादित करा")
                : (language === "english" ? "Add New Centre" : "नवीन केंद्र जोडा")
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{language === "english" ? "Centre Number" : "केंद्र क्रमांक"}</Label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  placeholder={language === "english" ? "Enter centre number" : "केंद्र क्रमांक प्रविष्ट करा"}
                  required
                />
              </div>

              <div>
                <Label>{language === "english" ? "Centre Name (English)" : "केंद्राचे नाव (इंग्रजी)"}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={language === "english" ? "Enter centre name" : "केंद्राचे नाव प्रविष्ट करा"}
                  required
                />
              </div>

              <div>
                <Label>{language === "english" ? "Centre Name (Marathi)" : "केंद्राचे नाव (मराठी)"}</Label>
                <Input
                  value={formData.nameMarathi}
                  onChange={(e) => setFormData({...formData, nameMarathi: e.target.value})}
                  placeholder={language === "english" ? "Enter centre name in Marathi" : "मराठीत केंद्राचे नाव प्रविष्ट करा"}
                  required
                />
              </div>

              <div>
                <Label>{language === "english" ? "Address (English)" : "पत्ता (इंग्रजी)"}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder={language === "english" ? "Enter address" : "पत्ता प्रविष्ट करा"}
                  required
                />
              </div>

              <div>
                <Label>{language === "english" ? "Address (Marathi)" : "पत्ता (मराठी)"}</Label>
                <Input
                  value={formData.addressMarathi}
                  onChange={(e) => setFormData({...formData, addressMarathi: e.target.value})}
                  placeholder={language === "english" ? "Enter address in Marathi" : "मराठीत पत्ता प्रविष्ट करा"}
                  required
                />
              </div>

              <div>
                <Label>{language === "english" ? "Payment Cycle" : "पेमेंट सायकल"}</Label>
                <Select
                  value={formData.paymentCycle}
                  onValueChange={(value: PaymentCycle) => setFormData({...formData, paymentCycle: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">
                      {language === "english" ? "Weekly" : "साप्ताहिक"}
                    </SelectItem>
                    <SelectItem value="bi-weekly">
                      {language === "english" ? "Bi-weekly" : "पाक्षिक"}
                    </SelectItem>
                    <SelectItem value="monthly">
                      {language === "english" ? "Monthly" : "मासिक"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isEditing 
                  ? (language === "english" ? "Update Centre" : "केंद्र अपडेट करा")
                  : (language === "english" ? "Add Centre" : "केंद्र जोडा")
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === "english" ? "Centre List" : "केंद्र यादी"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "english" ? "Number" : "क्रमांक"}</TableHead>
                  <TableHead>{language === "english" ? "Name" : "नाव"}</TableHead>
                  <TableHead>{language === "english" ? "Cycle" : "सायकल"}</TableHead>
                  <TableHead>{language === "english" ? "Actions" : "क्रिया"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centres.map((centre) => (
                  <TableRow key={centre.id}>
                    <TableCell>{centre.number}</TableCell>
                    <TableCell>
                      {language === "english" ? centre.name : centre.nameMarathi}
                    </TableCell>
                    <TableCell>
                      {language === "english" 
                        ? centre.paymentCycle.charAt(0).toUpperCase() + centre.paymentCycle.slice(1)
                        : centre.paymentCycle === "weekly" ? "साप्ताहिक" 
                        : centre.paymentCycle === "bi-weekly" ? "पाक्षिक" 
                        : "मासिक"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(centre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(centre.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CentreManagement;
