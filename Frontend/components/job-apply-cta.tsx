"use client";

import { ApplyDialog } from "@/components/apply-dialog";
import { useAuth } from "@/lib/auth-context";

export function JobApplyCta({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { userType } = useAuth();
  if (userType === "company") return null;
  return <ApplyDialog jobTitle={jobTitle} jobId={jobId} fullWidth />;
}

