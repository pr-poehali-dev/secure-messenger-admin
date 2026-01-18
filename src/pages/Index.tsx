import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ChatView from '@/components/ChatView';
import ContactsView from '@/components/ContactsView';
import ProfileView from '@/components/ProfileView';
import AdminView from '@/components/AdminView';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  encrypted: boolean;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
}

interface Contact {
  id: number;
  name: string;
  status: string;
  avatar: string;
  online: boolean;
}

interface AdminStat {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

const API_URL = func2url.messages;
const CURRENT_USER_ID = 1;

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'profile' | 'admin'>('chats');
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [isAdmin] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_chats', user_id: CURRENT_USER_ID })
      });
      const data = await response.json();
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_contacts', user_id: CURRENT_USER_ID })
      });
      const data = await response.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages', chat_id: chatId, user_id: CURRENT_USER_ID })
      });
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const adminStats: AdminStat[] = [
    { label: 'Активных пользователей', value: '1,234', icon: 'Users', trend: '+12%' },
    { label: 'Сообщений за сегодня', value: '45.6K', icon: 'MessageSquare', trend: '+8%' },
    { label: 'Заблокировано угроз', value: '23', icon: 'Shield', trend: '-15%' },
    { label: 'Время отклика', value: '1.2s', icon: 'Zap', trend: '-5%' },
  ];

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChat) {
      setLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_message',
            chat_id: selectedChat,
            sender_id: CURRENT_USER_ID,
            text: messageInput
          })
        });
        const data = await response.json();
        if (data.id) {
          setMessages([...messages, data]);
          setMessageInput('');
          loadChats();
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="h-full flex">
        <aside className="w-20 bg-white/80 backdrop-blur-lg border-r border-purple-100 flex flex-col items-center py-6 gap-6">
          <div className="w-12 h-12 rounded-2xl gradient-purple flex items-center justify-center text-white text-2xl font-bold animate-pulse-glow">
            M
          </div>
          
          <nav className="flex-1 flex flex-col gap-4">
            <Button
              variant={activeTab === 'chats' ? 'default' : 'ghost'}
              size="icon"
              className={`w-14 h-14 rounded-2xl transition-all ${activeTab === 'chats' ? 'gradient-purple text-white' : 'hover:bg-purple-100'}`}
              onClick={() => setActiveTab('chats')}
            >
              <Icon name="MessageSquare" size={24} />
            </Button>
            
            <Button
              variant={activeTab === 'contacts' ? 'default' : 'ghost'}
              size="icon"
              className={`w-14 h-14 rounded-2xl transition-all ${activeTab === 'contacts' ? 'gradient-purple text-white' : 'hover:bg-purple-100'}`}
              onClick={() => setActiveTab('contacts')}
            >
              <Icon name="Users" size={24} />
            </Button>
            
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              size="icon"
              className={`w-14 h-14 rounded-2xl transition-all ${activeTab === 'profile' ? 'gradient-purple text-white' : 'hover:bg-purple-100'}`}
              onClick={() => setActiveTab('profile')}
            >
              <Icon name="User" size={24} />
            </Button>
            
            {isAdmin && (
              <Button
                variant={activeTab === 'admin' ? 'default' : 'ghost'}
                size="icon"
                className={`w-14 h-14 rounded-2xl transition-all ${activeTab === 'admin' ? 'gradient-pink text-white' : 'hover:bg-pink-100'}`}
                onClick={() => setActiveTab('admin')}
              >
                <Icon name="Shield" size={24} />
              </Button>
            )}
          </nav>
          
          <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl hover:bg-purple-100">
            <Icon name="Settings" size={24} />
          </Button>
        </aside>

        {activeTab === 'chats' && (
          <ChatView
            chats={chats}
            messages={messages}
            selectedChat={selectedChat}
            messageInput={messageInput}
            setSelectedChat={setSelectedChat}
            setMessageInput={setMessageInput}
            handleSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsView contacts={contacts} />
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}

        {activeTab === 'admin' && (
          <AdminView adminStats={adminStats} />
        )}
      </div>
    </div>
  );
};

export default Index;
