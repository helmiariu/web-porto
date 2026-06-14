import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Eye, Users, Bot, UserPlus, Folder, Settings, Info, Activity } from 'lucide-react'

interface ActivityLog {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

interface PageviewStat {
  pagePath: string;
  count: number;
}

interface CountryStat {
  country: string;
  count: number;
}

interface WeeklyChartData {
  date: string;
  count: number;
}

interface AnalyticsData {
  totalPageviews: number;
  uniqueVisitors: number;
  totalAiSessions: number;
  registeredUsers: number;
  topPages: PageviewStat[];
  topCountries: CountryStat[];
  weeklyPageviews: WeeklyChartData[];
  recentActivities: ActivityLog[];
}

export function DashboardTabs() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const result = (await res.json()) as AnalyticsData;
        setData(result);
      } else {
        setError('Gagal memuat data dari server.');
      }
    } catch (err) {
      setError('Kesalahan jaringan saat memuat data analitik.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'admin_create_album':
      case 'admin_upload_file':
      case 'admin_delete_file':
      case 'admin_update_album_metadata':
        return <Folder className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'user_login':
        return <Users className="h-4 w-4 text-blue-500 shrink-0" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 border border-dashed rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Menghitung analitik database D1...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 border border-dashed border-red-200 bg-red-50/10 rounded-xl text-center">
        <p className="text-sm text-red-600 font-semibold">{error || 'Gagal memuat analitik.'}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-3 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Cari nilai maksimum chart untuk kalkulasi tinggi bar
  const maxChartCount = Math.max(...data.weeklyPageviews.map(d => d.count), 1);

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview" className="cursor-pointer">Overview</TabsTrigger>
        <TabsTrigger value="analytics" className="cursor-pointer">Analytics</TabsTrigger>
        <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Pageviews Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pageviews</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPageviews.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground">Kunjungan halaman HTML terakumulasi</p>
            </CardContent>
          </Card>

          {/* Unique Visitors Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground">Kombinasi unik User-Agent & Negara</p>
            </CardContent>
          </Card>

          {/* AI Chats Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Chat Sessions</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalAiSessions.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground">Sesi percakapan terdaftar di D1</p>
            </CardContent>
          </Card>

          {/* Registered Users Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.registeredUsers.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground">Pengguna yang melakukan login via OAuth</p>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          {/* Overview Chart Card */}
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Pageviews 7 Hari Terakhir</CardTitle>
              <CardDescription>Grafik harian kunjungan halaman web portfolio.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-end justify-between border-t border-dashed pt-6 px-6 pb-2 gap-2">
              {data.weeklyPageviews.map((day) => {
                const heightPercent = (day.count / maxChartCount) * 100;
                const dateObj = new Date(day.date);
                const dayLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
                const dateLabel = dateObj.toLocaleDateString('id-ID', { day: 'numeric' });

                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full flex items-end h-[160px] justify-center bg-muted/10 rounded p-1 relative">
                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-[10px] py-0.5 px-2 rounded pointer-events-none font-mono">
                        {day.count} views
                      </span>
                      <div 
                        className="w-full sm:w-8 bg-primary rounded-t transition-all duration-500 ease-out group-hover:bg-primary/80" 
                        style={{ height: `${Math.max(heightPercent, 3)}%` }}
                      ></div>
                    </div>
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[10px] font-semibold text-foreground">{dayLabel}</span>
                      <span className="text-[9px] text-muted-foreground font-mono mt-0.5">{dateLabel}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Log tindakan sistem dan pengguna paling anyar.</CardDescription>
            </CardHeader>
            <CardContent className="border-t border-dashed pt-4">
              <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                {data.recentActivities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Belum ada aktivitas tercatat.</p>
                ) : (
                  data.recentActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 text-xs leading-normal">
                      <div className="mt-0.5">{getActivityIcon(act.type)}</div>
                      <div className="flex-1 space-y-0.5">
                        <p className="font-medium text-foreground">{act.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{getRelativeTime(act.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          
          {/* Top Visited Pages Card */}
          <Card>
            <CardHeader>
              <CardTitle>Halaman Terpopuler</CardTitle>
              <CardDescription>Halaman HTML yang paling banyak menerima kunjungan.</CardDescription>
            </CardHeader>
            <CardContent className="border-t border-dashed pt-4">
              <div className="space-y-3.5">
                {data.topPages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Data halaman belum terekam.</p>
                ) : (
                  data.topPages.map((page, index) => (
                    <div key={page.pagePath} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="font-semibold truncate max-w-[200px]" title={page.pagePath}>
                          {page.pagePath}
                        </span>
                      </div>
                      <span className="text-xs bg-muted px-2.5 py-1 rounded font-mono font-medium shrink-0">
                        {page.count.toLocaleString('id-ID')} views
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries Card */}
          <Card>
            <CardHeader>
              <CardTitle>Asal Negara Pengunjung</CardTitle>
              <CardDescription>Distribusi geografis pengunjung berdasarkan deteksi Cloudflare.</CardDescription>
            </CardHeader>
            <CardContent className="border-t border-dashed pt-4">
              <div className="space-y-3.5">
                {data.topCountries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Data negara belum terekam.</p>
                ) : (
                  data.topCountries.map((c, index) => (
                    <div key={c.country} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="font-semibold">{c.country}</span>
                      </div>
                      <span className="text-xs bg-muted px-2.5 py-1 rounded font-mono font-medium shrink-0">
                        {c.count.toLocaleString('id-ID')} kunjungan
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </TabsContent>
    </Tabs>
  )
}
