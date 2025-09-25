
'use client';

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldCheck, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSupportChat } from '@/components/admin/admin-support-chat';
import { updateDoc } from 'firebase/firestore';


export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminStatus = async () => {
      let adminStatus = false;
      if (user.displayName === 'admin') {
        adminStatus = true;
      } else {
        const userRef = doc(db, 'users', user.displayName!);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === 'admin') {
          adminStatus = true;
        }
      }

      if (adminStatus) {
        setIsAdmin(true);
      } else {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to view this page.' });
        router.push('/dashboard');
      }
    };

    checkAdminStatus();
  }, [user, authLoading, router, toast]);

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({ ...doc.data(), username: doc.id }) as UserData)
        .filter(u => u.username !== 'admin');
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch users.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, toast]);


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
    } catch (error) {
      console.error(`Error updating role for ${username}:`, error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update ${username}'s role.` });
    }
  };

  if (authLoading || !isAdmin || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Verifying permissions and loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
       <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users"><ShieldCheck className="mr-2" /> User Management</TabsTrigger>
          <TabsTrigger value="support"><MessageSquare className="mr-2" /> Support Center</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and view their details.</CardDescription>
                </CardHeader>
                <CardContent>
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
                    {users.map(userItem => (
                        <TableRow key={userItem.username}>
                        <TableCell className="font-medium">{userItem.username}</TableCell>
                        <TableCell>{formatCurrency(userItem.totalDeposit)}</TableCell>
                        <TableCell>{userItem.membershipTier}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${userItem.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {userItem.role || 'user'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button
                            onClick={() => toggleRole(userItem.username, userItem.role || 'user')}
                            disabled={userItem.username === 'admin'}
                            size="sm"
                            variant={userItem.role === 'admin' ? 'destructive' : 'outline'}
                            >
                            {userItem.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="support">
            <Card>
                <CardHeader>
                    <CardTitle>Support Center</CardTitle>
                    <CardDescription>View user support chats and send replies.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminSupportChat allUsers={users} />
                </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
