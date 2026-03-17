"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail, FileText } from "lucide-react";
import { fetchCompanyCandidate, type ApiCandidateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function CompanyCandidateProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 bg-muted/30">
            <div className="container mx-auto px-4 py-8">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <CompanyCandidateProfilePageInner />
    </Suspense>
  );
}

function CompanyCandidateProfilePageInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const fromJob = sp.get("job") ?? undefined;
  const { isReady, isLoggedIn, userType, company, getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();
  const [candidate, setCandidate] = useState<ApiCandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fullAvatarUrl = useMemo(() => {
    const p = candidate?.avatar;
    if (!p) return undefined;
    if (p.startsWith("http")) return p;
    const normalized = p.startsWith("/") ? p : `/${p}`;
    if (normalized.startsWith("/uploads/")) {
      return `/api/avatar?path=${encodeURIComponent(normalized)}`;
    }
    return `${API_BASE_URL}${normalized}`;
  }, [candidate?.avatar, API_BASE_URL]);

  const cvUrl = useMemo(() => {
    const p = candidate?.cvUrl;
    if (!p) return undefined;
    if (p.startsWith("http")) return p;
    const normalized = p.startsWith("/") ? p : `/${p}`;
    return `${API_BASE_URL}${normalized}`;
  }, [candidate?.cvUrl, API_BASE_URL]);

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn || userType !== "company" || !company?.id) {
      router.replace("/login");
      return;
    }
    const id = params?.id;
    if (!id) return;
    setError(null);
    fetchCompanyCandidate(headers, id)
      .then(setCandidate)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar candidato"));
  }, [isReady, isLoggedIn, userType, company?.id, headers, params?.id, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={fromJob ? `/dashboard/company/applications?job=${encodeURIComponent(fromJob)}` : "/dashboard/company/applications"}
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a postulantes
          </Link>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Perfil del postulante</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {!candidate ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={fullAvatarUrl} alt={candidate.name} />
                      <AvatarFallback className="text-lg">
                        {candidate.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{candidate.name}</h2>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                    </div>
                    {cvUrl && (
                      <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                        <Button>
                          <Download className="mr-2 h-4 w-4" />
                          Descargar CV
                        </Button>
                      </a>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Descripción</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {candidate.description || "Sin descripción."}
                    </p>
                  </div>
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

