
'use client';

import { SupportChat } from "@/components/dashboard/support-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SupportPage = () => {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer Support</CardTitle>
        </CardHeader>
        <CardContent>
          <SupportChat />
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
