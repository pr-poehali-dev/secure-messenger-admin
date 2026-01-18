import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

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

interface ChatViewProps {
  chats: Chat[];
  messages: Message[];
  selectedChat: number;
  messageInput: string;
  setSelectedChat: (id: number) => void;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
}

export default function ChatView({
  chats,
  messages,
  selectedChat,
  messageInput,
  setSelectedChat,
  setMessageInput,
  handleSendMessage
}: ChatViewProps) {
  return (
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
  );
}
