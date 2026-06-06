// src/components/components/gallery-card.tsx
"use client";

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

// IMPORT KEDUA ELEMEN INI AGAR TIDAK REFERENCE ERROR
import { Button } from "@components/components/ui/button";
import { cn } from "@components/lib/utils";

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
    const [initialView, setInitialView] = React.useState<"3d" | number>("3d");
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

            {/* HEADER */}
            <div className="w-full flex justify-center items-center px-0 py-3 mb-1">
                <h2 className="text-xl font-semibold tracking-tight capitalize text-foreground truncate">
                    {albumName.replace(/-/g, " ")}
                </h2>
            </div>

            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {images.map((src, index) => (
                        <CarouselItem key={index}>
                            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                                <img
                                    src={src}
                                    alt={`${albumName} - ${index + 1}`}
                                    className="h-full w-full object-cover cursor-pointer"
                                    onClick={() => {
                                        if (index === 0 && modelUrl) {
                                            setInitialView("3d");
                                        } else {
                                            setInitialView(index);
                                        }
                                        setIsModalOpen(true);
                                    }}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    decoding="async"
                                />
                                {index === 0 && modelUrl && (
                                    <div
                                        onClick={() => {
                                            setInitialView("3d");
                                            setIsModalOpen(true);
                                        }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 hover:bg-black/35 transition-all cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center gap-1 bg-background/40 backdrop-blur-md text-foreground/90 border border-border/20 px-4 py-2 rounded-xl font-semibold shadow-md hover:scale-105 active:scale-95 transition-all">
                                            <Rotate3d className="h-5 w-5 text-primary/90 animate-pulse" />
                                            <span className="text-[10px] font-bold tracking-wider uppercase">
                                                360°
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* NAVIGASI, PROGRESS BAR, & TOMBOL AKSI */}
                <div className="flex flex-col gap-4 mt-4 px-1">
                    {/* Baris Atas: Progress Bar */}
                    <Progress className="w-full m-0" value={progress} />

                    {/* Baris Bawah: Kelompok tombol-tombol aksi */}
                    <div className="flex items-center gap-2">
                        <CarouselPrevious className="relative top-auto left-auto translate-y-0 h-10 w-10 md:h-9 md:w-9" />
                        <CarouselNext className="relative top-auto translate-y-0 right-auto h-10 w-10 md:h-9 md:w-9" />

                        {modelUrl && (
                            <Button
                                variant="outline"
                                // Tambahkan class h-10 md:h-9 di bawah ini:
                                className={cn("touch-manipulation rounded-full px-4 flex items-center gap-2 ml-auto h-10 md:h-9")}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInitialView("3d");
                                    setIsModalOpen(true);
                                }}
                            >
                                <Rotate3d className="h-4 w-4" />
                                <span className="text-xs font-semibold tracking-tight text-primary ">360° View</span>
                            </Button>
                        )}
                    </div>
                </div>
            </Carousel>

            {isModalOpen && (
                <React.Suspense fallback={null}>
                    <ModelViewerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        images={images}
                        albumName={albumName}
                        modelUrl={modelUrl}
                        wireframeUrl={wireframeUrl}
                        initialView={initialView}
                    />
                </React.Suspense>
            )}
        </div>
    );
}