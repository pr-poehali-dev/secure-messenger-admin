import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface UserRating {
  messagesSent: number;
  messagesReceived: number;
  callsMade: number;
  filesShared: number;
  ratingScore: number;
  lastActivity: string;
}

export default function ProfileView() {
  const [rating, setRating] = useState<UserRating | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  
  useEffect(() => {
    loadRating();
  }, []);
  
  const loadRating = async () => {
    try {
      const response = await fetch(func2url.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_user_rating', user_id: 1 })
      });
      const data = await response.json();
      setRating(data);
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };
  
  const handleCreateInvite = async () => {
    try {
      const response = await fetch(func2url.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_invite', inviter_id: 1 })
      });
      const data = await response.json();
      if (data.inviteCode) {
        setInviteCode(data.inviteCode);
        setShowInvite(true);
      }
    } catch (error) {
      console.error('Error creating invite:', error);
    }
  };
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
  };
  
  const getRatingLevel = (score: number) => {
    if (score >= 1000) return { level: 'Легенда', color: 'from-yellow-500 to-orange-500' };
    if (score >= 500) return { level: 'Мастер', color: 'from-purple-500 to-pink-500' };
    if (score >= 200) return { level: 'Эксперт', color: 'from-blue-500 to-purple-500' };
    return { level: 'Новичок', color: 'from-green-500 to-blue-500' };
  };
  
  return (
    <div className="flex-1 bg-white/40 backdrop-blur-sm p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
          Профиль
        </h1>
        <Card className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100 mb-6">
          <div className="flex flex-col items-center mb-8">
            <div className="text-8xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-2">Иван Иванов</h2>
            <p className="text-muted-foreground mb-4">@ivan_ivanov</p>
            <Badge className="gradient-purple text-white">В сети</Badge>
          </div>
          
          {rating && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">РЕЙТИНГ АКТИВНОСТИ</h3>
                <Badge className={`gradient-${getRatingLevel(rating.ratingScore).color.includes('yellow') ? 'pink' : 'purple'} text-white`}>
                  {getRatingLevel(rating.ratingScore).level}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Send" size={18} className="text-purple-600" />
                    <span className="text-sm text-muted-foreground">Отправлено</span>
                  </div>
                  <p className="text-2xl font-bold">{rating.messagesSent}</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="MessageSquare" size={18} className="text-blue-600" />
                    <span className="text-sm text-muted-foreground">Получено</span>
                  </div>
                  <p className="text-2xl font-bold">{rating.messagesReceived}</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Phone" size={18} className="text-green-600" />
                    <span className="text-sm text-muted-foreground">Звонков</span>
                  </div>
                  <p className="text-2xl font-bold">{rating.callsMade}</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Paperclip" size={18} className="text-orange-600" />
                    <span className="text-sm text-muted-foreground">Файлов</span>
                  </div>
                  <p className="text-2xl font-bold">{rating.filesShared}</p>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-r ${getRatingLevel(rating.ratingScore).color} text-white text-center">
                <p className="text-sm opacity-90 mb-1">Общий рейтинг</p>
                <p className="text-4xl font-bold">{rating.ratingScore}</p>
              </div>
            </div>
          )}
          
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
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">ПРИГЛАСИТЬ ДРУЗЕЙ</h3>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="UserPlus" size={24} className="text-pink-600" />
                  <div>
                    <p className="font-semibold">Поделитесь мессенджером</p>
                    <p className="text-sm text-muted-foreground">Создайте инвайт-код для друзей</p>
                  </div>
                </div>
                
                {showInvite ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-white border-2 border-pink-300">
                      <code className="flex-1 text-lg font-mono font-bold text-pink-600">{inviteCode}</code>
                      <Button
                        size="sm"
                        onClick={copyInviteCode}
                        className="rounded-full gradient-pink text-white"
                      >
                        <Icon name="Copy" size={16} className="mr-1" />
                        Копировать
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCreateInvite}
                      className="w-full rounded-full"
                    >
                      Создать новый код
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleCreateInvite}
                    className="w-full rounded-full gradient-pink text-white"
                  >
                    <Icon name="Gift" size={18} className="mr-2" />
                    Генерировать инвайт-код
                  </Button>
                )}
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
  );
}