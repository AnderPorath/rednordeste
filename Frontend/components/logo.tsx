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
  sm: { width: 85, height: 45 },
  md: { width: 115, height: 60 },
  lg: { width: 145, height: 76 },
};

export function Logo({ href = "/", className = "", size = "md" }: LogoProps) {
  const s = sizes[size];
  const img = (
    <Image
      src="/logo.png?v=7"
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
