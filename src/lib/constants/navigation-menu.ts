export type SidebarMenu = {
  groupLabel: string;
  menus: {
    href: string;
    label: string;
  }[];
};

export const publicDashboardMenu: SidebarMenu[] = [
  {
    groupLabel: "",
    menus: [
      { href: "/", label: "Home" },
      { href: "/project", label: "Project" },
      { href: "/3Dgallery", label: "3D Gallery" },
      { href: "/monitoring", label: "Monitoring" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    groupLabel: "Application",
    menus: [
      // { href: "/ai", label: "AI" },
      { href: "/chat", label: "Chat" },
    ],
  },
  {
    groupLabel: "Playground",
    menus: [
      { href: "/tools", label: "Tools" },
      // { href: "/roadmap", label: "Roadmap" },
    ],
  },
];

export const mainNavData = (isHaveToken: boolean) => [
  { href: "/", label: "Home" },
  { href: "/project", label: "Project" },
  { href: "/blog", label: "Blog" },
  {
    href: isHaveToken ? "/profile" : "/auth",
    label: isHaveToken ? "Profile" : "Login",
  },
];
