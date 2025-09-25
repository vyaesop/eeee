
'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { type FirestorePermissionError } from '@/lib/errors';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from './ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';

const isDevelopment = process.env.NODE_ENV === 'development';

export function FirebaseErrorListener() {
  const { user } = useAuth();
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (e: FirestorePermissionError) => {
      if (isDevelopment) {
        e.setUser(user);
        setError(e);
      } else {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You do not have permission to perform this action.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [user, toast]);

  const handleClose = () => {
    setError(null);
  };

  const copyToClipboard = () => {
    if (error) {
      navigator.clipboard.writeText(error.toDiagnosticString());
      toast({ title: 'Copied to clipboard!' });
    }
  };

  if (!error) {
    return null;
  }

  return (
    <AlertDialog open={!!error} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Firestore Security Rule Error
          </AlertDialogTitle>
          <AlertDialogDescription>
            The following request was denied by your Firestore Security Rules.
            This dialog is only shown in development.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 bg-muted p-4 rounded-lg space-y-4 text-sm overflow-auto max-h-[50vh]">
          <div className="flex justify-between items-center">
             <h3 className="font-semibold text-lg">Error Details</h3>
             <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
             </Button>
          </div>
          <div>
            <p className="font-semibold">Operation:</p>
            <p className="font-mono p-2 bg-background rounded-md text-destructive">
              {error.context.operation.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="font-semibold">Path:</p>
            <p className="font-mono p-2 bg-background rounded-md">
              {error.context.path}
            </p>
          </div>
          {error.user && (
            <div>
              <p className="font-semibold">Authenticated User (request.auth):</p>
              <pre className="font-mono p-2 bg-background rounded-md text-xs">
                {JSON.stringify(error.user, null, 2)}
              </pre>
            </div>
          )}
           {error.context.requestResourceData && (
            <div>
              <p className="font-semibold">Request Data (request.resource.data):</p>
              <pre className="font-mono p-2 bg-background rounded-md text-xs">
                {JSON.stringify(error.context.requestResourceData, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
