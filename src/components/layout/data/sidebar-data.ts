export interface SubItem {
  title: string
  url: string
}

export interface NavLink {
  title: string
  url: string
  icon?: string
  badge?: string
  items?: never
}

export interface NavCollapsible {
  title: string
  icon?: string
  badge?: string
  items: SubItem[]
  url?: never
}

export type NavItem = NavLink | NavCollapsible

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface SidebarData {
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: {
    name: string
    logo: string
    plan: string
  }[]
  navGroups: NavGroup[]
}

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: 'https://github.com/satnaing.png',
  },
  teams: [
    {
      name: 'Helmiari Admin',
      logo: 'Command',
      plan: 'helmiari.my.id',
    },
    {
      name: 'Acme Inc',
      logo: 'GalleryVerticalEnd',
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: 'AudioWaveform',
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: 'LayoutDashboard',
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: 'ListTodo',
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: 'Package',
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: 'MessagesSquare',
        },
        {
          title: 'Users',
          url: '/users',
          icon: 'Users',
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: 'ShieldCheck',
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: 'Bug',
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: 'Settings',
          items: [
            {
              title: 'Profile',
              url: '/settings',
            },
            {
              title: 'Account',
              url: '/settings/account',
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
            },
            {
              title: 'Display',
              url: '/settings/display',
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: 'HelpCircle',
        },
      ],
    },
  ],
}
