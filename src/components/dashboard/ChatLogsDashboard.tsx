import * as React from 'react';
import { Bot, User as UserIcon, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
}

export interface GuestSession {
  sessionId: string;
  lastActive: string;
  messages: ChatMessage[];
}

export interface UserSession {
  sessionId: string;
  lastActive: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  messages: ChatMessage[];
}

interface ChatLogsDashboardProps {
  initialGuestSessions: GuestSession[];
  initialUserSessions: UserSession[];
}

export function ChatLogsDashboard({ initialGuestSessions, initialUserSessions }: ChatLogsDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'guest' | 'user'>('guest');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>('');

  const currentSessions = activeTab === 'guest' ? initialGuestSessions : initialUserSessions;

  // Auto select first session of active tab if none selected or if selected is not in current list
  React.useEffect(() => {
    if (currentSessions.length > 0) {
      const exists = currentSessions.some(s => s.sessionId === selectedSessionId);
      if (!exists) {
        setSelectedSessionId(currentSessions[0].sessionId);
      }
    } else {
      setSelectedSessionId('');
    }
  }, [activeTab, currentSessions]);

  const selectedSession = currentSessions.find(s => s.sessionId === selectedSessionId);

  // Helper to format timestamp to "14:30 WIB, 12 Jun" or similar
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'Z'); // Add Z to treat sqlite CURRENT_TIMESTAMP (UTC) correctly
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      
      // Convert to local time format
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      
      return `${hours}:${minutes} WIB, ${day} ${month}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to get initials or clean session ID label
  const formatSessionLabel = (id: string) => {
    if (id.length > 8) {
      return `Session ...${id.slice(-8)}`;
    }
    return `Session ${id}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
      
      {/* Sidebar List: 4 cols on desktop */}
      <div className="md:col-span-5 lg:col-span-4 flex flex-col space-y-4 h-full border-r pr-0 md:pr-4">
        
        {/* Tab Controls */}
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'guest'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserIcon className="size-3.5" />
            Chat Guest ({initialGuestSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'user'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bot className="size-3.5" />
            Registered User ({initialUserSessions.length})
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
          {currentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MessageSquare className="size-8 mb-2 opacity-50" />
              <p className="text-sm">Tidak ada riwayat chat.</p>
            </div>
          ) : (
            currentSessions.map((session) => {
              const isSelected = session.sessionId === selectedSessionId;
              const lastMsg = session.messages[session.messages.length - 1];

              return (
                <button
                  key={session.sessionId}
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-primary/30 text-primary-foreground'
                      : 'bg-card hover:bg-muted/50 border-border'
                  }`}
                >
                  {activeTab === 'user' ? (
                    <img
                      src={(session as UserSession).user.avatar}
                      alt={(session as UserSession).user.name}
                      className="size-9 rounded-full shrink-0 object-cover border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://github.com/identicons/default.png';
                      }}
                    />
                  ) : (
                    <div className={`size-9 rounded-full shrink-0 flex items-center justify-center border ${
                      isSelected ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <UserIcon className="size-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {activeTab === 'user'
                          ? (session as UserSession).user.name
                          : formatSessionLabel(session.sessionId)}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                        <Calendar className="size-2.5" />
                        {formatTime(session.lastActive).split(' WIB,')[0]}
                      </span>
                    </div>
                    {activeTab === 'user' && (
                      <p className="text-xs text-muted-foreground truncate -mt-0.5 mb-1">
                        {(session as UserSession).user.email}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg ? lastMsg.content : 'Belum ada pesan'}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60 self-center shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Chat: 8 cols on desktop */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-card rounded-2xl border overflow-hidden">
        {selectedSession ? (
          <>
            {/* Header Detail Sesi */}
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {activeTab === 'user' ? (
                  <>
                    <img
                      src={(selectedSession as UserSession).user.avatar}
                      alt={(selectedSession as UserSession).user.name}
                      className="size-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {(selectedSession as UserSession).user.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {(selectedSession as UserSession).user.email}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="size-10 rounded-full flex items-center justify-center bg-muted border text-muted-foreground">
                      <UserIcon className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {formatSessionLabel(selectedSession.sessionId)}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate max-w-xs md:max-w-md">
                        Session ID: {selectedSession.sessionId}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-medium">
                  {selectedSession.messages.length} Pesan
                </span>
              </div>
            </div>

            {/* Bubble Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 scrollbar-thin">
              {selectedSession.messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm relative ${
                        isUser
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-accent text-accent-foreground border rounded-tl-none'
                      }`}
                    >
                      {/* Message Content */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Time Indicator */}
                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <MessageSquare className="size-12 mb-3 opacity-30 animate-pulse" />
            <h3 className="font-semibold text-base text-foreground mb-1">Pilih Sesi Chat</h3>
            <p className="text-sm max-w-xs">
              Silakan pilih salah satu sesi percakapan dari daftar di sebelah kiri untuk melihat detail log chat.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
