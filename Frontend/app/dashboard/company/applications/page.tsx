"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, MapPin, Calendar, FileText, User } from "lucide-react";
import { fetchCompanyApplications, fetchCompanyJobs, type ApiApplication, type ApiJob } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ApplicationsPage() {
  const sp = useSearchParams();
  const jobId = sp.get("job") ?? undefined;
  const { isReady, isLoggedIn, userType, company, getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();
  const [apps, setApps] = useState<ApiApplication[]>([]);
  const [jobs, setJobs] = useState<ApiJob[]>([]);

  useEffect(() => {
    if (!isReady || !isLoggedIn || userType !== "company" || !company?.id) return;
    fetchCompanyApplications(headers, jobId)
      .then(setApps)
      .catch(() => setApps([]));
    fetchCompanyJobs(company.id)
      .then(setJobs)
      .catch(() => setJobs([]));
  }, [isReady, isLoggedIn, userType, company?.id, headers, jobId]);

  const job = useMemo(() => (jobId ? jobs.find((j) => j.id === jobId) : null), [jobId, jobs]);
  const tz = "America/Asuncion";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const fullUrl = (p?: string | null) => {
    if (!p) return undefined;
    if (p.startsWith("http")) return p;
    const normalized = p.startsWith("/") ? p : `/${p}`;
    if (normalized.startsWith("/uploads/")) {
      return `/api/avatar?path=${encodeURIComponent(normalized)}`;
    }
    return `${API_BASE_URL}${normalized}`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/dashboard/company"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Postulaciones Recibidas</h1>
            {job && (
              <p className="mt-1 text-muted-foreground">
                Para: <strong>{job.title}</strong>
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {apps.length}{" "}
                {apps.length === 1 ? "Postulante" : "Postulantes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apps.length > 0 ? (
                <div className="space-y-4">
                  {apps.map((app) => {
                    const appJob = jobs.find((j) => j.id === app.jobId);
                    return (
                      <div
                        key={app.id}
                        className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={fullUrl(app.userAvatar)} alt={app.userName} />
                            <AvatarFallback>
                              {app.userName
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{app.userName}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{app.userCity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(app.appliedAt).toLocaleString("es-PY", {
                                    timeZone: tz,
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            {!jobId && appJob && (
                              <div className="mt-2">
                                <Badge variant="outline">{appJob.title}</Badge>
                              </div>
                            )}
                            {app.message && (
                              <p className="mt-2 text-sm text-muted-foreground border-l-2 border-border pl-3 italic">
                                &ldquo;{app.message}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                          <Link
                            href={`/dashboard/company/candidates/${encodeURIComponent(app.userId)}${jobId ? `?job=${encodeURIComponent(jobId)}` : ""}`}
                          >
                            <Button size="sm" variant="outline">
                              <User className="mr-2 h-4 w-4" />
                              Ver perfil
                            </Button>
                          </Link>
                          <a href={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + app.cvUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Descargar CV
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold">
                    No hay postulaciones aún
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cuando los candidatos se postulen, aparecerán aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
