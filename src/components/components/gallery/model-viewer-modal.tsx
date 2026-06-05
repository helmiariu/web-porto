// src/components/components/model-viewer-modal.tsx
"use client";

import * as React from "react";
import { X, Layers, Sun, Eye, Rotate3d, ChevronLeft, ChevronRight } from "lucide-react";

interface ModelViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    albumName: string;
    modelUrl?: string;
    wireframeUrl?: string;
}

export default function ModelViewerModal({
    isOpen,
    onClose,
    images,
    albumName,
    modelUrl,
    wireframeUrl
}: ModelViewerModalProps) {
    const [renderMode, setRenderMode] = React.useState<"final" | "wireframe" | "unlit">("final");
    const [activeView, setActiveView] = React.useState<"3d" | number>("3d");

    // State tambahan untuk mendeteksi swipe di HP (khusus mode 2D)
    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

    const thumbnailContainerRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll thumbnail tetap sama
    React.useEffect(() => {
        if (thumbnailContainerRef.current) {
            const activeElement = thumbnailContainerRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center"
                });
            }
        }
    }, [activeView]);

    if (!isOpen) return null;

    const getModelSrc = () => {
        if (renderMode === "wireframe") return wireframeUrl || modelUrl;
        return modelUrl;
    };

    const handleNext = () => {
        if (activeView === "3d") {
            if (images.length > 0) setActiveView(0);
        } else {
            const nextIdx = activeView + 1;
            if (nextIdx < images.length) setActiveView(nextIdx);
            else setActiveView("3d");
        }
    };

    const handlePrev = () => {
        if (activeView === "3d") {
            if (images.length > 0) setActiveView(images.length - 1);
        } else {
            const prevIdx = activeView - 1;
            if (prevIdx >= 0) setActiveView(prevIdx);
            else setActiveView("3d");
        }
    };

    // LOGIKA SWIPE HP (Hanya berjalan jika activeView BUKAN "3d")
    const handleTouchStart = (e: React.TouchEvent) => {
        if (activeView === "3d") return; // Abaikan jika sedang di mode 3D
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (activeView === "3d") return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (activeView === "3d" || !touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 60;  // Swipe ke kiri (Next)
        const isRightSwipe = distance < -60; // Swipe ke kanan (Prev)

        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();

        // Reset nilai touch
        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div className="fixed inset-0 z-[70] md:z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl h-[90vh] md:h-[85vh] bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-lg text-card-foreground">

                {/* HEADER MODAL */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-base md:text-lg font-semibold tracking-tight capitalize truncate max-w-[70%]">
                        {albumName.replace(/-/g, " ")} — {activeView === "3d" ? "3D Viewer" : `Detail #${(activeView as number) + 1}`}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-md opacity-70 hover:opacity-100 hover:bg-accent">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* FLOATING CONTROLS (Disesuaikan agar rapi di HP - Posisi horizontal di atas jika layar kecil) */}
                {activeView === "3d" && (
                    <div className="absolute top-16 right-2 md:top-20 md:right-4 z-20 flex flex-row md:flex-col gap-1 md:gap-2 bg-background/80 p-1 backdrop-blur-md rounded-lg border border-border shadow-sm max-w-[calc(100%-1rem)] overflow-x-auto">
                        <button onClick={() => setRenderMode("final")} className={`p-1.5 md:p-2 rounded-md flex items-center gap-1.5 text-[11px] md:text-xs font-medium whitespace-nowrap ${renderMode === "final" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                            <Sun className="h-3.5 w-3.5" /> Final
                        </button>
                        <button onClick={() => setRenderMode("unlit")} className={`p-1.5 md:p-2 rounded-md flex items-center gap-1.5 text-[11px] md:text-xs font-medium whitespace-nowrap ${renderMode === "unlit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                            <Eye className="h-3.5 w-3.5" /> No Light
                        </button>
                        <button onClick={() => wireframeUrl && setRenderMode("wireframe")} disabled={!wireframeUrl} className={`p-1.5 md:p-2 rounded-md flex items-center gap-1.5 text-[11px] md:text-xs font-medium whitespace-nowrap ${!wireframeUrl ? "opacity-30 cursor-not-allowed" : renderMode === "wireframe" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                            <Layers className="h-3.5 w-3.5" /> Wireframe
                        </button>
                    </div>
                )}

                {/* AREA VIEW UTAMA (Ditambah Listener Touch untuk Swipe HP) */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="flex-1 bg-muted/40 relative flex items-center justify-center overflow-hidden group select-none"
                >

                    {/* TOMBOL PREV: Di HP selalu muncul (`opacity-100`), di desktop menyusup (`md:opacity-0 md:group-hover:opacity-100`) */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 md:left-4 z-30 p-3 md:p-2 rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-all opacity-60 md:opacity-0 md:group-hover:opacity-100 hover:bg-background active:scale-90"
                    >
                        <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
                    </button>

                    {/* SCREEN VIEW */}
                    <div className="w-full h-full flex items-center justify-center">
                        {activeView === "3d" ? (
                            // @ts-ignore
                            <model-viewer
                                src={getModelSrc()}
                                camera-controls
                                auto-rotate
                                loading="lazy"          // 👈 1. Hanya load jika area 3D aktif
                                reveal="auto"           // 👈 2. Mesin 3D langsung menyala/load saat modal dibuka
                                poster={images[0]}      // 👈 3. Tampilkan gambar 2D biasa sebagai "cover" sementara
                                shadow-intensity="1.5"
                                shadow-softness="1"
                                exposure={renderMode === "unlit" ? "2" : "1"}
                                variant-name={renderMode === "unlit" ? "unlit" : "default"}
                                style={{ width: '100%', height: '100%', '--poster-color': 'transparent' } as React.CSSProperties}
                            >
                                {/* @ts-ignore */}
                            </model-viewer>
                        ) : (
                            <img
                                src={images[activeView]}
                                alt={`Detail ${activeView}`}
                                className="max-w-full max-h-full object-contain p-4 md:p-6 animate-in zoom-in-95 duration-200"
                                draggable="false"
                            />
                        )}
                    </div>

                    {/* TOMBOL NEXT */}
                    <button
                        onClick={handleNext}
                        className="absolute right-2 md:right-4 z-30 p-3 md:p-2 rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-all opacity-60 md:opacity-0 md:group-hover:opacity-100 hover:bg-background active:scale-90"
                    >
                        <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
                    </button>
                </div>

                {/* BARIS THUMBNAIL BAWAH */}
                <div ref={thumbnailContainerRef} className="h-24 bg-card border-t border-border p-3 flex gap-3 overflow-x-auto items-center w-full">
                    <button
                        onClick={() => setActiveView("3d")}
                        data-active={activeView === "3d"}
                        className={`h-16 w-16 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all shrink-0 select-none ${activeView === "3d"
                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                            : "border-input bg-background hover:bg-accent text-muted-foreground"
                            }`}
                    >
                        <Rotate3d className="h-7 w-7 shrink-0 animate-pulse" />
                        <span className="text-[11px] font-bold tracking-wide leading-none shrink-0">360°</span>
                    </button>

                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveView(idx)}
                            data-active={activeView === idx}
                            className={`h-16 w-16 rounded-lg overflow-hidden border transition-all shrink-0 bg-muted flex items-center justify-center ${activeView === idx ? "border-primary ring-2 ring-primary/20 scale-95" : "border-input"
                                }`}
                        >
                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" draggable="false" />
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}