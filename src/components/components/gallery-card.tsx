// src/components/components/gallery-card.tsx
"use client"; // Pastikan directive ini berada di baris paling atas

import * as React from "react";
import { Rotate3d } from "lucide-react";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@components/components/gallery/carousel";
import { Progress } from "@components/components/gallery/progress";

// 1. OPTIMASI UTAMA: Hapus import statis, ubah menjadi DYNAMIC IMPORT (Lazy Loading)
const ModelViewerModal = React.lazy(() => import("@components/components/gallery/model-viewer-modal"));

interface CarouselProps {
    images: string[];
    albumName: string;
    modelUrl?: string;
    wireframeUrl?: string;
}

export default function CarouselWithProgress({ images, albumName, modelUrl, wireframeUrl }: CarouselProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const progress = (current * 100) / count;

    React.useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    if (!images || images.length === 0) {
        return <p className="text-center text-sm text-primary p-4">Tidak ada foto di album ini.</p>;
    }

    return (
        <div className="w-full flex flex-col justify-start pb-4 pt-0 px-3">

            {/* HEADER: Judul Mepet Kiri */}
            <div className="w-full flex justify-center items-center px-0 py-3 mb-1">
                <h2 className="text-xl font-semibold tracking-tight capitalize text-foreground truncate">
                    {albumName.replace(/-/g, " ")}
                </h2>
            </div>

            {/* Pembungkus Carousel & Tombol Aksi */}
            <div className="relative w-full">

                {/* TOMBOL PEMICU MODAL */}
                {modelUrl && (
                    <button
                        id="floating-action-360"
                        onClick={() => setIsModalOpen(true)}
                        data-astro-transition-persist="floating-action-button"
                        className="absolute top-3 right-3 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md text-popover-foreground border border-border/30 w-12 h-12 rounded-xl font-medium hover:bg-background/80 transition-all shrink-0 shadow-md group"
                    >
                        <Rotate3d className="h-6 w-6 text-foreground/70 group-hover:text-foreground transition-colors" />
                        <span className="text-[10px] font-bold tracking-tight text-foreground/70 group-hover:text-foreground transition-colors -mt-0.5">
                            360°
                        </span>
                    </button>
                )}

                {/* CAROUSEL */}
                <Carousel className="w-full" setApi={setApi}>
                    <CarouselContent>
                        {images.map((image, index) => {
                            const isNearActiveSlide = Math.abs(index - (current - 1)) <= 1;

                            return (
                                <CarouselItem key={index}>
                                    {isNearActiveSlide ? (
                                        <img
                                            alt={`Foto album ke-${index + 1}`}
                                            className="size-full rounded-lg object-cover aspect-square transform-gpu backface-hidden"
                                            src={image}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="size-full rounded-lg aspect-square bg-muted/40" />
                                    )}
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>

                    {/* NAVIGASI & PROGRESS BAR */}
                    <div className="flex items-center justify-between mt-4 px-1 gap-1">
                        <div className="flex items-center gap-2">
                            <CarouselPrevious className="relative top-auto left-auto translate-y-0" />
                            <CarouselNext className="relative top-auto translate-y-0 right-auto" />
                        </div>
                        <Progress className="w-24 m-0" value={progress} />
                    </div>
                </Carousel>

            </div>

            {/* 2. SINKRONISASI OPTIMASI: 
                 Bungkus dengan React.Suspense & berikan kondisi hulu {isModalOpen && ...}
                 File modal 3D seberat ratusan KB hanya akan diunduh jika baris ini aktif (di-klik).
            */}
            {isModalOpen && (
                <React.Suspense fallback={null}>
                    <ModelViewerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        images={images}
                        albumName={albumName}
                        modelUrl={modelUrl}
                        wireframeUrl={wireframeUrl}
                    />
                </React.Suspense>
            )}
        </div>
    );
}