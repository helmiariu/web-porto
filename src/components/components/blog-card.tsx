// src/components/ui/CardBlog.tsx
import React from "react";
import { ClockIcon, Calendar } from "lucide-react";
import { Card, CardContent } from "@components/components/ui/card";
import { Badge } from "@components/components/ui/badge";

// Definisikan struktur data props yang dikirim dari Astro
interface CardBlogProps {
    postData: {
        title?: string;
        description?: string;
        category?: string;
        image?: string;
        readTime?: string;
        pubDate?: string | Date;
    };
}

export function CardBlog({ postData }: CardBlogProps) {
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
        <Card
            className="flex flex-col overflow-hidden rounded-md border-none bg-card py-0 shadow-none sm:flex-row sm:items-center"
            key={title}
        >
            {/* --- WADAH GAMBAR --- */}
            <div className="relative aspect-video shrink-0 grow overflow-hidden rounded-lg sm:aspect-square sm:w-56">
                <img
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                    src={image}
                    loading="lazy"
                />

                {/* BADGE KHUSUS HP (Sembunyi di layar sm ke atas) */}
                {/* Menggunakan bg-background/90 + backdrop-blur agar kontras di atas gambar */}
                <Badge className="absolute top-3 left-3 sm:hidden bg-background/90 dark:bg-background/80 text-foreground backdrop-blur-xs border-none shadow-xs text-[10px] font-medium py-1 px-2">
                    {category}
                </Badge>
            </div>

            {/* --- WADAH KONTEN TEKS --- */}
            {/* Menjaga seluruh padding dan margin bawaan kamu tetap 100% sama */}
            <CardContent className="flex flex-col px-4 sm:px-0 pt-3 sm:pt-0 pb-1 sm:p-0 sm:pl-6">

                {/* BADGE KHUSUS LAPTOP/DESKTOP (Sembunyi di HP) */}
                <div className="hidden sm:flex items-center gap-6">
                    <Badge className="bg-primary/5 text-primary shadow-none hover:bg-primary/5 text-[10px] sm:text-xs">
                        {category}
                    </Badge>
                </div>

                {/* OPTIMASI JUDUL ARTIKEL */}
                {/* HANYA MENGUBAH: text-base (16px) menjadi text-lg (18px) di HP agar judul lebih tegas */}
                <h3 className="-mt-2 sm:mt-0 sm:mt-2 lg:mt-2 xl:mt-4 font-semibold tracking-tight leading-snug text-foreground text-lg lg:text-xl xl:text-[1.5rem]">
                    {title}
                </h3>

                {/* OPTIMASI DESKRIPSI ARTIKEL */}
                {/* HANYA MENGUBAH: text-xs (12px) yang kekecilan menjadi text-sm (14px) di HP agar ramah di mata pembaca */}
                <p className="mt-2 lg:mt-1.5 text-muted-foreground leading-relaxed text-sm xl:text-base line-clamp-2 xl:line-clamp-3 text-ellipsis">
                    {description}
                </p>

                {/* OPTIMASI METADATA (WAKTU & TANGGAL) */}
                {/* HANYA MENGUBAH: text-[11px] menjadi text-xs (12px) di HP agar proporsional dengan deskripsinya */}
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
    );
}