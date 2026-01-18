import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminStat {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

interface AdminViewProps {
  adminStats: AdminStat[];
}

export default function AdminView({ adminStats }: AdminViewProps) {
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
