"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Logo horizontal: proporción ~1024/538
const sizes = {
  sm: { width: 95, height: 50 },
  md: { width: 245, height: 125 },
  lg: { width: 360, height: 185 },
};

export function Logo({ href = "/", className = "", size = "lg" }: LogoProps) {
  const s = sizes[size];
  const img = (
    <Image
      src="/logo.png?v=3"
      alt="Red Nordeste - Tu trabajo en Itapúa"
      width={s.width}
      height={s.height}
      className={`object-contain ${className}`}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} aria-label="Red Nordeste - Inicio">
        {img}
      </Link>
    );
  }
  return img;
}
