import React, { useState } from "react";
import { Pin, ChevronRight, Clock, Calendar, Eye, ArrowUpRight } from "lucide-react";
import { Icon } from "@iconify/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { Badge } from "@components/components/ui/badge";
import Gallerycard from "@components/components/gallery-card";
import { cn } from "@components/lib/utils";

export interface TechItem {
  icon?: string;
  color?: string;
}

export interface ProjectItem {
  id: string;
  data: {
    title: string;
    description: string;
    heroImage: string;
    techStack: TechItem[];
    isFeatured?: boolean;
  };
}

export interface BlogItem {
  id: string;
  data: {
    title?: string;
    description?: string;
    category?: string;
    image?: string;
    readTime?: string;
    pubDate?: string | Date;
  };
}

export interface AlbumItem {
  name: string;
  images: string[];
  modelUrl?: string;
  wireframeUrl?: string;
}

interface InteractiveFeaturedProps {
  projects: ProjectItem[];
  blogs: BlogItem[];
  albums: AlbumItem[];
}

export function InteractiveFeatured({ projects, blogs, albums }: InteractiveFeaturedProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getCardClassName = (id: string, defaultSpan: string, glowColor: "cyan" | "purple" | "yellow") => {
    const isHovered = hoveredId === id;
    const isAnyHovered = hoveredId !== null;

    let glowStyle = "";
    if (glowColor === "cyan") {
      glowStyle = "hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.12)] hover:ring-1 hover:ring-cyan-500/15";
    } else if (glowColor === "purple") {
      glowStyle = "hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.12)] hover:ring-1 hover:ring-purple-500/15";
    } else if (glowColor === "yellow") {
      glowStyle = "hover:border-yellow-500/30 hover:shadow-[0_0_40px_rgba(234,179,8,0.12)] hover:ring-1 hover:ring-yellow-500/15";
    }

    return cn(
      "group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/40 backdrop-blur-md transition-all duration-500 ease-out",
      defaultSpan,
      glowStyle,
      isAnyHovered && !isHovered ? "opacity-35 blur-[0.5px] scale-[0.98]" : "opacity-100 scale-100",
      isHovered ? "z-10 scale-[1.01]" : "z-0"
    );
  };

  const p0 = projects[0];
  const p1 = projects[1];
  const b0 = blogs[0];
  const b1 = blogs[1];
  const a0 = albums[0];
  const a1 = albums[1];

  const renderProjectCard = (proj: ProjectItem, id: string, spanClass: string) => {
    if (!proj) return null;
    const { title, description, heroImage, techStack = [], isFeatured } = proj.data;
    
    // For primary featured project (p0), render a beautiful Hero covered overlay card.
    if (proj.id === p0?.id) {
      return (
        <a
          href={`/project/${proj.id}`}
          data-astro-reload
          className={getCardClassName(id, spanClass, "cyan")}
          onMouseEnter={() => setHoveredId(id)}
          onMouseLeave={() => setHoveredId(null)}
          key={proj.id}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={heroImage}
              alt={title}
              className="h-full w-full object-cover opacity-35 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-transparent z-10" />
          </div>

          <div className="relative z-20 flex flex-col justify-between h-full min-h-[360px] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase">
                <Pin className="h-3 w-3 rotate-45" /> Featured Project
              </span>
              <span className="text-zinc-400 group-hover:text-cyan-400 transition-colors flex items-center gap-1 text-xs">
                View Project <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                {title}
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base max-w-2xl line-clamp-2 leading-relaxed">
                {description}
              </p>

              {/* Tech Stack */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {techStack.map((tech, idx) => {
                  const isString = typeof tech === "string";
                  const iconName = isString ? tech : tech.icon;
                  const iconColor = isString ? undefined : tech.color;

                  if (!iconName) return null;

                  return (
                    <div
                      key={`${iconName}-${idx}`}
                      title={iconName.split(":").pop()?.replace("-icon", "")}
                      className="flex items-center justify-center p-1.5 rounded-lg bg-zinc-900/60 border border-white/5 transition-all hover:bg-zinc-800"
                    >
                      <Icon
                        icon={iconName}
                        className="h-5 w-5 transition-transform group-hover:scale-110"
                        style={iconColor ? { color: iconColor } : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </a>
      );
    }

    // Standard Project Card
    return (
      <a
        href={`/project/${proj.id}`}
        data-astro-reload
        className={getCardClassName(id, spanClass, "cyan")}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        key={proj.id}
      >
        <div className="relative aspect-[18/9] w-full overflow-hidden bg-zinc-950">
          <img
            src={heroImage}
            alt={title}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
          {isFeatured && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 bg-black/70 text-white backdrop-blur-md border border-white/10 text-[10px] font-medium px-2 py-0.5 rounded-md">
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              {techStack.slice(0, 4).map((tech, idx) => {
                const isString = typeof tech === "string";
                const iconName = isString ? tech : tech.icon;
                const iconColor = isString ? undefined : tech.color;

                if (!iconName) return null;

                return (
                  <Icon
                    key={`${iconName}-${idx}`}
                    icon={iconName}
                    className="h-4.5 w-4.5 text-zinc-400 transition-transform group-hover:scale-110"
                    style={iconColor ? { color: iconColor } : undefined}
                  />
                );
              })}
              {techStack.length > 4 && (
                <span className="text-[10px] text-zinc-500 font-medium">+{techStack.length - 4}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
              Explore <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </a>
    );
  };

  const renderBlogCard = (blog: BlogItem, id: string, spanClass: string) => {
    if (!blog) return null;
    const { title, description, category, image, readTime, pubDate } = blog.data;
    const formattedDate = pubDate
      ? new Date(pubDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

    return (
      <a
        href={`/blog/${blog.id}`}
        className={getCardClassName(id, spanClass, "yellow")}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        key={blog.id}
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-zinc-950">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
          <Badge className="absolute top-3 left-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md">
            {category || "General"}
          </Badge>
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg text-white group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
            <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="mt-auto pt-2 flex items-center gap-4 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{readTime || "5 min read"}</span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>
      </a>
    );
  };

  const renderGalleryCard = (album: AlbumItem, id: string, spanClass: string) => {
    if (!album) return null;
    return (
      <div
        className={getCardClassName(id, spanClass, "purple")}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        key={album.name}
      >
        <div className="p-3 pb-0 text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center justify-between">
          <span>3D Showcase</span>
          <a
            href="/3Dgallery"
            className="text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-0.5 font-medium normal-case"
          >
            All 3D &rarr;
          </a>
        </div>
        
        {/* Transparent embedded container */}
        <div className="flex-1 flex flex-col justify-start bg-transparent">
          <Gallerycard
            albumName={album.name}
            images={album.images}
            modelUrl={album.modelUrl}
            wireframeUrl={album.wireframeUrl}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <Tabs defaultValue="all" className="w-full flex flex-col items-center">
        <TabsList className="bg-zinc-900/60 border border-white/5 p-1 rounded-xl w-full max-w-md grid grid-cols-4">
          <TabsTrigger value="all" className="rounded-lg text-xs font-semibold py-1.5 transition-all">All</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg text-xs font-semibold py-1.5 transition-all">Projects</TabsTrigger>
          <TabsTrigger value="3d" className="rounded-lg text-xs font-semibold py-1.5 transition-all">3D Gallery</TabsTrigger>
          <TabsTrigger value="articles" className="rounded-lg text-xs font-semibold py-1.5 transition-all">Articles</TabsTrigger>
        </TabsList>

        {/* ALL TAB */}
        <TabsContent value="all" className="w-full mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {renderProjectCard(p0, "proj-p0", "lg:col-span-2")}
            {renderGalleryCard(a0, "gal-a0", "lg:col-span-1")}
            {renderBlogCard(b0, "blog-b0", "lg:col-span-1")}
            {renderProjectCard(p1, "proj-p1", "lg:col-span-1")}
            {renderBlogCard(b1, "blog-b1", "lg:col-span-1")}
            {renderGalleryCard(a1, "gal-a1", "lg:col-span-1")}
          </div>
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="w-full mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj, index) => renderProjectCard(proj, `proj-${proj.id}`, "col-span-1"))}
          </div>
        </TabsContent>

        {/* 3D GALLERY TAB */}
        <TabsContent value="3d" className="w-full mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {albums.map((album, index) => renderGalleryCard(album, `gal-${album.name}`, "col-span-1"))}
          </div>
        </TabsContent>

        {/* ARTICLES TAB */}
        <TabsContent value="articles" className="w-full mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog, index) => renderBlogCard(blog, `blog-${blog.id}`, "col-span-1"))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
