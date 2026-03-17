import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Building2, MapPin, Briefcase } from "lucide-react";
import type { ApiCompany } from "@/lib/api";

interface CompanyCardProps {
  company: ApiCompany;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const jobsCount = company.jobs?.length ?? 0;

  return (
    <Card className="flex h-full flex-col transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className="flex-1 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/companies/${company.id}`}>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                {company.name}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{company.location}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
          {company.description}
        </p>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-3">
        <div className="flex w-full items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            {jobsCount} {jobsCount === 1 ? "vacante" : "vacantes"}
          </span>
          <Link
            href={`/companies/${company.id}`}
            className="font-medium text-primary hover:underline"
          >
            Ver empresa
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
