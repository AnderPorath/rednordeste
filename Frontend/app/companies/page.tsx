import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CompanyCard } from "@/components/company-card";
import { CompanyCityFilter } from "@/components/company-city-filter";
import { fetchCompanies } from "@/lib/api";
import { Building2 } from "lucide-react";

interface CompaniesPageProps {
  searchParams: Promise<{ city?: string }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const city = params.city;
  const companies = await fetchCompanies({ city });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold md:text-3xl">Empresas</h1>
            <p className="mt-2 text-muted-foreground">
              {companies.length}{" "}
              {companies.length === 1 ? "empresa encontrada" : "empresas encontradas"}
              {city && ` en ${city}`}
            </p>
            <div className="mt-4">
              <Suspense fallback={<div className="h-10" />}>
                <CompanyCityFilter />
              </Suspense>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {companies.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">
                  {city ? "No hay empresas en esta ciudad" : "No hay empresas registradas"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {city
                    ? "Prueba con otra ciudad o quita el filtro."
                    : "Pronto podrás ver las empresas que publican vacantes en la región."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
