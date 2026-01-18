import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import EmojiPicker from 'emoji-picker-react';
import func2url from '../../backend/func2url.json';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDesc, setChannelDesc] = useState('');
  const [channelEmoji, setChannelEmoji] = useState('📢');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleCreateChannel = async () => {
    if (!channelName.trim()) return;
    
    try {
      const response = await fetch(func2url.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_channel',
          name: channelName,
          description: channelDesc,
          avatar_emoji: channelEmoji,
          creator_id: 1,
          is_channel: true
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateChannel(false);
        setChannelName('');
        setChannelDesc('');
        setChannelEmoji('📢');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };
  
  return (
    <>
      <div className="w-96 bg-white/60 backdrop-blur-lg border-r border-purple-100 flex flex-col">
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Чаты
            </h1>
            <Button
              onClick={() => setShowCreateChannel(true)}
              size="sm"
              className="gradient-purple text-white rounded-full"
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
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

        <div className="p-6 border-t border-purple-100 bg-white/60 backdrop-blur-lg relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  setMessageInput(messageInput + emoji.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
          
          {selectedFile && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
              <Icon name="File" size={16} className="text-purple-600" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedFile(null)}
                className="h-6 w-6 p-0 rounded-full"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-100"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Icon name="Paperclip" size={20} />
            </Button>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Введите сообщение..."
              className="rounded-full border-purple-200 focus:border-purple-400 bg-white"
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-100"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
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
      
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Создать канал
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Эмодзи</label>
                <div className="flex gap-2">
                  {['📢', '🎨', '💻', '🚀', '💡', '🎯', '🌟', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setChannelEmoji(emoji)}
                      className={`text-3xl p-2 rounded-lg transition-all ${
                        channelEmoji === emoji ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Название канала</label>
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Введите название..."
                  className="rounded-2xl border-purple-200"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Input
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  placeholder="О чем ваш канал?"
                  className="rounded-2xl border-purple-200"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateChannel(false)}
                className="flex-1 rounded-full"
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreateChannel}
                className="flex-1 rounded-full gradient-purple text-white"
              >
                Создать
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}