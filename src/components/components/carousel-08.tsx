// src/components/components/carousel-08.tsx
"use client";

import * as React from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@components/components/ui/carousel";
import { Progress } from "@components/components/ui/progress";

// 1. Tambahkan albumName ke dalam interface Props
interface CarouselProps {
  images: string[];
  albumName: string;
}

export default function CarouselWithProgress({ images, albumName }: CarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const progress = (current * 100) / count;

  React.useEffect(() => {
    if (!api) {
      return;
    }

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
    <div class="w-full flex flex-col justify-start pb-4 px-3">

      {/* 3. HEADER: Judul Mepet Kiri, Tombol Mepet Kanan */}
      <div class="w-full flex justify-between items-center px-2 py-2">
        <h2 class="text-xl font-bold capitalize text-foreground truncate pr-2">
          {albumName.replace(/-/g, " ")}
        </h2>

        <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity shrink-0">
          Aksi
        </button>
      </div>

      {/* 4. CAROUSEL */}
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <img
                alt={`Foto album ke-${index + 1}`}
                className="size-full rounded-lg object-cover aspect-square"
                src={image}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* KUNCI PERBAIKAN: 
        Bungkus Tombol & Progress Bar di dalam satu baris flex yang sama (Normal Flow)
      */}
        <div class="flex items-center justify-between mt-4 px-1 gap-1">
          {/* Grup Tombol Navigasi */}
          <div class="flex items-center gap-2"> {/* Mengubah gap-2 menjadi gap-1 */}
            <CarouselPrevious className="relative top-auto left-auto translate-y-0" />
            <CarouselNext className="relative top-auto translate-y-0 right-auto" />
          </div>

          {/* Progress Bar (Dipindah ke dalam sini agar sejajar rapi dengan tombol) */}
          <Progress className="w-24 m-0" value={progress} />
        </div>

      </Carousel>
    </div>
  );
}