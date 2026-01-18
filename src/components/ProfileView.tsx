import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ProfileView() {
  return (
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
  );
}
