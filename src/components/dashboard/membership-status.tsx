'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MembershipStatusProps {
  tier: string | undefined;
}

export const MembershipStatus: React.FC<MembershipStatusProps> = ({ tier }) => {
  if (!tier) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Current Membership Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="default" className="text-lg px-4 py-2">{tier}</Badge>
      </CardContent>
    </Card>
  );
};
