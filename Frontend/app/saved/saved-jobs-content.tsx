"use client";

import { useAuth } from "@/lib/auth-context";
import { useSavedJobs } from "@/lib/saved-jobs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchJobById, type ApiJob } from "@/lib/api";
import { JobCard } from "@/components/job-card";
import { SaveJobButton } from "@/components/save-job-button";

export function SavedJobsContent() {
  const { isLoggedIn, userType, isReady } = useAuth();
  const { savedIds, isReady: savedReady } = useSavedJobs();
  const router = useRouter();
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn || userType !== "user") {
      router.replace("/login");
      return;
    }
  }, [isReady, isLoggedIn, userType, router]);

  useEffect(() => {
    if (!savedReady || savedIds.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(savedIds.map((id) => fetchJobById(id)))
      .then((results) => setJobs(results.filter((j): j is ApiJob => j != null)))
      .finally(() => setLoading(false));
  }, [savedReady, savedIds]);

  if (!isReady || !isLoggedIn || userType !== "user") {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Bookmark className="h-6 w-6" />
        Empleos guardados
      </h1>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          <p className="mb-4">Aún no tienes empleos guardados.</p>
          <Link href="/jobs" className="font-medium text-primary hover:underline">
            Buscar empleos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <div className="absolute right-2 top-2 z-10">
                <SaveJobButton jobId={job.id} />
              </div>
              <JobCard
                job={{
                  ...job,
                  city: job.city as Parameters<typeof JobCard>[0]["job"]["city"],
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
