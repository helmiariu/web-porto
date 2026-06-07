// src/components/ui/blog-dropdown.tsx
import { Layers, ChevronDown, BadgeDollarSign, Bike, BookHeart, BriefcaseBusiness, Cpu, FlaskRound, HeartPulse, Scale } from "lucide-react";
import { Button } from "@components/components/ui/button";
import { Badge } from "@components/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/components/ui/dropdown-menu";


const categories = [
    { name: "Technology", totalPosts: 10, icon: Cpu },
    { name: "Business", totalPosts: 5, icon: BriefcaseBusiness },
    { name: "Finance", totalPosts: 8, icon: BadgeDollarSign },
    { name: "Health", totalPosts: 12, icon: HeartPulse },
    { name: "Lifestyle", totalPosts: 15, icon: BookHeart },
    { name: "Politics", totalPosts: 20, icon: Scale },
    { name: "Science", totalPosts: 25, icon: FlaskRound },
    { name: "Sports", totalPosts: 30, icon: Bike },
];

export const CategoryDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-xs">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span>Categories</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {categories.map((category) => (
                    <DropdownMenuItem key={category.name} className="flex items-center justify-between gap-2 cursor-pointer py-2">
                        <div className="flex items-center gap-2.5">
                            <category.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <Badge className="rounded-full bg-foreground/7 px-1.5 py-0 text-foreground text-[10px] h-5 flex items-center justify-center">
                            {category.totalPosts}
                        </Badge>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};