// @components/components/gallery/model-viewer-modal.tsx
"use client";

import * as React from "react";
import { X, Layers, Sun, Eye, Rotate3d, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@components/components/gallery/carousel";

interface ModelViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    albumName: string;
    modelUrl?: string;
    wireframeUrl?: string;
    initialView?: "3d" | number;
}

// -------------------------------------------------------------
// ZOOM & PAN IMAGE COMPONENT FOR DESKTOP & MOBILE
// -------------------------------------------------------------
interface ZoomPanProps {
    src: string;
    alt: string;
    onZoomChange: (zoomed: boolean) => void;
}

function ZoomPanImage({ src, alt, onZoomChange }: ZoomPanProps) {
    const [scale, setScale] = React.useState(1);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStart = React.useRef({ x: 0, y: 0 });
    const imgRef = React.useRef<HTMLImageElement>(null);

    const touchStartDist = React.useRef<number | null>(null);
    const touchStartScale = React.useRef<number>(1);

    React.useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [src]);

    React.useEffect(() => {
        onZoomChange(scale > 1);
    }, [scale]);


    const getBounds = () => {
        if (!imgRef.current) return { x: 0, y: 0 };
        const width = imgRef.current.clientWidth;
        const height = imgRef.current.clientHeight;
        const boundsX = Math.max(0, (width * scale - width) / 2);
        const boundsY = Math.max(0, (height * scale - height) / 2);
        return { x: boundsX, y: boundsY };
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const zoomFactor = 0.15;
        let newScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
        newScale = Math.max(1, Math.min(newScale, 4));

        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
        }
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scale <= 1) return;
        e.stopPropagation();
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scale <= 1) return;
        e.stopPropagation();
        if (!isDragging) return;

        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        const bounds = getBounds();

        setPosition({
            x: Math.max(-bounds.x, Math.min(bounds.x, newX)),
            y: Math.max(-bounds.y, Math.min(bounds.y, newY))
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (scale > 1) {
            e.stopPropagation();
        }

        if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
        } else if (e.touches.length === 2) {
            setIsDragging(false);
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            touchStartDist.current = dist;
            touchStartScale.current = scale;
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (scale > 1 || e.touches.length === 2) {
            e.stopPropagation();
        }

        if (e.touches.length === 1 && isDragging && scale > 1) {
            const touch = e.touches[0];
            const newX = touch.clientX - dragStart.current.x;
            const newY = touch.clientY - dragStart.current.y;
            const bounds = getBounds();

            setPosition({
                x: Math.max(-bounds.x, Math.min(bounds.x, newX)),
                y: Math.max(-bounds.y, Math.min(bounds.y, newY))
            });
        } else if (e.touches.length === 2 && touchStartDist.current !== null) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const factor = dist / touchStartDist.current;
            let newScale = touchStartScale.current * factor;
            newScale = Math.max(1, Math.min(newScale, 4));

            if (newScale === 1) {
                setPosition({ x: 0, y: 0 });
            }
            setScale(newScale);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        touchStartDist.current = null;
    };

    return (
        <div
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
            style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain p-4 md:p-0 select-none pointer-events-none transition-transform duration-75 ease-out"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
                draggable="false"
            />
        </div>
    );
}

