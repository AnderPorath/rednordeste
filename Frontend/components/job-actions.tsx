"use client";

import { Button } from "@/components/ui/button";
import { SaveJobButton } from "@/components/save-job-button";
import { ApplyDialog } from "@/components/apply-dialog";
import { Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function JobActions({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { userType } = useAuth();

  return (
    <div className="flex flex-wrap gap-2">
      <SaveJobButton jobId={jobId} />
      <Button variant="outline" size="icon" aria-label="Compartir">
        <Share2 className="h-4 w-4" />
      </Button>
      {userType !== "company" && <ApplyDialog jobTitle={jobTitle} jobId={jobId} />}
    </div>
  );
}

