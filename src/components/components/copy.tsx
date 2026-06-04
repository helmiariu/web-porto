// src/components/components/gallery-card.tsx
import { Rotate3d } from "lucide-react";
import * as React from "react";
import ModelViewerModal from "./model-viewer-modal";

interface CarouselProps {
    images: string[];
    albumName: string;
}

export default function CarouselWithProgress({ images, albumName }: CarouselProps) {
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
            <div className="w-full flex justify-center items-center px-0 py-3 mb-1">
                <h2 className="text-xl font-semibold tracking-tight capitalize text-foreground truncate">
                    {albumName.replace(/-/g, " ")}
                </h2>
            </div>

            <div className="relative w-full">
                <button
                    id="floating-action-360"
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-3 right-3 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md text-popover-foreground border border-border/30 w-12 h-12 rounded-xl font-medium hover:bg-background/80 transition-all shrink-0 shadow-md group"
                >
                    <Rotate3d className="h-6 w-6 text-foreground/70 group-hover:text-foreground transition-colors" />
                    <span className="text-[10px] font-bold tracking-tight text-foreground/70 group-hover:text-foreground transition-colors -mt-0.5">
                        360°
                    </span>
                </button>

                <Carousel className="w-full" setApi={setApi}>
                </Carousel>
            </div>
            <ModelViewerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                images={images}
                albumName={albumName}
            />
        </div>
    );
}