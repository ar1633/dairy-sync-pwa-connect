
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FodderProvidersTab from "@/components/fodder/FodderProvidersTab";
import FodderInfoTab from "@/components/fodder/FodderInfoTab";
import PurchaseEntryTab from "@/components/fodder/PurchaseEntryTab";
import AdvanceInfoTab from "@/components/fodder/AdvanceInfoTab";

const FodderManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Animal Fodder Management</h2>
        <p className="text-gray-600">Manage fodder providers, inventory, purchases and advances</p>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="fodder">Fodder Info</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers">
          <FodderProvidersTab />
        </TabsContent>
        
        <TabsContent value="fodder">
          <FodderInfoTab />
        </TabsContent>
        
        <TabsContent value="purchases">
          <PurchaseEntryTab />
        </TabsContent>
        
        <TabsContent value="advances">
          <AdvanceInfoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FodderManagement;
