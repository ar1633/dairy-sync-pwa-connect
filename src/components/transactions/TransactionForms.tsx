
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, Clock, Users, Truck, Package, Receipt } from "lucide-react";

interface TransactionFormsProps {
  transactionType?: string;
  language: 'en' | 'mr';
}

const TransactionForms = ({ language, transactionType }: TransactionFormsProps) => {
  const [activeForm, setActiveForm] = useState<string>(transactionType || 'milk-collection');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [paidDate, setPaidDate] = useState<Date>();
  
  const translations = {
    en: {
      milkCollection: 'Milk Collection',
      milkDelivery: 'Milk Delivery',
      paymentAdjust: 'Payment Adjustment',
      feedSale: 'Feed Sale',
      balanceRecover: 'Balance Recovery',
      center: 'Center',
      date: 'Date',
      time: 'Time',
      farmer: 'Farmer',
      quantity: 'Quantity',
      fat: 'Fat',
      snf: 'SNF',
      rate: 'Rate',
      amount: 'Amount',
      morning: 'Morning',
      evening: 'Evening',
      manual: 'Manual',
      auto: 'AUTO',
      reset: 'Reset',
      no: 'No',
      yes: 'Yes',
      entry: 'Entry',
      statement: 'Statement',
      customerWise: 'Customer Wise',
      paidDatewise: 'Paid Datewise',
      close: 'Close',
      selectDate: 'Select Date',
      selectPaidDate: 'Select Paid Date',
      selectPaymentDate: 'Select Payment Date'
    },
    mr: {
      milkCollection: 'दूध संकलन',
      milkDelivery: 'दूध वितरण',
      paymentAdjust: 'पेमेंट एडजस्ट',
      feedSale: 'खाद्य विक्री',
      balanceRecover: 'शिल्लक वसुली',
      center: 'केंद्र',
      date: 'दिनांक',
      time: 'वेळ',
      farmer: 'शेतकरी',
      quantity: 'प्रमाण',
      fat: 'चरबी',
      snf: 'एसएनएफ',
      rate: 'दर',
      amount: 'रक्कम',
      morning: 'सकाळ',
      evening: 'संध्याकाळ',
      manual: 'मॅन्युअल',
      auto: 'ऑटो',
      reset: 'रीसेट',
      no: 'नाही',
      yes: 'होय',
      entry: 'एंट्री',
      statement: 'स्टेटमेंट',
      customerWise: 'ग्राहक प्रमाणे',
      paidDatewise: 'पेड तारीखवार',
      close: 'बंद',
      selectDate: 'दिनांक निवडा',
      selectPaidDate: 'पेड दिनांक निवडा',
      selectPaymentDate: 'पेमेंट दिनांक निवडा'
    }
  };

  const t = translations[language];

  const MilkCollectionForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t.milkCollection}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.center}</Label>
            <Select defaultValue="80">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80">80 - शिराखेड</SelectItem>
                <SelectItem value="81">81 - पाटील नगर</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.date}</Label>
            <DatePicker 
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder={t.selectDate}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.time}</Label>
            <Select defaultValue="morning">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t.morning}</SelectItem>
                <SelectItem value="evening">{t.evening}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm">{t.manual}</Button>
            <Button size="sm">{t.auto}</Button>
            <Button variant="outline" size="sm">{t.reset}</Button>
            <Button variant="outline" size="sm">{t.no}</Button>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">दिनांक</Label>
              <Input 
                placeholder="१२-०७-२०२५" 
                className="text-center bg-background"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">केंद्र</Label>
              <div className="flex gap-2 items-center">
                <Input placeholder="0" className="w-16 text-center bg-background" />
                <span className="text-sm text-muted-foreground">ते</span>
                <Input placeholder="0" className="w-16 text-center bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">बॅलेंस</Label>
              <Input 
                placeholder="0.00" 
                className="text-center bg-background font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button className="bg-green-600 hover:bg-green-700">
            Save Entry
          </Button>
          <Button variant="outline">
            Print Receipt
          </Button>
          <Button variant="outline">
            View Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const PaymentAdjustForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          PAYMENT ADJUST
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">दिनांक</Label>
            <DatePicker 
              date={paymentDate}
              onDateChange={setPaymentDate}
              placeholder={t.selectPaymentDate}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount</Label>
            <Input placeholder="0.00" className="font-mono" />
          </div>
        </div>
        
        <div className="flex gap-4 justify-center pt-4">
          <Button className="px-8">{t.yes}</Button>
          <Button variant="outline" className="px-8">{t.no}</Button>
        </div>
      </CardContent>
    </Card>
  );

  const PaidPaymentForm = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PAID PAYMENT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">{t.entry}</Button>
          <Button variant="outline" size="sm">Stmt</Button>
          <Button variant="outline" size="sm">Cust Wise</Button>
          <Button variant="outline" size="sm">Paid Datewise</Button>
          <Button variant="outline" size="sm">{t.close}</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">केंद्र नं</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="0" className="w-20 text-center" />
                <span className="text-sm text-muted-foreground">ते</span>
                <Input placeholder="0" className="w-20 text-center" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">उत्पादक नं.</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="0" className="w-20 text-center" />
                <span className="text-sm text-muted-foreground">ते</span>
                <Input placeholder="0" className="w-20 text-center" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">दिनांक</Label>
              <DatePicker 
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder={t.selectDate}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">ते</Label>
              <DatePicker 
                date={undefined}
                onDateChange={() => {}}
                placeholder={t.selectDate}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">पेड दिनांक</Label>
            <DatePicker 
              date={paidDate}
              onDateChange={setPaidDate}
              placeholder={t.selectPaidDate}
              className="w-full max-w-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Process Payment
          </Button>
          <Button variant="outline">
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Transaction Forms' : 'व्यवहार फॉर्म'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Manage daily dairy transactions and entries' 
            : 'दैनंदिन डेअरी व्यवहार आणि नोंदी व्यवस्थापित करा'
          }
        </p>
      </div>

      <Tabs value={activeForm} onValueChange={setActiveForm}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="milk-collection" className="text-sm">
            {t.milkCollection}
          </TabsTrigger>
          <TabsTrigger value="payment-adjust" className="text-sm">
            {t.paymentAdjust}
          </TabsTrigger>
          <TabsTrigger value="paid-payment" className="text-sm">
            Paid Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="milk-collection">
          <MilkCollectionForm />
        </TabsContent>

        <TabsContent value="payment-adjust">
          <PaymentAdjustForm />
        </TabsContent>

        <TabsContent value="paid-payment">
          <PaidPaymentForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionForms;
