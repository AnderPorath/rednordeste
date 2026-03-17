import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JobCard } from "@/components/job-card";
import { JobSearchBar } from "@/components/job-search-bar";
import { CityFilter } from "@/components/city-filter";
import { JobTypeFilter } from "@/components/job-type-filter";
import { type City, type JobType } from "@/lib/data";
import { fetchJobs } from "@/lib/api";
import { Briefcase } from "lucide-react";

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    type?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const keyword = params.q || "";
  const city = params.city as City | undefined;
  const jobType = params.type as JobType | undefined;

  const jobs = await fetchJobs({
    q: keyword,
    city,
    type: jobType,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold md:text-3xl">Buscar Empleos</h1>
            <p className="mt-2 text-muted-foreground">
              {jobs.length} {jobs.length === 1 ? "empleo encontrado" : "empleos encontrados"}
              {keyword && ` para "${keyword}"`}
              {city && ` en ${city}`}
            </p>

            <div className="mt-6">
              <JobSearchBar
                initialKeyword={keyword}
                initialCity={city || ""}
                variant="compact"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Sidebar Filters */}
              <aside className="w-full shrink-0 lg:w-64">
                <div className="sticky top-24 space-y-6 rounded-lg border border-border bg-card p-4">
                  <Suspense fallback={<div>Loading...</div>}>
                    <CityFilter />
                  </Suspense>
                  <div className="h-px bg-border" />
                  <Suspense fallback={<div>Loading...</div>}>
                    <JobTypeFilter />
                  </Suspense>
                </div>
              </aside>

              {/* Job List */}
              <div className="flex-1">
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No se encontraron empleos
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Intenta ajustar tus filtros de búsqueda
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
