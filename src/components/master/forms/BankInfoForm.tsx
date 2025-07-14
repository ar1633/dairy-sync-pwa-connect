import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Trash2, Edit2 } from "lucide-react";

const bankInfoSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters"),
  branchName: z.string().min(1, "Branch name is required"),
  branchAddress: z.string().min(1, "Branch address is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  managerName: z.string().optional(),
});

type BankInfoFormData = z.infer<typeof bankInfoSchema>;

interface BankInfo extends BankInfoFormData {
  id: string;
}

const BankInfoForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankInfo[]>([
    {
      id: "1",
      bankName: "State Bank of India",
      ifscCode: "SBIN0001234",
      branchName: "Main Branch",
      branchAddress: "123 Main Street, City",
      contactNumber: "9876543210",
      managerName: "John Doe"
    }
  ]);
  const { toast } = useToast();

  const form = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankName: "",
      ifscCode: "",
      branchName: "",
      branchAddress: "",
      contactNumber: "",
      managerName: "",
    },
  });

  const onSubmit = async (data: BankInfoFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        setBanks(prev => prev.map(bank => 
          bank.id === editingId ? { ...data, id: editingId } : bank
        ));
        setEditingId(null);
        toast({
          title: "Bank Information Updated",
          description: "Bank details have been updated successfully.",
        });
      } else {
        const newBank: BankInfo = {
          ...data,
          id: Date.now().toString(),
        };
        setBanks(prev => [...prev, newBank]);
        toast({
          title: "Bank Information Added",
          description: "New bank has been added successfully.",
        });
      }
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bank information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (bank: BankInfo) => {
    setEditingId(bank.id);
    form.reset(bank);
  };

  const handleDelete = (id: string) => {
    setBanks(prev => prev.filter(bank => bank.id !== id));
    toast({
      title: "Bank Deleted",
      description: "Bank information has been removed.",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {editingId ? "Edit Bank Information" : "Add Bank Information"}
          </CardTitle>
          <CardDescription>
            Manage bank details for farmers and dairy transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="State Bank of India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ifscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SBIN0001234" 
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
                  name="branchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Branch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9876543210" 
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
                  name="branchAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Branch Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street, City, State, PIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : editingId ? "Update Bank" : "Add Bank"}
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

      <Card>
        <CardHeader>
          <CardTitle>Registered Banks</CardTitle>
          <CardDescription>
            List of all registered bank information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Name</TableHead>
                <TableHead>IFSC Code</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell className="font-medium">{bank.bankName}</TableCell>
                  <TableCell className="font-mono">{bank.ifscCode}</TableCell>
                  <TableCell>{bank.branchName}</TableCell>
                  <TableCell className="font-mono">{bank.contactNumber}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(bank)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(bank.id)}
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

export default BankInfoForm;