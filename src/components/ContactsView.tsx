import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Contact {
  id: number;
  name: string;
  status: string;
  avatar: string;
  online: boolean;
}

interface ContactsViewProps {
  contacts: Contact[];
}

export default function ContactsView({ contacts }: ContactsViewProps) {
  return (
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
  );
}
