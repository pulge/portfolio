// src/components/Marquee.tsx
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const icons = [
    { name: 'logos:c', label: 'C' },
    { name: 'logos:javascript', label: 'JavaScript' },
    { name: 'logos:postgresql', label: 'PostgreSQL' },
    { name: 'logos:python', label: 'Python' },
    { name: 'logos:tailwindcss-icon', label: 'Tailwind CSS' },
    { name: 'logos:astro-icon', label: 'Astro' },
    { name: 'logos:github-icon', label: 'GitHub' },
    { name: 'logos:linux-tux', label: 'Linux' },
    { name: 'logos:typescript-icon', label: 'TypeScript' },
    { name: 'mdi:blender-software', label: 'Blender' },
    { name: 'logos:figma', label: 'Figma' },
];

export default function TechMarquee() {
    return (
        <div className="relative w-full overflow-hidden">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Marquee content */}
            <motion.div
                className="flex gap-12 grayscale"
                animate={{
                    x: [0, -1000],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 20,
                        ease: "linear",
                    },
                }}
            >
                {/* First set of icons */}
                {icons.map(({ name, label }, index) => (
                    <div key={`first-${index}`} className="flex-shrink-0">
                        <Icon icon={name} width="48" height="48" />
                    </div>
                ))}

                {/* Duplicate set for seamless loop */}
                {icons.map(({ name, label }, index) => (
                    <div key={`second-${index}`} className="flex-shrink-0">
                        <Icon icon={name} width="48" height="48" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}