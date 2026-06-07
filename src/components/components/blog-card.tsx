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
        <a href={url} className="block group w-full cursor-pointer">
            <Card
                className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card py-0 shadow-sm sm:flex-row sm:items-stretch transition-all duration-300 hover:shadow-md"
                key={title}
            >
                {/* --- WADAH GAMBAR --- */}
                {/* PERBAIKAN: 
              1. Hapus 'grow'.
              2. Tambah 'w-full' agar di HP gambarnya full margin.
              3. Atur lebar fixed untuk tablet (sm:w-48) dan desktop (lg:w-64).
            */}
                <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:w-48 sm:aspect-[4/3] lg:w-64 lg:aspect-video">
                    <img
                        alt={title}
                        /* Ubah scale-103 jadi scale-105 karena Tailwind bawaan tidak punya scale-103 */
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={image}
                        loading="lazy"
                    />

                    {/* BADGE KHUSUS HP (Sembunyi di layar sm ke atas) */}
                    <Badge className="absolute top-3 left-3 sm:hidden bg-background/90 dark:bg-background/80 text-foreground backdrop-blur-md border-none shadow-sm text-[10px] font-medium py-1 px-2 rounded-md">
                        {category}
                    </Badge>
                </div>

                {/* --- WADAH KONTEN TEKS --- */}
                <CardContent className="flex flex-col flex-1 p-4 sm:p-5 lg:p-6 gap-2 sm:gap-3">

                    {/* BADGE KHUSUS LAPTOP/DESKTOP (Sembunyi di HP) */}
                    <div className="hidden sm:flex items-center">
                        <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:bg-cyan-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                            {category}
                        </Badge>
                    </div>

                    {/* OPTIMASI JUDUL ARTIKEL */}
                    <h3 className="font-semibold tracking-tight leading-snug text-foreground text-lg sm:text-xl lg:text-2xl transition-colors group-hover:text-primary">
                        {title}
                    </h3>

                    {/* OPTIMASI DESKRIPSI ARTIKEL */}
                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base line-clamp-2 lg:line-clamp-3">
                        {description}
                    </p>

                    {/* OPTIMASI METADATA (WAKTU & TANGGAL) */}
                    <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 font-medium text-muted-foreground text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{readTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </a>
    );
}