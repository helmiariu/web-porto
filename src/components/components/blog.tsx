// src/components/blog.tsx

import {
  BadgeDollarSign,
  Bike,
  BookHeart,
  BriefcaseBusiness,
  Calendar,
  ClockIcon,
  Cpu,
  FlaskRound,
  HeartPulse,
  Scale,
  ChevronDown, // Tambahkan ini untuk icon panah dropdown
  Layers,      // Tambahkan ini untuk icon tombol kategori
} from "lucide-react";
import { Badge } from "@components/components/ui/badge";
import { Card, CardContent } from "@components/components/ui/card";
// Import komponen Dropdown Menu baru
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/components/ui/dropdown-menu";
import { Button } from "@components/components/ui/button"; // Menggunakan Button Shadcn sebagai trigger

const blogPosts = [
  {
    category: "Technology",
    title: "A beginner's guide to blockchain for engineers",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "5 min read",
    date: "Nov 20, 2024",
    image: "https://cdn.pixabay.com/photo/2021/08/27/18/50/water-6579313_1280.jpg",
  },
  {
    category: "Business",
    title: "Understanding React Server Components",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "8 min read",
    date: "Nov 18, 2024",
    image: "https://cdn.pixabay.com/photo/2020/02/13/06/49/seascape-4844697_1280.jpg",
  },
  {
    category: "Finance",
    title: "10 Useful Shadcn UI Components You Should Know",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "6 min read",
    date: "Nov 15, 2024",
    image: "https://cdn.pixabay.com/photo/2021/08/13/12/51/sea-6543041_1280.jpg",
  },
  {
    category: "Health",
    title: "Building a Personal Blog with Next.js",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "10 min read",
    date: "Nov 12, 2024",
    image: "https://cdn.pixabay.com/photo/2017/06/22/20/24/dewdrops-2432391_1280.jpg",
  },
  {
    category: "Lifestyle",
    title: "The Complete Guide to TypeScript for Beginners",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "12 min read",
    date: "Nov 10, 2024",
    image: "https://cdn.pixabay.com/photo/2013/07/21/13/00/rose-165819_1280.jpg",
  },
  {
    category: "Politics",
    title: "Optimizing Web Performance with Next.js",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "7 min read",
    date: "Nov 8, 2024",
    image: "https://cdn.pixabay.com/photo/2021/08/12/10/38/mountains-6540497_1280.jpg",
  },
  {
    category: "Science",
    title: "Deploying Full-Stack Apps on Vercel",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "9 min read",
    date: "Nov 5, 2024",
    image: "https://cdn.pixabay.com/photo/2016/03/27/18/54/technology-1283624_1280.jpg",
  },
  {
    category: "Sports",
    title: "Getting Started with Modern Web Development",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa consequatur minus dicta accusantium quos, ratione suscipit id adipisci voluptatibus. Nulla sint repudiandae fugiat tenetur dolores.",
    readTime: "11 min read",
    date: "Nov 2, 2024",
    image: "https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_1280.jpg",
  },
];

const categories = [
  { name: "Technology", totalPosts: 10, icon: Cpu },
  { name: "Business", totalPosts: 5, icon: BriefcaseBusiness },
  { name: "Finance", totalPosts: 8, icon: BadgeDollarSign },
  { name: "Health", totalPosts: 12, icon: HeartPulse },
  { name: "Lifestyle", totalPosts: 15, icon: BookHeart },
  { name: "Politics", totalPosts: 20, icon: Scale },
  { name: "Science", totalPosts: 25, icon: FlaskRound },
  { name: "Sports", totalPosts: 30, icon: Bike },
];

