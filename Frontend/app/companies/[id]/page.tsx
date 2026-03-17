import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchCompanyById } from "@/lib/api";
import { fetchJobs } from "@/lib/api";
import { JobCard } from "@/components/job-card";
import { Building2, MapPin, Mail, ArrowLeft } from "lucide-react";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const company = await fetchCompanyById(id);

  if (!company) {
    notFound();
  }

  const allJobs = await fetchJobs({});
  const companyJobs = allJobs.filter((j) => j.company === company.name);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <Link
              href="/companies"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a empresas
            </Link>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{company.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.location}
                  </span>
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold">Sobre la empresa</h2>
                    <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
                      {company.description}
                    </p>
                  </CardContent>
                </Card>

                {companyJobs.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Vacantes publicadas ({companyJobs.length})
                    </h2>
                    <div className="space-y-4">
                      {companyJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold">Contacto</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {company.location}, Itapúa
                    </p>
                    <a
                      href={`mailto:${company.email}`}
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      {company.email}
                    </a>
                    <Link href="/jobs" className="mt-4 block">
                      <Button className="w-full">Ver todas las vacantes</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
