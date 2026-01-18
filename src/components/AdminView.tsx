import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface AdminStat {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

interface AdminViewProps {
  adminStats: AdminStat[];
}

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminView({ adminStats }: AdminViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      const response = await fetch(func2url.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_all_users' })
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };
  
  const handleBlockUser = async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch(func2url.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block_user',
          user_id: userId,
          blocked_by: 1,
          reason: 'Блокировка администратором'
        })
      });
      const data = await response.json();
      if (data.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnblockUser = async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch(func2url.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unblock_user',
          user_id: userId
        })
      });
      const data = await response.json();
      if (data.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
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

        <Card className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-purple-100 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Icon name="Users" size={24} className="text-purple-600" />
            Управление пользователями
          </h2>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-purple-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <div className="text-3xl">{user.avatar}</div>
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.isAdmin && (
                          <Badge className="bg-pink-500 text-white text-xs">
                            <Icon name="Shield" size={12} className="mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">Регистрация: {user.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.online ? (
                      <Badge className="bg-green-500 text-white">В сети</Badge>
                    ) : (
                      <Badge variant="outline">Оффлайн</Badge>
                    )}
                    {user.isBlocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockUser(user.id)}
                        disabled={loading}
                        className="rounded-full border-green-500 text-green-500 hover:bg-green-50"
                      >
                        <Icon name="Unlock" size={14} className="mr-1" />
                        Разблокировать
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBlockUser(user.id)}
                        disabled={loading || user.isAdmin}
                        className="rounded-full border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Icon name="Ban" size={14} className="mr-1" />
                        Блокировать
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        
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
  );
}