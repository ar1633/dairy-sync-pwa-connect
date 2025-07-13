
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Truck, Package, Receipt } from "lucide-react";

interface TransactionFormsProps {
  language: 'en' | 'mr';
}

const TransactionForms = ({ language }: TransactionFormsProps) => {
  const [activeForm, setActiveForm] = useState<string>('milk-collection');
  
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
      close: 'Close'
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
      close: 'बंद'
    }
  };

  const t = translations[language];

  const MilkCollectionForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t.milkCollection}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label>{t.center}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="80" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80">80 - शिराखेड</SelectItem>
                <SelectItem value="81">81 - पाटील नगर</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t.date}</Label>
            <Input type="date" defaultValue="2025-07-12" />
          </div>
          <div>
            <Label>{t.time}</Label>
            <Select defaultValue="morning">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t.morning}</SelectItem>
                <SelectItem value="evening">{t.evening}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline">{t.manual}</Button>
            <Button>{t.auto}</Button>
            <Button variant="outline">{t.reset}</Button>
            <Button variant="outline">{t.no}</Button>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>दिनांक</Label>
              <Input placeholder="१२-०७-२०२५" className="text-center" />
            </div>
            <div>
              <Label>केंद्र</Label>
              <div className="flex gap-2">
                <Input placeholder="0" className="w-16" />
                <span className="self-center">ते</span>
                <Input placeholder="0" className="w-16" />
              </div>
            </div>
            <div>
              <Label>बॅलेंस</Label>
              <Input placeholder="0.00" className="text-center" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700">Save Entry</Button>
          <Button variant="outline">Print Receipt</Button>
          <Button variant="outline">View Report</Button>
        </div>
      </CardContent>
    </Card>
  );

  const PaymentAdjustForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          PAYMENT ADJUST
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>दिनांक</Label>
              <Input placeholder="• •" />
            </div>
            <div>
              <Label></Label>
              <Input placeholder="• •" />
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button>{t.yes}</Button>
            <Button variant="outline">{t.no}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PaidPaymentForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>PAID PAYMENT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button variant="outline">{t.entry}</Button>
          <Button variant="outline">Stmt</Button>
          <Button variant="outline">Cust Wise</Button>
          <Button variant="outline">Paid Datewise</Button>
          <Button variant="outline">{t.close}</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Label>केंद्र नं</Label>
              <Input placeholder="0" className="w-20" />
              <span>ते</span>
              <Input placeholder="0" className="w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Label>उत्पादक नं.</Label>
              <Input placeholder="0" className="w-20" />
              <span>ते</span>
              <Input placeholder="0" className="w-20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>दिनांक</Label>
              <Input placeholder="• •" />
            </div>
            <div>
              <Label>ते</Label>
              <Input placeholder="• •" />
            </div>
          </div>

          <div>
            <Label>पेड दिनांक</Label>
            <Input placeholder="• •" />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700">Process Payment</Button>
          <Button variant="outline">Generate Report</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {language === 'en' ? 'Transaction Forms' : 'व्यवहार फॉर्म'}
        </h1>
        <p className="text-gray-600">
          {language === 'en' 
            ? 'Manage daily dairy transactions and entries' 
            : 'दैनंदिन डेअरी व्यवहार आणि नोंदी व्यवस्थापित करा'
          }
        </p>
      </div>

      <Tabs value={activeForm} onValueChange={setActiveForm}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="milk-collection">{t.milkCollection}</TabsTrigger>
          <TabsTrigger value="payment-adjust">{t.paymentAdjust}</TabsTrigger>
          <TabsTrigger value="paid-payment">Paid Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="milk-collection" className="mt-6">
          <MilkCollectionForm />
        </TabsContent>

        <TabsContent value="payment-adjust" className="mt-6">
          <PaymentAdjustForm />
        </TabsContent>

        <TabsContent value="paid-payment" className="mt-6">
          <PaidPaymentForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionForms;
