"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatJobType, type JobType } from "@/lib/data";
import { Clock } from "lucide-react";

const jobTypes: JobType[] = ["full-time", "part-time", "contract", "remote"];

export function JobTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  const handleTypeClick = (type: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4" />
        Tipo de Empleo
      </h3>
      <div className="flex flex-col gap-2">
        <Button
          variant={!currentType ? "default" : "outline"}
          size="sm"
          className="justify-start"
          onClick={() => handleTypeClick(null)}
        >
          Todos
        </Button>
        {jobTypes.map((type) => (
          <Button
            key={type}
            variant={currentType === type ? "default" : "outline"}
            size="sm"
            className="justify-start"
            onClick={() => handleTypeClick(type)}
          >
            {formatJobType(type)}
          </Button>
        ))}
      </div>
    </div>
  );
}
