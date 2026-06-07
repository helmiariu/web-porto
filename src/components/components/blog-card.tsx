// src/components/ui/CardBlog.tsx
import React from "react";
import { ClockIcon, Calendar } from "lucide-react";
import { Card, CardContent } from "@components/components/ui/card";
import { Badge } from "@components/components/ui/badge";

// Definisikan struktur data props termasuk PROP URL BARU
interface CardBlogProps {
    postData: {
        title?: string;
        description?: string;
        category?: string;
        image?: string;
        readTime?: string;
        pubDate?: string | Date;
    };
    url: string; // <-- Tambahan properti URL wajib
}

export function CardBlog({ postData, url }: CardBlogProps) {
    // Nilai cadangan (fallback) jika ada frontmatter yang kosong di file markdown
    const {
        title = "Untitled Post",
        description = "No description available.",
        category = "General",
        image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
        readTime = "5 min read",
        pubDate = new Date(),
    } = postData || {};

    // Format tanggal dinamis dari markdown agar serasi dengan teks biasa
    const formattedDate = new Date(pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        /* 
          PERBAIKAN 1: Bungkus dengan tag <a> dan beri kelas 'group' 
          agar kita bisa mendeteksi hover pada seluruh area kartu.
        */
        <a href={url} className="block group w-full cursor-pointer ">
            <Card
                className="flex flex-col overflow-hidden rounded-md border-none bg-card py-0 shadow-none sm:flex-row sm:items-center transition-transform duration-300 group-hover:scale-103"
                key={title}
            >
                {/* --- WADAH GAMBAR --- */}
                <div className="relative aspect-video shrink-0 grow overflow-hidden rounded-lg sm:aspect-square sm:w-56">
                    {/* 
                      PERBAIKAN 2: Tambahkan efek zoom-in pada gambar saat kartu di-hover 
                      (transition-transform duration-300 group-hover:scale-103)
                    */}
                    <img
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                        src={image}
                        loading="lazy"
                    />

                    {/* BADGE KHUSUS HP (Sembunyi di layar sm ke atas) */}
                    <Badge className="absolute top-3 left-3 sm:hidden bg-background/90 dark:bg-background/80 text-foreground backdrop-blur-xs border-none shadow-xs text-[10px] font-medium py-1 px-2">
                        {category}
                    </Badge>
                </div>

                {/* --- WADAH KONTEN TEKS --- */}
                <CardContent className="flex flex-col px-4 sm:px-0 pt-3 sm:pt-0 pb-1 sm:p-0 sm:px-4 sm:pr-8">

                    {/* BADGE KHUSUS LAPTOP/DESKTOP (Sembunyi di HP) */}
                    <div className="hidden sm:flex items-center gap-6">
                        <Badge className="bg-primary/5 text-primary shadow-none hover:bg-primary/5 text-[10px] sm:text-xs">
                            {category}
                        </Badge>
                    </div>

                    {/* OPTIMASI JUDUL ARTIKEL */}
                    {/* 
                      PERBAIKAN 3: Tambahkan efek perubahan warna teks judul saat kartu di-hover 
                      (transition-colors group-hover:text-primary)
                    */}
                    <h3 className="-mt-2 sm:mt-0 sm:mt-2 lg:mt-2 xl:mt-2   font-semibold tracking-tight leading-snug text-foreground text-lg lg:text-xl xl:text-[1.5rem] transition-colors group-hover:text-primary">
                        {title}
                    </h3>

                    {/* OPTIMASI DESKRIPSI ARTIKEL */}
                    <p className="mt-2 lg:mt-1.5 text-muted-foreground leading-relaxed text-sm xl:text-base line-clamp-2 xl:line-clamp-3 text-ellipsis">
                        {description}
                    </p>

                    {/* OPTIMASI METADATA (WAKTU & TANGGAL) */}
                    <div className="pb-3 mt-3 lg:mt-3 xl:mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium text-muted-foreground text-xs xl:text-sm">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0" /> {readTime}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" /> {formattedDate}
                        </div>
                    </div>

                </CardContent>
            </Card>
        </a>
    );
}