const Blog = () => {
  return (
    <div className="w-full space-y-8">

      {/* 1. STICKY NAVBAR DROPDOWN */}
      {/* Catatan: sticky top-0 akan menempel di paling atas viewport saat di-scroll */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 pb-4 pt-4 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Articles</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Explore our latest insights and tutorials</p>
        </div>

        {/* Dropdown Kategori */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 shadow-xs">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>Categories</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.name}
                className="flex items-center justify-between gap-2 cursor-pointer py-2"
              >
                <div className="flex items-center gap-2.5">
                  <category.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <Badge className="rounded-full bg-foreground/7 px-1.5 py-0 text-foreground text-[10px] h-5 flex items-center justify-center">
                  {category.totalPosts}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. LIST BLOG (Badge pindah ke dalam gambar khusus di mode HP) */}
      <div className="space-y-10">
        {/* --- API NEWS HIGHLIGHT SECTION --- */}
        {/* mb-8 atau mb-12 untuk memberikan jarak ke list blog utama kamu */}
        <div className="mb-10">
          {/* Header Kecil untuk Section News */}
          <div className="flex items-center gap-2 mb-4 px-0 sm:px-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Breaking News
            </h4>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>

          {/* KONTEN BERITA */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-0 sm:px-0 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-x-visible sm:pb-0">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="w-[88%] shrink-0 snap-center rounded-lg border bg-card p-0 pr-3 sm:pr-4 transition-hover hover:border-primary/50 sm:w-full flex gap-3 items-center overflow-hidden"
              >

                {/* PERBAIKAN 2: GAMBAR LANGSUNG MEPEET (Tanpa div pembungkus lagi) */}
                {/* Ukuran h-16 (64px) di HP & h-20 (80px) di desktop akan mengunci tinggi total container */}
                <img
                  alt="News"
                  className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 object-cover"
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60"
                  loading="lazy"
                />

                {/* PERBAIKAN 3: WADAH KONTEN TEKS */}
                {/* Ditambahkan py-1.5 agar teks memiliki sedikit jarak aman dari batas atas/bawah gambar */}
                <div className="flex-1 min-w-0 py-1.5">
                  {/* Sumber & Waktu Berita */}
                  <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground mb-0.5 -mt-0.5">
                    <span className="text-primary font-semibold">TechCrunch</span>
                    <span>•</span>
                    <span>5m ago</span>
                  </div>

                  {/* Judul Berita API */}
                  <h5 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2 leading-snug hover:text-primary cursor-pointer">
                    OpenAI Announces New Advanced AI Models for Everyday Developers
                  </h5>
                </div>

              </div>
            ))}

          </div>
        </div>
        {blogPosts.map((post) => (
          <Card
            className="flex flex-col overflow-hidden rounded-md border-none bg-card py-0 shadow-none sm:flex-row sm:items-center"
            key={post.title}
          >
            {/* --- WADAH GAMBAR --- */}
            <div className="relative aspect-video shrink-0 grow overflow-hidden rounded-lg sm:aspect-square sm:w-56">
              <img
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover"
                src={post.image}
                loading="lazy"
              />

              {/* BADGE KHUSUS HP (Sembunyi di layar sm ke atas) */}
              {/* Menggunakan bg-background/90 + backdrop-blur agar kontras di atas gambar */}
              <Badge className="absolute top-3 left-3 sm:hidden bg-background/90 dark:bg-background/80 text-foreground backdrop-blur-xs border-none shadow-xs text-[10px] font-medium py-1 px-2">
                {post.category}
              </Badge>
            </div>

            {/* --- WADAH KONTEN TEKS --- */}
            {/* Menjaga seluruh padding dan margin bawaan kamu tetap 100% sama */}
            <CardContent className="flex flex-col px-4 sm:px-0 pt-3 sm:pt-0 pb-1 sm:p-0 sm:pl-6">

              {/* BADGE KHUSUS LAPTOP/DESKTOP (Sembunyi di HP) */}
              <div className="hidden sm:flex items-center gap-6">
                <Badge className="bg-primary/5 text-primary shadow-none hover:bg-primary/5 text-[10px] sm:text-xs">
                  {post.category}
                </Badge>
              </div>

              {/* OPTIMASI JUDUL ARTIKEL */}
              {/* HANYA MENGUBAH: text-base (16px) menjadi text-lg (18px) di HP agar judul lebih tegas */}
              <h3 className="-mt-2 sm:mt-0 sm:mt-2 lg:mt-2 xl:mt-4 font-semibold tracking-tight leading-snug text-foreground text-lg lg:text-xl xl:text-[1.5rem]">
                {post.title}
              </h3>

              {/* OPTIMASI DESKRIPSI ARTIKEL */}
              {/* HANYA MENGUBAH: text-xs (12px) yang kekecilan menjadi text-sm (14px) di HP agar ramah di mata pembaca */}
              <p className="mt-2 lg:mt-1.5 text-muted-foreground leading-relaxed text-sm xl:text-base line-clamp-2 xl:line-clamp-3 text-ellipsis">
                {post.description}
              </p>

              {/* OPTIMASI METADATA (WAKTU & TANGGAL) */}
              {/* HANYA MENGUBAH: text-[11px] menjadi text-xs (12px) di HP agar proporsional dengan deskripsinya */}
              <div className="pb-3 mt-3 lg:mt-3 xl:mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium text-muted-foreground text-xs xl:text-sm">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5 shrink-0" /> {post.readTime}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" /> {post.date}
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default Blog;