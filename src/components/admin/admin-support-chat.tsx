
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, Timestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  timestamp: Timestamp;
  user: string;
}

interface ChatMetadata {
    user: string;
    lastMessage: string;
    lastUpdated: Timestamp;
    unread: boolean;
}

interface AdminSupportChatProps {
  allUsers: UserData[];
}

export const AdminSupportChat = ({ allUsers }: AdminSupportChatProps) => {
  const { user: adminUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUsers, setChatUsers] = useState<ChatMetadata[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!adminUser) return;

    setLoadingChats(true);
    const chatsCol = collection(db, 'supportChats');
    const q = query(chatsCol, orderBy('lastUpdated', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ ...doc.data(), user: doc.id })) as ChatMetadata[];
      setChatUsers(chats);
      if (chats.length > 0 && !selectedUser) {
        setSelectedUser(chats[0].user);
      }
      setLoadingChats(false);
    }, (error) => {
      console.error("Error fetching active chats:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch active chats. Please check your permissions.' });
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [adminUser, toast]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    };

    const messagesCol = collection(db, 'supportChats', selectedUser, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Message[];
      setMessages(fetchedMessages);

      if (snapshot.docs.length > 0) {
        const chatDocRef = doc(db, 'supportChats', selectedUser);
        const chatToUpdate = chatUsers.find(c => c.user === selectedUser);
        if (chatToUpdate?.unread) {
            await setDoc(chatDocRef, { unread: false }, { merge: true });
        }
      }
    });

    return () => unsubscribe();
  }, [selectedUser, chatUsers]);
  
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
    if (!newMessage.trim() || !adminUser || !selectedUser) return;

    const messagesCol = collection(db, 'supportChats', selectedUser, 'messages');
    await addDoc(messagesCol, {
      text: newMessage,
      sender: 'admin',
      user: adminUser.displayName,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');

    const chatDocRef = doc(db, 'supportChats', selectedUser);
    await setDoc(chatDocRef, { lastMessage: newMessage, lastUpdated: serverTimestamp() }, { merge: true });
  };
  
  const selectedUserData = useMemo(() => {
    return allUsers.find(u => u.username === selectedUser);
  }, [selectedUser, allUsers]);

  return (
    <div className="flex flex-col h-[600px]">
      <div className="mb-4">
        <Select onValueChange={setSelectedUser} value={selectedUser || ''}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a user chat" />
          </SelectTrigger>
          <SelectContent>
            {loadingChats ? (
                <div className="p-4 text-sm text-muted-foreground">Loading chats...</div>
            ) : chatUsers.length > 0 ? (
              chatUsers.map(chat => (
                <SelectItem key={chat.user} value={chat.user}>
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{chat.user}</span>
                    {chat.unread && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                  </div>
                </SelectItem>
              ))
            ) : (
                <div className="p-4 text-sm text-muted-foreground">No active support chats.</div>
            )}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-grow p-4 border rounded-md" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== 'admin' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{selectedUserData?.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
               {msg.sender === 'admin' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={'/avatars/alex.jpg'} />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        {selectedUser && messages.length === 0 && !loadingChats && (
             <div className="text-center text-muted-foreground p-8">No messages in this chat yet.</div>
        )}
      </ScrollArea>
      
      {selectedUser && (
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-4">
            <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Reply to ${selectedUser}...`}
            />
            <Button type="submit">Send</Button>
        </form>
      )}
    </div>
  );
};
