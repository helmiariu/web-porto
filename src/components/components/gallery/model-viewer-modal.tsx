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

    // 1. STATE UNTUK REAL PROGRESS BAR
    const [downloadProgress, setDownloadProgress] = React.useState<number>(0);

    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

    const thumbnailContainerRef = React.useRef<HTMLDivElement>(null);
    const modelViewerRef = React.useRef<HTMLElement>(null); // Ref untuk model-viewer

    // Load Lottie Web Component secara aman di Client-Side
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            import("@dotlottie/player-component");
        }
    }, []);

    // 2. LISTEN KE EVENT PROGRESS MODEL-VIEWER
    React.useEffect(() => {
        const handleProgress = (event: any) => {
            // event.detail.totalProgress mengembalikan angka dari 0 sampai 1
            const percentage = Math.floor(event.detail.totalProgress * 100);
            setDownloadProgress(percentage);
        };

        const currentModel = modelViewerRef.current;
        if (currentModel) {
            currentModel.addEventListener("progress", handleProgress);
        }

        return () => {
            if (currentModel) {
                currentModel.removeEventListener("progress", handleProgress);
            }
        };
    }, [activeView, isOpen]); // Re-bind jika mode 3D aktif

    // Auto-scroll thumbnail
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

    const handleTouchStart = (e: React.TouchEvent) => {
        if (activeView === "3d") return;
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (activeView === "3d") return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (activeView === "3d" || !touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 60) handleNext();
        if (distance < -60) handlePrev();
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

                {/* FLOATING CONTROLS */}
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

                {/* AREA VIEW UTAMA */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="flex-1 bg-muted/40 relative flex items-center justify-center overflow-hidden group select-none"
                >
                    <button onClick={handlePrev} className="absolute left-2 md:left-4 z-30 p-3 md:p-2 rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-all opacity-60 md:opacity-0 md:group-hover:opacity-100 hover:bg-background active:scale-90">
                        <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
                    </button>

                    <div className="w-full h-full flex items-center justify-center">
                        {activeView === "3d" ? (
                            // @ts-ignore
                            <model-viewer
                                ref={modelViewerRef} // Pasang Ref di sini
                                src={getModelSrc()}
                                camera-controls
                                auto-rotate
                                loading="lazy"
                                reveal="auto"
                                shadow-intensity="1.5"
                                shadow-softness="1"
                                exposure={renderMode === "unlit" ? "2" : "1"}
                                variant-name={renderMode === "unlit" ? "unlit" : "default"}
                                style={{ width: '100%', height: '100%' } as React.CSSProperties}
                            >
                                {/* CUSTOM POSTER SLOT (Otomatis hilang lewat fade-out bawaan model-viewer) */}
                                {/* @ts-ignore */}
                                <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm transition-opacity duration-500">
                                    <img src={images[0]} alt="Loading preview" className="absolute inset-0 w-full h-full object-contain opacity-20 blur-[2px] p-4 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col items-center gap-3 p-5 rounded-xl bg-card/90 border border-border shadow-md max-w-xs text-center">

                                        {/* LOGIKA INTEGRASI LOTTIE KUCING ANDA */}
                                        <div className="w-28 h-28 flex items-center justify-center">
                                            {/* Mode Terang */}
                                            <div className="block dark:hidden">
                                                {/* @ts-ignore */}
                                                <dotlottie-player src="/cat.lottie" background="transparent" speed="1" style={{ width: '100%', height: '100%' }} loop autoplay />
                                            </div>
                                            {/* Mode Gelap */}
                                            <div className="hidden dark:block">
                                                {/* @ts-ignore */}
                                                <dotlottie-player src="/catdark.json" background="transparent" speed="1" style={{ width: '100%', height: '100%' }} loop autoplay />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">Memuat Model 3D...</p>
                                            <p className="text-[11px] text-muted-foreground">Kucing kami sedang menyiapkan asetnya</p>
                                        </div>

                                        {/* REAL PROGRESS BAR */}
                                        <div className="w-full space-y-1">
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${downloadProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground">{downloadProgress}%</span>
                                        </div>

                                    </div>
                                </div>
                                {/* @ts-ignore */}
                            </model-viewer>
                        ) : (
                            <img src={images[activeView]} alt={`Detail ${activeView}`} className="max-w-full max-h-full object-contain p-4 md:p-6 animate-in zoom-in-95 duration-200" draggable="false" />
                        )}
                    </div>

                    <button onClick={handleNext} className="absolute right-2 md:right-4 z-30 p-3 md:p-2 rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground shadow-md transition-all opacity-60 md:opacity-0 md:group-hover:opacity-100 hover:bg-background active:scale-90">
                        <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
                    </button>
                </div>

                {/* BARIS THUMBNAIL BAWAH */}
                <div ref={thumbnailContainerRef} className="h-24 bg-card border-t border-border p-3 flex gap-3 overflow-x-auto items-center w-full">
                    <button onClick={() => setActiveView("3d")} data-active={activeView === "3d"} className={`h-16 w-16 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all shrink-0 select-none ${activeView === "3d" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-input bg-background hover:bg-accent text-muted-foreground"}`}>
                        <Rotate3d className="h-7 w-7 shrink-0" />
                        <span className="text-[11px] font-bold tracking-wide leading-none shrink-0">360°</span>
                    </button>

                    {images.map((img, idx) => (
                        <button key={idx} onClick={() => setActiveView(idx)} data-active={activeView === idx} className={`h-16 w-16 rounded-lg overflow-hidden border transition-all shrink-0 bg-muted flex items-center justify-center ${activeView === idx ? "border-primary ring-2 ring-primary/20 scale-95" : "border-input"}`}>
                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" draggable="false" />
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}