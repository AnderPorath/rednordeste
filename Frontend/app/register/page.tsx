"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Building2, ArrowLeft } from "lucide-react";
import { cities } from "@/lib/data";
import { registerUser, registerCompany } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyLocation, setCompanyLocation] = useState<string>("");

  const handleSubmitUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const name = (form.querySelector("#user-name") as HTMLInputElement)?.value;
    const email = (form.querySelector("#user-reg-email") as HTMLInputElement)?.value;
    const password = (form.querySelector("#user-reg-password") as HTMLInputElement)?.value;
    if (!name || !email || !password) return;
    setIsLoading(true);
    try {
      await registerUser({ name, email, password, description: "" });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const name = (form.querySelector("#company-name") as HTMLInputElement)?.value;
    const email = (form.querySelector("#company-reg-email") as HTMLInputElement)?.value;
    const password = (form.querySelector("#company-reg-password") as HTMLInputElement)?.value;
    const location = companyLocation;
    if (!name || !location || !email || !password) {
      if (!location) setError("Seleccioná una ciudad");
      return;
    }
    setIsLoading(true);
    try {
      await registerCompany({ name, email, location, password, description: "" });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo href="/" size="md" />
            </div>
            <CardTitle className="text-xl">Crear Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user" className="gap-2">
                  <User className="h-4 w-4" />
                  Candidato
                </TabsTrigger>
                <TabsTrigger value="company" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <form onSubmit={handleSubmitUser} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Nombre completo</Label>
                    <Input
                      id="user-name"
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-reg-email">Email</Label>
                    <Input
                      id="user-reg-email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-reg-password">Contraseña</Label>
                    <Input
                      id="user-reg-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Registrarse como Candidato"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="company">
                <form onSubmit={handleSubmitCompany} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nombre de la empresa</Label>
                    <Input
                      id="company-name"
                      placeholder="Mi Empresa SA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-location">Ciudad</Label>
                    <Select value={companyLocation} onValueChange={setCompanyLocation} required>
                      <SelectTrigger id="company-location">
                        <SelectValue placeholder="Seleccionar ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-reg-email">Email corporativo</Label>
                    <Input
                      id="company-reg-email"
                      type="email"
                      placeholder="rrhh@empresa.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-reg-password">Contraseña</Label>
                    <Input
                      id="company-reg-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Registrarse como Empresa"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tenés una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
