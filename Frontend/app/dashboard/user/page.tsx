"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  FileText,
  Upload,
  MapPin,
  Building2,
  ExternalLink,
  Trash2,
  Lock,
} from "lucide-react";
import { formatJobType } from "@/lib/data";
import type { User } from "@/lib/data";
import {
  updateMe,
  uploadMeAvatar,
  uploadMeCv,
  changePassword,
  fetchApplications,
  fetchJobs,
  type ApiApplication,
  type ApiJob,
} from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function fullUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/uploads/")) {
    return `/api/avatar?path=${encodeURIComponent(normalized)}`;
  }
  return `${API_BASE_URL}${normalized}`;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, userType, user: authUser, getAuthHeaders, updateUser: updateAuthUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [cvDialogOpen, setCvDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn || userType !== "user") {
      router.replace("/login");
      return;
    }
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        description: authUser.description ?? "",
        avatar: authUser.avatar,
        cvUrl: authUser.cvUrl,
        appliedJobs: [],
      });
    }
  }, [isReady, isLoggedIn, userType, authUser, router]);

  useEffect(() => {
    if (!isReady || !isLoggedIn || userType !== "user" || !authUser?.id) return;
    fetchApplications({ userId: authUser.id })
      .then(setApplications)
      .catch(() => setApplications([]));
    fetchJobs()
      .then(setJobs)
      .catch(() => setJobs([]));
  }, [isReady, isLoggedIn, userType, authUser?.id]);

  const appliedJobs = jobs.filter((j) => applications.some((a) => a.jobId === j.id));
  const headers = getAuthHeaders();
  const tz = "America/Asuncion";

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaveError(null);
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string) || user.name;
    const description = (formData.get("description") as string) ?? user.description;
    const avatarFile = form.querySelector<HTMLInputElement>('input[name="avatar"]')?.files?.[0];
    try {
      let updated = { ...user, name, description };
      if (avatarFile) {
        const res = await uploadMeAvatar(headers, avatarFile);
        updated = { ...updated, avatar: res.avatar ?? undefined };
        updateAuthUser({ avatar: res.avatar ?? undefined });
      }
      const res = await updateMe(headers, { name, description });
      updated = { ...updated, name: res.name, description: res.description };
      setUser(updated);
      updateAuthUser({ name: res.name, description: res.description });
      setEditOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    const form = e.currentTarget;
    const currentPassword = (form.querySelector('#currentPassword') as HTMLInputElement)?.value;
    const newPassword = (form.querySelector('#newPassword') as HTMLInputElement)?.value;
    const confirmPassword = (form.querySelector('#confirmPassword') as HTMLInputElement)?.value;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Completa todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y la confirmación no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(headers, { currentPassword, newPassword });
      setChangePasswordOpen(false);
      form.reset();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCvUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    if (!file) {
      setCvError("Selecciona un archivo PDF o DOC");
      return;
    }
    setCvError(null);
    setUploadingCv(true);
    try {
      const res = await uploadMeCv(headers, file);
      setUser((u) => (u ? { ...u, cvUrl: res.cvUrl ?? undefined } : null));
      updateAuthUser({ cvUrl: res.cvUrl ?? undefined });
      setCvDialogOpen(false);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Error al subir el CV");
    } finally {
      setUploadingCv(false);
    }
  };

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <p className="text-muted-foreground">Cargando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={fullUrl(user.avatar)} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <h1 className="mt-4 text-xl font-bold">{user.name}</h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {user.description}
                  </p>

                  <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); setSaveError(null); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-6 w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                        <DialogDescription>
                          Actualiza tu información y foto de perfil
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre completo</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={user.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={user.description}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Foto de perfil</Label>
                          <Input
                            type="file"
                            name="avatar"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground">Opcional. JPEG, PNG, GIF o WebP (máx. 5 MB)</p>
                        </div>
                        {saveError && (
                          <p className="text-sm text-destructive">{saveError}</p>
                        )}
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditOpen(false)}
                            disabled={saving}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={saving}>
                            {saving ? "Guardando…" : "Guardar Cambios"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Cambiar contraseña
                  </Button>
                </div>

                <div className="mt-6 border-t border-border pt-6 text-center">
                  <h3 className="flex items-center justify-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" />
                    Curriculum Vitae
                  </h3>
                  {user.cvUrl ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-border p-3">
                      <span className="text-sm truncate">
                        {user.cvUrl.split("/").pop() || "CV"}
                      </span>
                      <a
                        href={fullUrl(user.cvUrl)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Button variant="outline" className="w-full" onClick={() => { setCvDialogOpen(true); setCvError(null); }}>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir CV
                      </Button>
                    </div>
                  )}
                </div>

                <Dialog open={cvDialogOpen} onOpenChange={(open) => { setCvDialogOpen(open); setCvError(null); }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Subir Curriculum Vitae</DialogTitle>
                      <DialogDescription>
                        PDF o DOC/DOCX (máx. 10 MB)
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCvUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Archivo</Label>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="cursor-pointer"
                          required
                        />
                      </div>
                      {cvError && <p className="text-sm text-destructive">{cvError}</p>}
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setCvDialogOpen(false)} disabled={uploadingCv}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={uploadingCv}>
                          {uploadingCv ? "Subiendo…" : "Subir"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={changePasswordOpen} onOpenChange={(open) => { setChangePasswordOpen(open); setPasswordError(null); }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar contraseña</DialogTitle>
                      <DialogDescription>
                        Introduce tu contraseña actual y la nueva contraseña
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña actual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva contraseña</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setChangePasswordOpen(false)}
                          disabled={changingPassword}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={changingPassword}>
                          {changingPassword ? "Guardando…" : "Cambiar contraseña"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Applied Jobs */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mis Postulaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {appliedJobs.map((job) => {
                        const app = applications.find((a) => a.jobId === job.id);
                        return (
                        <div
                          key={job.id}
                          className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                        >
                          <div className="flex w-28 justify-center pt-4">
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={fullUrl(job.companyLogo)} alt={job.company} />
                              <AvatarFallback>
                                <Building2 className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {job.title}
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.city}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {formatJobType(job.type)}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {job.salary}
                            </p>
                            {app?.appliedAt && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Postulado: {new Date(app.appliedAt).toLocaleString("es-PY", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${job.id}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver empleo
                              </Button>
                            </Link>
                            <Badge variant="outline">Enviado</Badge>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">
                        No tienes postulaciones
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Explora los empleos disponibles y postúlate
                      </p>
                      <Link href="/jobs" className="mt-4">
                        <Button>Buscar Empleos</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
