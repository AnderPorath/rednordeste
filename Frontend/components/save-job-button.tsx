"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useSavedJobs } from "@/lib/saved-jobs";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SaveJobButtonProps {
  jobId: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SaveJobButton({
  jobId,
  variant = "outline",
  size = "icon",
  className,
}: SaveJobButtonProps) {
  const { isSaved, toggle, isReady } = useSavedJobs();
  const { isLoggedIn, userType } = useAuth();
  const router = useRouter();

  const saved = isReady && isSaved(jobId);
  const canSave = isLoggedIn && userType === "user";

  const handleClick = () => {
    if (!canSave) {
      router.push("/login");
      return;
    }
    toggle(jobId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleClick}
            aria-label={saved ? "Quitar de guardados" : "Guardar empleo"}
          >
            <Bookmark
              className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!canSave
            ? "Inicia sesión como candidato para guardar"
            : saved
              ? "Quitar de empleos guardados"
              : "Guardar empleo"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
