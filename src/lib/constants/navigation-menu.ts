import {
  Home,
  Briefcase,
  FileText,
  MessageCircle,
  Wrench,
  Rotate3d,
  Gauge,
  Menu,
} from "@lucide/astro";

export type SidebarMenu = {
  groupLabel: string;
  menus: {
    href: string;
    label: string;
    icon?: any; // Astro component
  }[];
};

export const publicDashboardMenu: SidebarMenu[] = [
  {
    groupLabel: "",
    menus: [
      { href: "/", label: "Home", icon: Home },
      { href: "/project", label: "Project", icon: Briefcase },
      { href: "/3Dgallery", label: "3D Gallery", icon: Rotate3d },
      { href: "/monitoring", label: "Monitoring", icon: Gauge },
      { href: "/blog", label: "Blog", icon: FileText },
    ],
  },
  {
    groupLabel: "Application",
    menus: [
      // { href: "/ai", label: "AI" },
      { href: "/chat", label: "Chat", icon: MessageCircle },
    ],
  },
  {
    groupLabel: "Playground",
    menus: [
      { href: "/tools", label: "Tools", icon: Wrench },
      // { href: "/roadmap", label: "Roadmap" },
    ],
  },
];

export const mainNavData = (isHaveToken: boolean) => [
  { href: "/", label: "Home", icon: Home },
  { href: "/project", label: "Project", icon: Briefcase },
  { href: "/3Dgallery", label: "3D Gallery", icon: Rotate3d },
  { href: "/monitoring", label: "Monitoring", icon: Gauge },
  // {
  //   href: isHaveToken ? "/profile" : "/auth",
  //   label: isHaveToken ? "Profile" : "Login",
  // },
];
