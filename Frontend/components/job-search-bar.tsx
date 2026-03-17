"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cities } from "@/lib/data";

interface JobSearchBarProps {
  initialKeyword?: string;
  initialCity?: string;
  variant?: "hero" | "compact";
}

export function JobSearchBar({
  initialKeyword = "",
  initialCity = "",
  variant = "hero",
}: JobSearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [city, setCity] = useState(initialCity);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (city && city !== "all") params.set("city", city);
    router.push(`/jobs?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar empleo..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg md:flex-row md:items-center md:gap-2 md:p-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Puesto, empresa o palabra clave..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="h-8 w-px bg-border hidden md:block" />

      <Select value={city} onValueChange={setCity}>
        <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus:ring-0 md:w-48">
          <SelectValue placeholder="Ciudad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las ciudades</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="mr-2 h-4 w-4" />
        Buscar
      </Button>
    </form>
  );
}
