"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  Plus,
  MapPin,
  Eye,
  Users,
  Briefcase,
  Clock,
} from "lucide-react";
import { formatJobType } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { deleteJob, fetchCompanyApplications, fetchCompanyJobs, updateCompanyMe, uploadCompanyLogo, type ApiApplication, type ApiJob } from "@/lib/api";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, userType, company: authCompany, updateCompany, getAuthHeaders } = useAuth();
  const [company, setCompany] = useState<{
    id: string;
    name: string;
    email: string;
    location: string;
    description?: string;
    logo?: string;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companySaveError, setCompanySaveError] = useState<string | null>(null);
  const [companyJobs, setCompanyJobs] = useState<ApiJob[]>([]);
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const headers = getAuthHeaders();
  const tz = "America/Asuncion";

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const fullUrl = (p?: string) => {
    if (!p) return undefined;
    if (p.startsWith("http")) return p;
    const normalized = p.startsWith("/") ? p : `/${p}`;
    if (normalized.startsWith("/uploads/")) {
      return `/api/avatar?path=${encodeURIComponent(normalized)}`;
    }
    return `${API_BASE_URL}${normalized}`;
  };

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn || userType !== "company") {
      router.replace("/login");
      return;
    }
    if (authCompany) {
      setCompany(authCompany);
    }
  }, [isReady, isLoggedIn, userType, authCompany, router]);

  useEffect(() => {
    if (!company?.id) return;
    fetchCompanyJobs(company.id)
      .then(setCompanyJobs)
      .catch(() => setCompanyJobs([]));
  }, [company?.id]);

  useEffect(() => {
    if (!company?.id) return;
    fetchCompanyApplications(headers)
      .then(setApplications)
      .catch(() => setApplications([]));
  }, [company?.id, headers]);

  const handleDeleteJob = async (jobId: string) => {
    setDeletingJobId(jobId);
    try {
      await deleteJob(jobId);
      setCompanyJobs((prev) => prev.filter((j) => j.id !== jobId));
    } finally {
      setDeletingJobId(null);
    }
  };

  const totalApplications = applications.length;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company) return;
    setCompanySaveError(null);
    setSavingCompany(true);
    const formData = new FormData(e.currentTarget);
    const logoFile = e.currentTarget.querySelector<HTMLInputElement>('input[name="logo"]')?.files?.[0];
    const next = {
      ...company,
      name: (formData.get("name") as string) || company.name,
      description: (formData.get("description") as string) ?? company.description,
    };
    try {
      let updatedLogo = next.logo;
      if (logoFile) {
        const res = await uploadCompanyLogo(headers, logoFile);
        updatedLogo = (res.logo ?? undefined) as any;
      }
      const res = await updateCompanyMe(headers, { name: next.name, description: next.description, location: next.location });
      const merged = { ...next, logo: (updatedLogo ?? res.logo ?? undefined) as any };
      setCompany(merged);
      updateCompany({ name: merged.name, description: merged.description, logo: merged.logo });
      setEditOpen(false);
    } catch (err) {
      setCompanySaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingCompany(false);
    }
  };

  if (!isReady || !company) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <p className="text-muted-foreground">Cargando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Stats Row */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{companyJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Empleos activos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalApplications}</p>
                  <p className="text-sm text-muted-foreground">Postulaciones</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">245</p>
                  <p className="text-sm text-muted-foreground">Vistas totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Company Profile */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={fullUrl(company.logo)} alt={company.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {company.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <h1 className="mt-4 text-xl font-bold">{company.name}</h1>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}, Itapúa</span>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {company.description}
                  </p>

                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-6 w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Perfil de Empresa</DialogTitle>
                        <DialogDescription>
                          Actualiza la información de tu empresa
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre de la empresa</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={company.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={company.description}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Foto / Logo</Label>
                          <Input
                            type="file"
                            name="logo"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground">Opcional. JPEG, PNG, GIF o WebP (máx. 5 MB)</p>
                        </div>
                        {companySaveError && (
                          <p className="text-sm text-destructive">{companySaveError}</p>
                        )}
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditOpen(false)}
                            disabled={savingCompany}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={savingCompany}>
                            {savingCompany ? "Guardando…" : "Guardar Cambios"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Posted Jobs */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Empleos Publicados</h2>
                <Link href="/dashboard/company/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Empleo
                  </Button>
                </Link>
              </div>

              <Card>
                <CardContent className="p-0">
                  {companyJobs.length > 0 ? (
                    <div className="divide-y divide-border">
                      {companyJobs.map((job) => {
                        const jobApplications = applications.filter((a) => a.jobId === job.id).length;
                        return (
                          <div
                            key={job.id}
                            className="flex items-center justify-between gap-4 p-4"
                          >
                            <div className="flex-1">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {job.title}
                              </Link>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.city}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {new Date(job.postedAt).toLocaleDateString("es-PY", { timeZone: tz })}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="secondary">
                                  {formatJobType(job.type)}
                                </Badge>
                                <Badge variant="outline">
                                  {jobApplications} postulaciones
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/jobs/${job.id}?from=company`}>
                                <Button variant="outline" size="sm">
                                  Ver empleo
                                </Button>
                              </Link>
                              <Link href={`/dashboard/company/applications?job=${job.id}`}>
                                <Button variant="outline" size="sm">
                                  <Users className="mr-2 h-4 w-4" />
                                  Ver Postulantes
                                </Button>
                              </Link>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    Eliminar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Eliminar empleo</DialogTitle>
                                    <DialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará la vacante y sus postulaciones.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="rounded-md border border-border p-3 text-sm">
                                    <div className="font-semibold">{job.title}</div>
                                    <div className="text-muted-foreground">{job.city} · {formatJobType(job.type)}</div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button type="button" variant="outline">
                                        Cancelar
                                      </Button>
                                    </DialogClose>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      disabled={deletingJobId === job.id}
                                      onClick={() => handleDeleteJob(job.id)}
                                    >
                                      {deletingJobId === job.id ? "Eliminando…" : "Eliminar"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">
                        No has publicado empleos
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Publica tu primera vacante para encontrar candidatos
                      </p>
                      <Link href="/dashboard/company/create" className="mt-4">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Publicar Empleo
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
