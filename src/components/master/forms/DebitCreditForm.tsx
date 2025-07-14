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
import { Receipt, Plus, Trash2, Edit2, Calendar } from "lucide-react";

const debitCreditSchema = z.object({
  type: z.enum(["debit", "credit"]),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  voucherNumber: z.string().min(1, "Voucher number is required"),
  date: z.string().min(1, "Date is required"),
  farmerId: z.string().optional(),
  reference: z.string().optional(),
});

type DebitCreditFormData = z.infer<typeof debitCreditSchema>;

interface DebitCreditEntry extends DebitCreditFormData {
  id: string;
  createdAt: string;
}

const DebitCreditForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entries, setEntries] = useState<DebitCreditEntry[]>([
    {
      id: "1",
      type: "debit",
      category: "Transport",
      amount: "500",
      description: "Vehicle maintenance",
      voucherNumber: "V001",
      date: "2024-01-15",
      farmerId: "F001",
      reference: "REF001",
      createdAt: new Date().toISOString(),
    }
  ]);
  const { toast } = useToast();

  const categories = {
    debit: ["Transport", "Maintenance", "Utilities", "Labour", "Miscellaneous"],
    credit: ["Bonus", "Government Subsidy", "Sale Returns", "Interest", "Miscellaneous"]
  };

  const form = useForm<DebitCreditFormData>({
    resolver: zodResolver(debitCreditSchema),
    defaultValues: {
      type: "debit",
      category: "",
      amount: "",
      description: "",
      voucherNumber: "",
      date: new Date().toISOString().split('T')[0],
      farmerId: "",
      reference: "",
    },
  });

  const watchType = form.watch("type");

  const onSubmit = async (data: DebitCreditFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        setEntries(prev => prev.map(entry => 
          entry.id === editingId ? { ...data, id: editingId, createdAt: new Date().toISOString() } : entry
        ));
        setEditingId(null);
        toast({
          title: "Entry Updated",
          description: "Debit/Credit entry has been updated successfully.",
        });
      } else {
        const newEntry: DebitCreditEntry = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        setEntries(prev => [...prev, newEntry]);
        toast({
          title: "Entry Added",
          description: `${data.type === 'debit' ? 'Debit' : 'Credit'} entry has been added successfully.`,
        });
      }
      
      form.reset({
        type: "debit",
        category: "",
        amount: "",
        description: "",
        voucherNumber: "",
        date: new Date().toISOString().split('T')[0],
        farmerId: "",
        reference: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: DebitCreditEntry) => {
    setEditingId(entry.id);
    form.reset(entry);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Entry Deleted",
      description: "Debit/Credit entry has been removed.",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset();
  };

  const totalDebits = entries
    .filter(entry => entry.type === 'debit')
    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  const totalCredits = entries
    .filter(entry => entry.type === 'credit')
    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {editingId ? "Edit Debit/Credit Entry" : "Add Debit/Credit Entry"}
          </CardTitle>
          <CardDescription>
            Manage vouchers, variations, and adjustment entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories[watchType]?.map((category) => (
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
                  name="voucherNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voucher Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="V001" 
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
                  name="farmerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer ID (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="F001" 
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the transaction"
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
                        <Input placeholder="REF001" {...field} />
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
            <div className="text-2xl font-bold text-red-600">₹{totalDebits.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Total Debits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">₹{totalCredits.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Total Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${(totalCredits - totalDebits) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(totalCredits - totalDebits).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Net Balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>
            List of all debit and credit entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Voucher</TableHead>
                <TableHead>Amount</TableHead>
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
                    <Badge variant={entry.type === 'debit' ? 'destructive' : 'default'}>
                      {entry.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell className="font-mono">{entry.voucherNumber}</TableCell>
                  <TableCell className="font-mono">₹{parseFloat(entry.amount).toFixed(2)}</TableCell>
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

export default DebitCreditForm;