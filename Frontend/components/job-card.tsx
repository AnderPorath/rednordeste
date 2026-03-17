import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Banknote, Building2 } from "lucide-react";
import { type Job, formatJobType } from "@/lib/data";

interface JobCardProps {
  job: Job;
  variant?: "default" | "compact";
}

export function JobCard({ job, variant = "default" }: JobCardProps) {
  const isCompact = variant === "compact";
  const tz = "America/Asuncion";

  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className={isCompact ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <Link href={`/jobs/${job.id}`}>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Banknote className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
            </div>

            {!isCompact && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
            )}
          </div>

          <Badge
            variant={job.type === "remote" ? "default" : "secondary"}
            className="shrink-0"
          >
            {formatJobType(job.type)}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className={`border-t bg-muted/30 ${isCompact ? "p-3" : "px-6 py-3"}`}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Publicado: {new Date(job.postedAt).toLocaleDateString("es-PY", { timeZone: tz })}</span>
          </div>
          <Link href={`/jobs/${job.id}`}>
            <Button variant="ghost" size="sm">
              Ver más
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
