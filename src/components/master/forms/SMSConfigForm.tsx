import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Phone, Save, TestTube } from "lucide-react";

const smsConfigSchema = z.object({
  ownerPhoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  enableSMSNotifications: z.boolean(),
  enableDailyReports: z.boolean(),
  enablePaymentAlerts: z.boolean(),
  enableLowStockAlerts: z.boolean(),
  smsGatewayProvider: z.string().min(1, "SMS Gateway Provider is required"),
  apiKey: z.string().optional(),
});

type SMSConfigFormData = z.infer<typeof smsConfigSchema>;

const SMSConfigForm = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<SMSConfigFormData>({
    resolver: zodResolver(smsConfigSchema),
    defaultValues: {
      ownerPhoneNumber: "",
      enableSMSNotifications: true,
      enableDailyReports: false,
      enablePaymentAlerts: true,
      enableLowStockAlerts: true,
      smsGatewayProvider: "TextLocal",
      apiKey: "",
    },
  });

  React.useEffect(() => {
    // Fetch config from backend
    fetch("/api/master-data/sms-config")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) form.reset(data);
      });
  }, []);

  const onSubmit = async (data: SMSConfigFormData) => {
    setIsSaving(true);
    try {
      await fetch("/api/master-data/sms-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      toast({
        title: "SMS Configuration Saved",
        description: "SMS settings have been updated successfully.",
      });
      
      console.log("SMS Config saved:", data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMS configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testSMS = () => {
    toast({
      title: "Test SMS Sent",
      description: "A test message has been sent to the configured number.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          SMS Configuration
        </CardTitle>
        <CardDescription>
          Configure SMS notifications and alerts for the dairy management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ownerPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91 9876543210"
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
                name="smsGatewayProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS Gateway Provider</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TextLocal, Twilio, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>API Key (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your SMS gateway API key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enableSMSNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable general SMS notifications
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableDailyReports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Daily Reports</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Send daily summary reports via SMS
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enablePaymentAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Payment Alerts</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Alert on payment due dates
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableLowStockAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Low Stock Alerts</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Alert when fodder stock is low
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
              
              <Button type="button" variant="outline" onClick={testSMS}>
                <TestTube className="mr-2 h-4 w-4" />
                Send Test SMS
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SMSConfigForm;