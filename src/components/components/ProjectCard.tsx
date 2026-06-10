import React from "react";
import { Pin, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";
import { Card, CardContent } from "@components/components/ui/card";
import { Badge } from "@components/components/ui/badge";

export interface TechItem {
  icon?: string;
  color?: string;
}

export interface ProjectData {
  title: string;
  description: string;
  heroImage: string;
  techStack: TechItem[];
  isFeatured?: boolean;
}

interface ProjectCardProps {
  project: ProjectData;
  slug: string;
}

export function ProjectCard({ project, slug }: ProjectCardProps) {
  const {
    title,
    description,
    heroImage,
    techStack = [],
    isFeatured = false,
  } = project;

  return (
    <a href={`/project/${slug}`} data-astro-reload className="group/project block w-full cursor-pointer">
      <Card className="flex flex-col h-full overflow-hidden rounded-xl border border-border/50 bg-card py-0 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]">

        {/* --- Top: Diubah dari aspect-video (16:9) ke cinematic aspect-[21/9] --- */}
        <div className="relative aspect-[18/9] w-full overflow-hidden bg-muted">
          <img
            src={heroImage}
            alt={title}
            className="h-full w-full object-cover transition-all duration-500 group-hover/project:scale-105 group-hover/project:blur-[3px]"
            loading="lazy"
          />

          {/* --- Overlay View Project yang muncul saat hover --- */}
          {/* bg-primary/50 diubah menjadi warna statis (contoh bg-zinc-900/50) agar kebal dari efek dark mode */}
          {/* text-primary-foreground diubah menjadi text-white */}
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/50 opacity-0 transition-all duration-500 group-hover/project:opacity-100">
            <span className="flex items-center gap-1.5 text-sm font-medium text-white">
              View Project <ChevronRight className="h-4 w-4" />
            </span>
          </div>

          {/* --- Featured Badge Overlay (Disesuaikan dengan ukuran teks) --- */}
          {isFeatured && (
            // Posisi dipertahankan (top-2.5 right-2.5)
            <div className="absolute top-2.5 right-2.5 z-10">
              <Badge className="bg-background/90 hover:bg-background/90 text-foreground backdrop-blur-md border border-border/50 shadow-sm font-heading tracking-tight flex items-center rounded-md text-[10px] sm:text-xs py-2.5 px-2 gap-1.5">
                <Pin className="h-4 w-4 text-primary rotate-45" />
                <span>Featured</span>
              </Badge>
            </div>
          )}
        </div>

        {/* --- Middle: Content & Info --- */}
        <CardContent className="flex flex-col flex-1 p-4 gap-2 -mt-3">
          <h3 className="font-semibold text-base text-foreground line-clamp-1 leading-snug transition-colors group-hover/project:text-primary">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm sm:text-sm line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* --- Bottom: Tech Stack Icons (Ukuran disesuaikan agar seimbang) --- */}
          <div className="mt-auto pt-0 flex items-center gap-1.5 flex-wrap">
            {techStack.map((tech, index) => {
              const isString = typeof tech === "string";
              const iconName = isString ? tech : tech.icon;
              const iconColor = isString ? undefined : tech.color;

              if (!iconName) return null;

              return (
                <div
                  key={`${iconName}-${index}`}
                  title={iconName.split(":").pop()?.replace("-icon", "")}
                  className="flex items-center justify-center p-1 rounded hover:bg-muted border border-border/10 transition-all duration-200"
                >
                  {/* Ukuran icon diubah dari h-6 w-6 ke h-5 w-5 */}
                  <Icon
                    icon={iconName}
                    className="h-5 w-5 shrink-0 transition-transform hover:scale-110"
                    style={iconColor ? { color: iconColor } : undefined}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}