// -------------------------------------------------------------
// MAIN MODAL COMPONENT
// -------------------------------------------------------------
export default function ModelViewerModal({
    isOpen,
    onClose,
    images,
    albumName,
    modelUrl,
    wireframeUrl,
    initialView
}: ModelViewerModalProps) {
    const [renderMode, setRenderMode] = React.useState<"final" | "wireframe" | "unlit">("final");
    const [activeView, setActiveView] = React.useState<"3d" | number>(initialView ?? "3d");

    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
    const [isZoomed, setIsZoomed] = React.useState(false);

    const thumbnailContainerRef = React.useRef<HTMLDivElement>(null);
    const modelViewerRef = React.useRef<HTMLElement>(null);
    const progressBarRef = React.useRef<HTMLDivElement>(null);
    const progressTextRef = React.useRef<HTMLSpanElement>(null);

    // 1. Hook useEffect untuk registrasi Lottie sebelumnya SUDAH DIHAPUS agar menghemat memori

    React.useEffect(() => {
        if (isOpen) {
            setActiveView(initialView ?? "3d");
        }
    }, [isOpen, initialView]);

    React.useEffect(() => {
        if (isOpen) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }
        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Nonaktifkan drag/swipe pada Embla secara dinamis:
    React.useEffect(() => {
        if (!carouselApi) return;
        carouselApi.reInit({ watchDrag: !isZoomed });
    }, [carouselApi, isZoomed]);


    // Pembersihan Blob URL (Hanya dipanggil saat unmount atau saat url model berubah)
    React.useEffect(() => {
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [blobUrl]);

    // Logika download & pembersihan internal useEffect
    React.useEffect(() => {
        if (!isOpen || activeView !== "3d" || !modelUrl || blobUrl) return;

        let active = true;

        const downloadModel = async () => {
            setIsDownloading(true);
            try {
                const response = await fetch(modelUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const contentLength = response.headers.get("content-length");
                const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

                const reader = response.body?.getReader();
                if (!reader) throw new Error("ReadableStream not supported");

                let loadedBytes = 0;
                const chunks: Uint8Array[] = [];

                if (progressBarRef.current) progressBarRef.current.style.width = "0%";
                if (progressTextRef.current) progressTextRef.current.innerText = "0%";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (!active) return;

                    chunks.push(value);
                    loadedBytes += value.length;

                    if (totalBytes > 0) {
                        const percentage = Math.floor((loadedBytes / totalBytes) * 100);
                        if (progressBarRef.current) {
                            progressBarRef.current.style.width = `${percentage}%`;
                        }
                        if (progressTextRef.current) {
                            progressTextRef.current.innerText = `${percentage}%`;
                        }
                    }
                }

                if (!active) return;

                const blob = new Blob(chunks);
                const objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            } catch (error) {
                console.error("Failed to download 3D model:", error);
            } finally {
                if (active) {
                    setIsDownloading(false);
                }
            }
        };

        downloadModel();

        return () => {
            active = false;
        };
    }, [activeView, modelUrl, blobUrl, isOpen]);

    React.useEffect(() => {
        if (carouselApi && typeof activeView === "number") {
            const currentSnap = carouselApi.selectedScrollSnap();
            if (currentSnap !== activeView) {
                carouselApi.scrollTo(activeView);
            }
        }
    }, [activeView, carouselApi]);

    React.useEffect(() => {
        if (!carouselApi) return;

        carouselApi.on("select", () => {
            const currentIdx = carouselApi.selectedScrollSnap();
            setActiveView(currentIdx);
        });
    }, [carouselApi]);

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

    const handleNext = () => {
        if (activeView === "3d") {
            if (images.length > 0) setActiveView(0);
        } else {
            const nextIdx = activeView + 1;
            if (nextIdx < images.length) {
                if (carouselApi) {
                    carouselApi.scrollNext();
                } else {
                    setActiveView(nextIdx);
                }
            } else {
                setActiveView("3d");
            }
        }
    };

    const handlePrev = () => {
        if (activeView === "3d") {
            if (images.length > 0) setActiveView(images.length - 1);
        } else {
            const prevIdx = activeView - 1;
            if (prevIdx >= 0) {
                if (carouselApi) {
                    carouselApi.scrollPrev();
                } else {
                    setActiveView(prevIdx);
                }
            } else {
                setActiveView("3d");
            }
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[70] md:z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl h-[90vh] md:h-[85vh] bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-lg text-card-foreground"
            >

                {/* HEADER MODAL */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-base md:text-lg font-semibold tracking-tight capitalize truncate max-w-[70%]">
                        {albumName.replace(/-/g, " ")} — {activeView === "3d" ? "3D Viewer" : `Detail #${(activeView as number) + 1}`}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-md opacity-70 hover:opacity-100 hover:bg-accent cursor-pointer">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* FLOATING CONTROLS */}
                {activeView === "3d" && (
                    <div className="absolute top-16 right-2 md:top-20 md:right-4 z-20 flex flex-row md:flex-col gap-1 md:gap-2 bg-background/80 p-1 backdrop-blur-md rounded-lg border border-border shadow-sm max-w-[calc(100%-1rem)] overflow-x-auto">
                        <button onClick={() => setRenderMode("final")} className={`p-1.5 md:p-2 rounded-md flex items-center gap-1.5 text-[11px] md:text-xs font-medium whitespace-nowrap cursor-pointer ${renderMode === "final" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                            <Sun className="h-3.5 w-3.5" /> Final
                        </button>
                        <button onClick={() => setRenderMode("unlit")} className={`p-1.5 md:p-2 rounded-md flex items-center gap-1.5 text-[11px] md:text-xs font-medium whitespace-nowrap cursor-pointer ${renderMode === "unlit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                            <Eye className="h-3.5 w-3.5" /> No Light
                        </button>
                        <button onClick={() => wireframeUrl && setRenderMode("wireframe")} disabled={!wireframeUrl} className={`p-1.5 md:p-2 rounded-md flex items-center gap-1.5 text-[11px] md:text-xs font-medium whitespace-nowrap cursor-pointer ${!wireframeUrl ? "opacity-30 cursor-not-allowed" : renderMode === "wireframe" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                            <Layers className="h-3.5 w-3.5" /> Wireframe
                        </button>
                    </div>
                )}

                {/* AREA VIEW UTAMA */}
                <div className="flex-1 min-h-0 bg-muted/40 relative flex items-center justify-center overflow-hidden group select-none">

                    {activeView !== "3d" && modelUrl && (
                        <button
                            onClick={() => setActiveView("3d")}
                            className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 hover:bg-background border border-border text-foreground text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                            <Rotate3d className="h-4 w-4 text-primary animate-pulse" />
                            <span>360° View</span>
                        </button>
                    )}

                    <button
                        onClick={handlePrev}
                        className="absolute left-1 md:left-4 z-30 p-1.5 md:p-2 rounded-full md:border md:border-border bg-background/40 md:bg-background/80 backdrop-blur-[1px] md:backdrop-blur-sm text-foreground/70 md:text-foreground md:shadow-md transition-all opacity-30 md:opacity-0 md:group-hover:opacity-100 hover:bg-background active:scale-90 cursor-pointer"
                    >
                        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </button>

                    <div className="absolute inset-0 flex items-center justify-center p-0 md:p-0 bg-card">
                        {activeView === "3d" ? (
                            !blobUrl || isDownloading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm transition-opacity duration-500">
                                    <img src={images[0]} alt="Loading preview" className="absolute inset-0 w-full h-full object-contain opacity-20 blur-[2px] p-4 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-3.5 p-4 sm:p-5 rounded-xl bg-card/90 border border-border shadow-md w-64 sm:w-72 text-center transition-all">

                                        {/* 2. BAGIAN BARU: Memanggil Kucing dalam format Animated SVG (Support Light/Dark Mode) */}
                                        <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center transition-all">
                                            {/* Kucing Mode Terang (Light Mode) */}
                                            <img
                                                src="/cat.svg"
                                                alt="Loading Kucing"
                                                className="w-full h-full object-contain pointer-events-none block dark:hidden"
                                                loading="eager"
                                                fetchPriority="high"
                                            />

                                            {/* Kucing Mode Gelap (Dark Mode) */}
                                            <img
                                                src="/catdark.svg"
                                                alt="Loading Kucing Dark"
                                                className="w-full h-full object-contain pointer-events-none hidden dark:block"
                                                loading="eager"
                                                fetchPriority="high"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            {/* Judul naik sedikit ke 13px di HP agar lebih tegas */}
                                            <p className="text-[13px] sm:text-sm font-semibold text-foreground tracking-tight">
                                                Memuat Model 3D...
                                            </p>
                                            {/* Subjudul naik ke 11px di HP agar lebih ramah di mata */}
                                            <p className="text-[11px] sm:text-[11px] text-muted-foreground leading-tight">
                                                Kucing kami sedang menyiapkan asetnya
                                            </p>
                                        </div>

                                        <div className="w-full space-y-1.5 mt-0.5">
                                            <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    ref={progressBarRef}
                                                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: "0%" }}
                                                />
                                            </div>
                                            <span ref={progressTextRef} className="text-[9px] sm:text-[10px] font-mono text-muted-foreground block">0%</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // @ts-ignore
                                <model-viewer
                                    ref={modelViewerRef}
                                    src={blobUrl}
                                    poster={images[0]}
                                    camera-controls
                                    auto-rotate
                                    loading="lazy"
                                    reveal="auto"
                                    shadow-intensity="1.5"
                                    shadow-softness="1"
                                    exposure={renderMode === "unlit" ? "2" : "1"}
                                    variant-name={renderMode === "unlit" ? "unlit" : "default"}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                </model-viewer>
                            )
                        ) : (
                            <Carousel
                                setApi={setCarouselApi}
                                className="w-full h-full [&>div]:h-full"
                                opts={{
                                    startIndex: typeof activeView === "number" ? activeView : 0,
                                    watchDrag: !isZoomed, // <-- Kunci drag awal
                                }}
                            >
                                <CarouselContent className="h-full items-center">
                                    {images.map((img, idx) => (
                                        <CarouselItem key={idx} className="h-full flex items-center justify-center overflow-hidden">
                                            <ZoomPanImage src={img} alt={`${albumName} - ${idx + 1}`} onZoomChange={setIsZoomed} />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        className="absolute right-1 md:right-4 z-30 p-1.5 md:p-2 rounded-full md:border md:border-border bg-background/40 md:bg-background/80 backdrop-blur-[1px] md:backdrop-blur-sm text-foreground/70 md:text-foreground md:shadow-md transition-all opacity-30 md:opacity-0 md:group-hover:opacity-100 hover:bg-background active:scale-90 cursor-pointer"
                    >
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                </div>

                {/* BARIS THUMBNAIL BAWAH */}
                <div ref={thumbnailContainerRef} className="h-22 lg:h-26 bg-card border-t border-border p-3 flex gap-3 overflow-x-auto items-center w-full">
                    {modelUrl && (
                        <button onClick={() => setActiveView("3d")} data-active={activeView === "3d"} className={`h-16 w-16 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all shrink-0 select-none cursor-pointer ${activeView === "3d" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-input bg-background hover:bg-accent text-muted-foreground"}`}>
                            <Rotate3d className="h-7 w-7 shrink-0" />
                            <span className="text-[11px] font-bold tracking-wide leading-none shrink-0">360°</span>
                        </button>
                    )}

                    {images.map((img, idx) => (
                        <button key={idx} onClick={() => setActiveView(idx)} data-active={activeView === idx} className={`h-16 w-16 rounded-lg overflow-hidden border transition-all shrink-0 bg-muted flex items-center justify-center cursor-pointer ${activeView === idx ? "border-primary ring-2 ring-primary/20 scale-95" : "border-input"}`}>
                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" draggable="false" />
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}