import Link from "next/link";
import { cities } from "@/lib/data";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo href="/" size="sm" />
            <p className="text-sm text-muted-foreground">
              La plataforma de empleo líder en Itapúa, Paraguay. Conectando
              talentos con oportunidades.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Para Candidatos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-foreground">
                  Buscar Empleos
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Crear Cuenta
                </Link>
              </li>
              <li>
                <Link href="/dashboard/user" className="hover:text-foreground">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Para Empresas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Publicar Empleo
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/company"
                  className="hover:text-foreground"
                >
                  Panel de Empresa
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-foreground">
                  Ver Candidatos
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Ciudades</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {cities.slice(0, 4).map((city) => (
                <li key={city}>
                  <Link
                    href={`/jobs?city=${encodeURIComponent(city)}`}
                    className="hover:text-foreground"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Red Nordeste. Todos los derechos reservados. Itapúa, Paraguay.</p>
        </div>
      </div>
    </footer>
  );
}
