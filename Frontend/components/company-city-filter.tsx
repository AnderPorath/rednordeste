"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { cities } from "@/lib/data";

export function CompanyCityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get("city") ?? "all";

  const handleCityChange = (city: string) => {
    const params = new URLSearchParams();
    if (city && city !== "all") params.set("city", city);
    router.push(`/companies?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:gap-2 md:p-3">
      <div className="flex items-center gap-2 text-muted-foreground md:pl-1">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">Ciudad</span>
      </div>
      <div className="h-px bg-border md:h-8 md:w-px md:self-stretch" />
      <Select value={currentCity} onValueChange={handleCityChange}>
        <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus:ring-0 md:w-56">
          <SelectValue placeholder="Todas las ciudades" />
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
    </div>
  );
}
