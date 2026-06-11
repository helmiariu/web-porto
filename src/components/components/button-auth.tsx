import { useState } from "react"
import { ArrowUpRight, LogOut } from "lucide-react" // Sesuaikan jika kamu memakai library icon lain

interface UserSession {
    name: string
    email: string
    avatar: string
}

interface SidebarAuthProps {
    user: UserSession | null
}

export function SidebarAuth({ user }: SidebarAuthProps) {
    const [isOpen, setIsOpen] = useState(false)

    // KONDISI 1: JIKA USER BELUM LOGIN (Menggunakan desain aslimu)
    if (!user) {
        return (
            <a href="/auth" className="block outline-none hover:opacity-90 transition-opacity">
                <div className="flex flex-col rounded-2xl border border-border bg-background p-1 shadow-sm w-full">
                    <div className="flex w-full items-center justify-between gap-4 p-3 pb-3 border-border/60">
                        <div className="flex flex-col text-left">
                            <p className="text-sm font-semibold text-foreground leading-tight">
                                Sign in
                            </p>
                            <span className="text-xs text-muted-foreground mt-1 leading-normal">
                                To access all features and personalization
                            </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                </div>
            </a>
        )
    }

    // KONDISI 2: JIKA USER SUDAH LOGIN (Menampilkan Avatar & Menu Logout)
    return (
        <div className="relative min-w-[260px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-background p-3 shadow-sm hover:bg-accent/50 transition-colors text-left focus:outline-none"
            >
                <img
                    src={user.avatar || "/placeholder-avatar.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-border/60"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">
                        {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-normal truncate">
                        {user.email}
                    </p>
                </div>
            </button>

            {/* Dropdown Menu Logout */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl border border-border bg-popover p-1.5 shadow-md animate-in slide-in-from-top-2 duration-150">
                    <a
                        href="/api/auth/logout"
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </a>
                </div>
            )}
        </div>
    )
}