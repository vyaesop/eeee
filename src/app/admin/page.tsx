
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const checkAdmin = async () => {
      if (authLoading) return;
      if (!user?.displayName) {
        router.push('/login');
        return;
      }
      
      if (user.displayName === 'admin') {
         setIsAdmin(true);
         fetchUsers();
         return;
      }

      const userRef = doc(db, 'users', user.displayName);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role === 'admin') {
        setIsAdmin(true);
        fetchUsers();
      } else {
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  const toggleRole = async (username: string, currentRole: 'user' | 'admin') => {
    if (username === 'admin') {
        toast({ variant: 'destructive', title: 'Action Forbidden', description: 'Cannot change the role of the primary admin.' });
        return;
    }
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

  if (authLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Manage users and their roles.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Total Deposit</TableHead>
                <TableHead>Membership Tier</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.username}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{formatCurrency(user.totalDeposit)}</TableCell>
                  <TableCell>{user.membershipTier}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {user.role || 'user'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => toggleRole(user.username, user.role || 'user')} 
                      disabled={user.username === 'admin'}
                      size="sm"
                      variant={user.role === 'admin' ? 'destructive' : 'outline'}
                    >
                      {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
