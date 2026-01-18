import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

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
          <>
            <div className="w-96 bg-white/60 backdrop-blur-lg border-r border-purple-100 flex flex-col">
              <div className="p-6 border-b border-purple-100">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Чаты
                </h1>
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Поиск чатов..." className="pl-10 rounded-2xl border-purple-200 focus:border-purple-400" />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full p-4 rounded-2xl transition-all hover:scale-[1.02] ${
                        selectedChat === chat.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/80 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="text-3xl">{chat.avatar}</div>
                          {chat.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold truncate">{chat.name}</span>
                            <span className={`text-xs ${selectedChat === chat.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {chat.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${selectedChat === chat.id ? 'text-white/90' : 'text-muted-foreground'}`}>
                              {chat.lastMessage}
                            </p>
                            {chat.unread > 0 && (
                              <Badge className="gradient-blue text-white min-w-[24px] h-6 rounded-full">
                                {chat.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
              <div className="p-6 border-b border-purple-100 bg-white/60 backdrop-blur-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="text-4xl">{chats.find(c => c.id === selectedChat)?.avatar}</div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{chats.find(c => c.id === selectedChat)?.name}</h2>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      В сети
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                    <Icon name="Phone" size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                    <Icon name="Video" size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                    <Icon name="MoreVertical" size={20} />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 animate-fade-in ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-3xl ${
                          message.sender === 'me'
                            ? 'gradient-purple text-white rounded-br-md'
                            : 'bg-white shadow-md rounded-bl-md'
                        }`}
                      >
                        <p className="mb-1">{message.text}</p>
                        <div className={`flex items-center gap-2 text-xs ${message.sender === 'me' ? 'text-white/80' : 'text-muted-foreground'}`}>
                          <span>{message.time}</span>
                          {message.encrypted && (
                            <Icon name="Lock" size={12} className={message.sender === 'me' ? 'text-white/80' : 'text-green-500'} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-purple-100 bg-white/60 backdrop-blur-lg">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                    <Icon name="Plus" size={24} />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Введите сообщение..."
                    className="rounded-full border-purple-200 focus:border-purple-400 bg-white"
                  />
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                    <Icon name="Paperclip" size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100">
                    <Icon name="Smile" size={20} />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="rounded-full gradient-purple text-white h-12 w-12 p-0"
                  >
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Lock" size={12} className="text-green-500" />
                  <span>Сквозное шифрование активно</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'contacts' && (
          <div className="flex-1 bg-white/40 backdrop-blur-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Контакты
              </h1>
              <div className="relative mb-6">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Поиск контактов..." className="pl-12 rounded-2xl border-purple-200 focus:border-purple-400 h-14" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="text-5xl">{contact.avatar}</div>
                        {contact.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        <p className={`text-sm ${contact.online ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {contact.status}
                        </p>
                      </div>
                      <Button className="rounded-full gradient-blue text-white">
                        <Icon name="MessageSquare" size={18} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="flex-1 bg-white/40 backdrop-blur-sm p-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
                Профиль
              </h1>
              <Card className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100">
                <div className="flex flex-col items-center mb-8">
                  <div className="text-8xl mb-4">👤</div>
                  <h2 className="text-2xl font-bold mb-2">Иван Иванов</h2>
                  <p className="text-muted-foreground mb-4">@ivan_ivanov</p>
                  <Badge className="gradient-purple text-white">В сети</Badge>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">НАСТРОЙКИ БЕЗОПАСНОСТИ</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-200">
                        <div className="flex items-center gap-3">
                          <Icon name="Lock" size={20} className="text-green-600" />
                          <span className="font-medium">Сквозное шифрование</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Включено</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Icon name="Shield" size={20} className="text-blue-600" />
                          <span className="font-medium">Двухфакторная аутентификация</span>
                        </div>
                        <Badge className="bg-blue-500 text-white">Включена</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-3">
                          <Icon name="Key" size={20} className="text-purple-600" />
                          <span className="font-medium">Биометрия</span>
                        </div>
                        <Badge className="bg-purple-500 text-white">Активна</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">УВЕДОМЛЕНИЯ</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-purple-200">
                        <span>Новые сообщения</span>
                        <div className="w-12 h-6 bg-purple-500 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-purple-200">
                        <span>Звонки</span>
                        <div className="w-12 h-6 bg-purple-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="flex-1 bg-white/40 backdrop-blur-sm p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Админ-панель
                </h1>
                <Badge className="gradient-pink text-white text-sm px-4 py-2">
                  <Icon name="Shield" size={16} className="mr-2" />
                  Защищённый доступ
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminStats.map((stat, idx) => (
                  <Card key={idx} className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-xl transition-all hover:scale-[1.05]">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${idx % 2 === 0 ? 'gradient-purple' : 'gradient-pink'} flex items-center justify-center text-white`}>
                        <Icon name={stat.icon as any} size={24} />
                      </div>
                      <Badge className={stat.trend.startsWith('+') ? 'bg-green-500' : 'bg-blue-500'} variant="secondary">
                        {stat.trend}
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="Activity" size={24} className="text-purple-600" />
                    Активность системы
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">Все системы работают</span>
                      </div>
                      <Badge className="bg-green-500 text-white">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-200">
                      <span>CPU загрузка</span>
                      <span className="font-bold">23%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 border border-purple-200">
                      <span>RAM использование</span>
                      <span className="font-bold">4.2 / 16 GB</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="ShieldAlert" size={24} className="text-orange-600" />
                    Последние события
                  </h2>
                  <div className="space-y-3">
                    {[
                      { type: 'success', text: 'Заблокирована попытка взлома', time: '2 мин назад' },
                      { type: 'warning', text: 'Необычная активность из IP 192.168.1.1', time: '15 мин назад' },
                      { type: 'info', text: 'Новый пользователь зарегистрирован', time: '1 час назад' },
                      { type: 'success', text: 'Резервное копирование завершено', time: '2 часа назад' },
                    ].map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-purple-100">
                        <Icon
                          name={event.type === 'success' ? 'CheckCircle' : event.type === 'warning' ? 'AlertTriangle' : 'Info'}
                          size={20}
                          className={
                            event.type === 'success' ? 'text-green-500' :
                            event.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.text}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;