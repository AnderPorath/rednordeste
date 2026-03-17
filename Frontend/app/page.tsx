import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JobSearchBar } from "@/components/job-search-bar";
import { JobCard } from "@/components/job-card";
import { cities } from "@/lib/data";
import { Briefcase, Users, Building2, MapPin, ArrowRight } from "lucide-react";
import { fetchJobs, fetchCompanies, fetchUsersList } from "@/lib/api";

export default async function HomePage() {
  let latestJobs: Awaited<ReturnType<typeof fetchJobs>> = [];
  let jobsCount = 0;
  let companiesCount = 0;
  let usersCount = 0;
  try {
    const [jobsList, companiesList, usersList] = await Promise.all([
      fetchJobs({}).catch(() => []),
      fetchCompanies().catch(() => []),
      fetchUsersList().catch(() => []),
    ]);
    latestJobs = jobsList.slice(0, 6);
    jobsCount = jobsList.length;
    companiesCount = companiesList.length;
    usersCount = usersList.length;
  } catch {
    // Si el backend no está disponible, la página abre igual con lista vacía
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Encuentra tu próximo empleo en{" "}
                <span className="text-primary">Itapúa</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
                La plataforma de empleo líder en el departamento de Itapúa,
                Paraguay. Conectamos talentos con las mejores oportunidades
                laborales de la región.
              </p>

              <div className="mt-10">
                <JobSearchBar />
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span>Ciudades populares:</span>
                {cities.slice(0, 4).map((city) => (
                  <Link
                    key={city}
                    href={`/jobs?city=${city}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
        </section>

        {/* Stats Section - misma forma que antes, centrado y números reales */}
        <section className="border-y border-border bg-card py-12">
          <div className="container mx-auto px-4 flex justify-center">
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobsCount}</p>
                  <p className="text-sm text-muted-foreground">Empleos activos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{companiesCount}</p>
                  <p className="text-sm text-muted-foreground">Empresas registradas</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usersCount}</p>
                  <p className="text-sm text-muted-foreground">Candidatos activos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Jobs Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Últimas Vacantes</h2>
                <p className="mt-2 text-muted-foreground">
                  Descubre las oportunidades más recientes en Itapúa
                </p>
              </div>
              <Link href="/jobs">
                <Button variant="ghost" className="hidden md:flex">
                  Ver todos los empleos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/jobs">
                <Button>
                  Ver todos los empleos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Cities Section */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Explora por Ciudad</h2>
              <p className="mt-2 text-muted-foreground">
                Encuentra oportunidades cerca de ti en todo el departamento de Itapúa
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {cities.map((city) => {
                const jobCount = latestJobs.filter((j) => j.city === city).length;
                return (
                  <Link
                    key={city}
                    href={`/jobs?city=${city}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div>
                      <p className="font-medium">{city}</p>
                      <p className="text-xs text-muted-foreground">
                        {jobCount} {jobCount === 1 ? "empleo" : "empleos"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
              <h2 className="text-2xl font-bold md:text-3xl">
                ¿Eres una empresa buscando talento?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Publica tus vacantes y encuentra a los mejores candidatos de
                Itapúa. Regístrate gratis como empresa.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Registrar mi Empresa
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Explorar Empleos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
