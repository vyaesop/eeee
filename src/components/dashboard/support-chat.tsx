'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  timestamp: Timestamp;
  user: string;
}

export const SupportChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesCol = user?.displayName ? collection(db, 'supportChats', user.displayName, 'messages') : null;
  const chatDocRef = user?.displayName ? doc(db, 'supportChats', user.displayName) : null;
  const userDocRef = user?.displayName ? doc(db, 'users', user.displayName) : null;

  useEffect(() => {
    if (!messagesCol) return;
    const q = query(messagesCol, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Message[];
      setMessages(fetchedMessages);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messagesCol.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    return () => unsubscribe();
  }, [messagesCol]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !user.displayName || !messagesCol || !chatDocRef || !userDocRef) return;

    const chatDocSnap = await getDoc(chatDocRef);
    const updateData = {
      user: user.displayName,
      lastMessage: newMessage,
      lastUpdated: serverTimestamp(),
      unread: true,
    };

    const messagePayload = {
      text: newMessage,
      sender: 'user' as const,
      user: user.displayName,
      timestamp: serverTimestamp(),
    };

    setNewMessage('');

    if (!chatDocSnap.exists()) {
      setDoc(chatDocRef, updateData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: chatDocRef.path,
            operation: 'create',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      updateDoc(userDocRef, { hasActiveChat: true }).catch(serverError => {
         const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: { hasActiveChat: true },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      setDoc(chatDocRef, updateData, { merge: true }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: chatDocRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    addDoc(messagesCol, messagePayload).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: messagesCol.path,
            operation: 'create',
            requestResourceData: messagePayload,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-grow p-4 border rounded-md" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.sender === 'admin' ? '/avatars/alex.jpg' : '/logo.png'} />
                  <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!user?.displayName}
        />
        <Button type="submit" disabled={!user?.displayName}>Send</Button>
      </form>
    </div>
  );
};
