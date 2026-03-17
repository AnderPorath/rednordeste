"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cities } from "@/lib/data";
import { MapPin } from "lucide-react";

export function CityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get("city");

  const handleCityClick = (city: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MapPin className="h-4 w-4" />
        Filtrar por Ciudad
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!currentCity ? "default" : "outline"}
          size="sm"
          onClick={() => handleCityClick(null)}
        >
          Todas
        </Button>
        {cities.map((city) => (
          <Button
            key={city}
            variant={currentCity === city ? "default" : "outline"}
            size="sm"
            onClick={() => handleCityClick(city)}
          >
            {city}
          </Button>
        ))}
      </div>
    </div>
  );
}
