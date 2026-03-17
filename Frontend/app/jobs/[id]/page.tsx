import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JobActions } from "@/components/job-actions";
import { JobApplyCta } from "@/components/job-apply-cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatJobType } from "@/lib/data";
import { fetchJobById, fetchJobs } from "@/lib/api";
import {
  MapPin,
  Banknote,
  Clock,
  Building2,
  ArrowLeft,
  Share2,
  CheckCircle,
} from "lucide-react";
import { JobCard } from "@/components/job-card";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}

export default async function JobDetailsPage({ params, searchParams }: JobDetailsPageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const job = await fetchJobById(id);

  if (!job) {
    notFound();
  }

  // Get related jobs (same city or same company, excluding current)
  const relatedCandidates = await fetchJobs({
    city: job.city as any,
  });
  const relatedJobs = relatedCandidates
    .filter(
      (j) =>
        j.id !== job.id && (j.city === job.city || j.company === job.company)
    )
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <Link
              href={sp.from === "company" ? "/dashboard/company" : "/jobs"}
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {sp.from === "company" ? "Volver al panel" : "Volver a empleos"}
            </Link>

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={job.type === "remote" ? "default" : "secondary"}>
                    {formatJobType(job.type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Publicado:{" "}
                    {new Date(job.postedAt).toLocaleDateString("es-PY", {
                      timeZone: "America/Asuncion",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h1 className="text-3xl font-bold md:text-4xl">{job.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium text-foreground">
                      {job.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{job.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    <span>{job.salary}</span>
                  </div>
                </div>
              </div>

              <JobActions jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Main Content */}
              <div className="flex-1 space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">Descripción del Puesto</h2>
                    <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">Requisitos</h2>
                    <ul className="mt-4 space-y-3">
                      {job.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">Sobre la Empresa</h2>
                    <div className="mt-4">
                      <h3 className="font-medium">{job.company}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Empresa ubicada en {job.city}, Itapúa. Comprometida con
                        el crecimiento profesional de sus colaboradores.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <aside className="w-full shrink-0 lg:w-80">
                <div className="sticky top-24 space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold">Resumen del Empleo</h3>
                      <div className="mt-4 space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Tipo de Empleo</p>
                            <p className="text-muted-foreground">
                              {formatJobType(job.type)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Ubicación</p>
                            <p className="text-muted-foreground">
                              {job.city}, Itapúa
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Banknote className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Salario</p>
                            <p className="text-muted-foreground">{job.salary}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <JobApplyCta jobTitle={job.title} jobId={job.id} />
                      </div>
                    </CardContent>
                  </Card>

                  {relatedJobs.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Empleos Relacionados</h3>
                      {relatedJobs.map((relatedJob) => (
                        <JobCard
                          key={relatedJob.id}
                          job={relatedJob}
                          variant="compact"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
