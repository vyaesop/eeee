
'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const messagesCol = collection(db, 'supportChats', user!.displayName!, 'messages');
  const chatDocRef = doc(db, 'supportChats', user!.displayName!);

  useEffect(() => {
    const q = query(messagesCol, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Message[];
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !user.displayName) return;

    // Ensure the parent chat document exists
    const chatDocSnap = await getDoc(chatDocRef);
    if (!chatDocSnap.exists()) {
      await setDoc(chatDocRef, {
        user: user.displayName,
        lastMessage: newMessage,
        lastUpdated: serverTimestamp(),
        unread: true,
      });
    } else {
        await setDoc(chatDocRef, {
            lastMessage: newMessage,
            lastUpdated: serverTimestamp(),
            unread: true,
          }, { merge: true });
    }

    await addDoc(messagesCol, {
      text: newMessage,
      sender: user.displayName === 'admin' ? 'admin' : 'user',
      user: user.displayName,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
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
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};
