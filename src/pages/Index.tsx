import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type Section = 'home' | 'videos' | 'music' | 'store' | 'profile' | 'short_videos' | 'images';
type User = { id: number; email: string; username: string; avatar_url?: string } | null;
type ContentItem = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url?: string;
  category?: string;
  price: number;
  discount: number;
  downloads: number;
  views: number;
  author?: string;
  created_at: string;
};

const AUTH_API = 'https://functions.poehali.dev/157c6356-a9f0-48bd-ad63-3d7459caaf2f';
const CONTENT_API = 'https://functions.poehali.dev/084be2f6-df68-486f-ac93-d7b0d9dadd3a';

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [user, setUser] = useState<User>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<string>('game');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [authForm, setAuthForm] = useState({ email: '', username: '', password: '' });
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    file: null as File | null
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [activeSection]);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = authMode === 'register'
        ? { action: 'register', ...authForm }
        : { action: 'login', email: authForm.email, password: authForm.password };

      const res = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setShowAuthModal(false);
        toast({ title: authMode === 'register' ? 'Регистрация успешна!' : 'Вход выполнен!' });
        setAuthForm({ email: '', username: '', password: '' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить запрос', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast({ title: 'Вы вышли из аккаунта' });
  };

  const loadContent = async () => {
    try {
      const typeMap: Record<Section, string | null> = {
        home: null,
        store: 'game',
        music: 'music',
        videos: 'video',
        short_videos: 'short_video',
        images: 'image',
        profile: null
      };
      
      const type = typeMap[activeSection];
      const url = type ? `${CONTENT_API}?type=${type}` : CONTENT_API;
      
      const res = await fetch(url);
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Требуется авторизация', variant: 'destructive' });
      return;
    }
    if (!uploadForm.file) {
      toast({ title: 'Выберите файл', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const res = await fetch(CONTENT_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            type: uploadType,
            title: uploadForm.title,
            description: uploadForm.description,
            category: uploadForm.category,
            price: uploadForm.price,
            file_data: base64,
            file_name: uploadForm.file!.name
          })
        });

        const data = await res.json();
        if (res.ok) {
          toast({ title: 'Контент загружен успешно!' });
          setShowUploadModal(false);
          setUploadForm({ title: '', description: '', category: '', price: 0, file: null });
          loadContent();
        } else {
          toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
        }
      };
      reader.readAsDataURL(uploadForm.file);
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'home' as Section, icon: 'Home', label: 'Главная' },
    { id: 'videos' as Section, icon: 'Video', label: 'Видео' },
    { id: 'short_videos' as Section, icon: 'Film', label: 'Shorts' },
    { id: 'music' as Section, icon: 'Music', label: 'Музыка' },
    { id: 'images' as Section, icon: 'Image', label: 'Картинки' },
    { id: 'store' as Section, icon: 'ShoppingBag', label: 'Игры' },
    { id: 'profile' as Section, icon: 'User', label: 'Профиль' },
  ];

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-6xl font-bold neon-glow text-primary">Di-NEO</h1>
        <p className="text-xl text-muted-foreground">by Digiplay</p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Платформа для загрузки и обмена контентом: игры, музыка, видео, shorts, картинки
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

  const renderContentGrid = (type: string, emptyMessage: string) => (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{menuItems.find(m => m.id === activeSection)?.label}</h2>
        {user && (
          <Button 
            className="neon-border" 
            onClick={() => { setUploadType(type); setShowUploadModal(true); }}
          >
            <Icon name="Upload" size={20} className="mr-2" />
            Загрузить
          </Button>
        )}
      </div>

      {content.length === 0 ? (
        <Card className="p-12">
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:neon-border transition-all cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-background flex items-center justify-center text-6xl relative overflow-hidden">
                {type === 'game' && '🎮'}
                {type === 'music' && '🎵'}
                {type === 'video' && '🎬'}
                {type === 'short_video' && '📱'}
                {type === 'image' && '🖼️'}
                {item.discount > 0 && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground neon-glow">
                    -{item.discount}%
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  {item.category && <Badge variant="outline" className="mb-2">{item.category}</Badge>}
                  <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">by {item.author || 'Unknown'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.price === 0 ? (
                      <span className="font-bold text-primary">Бесплатно</span>
                    ) : (
                      <span className="font-bold">{item.price} ₽</span>
                    )}
                  </div>
                  <Button size="sm" className="neon-border-subtle" onClick={() => window.open(item.file_url, '_blank')}>
                    {type === 'game' ? 'Скачать' : 'Открыть'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="animate-fade-in space-y-6">
      {user ? (
        <>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-5xl">
                  👤
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{user.username}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>Выйти</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-2xl font-bold">Мой контент</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.filter(c => c.user_id === user.id).map(item => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Войдите, чтобы увидеть профиль</p>
            <Button onClick={() => setShowAuthModal(true)}>Войти</Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return renderHome();
      case 'store': return renderContentGrid('game', 'Игры пока не загружены');
      case 'music': return renderContentGrid('music', 'Музыка пока не загружена');
      case 'videos': return renderContentGrid('video', 'Видео пока не загружены');
      case 'short_videos': return renderContentGrid('short_video', 'Shorts пока не загружены');
      case 'images': return renderContentGrid('image', 'Картинки пока не загружены');
      case 'profile': return renderProfile();
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

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.username}</span>
              <Button variant="outline" size="sm" onClick={() => setActiveSection('profile')}>
                <Icon name="User" size={16} />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
              Войти
            </Button>
          )}
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
          <p>© 2024 Di-NEO by Digiplay. Платформа для обмена контентом.</p>
        </div>
      </footer>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Вход' : 'Регистрация'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>
            {authMode === 'register' && (
              <div>
                <Label>Username</Label>
                <Input
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <Label>Пароль</Label>
              <Input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить {uploadType === 'game' ? 'игру' : uploadType === 'music' ? 'музыку' : uploadType === 'video' ? 'видео' : uploadType === 'short_video' ? 'короткое видео' : 'картинку'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Категория</Label>
              <Input
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Цена (₽)</Label>
              <Input
                type="number"
                value={uploadForm.price}
                onChange={(e) => setUploadForm({ ...uploadForm, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Файл</Label>
              <Input
                type="file"
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
