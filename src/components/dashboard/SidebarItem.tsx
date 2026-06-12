import * as React from 'react'
import { useStore } from '@nanostores/react'
import { $sidebarOpen } from '../../stores/sidebar'
import { ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface SubItem {
  title: string
  url: string
}

interface SidebarItemProps {
  item: {
    title: string
    url?: string
    badge?: string
    icon?: string
    items?: SubItem[]
  }
  activeRoute: string
}

export function SidebarItem({ item, activeRoute }: SidebarItemProps) {
  const isSidebarOpen = useStore($sidebarOpen)
  const Icon = item.icon ? (Icons as any)[item.icon] : null
  const hasChildren = !!item.items

  const isChildActive = item.items?.some((sub) => activeRoute === sub.url)
  const isActive = item.url ? activeRoute === item.url : isChildActive

  // 1. Collapsed Sidebar with Submenu -> Dropdown to the right
  if (!isSidebarOpen && hasChildren) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-10 p-0 mx-auto flex items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            )}
            title={item.title}
          >
            {Icon && <Icon className="size-4 shrink-0" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56">
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items?.map((sub) => {
            const isSubActive = activeRoute === sub.url
            return (
              <DropdownMenuItem key={sub.title} asChild>
                <a
                  href={sub.url}
                  className={cn(
                    "w-full cursor-pointer flex items-center justify-between",
                    isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  )}
                >
                  {sub.title}
                </a>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // 2. Normal Link Item (Non-collapsible or Expanded Sidebar)
  if (!hasChildren) {
    return (
      <a
        href={item.url}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          !isSidebarOpen && "justify-center w-10 h-10 mx-auto p-0",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/85"
        )}
      >
        {Icon && <Icon className="size-4 shrink-0" />}
        {isSidebarOpen && <span className="truncate">{item.title}</span>}
        {isSidebarOpen && item.badge && (
          <span className="ms-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {item.badge}
          </span>
        )}
      </a>
    )
  }

  // 3. Expanded Sidebar with Submenu -> details/summary layout
  return (
    <details className="group/collapsible" open={isChildActive}>
      <summary className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{item.title}</span>
        <ChevronRight className="ms-auto size-4 transition-transform duration-200 group-open/collapsible:rotate-90" />
      </summary>
      <ul className="mt-1 ps-8 space-y-0.5">
        {item.items?.map((sub) => {
          const isSubActive = activeRoute === sub.url
          return (
            <li key={sub.title}>
              <a
                href={sub.url}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isSubActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/75"
                )}
              >
                <span>{sub.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </details>
  )
}
