"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, CheckCircle, Loader2 } from "lucide-react";
import { cities, formatJobType, type JobType } from "@/lib/data";
import { createJob } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const jobTypes: JobType[] = ["full-time", "part-time", "contract", "remote"];

export default function CreateJobPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, userType, company } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn || userType !== "company") {
      router.replace("/login");
    }
  }, [isReady, isLoggedIn, userType, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!company?.id) {
      setError("No se detectó la empresa en sesión. Cierra sesión e inicia de nuevo.");
      return;
    }
    setLoading(true);
    const form = e.currentTarget;
    const title = (form.querySelector("#title") as HTMLInputElement)?.value?.trim();
    const salary = (form.querySelector("#salary") as HTMLInputElement)?.value?.trim();
    const description = (form.querySelector("#description") as HTMLTextAreaElement)?.value?.trim();
    const requirementsRaw = (form.querySelector("#requirements") as HTMLTextAreaElement)?.value?.trim() ?? "";
    const requirements = requirementsRaw
      .split(/\n/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (!title || !salary || !description || !city || !type) {
      setError("Completa todos los campos obligatorios.");
      setLoading(false);
      return;
    }
    try {
      await createJob({
        title,
        description,
        salary,
        type: type as "full-time" | "part-time" | "contract" | "remote",
        city,
        requirements,
        companyId: company.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar el empleo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-muted/30 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">Empleo Publicado</h2>
              <p className="mt-2 text-muted-foreground">
                Tu vacante ha sido publicada exitosamente y ya está visible para
                los candidatos.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/dashboard/company">
                  <Button variant="outline">Ver Panel</Button>
                </Link>
                <Button onClick={() => setSubmitted(false)}>
                  Publicar Otro
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Link
            href="/dashboard/company"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Publicar Nuevo Empleo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Título del puesto *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ej: Desarrollador Frontend"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Select name="city" required value={city} onValueChange={setCity}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Seleccionar ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de empleo *</Label>
                    <Select name="type" required value={type} onValueChange={setType}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatJobType(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salario *</Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="Ej: 3.500.000 - 5.000.000 Gs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del puesto *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe las responsabilidades y el rol del puesto..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">
                    Requisitos (uno por línea) *
                  </Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="Ej:&#10;2+ años de experiencia&#10;Conocimiento de React&#10;Inglés intermedio"
                    rows={5}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <Link href="/dashboard/company">
                    <Button type="button" variant="outline" disabled={loading}>
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Publicando..." : "Publicar Empleo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
