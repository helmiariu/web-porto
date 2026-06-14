import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Bell, Folder, Settings, Bot, User, Info, Check } from 'lucide-react'

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

export function NotificationDropdown() {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [hasUnread, setHasUnread] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // Helper untuk format waktu relatif
  const getRelativeTime = (utcDateStr: string) => {
    try {
      const cleanStr = utcDateStr.replace(" ", "T") + "Z";
      const date = new Date(cleanStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffSec < 60) return "Baru saja";
      if (diffMin < 60) return `${diffMin}m yang lalu`;
      if (diffHr < 24) return `${diffHr}j yang lalu`;
      return `${diffDay}h yang lalu`;
    } catch (e) {
      return utcDateStr;
    }
  };

  // Helper mendapatkan icon berdasarkan tipe aktivitas
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'admin_create_album':
      case 'admin_upload_file':
      case 'admin_delete_file':
      case 'admin_update_album_metadata':
        return <Folder className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'user_login':
        return <User className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'admin_create_software':
      case 'admin_update_software':
      case 'admin_delete_software':
        return <Settings className="h-4 w-4 text-violet-500 shrink-0" />;
      case 'ai_chat':
        return <Bot className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/admin/activities');
      if (res.ok) {
        const data = (await res.json()) as Activity[];
        setActivities(data);

        // Cek apakah ada notifikasi baru dibanding yang terakhir dibaca
        const lastRead = localStorage.getItem('site:notifications:lastRead');
        if (data.length > 0) {
          const latestTime = new Date(data[0].createdAt.replace(" ", "T") + "Z").getTime();
          if (!lastRead || latestTime > parseInt(lastRead)) {
            setHasUnread(true);
          }
        }
      }
    } catch (e) {
      console.warn("Gagal mengambil log aktivitas untuk bel notifikasi:", e);
    }
  };

  React.useEffect(() => {
    fetchActivities();
    
    // Polling setiap 30 detik untuk notifikasi baru
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Saat dropdown dibuka, tandai semua sebagai telah dibaca
  React.useEffect(() => {
    if (open && activities.length > 0) {
      const latestTime = new Date(activities[0].createdAt.replace(" ", "T") + "Z").getTime();
      localStorage.setItem('site:notifications:lastRead', latestTime.toString());
      setHasUnread(false);
    }
  }, [open, activities]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent hover:text-accent-foreground rounded-full h-9 w-9">
          <Bell className="h-[18px] w-[18px]" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[420px] overflow-y-auto" align="end" forceMount>
        <DropdownMenuLabel className="font-semibold flex items-center justify-between py-2.5 px-3">
          <span>Aktivitas Sistem Terbaru</span>
          <span className="text-[10px] bg-primary/10 text-primary font-mono px-2 py-0.5 rounded-full">
            Realtime
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="py-1">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Tidak ada aktivitas terbaru.
            </div>
          ) : (
            activities.map((act) => (
              <DropdownMenuItem key={act.id} className="flex gap-3 items-start py-2.5 px-3 hover:bg-muted/50 cursor-default focus:bg-muted/60 transition-colors">
                {getActivityIcon(act.type)}
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-foreground leading-normal font-medium">{act.description}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{getRelativeTime(act.createdAt)}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
