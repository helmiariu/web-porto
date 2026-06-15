// src/components/components/gallery-card.tsx
"use client";

import * as React from "react";
import { Rotate3d } from "lucide-react";
import { Icon } from "@iconify/react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@components/components/gallery/carousel";

// IMPORT KEDUA ELEMEN INI AGAR TIDAK REFERENCE ERROR
import { Button } from "@components/components/ui/button";

const ModelViewerModal = React.lazy(() => import("@components/components/gallery/model-viewer-modal"));

interface CarouselProps {
    images: string[];
    albumName: string;
    modelUrl?: string;
    wireframeUrl?: string;
    title?: string;
    softwareTools?: Array<{
        name: string;
        slug: string;
        iconType: string;
        iconValue: string;
        color?: string;
    }>;
}

function getBrightness(hexColor: string | undefined | null): number {
  if (!hexColor) return 128;
  const cleanHex = hexColor.replace("#", "");
  if (cleanHex.length !== 6) return 128;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function getBadgeClass(color: string | undefined | null): string {
  const brightness = getBrightness(color);
  const base = "flex items-center gap-1.5 px-2.5 py-0.5 md:py-1 rounded-full text-[11px] md:text-xs font-semibold border transition-all duration-200 select-none shrink-0";
  if (color && brightness < 80) {
    return `${base} bg-muted/65 text-foreground border-border/40 dark:bg-white/95 dark:text-zinc-950 dark:border-zinc-200`;
  }
  if (color && brightness > 200) {
    return `${base} bg-zinc-950 text-white border-zinc-800 dark:bg-muted/65 dark:text-foreground dark:border-border/40`;
  }
  return `${base} bg-muted/65 text-foreground border-border/40 hover:bg-muted/80`;
}

export default function CarouselWithProgress({ 
    images, 
    albumName, 
    modelUrl, 
    wireframeUrl,
    title,
    softwareTools = []
}: CarouselProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [initialView, setInitialView] = React.useState<"3d" | number>("3d");

    if (!images || images.length === 0) {
        return <p className="text-center text-sm text-primary p-4">Tidak ada foto di album ini.</p>;
    }

    return (
        <div className="w-full">
            <Carousel
                opts={{ loop: true, align: "start" }}
                className="w-full"
            >
                {/* Main Card Wrapper */}
                <div className="rounded-xl bg-card p-4 md:p-6 shadow-xl/3 ring ring-border/80">
                    {/* Header */}
                    <div className="mb-5 flex items-end justify-between">
                        <div>
                            <h2 className="font-medium text-2xl md:text-3xl tracking-tight capitalize text-foreground">
                                {title || albumName.replace(/-/g, " ")}
                            </h2>
                            {softwareTools.length > 0 ? (
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    {softwareTools.map((tool) => {
                                        return (
                                            <div 
                                                key={tool.slug}
                                                className={getBadgeClass(tool.color)}
                                                style={{ borderColor: tool.color && !(getBrightness(tool.color) < 80 || getBrightness(tool.color) > 200) ? `${tool.color}30` : undefined }}
                                                title={tool.name}
                                            >
                                                {tool.iconType === "iconify" ? (
                                                    <Icon 
                                                        icon={tool.iconValue} 
                                                        className="h-3.5 w-3.5 shrink-0" 
                                                        style={{ color: tool.color || undefined }}
                                                    />
                                                ) : tool.color ? (
                                                    <div 
                                                        className="h-3.5 w-3.5 shrink-0"
                                                        style={{
                                                            backgroundColor: tool.color,
                                                            WebkitMaskImage: `url(${tool.iconValue.startsWith("/") ? tool.iconValue : `/api/assets/${tool.iconValue}`})`,
                                                            maskImage: `url(${tool.iconValue.startsWith("/") ? tool.iconValue : `/api/assets/${tool.iconValue}`})`,
                                                            WebkitMaskSize: "contain",
                                                            maskSize: "contain",
                                                            WebkitMaskRepeat: "no-repeat",
                                                            maskRepeat: "no-repeat",
                                                            WebkitMaskPosition: "center",
                                                            maskPosition: "center",
                                                        }}
                                                    />
                                                ) : (
                                                    <img 
                                                        src={tool.iconValue.startsWith("/") ? tool.iconValue : `/api/assets/${tool.iconValue}`}
                                                        alt={tool.name}
                                                        className="h-3.5 w-3.5 shrink-0 object-contain"
                                                    />
                                                )}
                                                <span>{tool.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                                    {modelUrl ? "Interactive 3D model & render gallery" : "Render gallery"}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {modelUrl && (
                                <Button
                                    variant="outline"
                                    className="touch-manipulation rounded-full px-3 hidden md:flex items-center gap-2 h-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setInitialView("3d");
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <Rotate3d className="h-4 w-4" />
                                    <span className="text-xs font-semibold tracking-tight text-primary">360° View</span>
                                </Button>
                            )}
                            <div className="hidden space-x-2 md:flex items-center">
                                <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                                <CarouselNext className="static translate-y-0 h-8 w-8" />
                            </div>
                        </div>
                    </div>

                    {/* Carousel Content */}
                    <CarouselContent>
                        {images.map((src, index) => (
                            <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="p-1">
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
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Mobile Navigation & View Controls (Below Content) */}
                    <div className="flex justify-between items-center mt-4 md:hidden">
                        <div className="flex gap-2">
                            <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                            <CarouselNext className="static translate-y-0 h-8 w-8" />
                        </div>
                        {modelUrl && (
                            <Button
                                variant="outline"
                                className="touch-manipulation rounded-full px-3 flex items-center gap-2 h-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInitialView("3d");
                                    setIsModalOpen(true);
                                }}
                            >
                                <Rotate3d className="h-4 w-4" />
                                <span className="text-xs font-semibold tracking-tight text-primary">360° View</span>
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