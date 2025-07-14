import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Plus, Trash2, Edit2, DollarSign, Calendar } from "lucide-react";

const inflowSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountCode: z.string().min(1, "Account code is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reference: z.string().optional(),
  isRecurring: z.boolean().default(false),
});

type InflowFormData = z.infer<typeof inflowSchema>;

interface InflowEntry extends InflowFormData {
  id: string;
  createdAt: string;
}

const InflowForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entries, setEntries] = useState<InflowEntry[]>([
    {
      id: "1",
      accountName: "Milk Sales Revenue",
      accountCode: "INC001",
      category: "Primary Income",
      amount: "15000",
      description: "Daily milk sales to local buyers",
      date: "2024-01-15",
      paymentMethod: "Bank Transfer",
      reference: "TXN001",
      isRecurring: true,
      createdAt: new Date().toISOString(),
    }
  ]);
  const { toast } = useToast();

  const categories = [
    "Primary Income",
    "Secondary Income", 
    "Government Subsidy",
    "Loan Disbursement",
    "Investment Returns",
    "Sale of Assets",
    "Insurance Claims",
    "Miscellaneous"
  ];

  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Cheque",
    "UPI",
    "Credit Card",
    "Debit Card"
  ];

  const form = useForm<InflowFormData>({
    resolver: zodResolver(inflowSchema),
    defaultValues: {
      accountName: "",
      accountCode: "",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      reference: "",
      isRecurring: false,
    },
  });

  const onSubmit = async (data: InflowFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        setEntries(prev => prev.map(entry => 
          entry.id === editingId ? { ...data, id: editingId, createdAt: new Date().toISOString() } : entry
        ));
        setEditingId(null);
        toast({
          title: "Income Entry Updated",
          description: "Income record has been updated successfully.",
        });
      } else {
        const newEntry: InflowEntry = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        setEntries(prev => [...prev, newEntry]);
        toast({
          title: "Income Entry Added",
          description: "New income record has been added successfully.",
        });
      }
      
      form.reset({
        accountName: "",
        accountCode: "",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        reference: "",
        isRecurring: false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save income entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: InflowEntry) => {
    setEditingId(entry.id);
    form.reset(entry);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Entry Deleted",
      description: "Income entry has been removed.",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset();
  };

  const totalInflow = entries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const monthlyInflow = entries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      const currentMonth = new Date().getMonth();
      return entryDate.getMonth() === currentMonth;
    })
    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {editingId ? "Edit Income Entry" : "Add Income Entry"}
          </CardTitle>
          <CardDescription>
            Configure income sources and account management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Milk Sales Revenue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="INC001" 
                          {...field}
                          className="font-mono"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the income source"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="TXN001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : editingId ? "Update Entry" : "Add Entry"}
                </Button>
                
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">₹{totalInflow.toFixed(2)}</div>
            </div>
            <p className="text-sm text-muted-foreground">Total Income</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">₹{monthlyInflow.toFixed(2)}</div>
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{entries.length}</div>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
          <CardDescription>
            List of all income entries and accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {entry.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{entry.accountName}</div>
                      <div className="text-sm text-muted-foreground font-mono">{entry.accountCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{entry.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-green-600">₹{parseFloat(entry.amount).toFixed(2)}</TableCell>
                  <TableCell>{entry.paymentMethod}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(entry.id)}
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
  );
};

export default InflowForm;