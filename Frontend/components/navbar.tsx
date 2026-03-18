"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, Building2, LogOut, Bookmark, PlusCircle, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

export function Navbar() {
  const { isLoggedIn, userType, logout, user, company, admin } = useAuth();
  const router = useRouter();

  const rawAvatar =
    userType === "user"
      ? user?.avatar
      : userType === "company"
        ? company?.logo
        : userType === "admin"
          ? admin?.avatar
          : undefined;

  const displayName =
    userType === "user"
      ? user?.name
      : userType === "company"
        ? company?.name
        : userType === "admin"
          ? admin?.name
          : undefined;

  const avatarUrl = (() => {
    if (!rawAvatar) return undefined;
    if (rawAvatar.startsWith("http")) return rawAvatar;
    const path = rawAvatar.startsWith("/") ? rawAvatar : `/${rawAvatar}`;
    if (path.startsWith("/uploads/")) {
      return `/api/avatar?path=${encodeURIComponent(path)}`;
    }
    return path;
  })();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" aria-label="Red Nordeste - Inicio" className="flex items-center">
          <Image
            src="/navbar-logo.0c13703df2.png"
            alt="Red Nordeste - Tu trabajo en Itapúa"
            width={1000}
            height={200}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Buscar Empleos
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Empresas
          </Link>
          {isLoggedIn && userType === "user" && (
            <Link
              href="/saved"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Empleos guardados
            </Link>
          )}
          {isLoggedIn && userType === "company" && (
            <Link
              href="/dashboard/company/create"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Crear empleo
            </Link>
          )}
          {isLoggedIn && userType === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Panel Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={displayName ?? "Perfil"} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {userType === "admin" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Panel Admin
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          userType === "company"
                            ? "/dashboard/company"
                            : "/dashboard/user"
                        }
                      >
                        <User className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                {userType === "user" && (
                  <DropdownMenuItem asChild>
                    <Link href="/saved">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Empleos guardados
                    </Link>
                  </DropdownMenuItem>
                )}
                {userType === "company" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/company/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear empleo
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/company/applications">
                        <Building2 className="mr-2 h-4 w-4" />
                        Postulaciones
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/jobs">Buscar Empleos</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/companies">Empresas</Link>
              </DropdownMenuItem>
              {isLoggedIn && userType === "user" && (
                <DropdownMenuItem asChild>
                  <Link href="/saved">Empleos guardados</Link>
                </DropdownMenuItem>
              )}
              {isLoggedIn && userType === "company" && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/company/create">Crear empleo</Link>
                </DropdownMenuItem>
              )}
              {isLoggedIn && userType === "admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">Panel Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
