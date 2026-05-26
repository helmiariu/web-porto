// src/components/MarqueeSkills.jsx
import Marquee from "react-fast-marquee";
import {
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiAstro,
  SiTailwindcss,
  SiBlender,
  SiAutocad,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiMongodb,
  SiPrisma,
  SiGit,
  SiDocker,
  SiFigma,
  SiBun,
  SiAutodeskmaya,
} from "react-icons/si";
import { FaCss3Alt } from "react-icons/fa"; // Amankan CSS3 menggunakan Font Awesome

const row1Skills = [
  { name: "HTML5", icon: <SiHtml5 className="text-[#E34F26]" /> },
  { name: "CSS3", icon: <FaCss3Alt className="text-[#1572B6]" /> },
  { name: "JavaScript", icon: <SiJavascript className="text-[#F7DF1E]" /> },
  { name: "TypeScript", icon: <SiTypescript className="text-[#3178C6]" /> },
  { name: "React", icon: <SiReact className="text-[#61DAFB]" /> },
  { name: "Astro", icon: <SiAstro className="text-[#BC52EE]" /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss className="text-[#06B6D4]" /> },
  { name: "Blender", icon: <SiBlender className="text-[#F5792A]" /> },
  { name: "3D Maya", icon: <SiAutodeskmaya className="text-[#37A5CC]" /> },
  { name: "AutoCAD", icon: <SiAutocad className="text-[#E2231A]" /> },
];

const row2Skills = [
  { name: "Node.js", icon: <SiNodedotjs className="text-[#339933]" /> },
  {
    name: "Express",
    icon: <SiExpress className="text-[#000000] dark:text-white" />,
  },
  { name: "PostgreSQL", icon: <SiPostgresql className="text-[#4169E1]" /> },
  { name: "MongoDB", icon: <SiMongodb className="text-[#47A248]" /> },
  {
    name: "Prisma",
    icon: <SiPrisma className="text-[#2D3748] dark:text-white" />,
  },
  { name: "Git", icon: <SiGit className="text-[#F05032]" /> },
  { name: "Docker", icon: <SiDocker className="text-[#2496ED]" /> },
  { name: "Figma", icon: <SiFigma className="text-[#F24E1E]" /> },
  { name: "Bun", icon: <SiBun className="text-[#FBF0DF]" /> },
];

export default function MarqueeSkills() {
  return (
    <div className="flex flex-col gap-4 w-full relative">
      {/* Baris 1: Ke Kiri */}
      <Marquee speed={40} pauseOnHover={true} direction="left" autoFill={true}>
        {row1Skills.map((skill, index) => (
          <div
            key={`row1-${index}`}
            className="inline-flex items-center justify-center gap-3 px-6 py-3 mx-2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-medium text-sm transition-all hover:bg-[hsl(var(--muted))] hover:scale-105 select-none"
          >
            <span className="text-xl flex items-center justify-center">
              {skill.icon}
            </span>
            <span>{skill.name}</span>
          </div>
        ))}
      </Marquee>

      {/* Baris 2: Ke Ranan */}
      <Marquee speed={40} pauseOnHover={true} direction="right" autoFill={true}>
        {row2Skills.map((skill, index) => (
          <div
            key={`row2-${index}`}
            className="inline-flex items-center justify-center gap-3 px-6 py-3 mx-2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-medium text-sm transition-all hover:bg-[hsl(var(--muted))] hover:scale-105 select-none"
          >
            <span className="text-xl flex items-center justify-center">
              {skill.icon}
            </span>
            <span>{skill.name}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
