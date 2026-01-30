import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Section = 'home' | 'chats' | 'groups' | 'channels' | 'videos' | 'music' | 'store' | 'profile' | 'calls' | 'admin';

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>('home');

  const menuItems = [
    { id: 'home' as Section, icon: 'Home', label: 'Главная' },
    { id: 'chats' as Section, icon: 'MessageCircle', label: 'Чаты' },
    { id: 'groups' as Section, icon: 'Users', label: 'Группы' },
    { id: 'channels' as Section, icon: 'Radio', label: 'Каналы' },
    { id: 'videos' as Section, icon: 'Video', label: 'Видео' },
    { id: 'music' as Section, icon: 'Music', label: 'Музыка' },
    { id: 'store' as Section, icon: 'ShoppingBag', label: 'Магазин' },
    { id: 'calls' as Section, icon: 'Phone', label: 'Звонки' },
    { id: 'profile' as Section, icon: 'User', label: 'Профиль' },
    { id: 'admin' as Section, icon: 'Shield', label: 'Админ' },
  ];

  const games = [
    { id: 1, title: 'Cyber Wars 2077', price: 1999, discount: 30, image: '🎮', category: 'Action' },
    { id: 2, title: 'Neon Racers', price: 899, discount: 50, image: '🏎️', category: 'Racing' },
    { id: 3, title: 'Space Odyssey', price: 2499, discount: 0, image: '🚀', category: 'Adventure' },
    { id: 4, title: 'Battle Royale X', price: 0, discount: 0, image: '⚔️', category: 'Shooter' },
    { id: 5, title: 'Puzzle Master', price: 499, discount: 20, image: '🧩', category: 'Puzzle' },
    { id: 6, title: 'Dark Dungeon', price: 1499, discount: 15, image: '🗡️', category: 'RPG' },
  ];

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-6xl font-bold neon-glow text-primary">Di-NEO</h1>
        <p className="text-xl text-muted-foreground">by Digiplay</p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Полнофункциональная платформа для общения, развлечений и игр
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.filter(item => item.id !== 'home').map((item) => (
          <Card
            key={item.id}
            className="group cursor-pointer transition-all hover:scale-105 hover:neon-border-subtle bg-card/50 backdrop-blur"
            onClick={() => setActiveSection(item.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon name={item.icon} size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{item.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold mb-6">Чаты</h2>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="cursor-pointer hover:bg-card/80 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                👤
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Пользователь {i}</h4>
                <p className="text-sm text-muted-foreground">Последнее сообщение...</p>
              </div>
              <Badge variant="secondary">2</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGroups = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold mb-6">Группы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:neon-border-subtle transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-3xl">
                  🎮
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Игровая группа {i}</h4>
                  <p className="text-sm text-muted-foreground">1.{i}K участников</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderChannels = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold mb-6">Каналы</h2>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                📢
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Канал новостей {i}</h4>
                <p className="text-xs text-muted-foreground">5.{i}K подписчиков</p>
              </div>
              <Button size="sm" variant="outline">Подписаться</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold mb-6">Видео</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden hover:neon-border-subtle transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-6xl">
              🎬
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold">Видео {i}</h4>
              <p className="text-sm text-muted-foreground">1{i}K просмотров</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMusic = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold mb-6">Музыка</h2>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-2xl">
                🎵
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Трек {i}</h4>
                <p className="text-sm text-muted-foreground">Исполнитель {i}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-primary">
                <Icon name="Play" size={20} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStore = () => (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Игровой магазин</h2>
        <Button className="neon-border">Загрузить игру</Button>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Поиск игр..." className="flex-1" />
        <Button variant="outline">Фильтры</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card
            key={game.id}
            className="group overflow-hidden hover:neon-border transition-all cursor-pointer"
          >
            <div className="aspect-video bg-gradient-to-br from-primary/30 to-background flex items-center justify-center text-8xl relative overflow-hidden">
              {game.image}
              {game.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground neon-glow">
                  -{game.discount}%
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">{game.category}</Badge>
                <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {game.title}
                </h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {game.discount > 0 ? (
                    <>
                      <span className="text-muted-foreground line-through text-sm">
                        {game.price} ₽
                      </span>
                      <span className="font-bold text-primary">
                        {Math.round(game.price * (1 - game.discount / 100))} ₽
                      </span>
                    </>
                  ) : game.price === 0 ? (
                    <span className="font-bold text-primary">Бесплатно</span>
                  ) : (
                    <span className="font-bold">{game.price} ₽</span>
                  )}
                </div>
                <Button size="sm" className="neon-border-subtle">
                  {game.price === 0 ? 'Скачать' : 'Купить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Купоны и скидки</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-primary/30 rounded-lg">
              <p className="font-mono font-bold text-primary">WELCOME50</p>
              <p className="text-sm text-muted-foreground">50% на первую покупку</p>
            </div>
            <div className="p-4 border border-primary/30 rounded-lg">
              <p className="font-mono font-bold text-primary">GAMER30</p>
              <p className="text-sm text-muted-foreground">30% на все игры</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCalls = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold mb-6">Звонки</h2>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:bg-card/80 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  📞
                </div>
                <div>
                  <h4 className="font-semibold">Контакт {i}</h4>
                  <p className="text-xs text-muted-foreground">Вчера в 1{i}:30</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Icon name="Phone" size={16} />
                </Button>
                <Button size="sm" variant="outline">
                  <Icon name="Video" size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-fade-in space-y-6">
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-5xl">
              👤
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Игрок #1337</h2>
                <p className="text-muted-foreground">player@di-neo.com</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Редактировать</Button>
                <Button variant="outline">Настройки</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">24</p>
            <p className="text-sm text-muted-foreground">Игр в библиотеке</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">156</p>
            <p className="text-sm text-muted-foreground">Часов игры</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">89</p>
            <p className="text-sm text-muted-foreground">Достижений</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-bold mb-6">Администрирование</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:neon-border-subtle transition-all cursor-pointer">
          <CardContent className="p-6">
            <Icon name="Users" size={32} className="text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Управление пользователями</h3>
            <p className="text-sm text-muted-foreground">1,234 активных пользователей</p>
          </CardContent>
        </Card>
        <Card className="hover:neon-border-subtle transition-all cursor-pointer">
          <CardContent className="p-6">
            <Icon name="ShoppingBag" size={32} className="text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Модерация магазина</h3>
            <p className="text-sm text-muted-foreground">5 игр на проверке</p>
          </CardContent>
        </Card>
        <Card className="hover:neon-border-subtle transition-all cursor-pointer">
          <CardContent className="p-6">
            <Icon name="MessageCircle" size={32} className="text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Модерация контента</h3>
            <p className="text-sm text-muted-foreground">12 жалоб на рассмотрении</p>
          </CardContent>
        </Card>
        <Card className="hover:neon-border-subtle transition-all cursor-pointer">
          <CardContent className="p-6">
            <Icon name="Settings" size={32} className="text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Настройки платформы</h3>
            <p className="text-sm text-muted-foreground">Конфигурация системы</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return renderHome();
      case 'chats': return renderChats();
      case 'groups': return renderGroups();
      case 'channels': return renderChannels();
      case 'videos': return renderVideos();
      case 'music': return renderMusic();
      case 'store': return renderStore();
      case 'calls': return renderCalls();
      case 'profile': return renderProfile();
      case 'admin': return renderAdmin();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveSection('home')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold animate-neon-pulse">
              DN
            </div>
            <h1 className="text-2xl font-bold neon-glow">Di-NEO</h1>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection(item.id)}
                className={activeSection === item.id ? 'neon-border-subtle' : ''}
              >
                <Icon name={item.icon} size={16} className="mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm">Войти</Button>
        </div>
      </nav>

      <div className="lg:hidden border-b border-border overflow-x-auto">
        <div className="flex gap-2 p-2 min-w-max">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(item.id)}
              className={activeSection === item.id ? 'neon-border-subtle' : ''}
            >
              <Icon name={item.icon} size={16} className="mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {renderSection()}
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Di-NEO by Digiplay. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}