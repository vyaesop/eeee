
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), username: doc.id }) as UserData);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (username: string, currentRole: 'user' | 'admin') => {
    try {
      const userRef = doc(db, 'users', username);
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(userRef, { role: newRole });
      toast({ title: 'Success', description: `${username}'s role updated to ${newRole}.` });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error(`Error updating role for ${username}:`, error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update ${username}'s role.` });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Total Deposit</TableHead>
                <TableHead>Earnings Balance</TableHead>
                <TableHead>Membership Tier</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.username}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{formatCurrency(user.totalDeposit)}</TableCell>
                  <TableCell>{formatCurrency(user.earningsBalance)}</TableCell>
                  <TableCell>{user.membershipTier}</TableCell>
                  <TableCell>{user.role || 'user'}</TableCell>
                  <TableCell>
                    <Button onClick={() => toggleRole(user.username, user.role || 'user')} disabled={user.username === 'admin'}>
                      Toggle Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
