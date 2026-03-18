"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import {
  adminGetMe,
  adminUpdateProfile,
  adminUploadAvatar,
  adminPatchProfile,
  adminAvatarUrl,
  adminChangePassword,
  adminFetchUsers,
  adminFetchCompanies,
  adminFetchJobs,
  adminFetchAdmins,
  adminUpdateUser,
  adminUpdateCompany,
  adminUpdateJob,
  adminDeleteUser,
  adminDeleteCompany,
  adminDeleteJob,
  adminCreateAdmin,
  adminUpdateAdmin,
  adminDeleteAdmin,
  type AdminUser,
  type AdminCompany,
  type AdminJob,
} from "@/lib/admin-api";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User as UserIcon,
  Building2,
  Briefcase,
  Shield,
  KeyRound,
  UserCog,
  Plus,
} from "lucide-react";
import { registerUser, registerCompany, createJob } from "@/lib/api";
import { cities, formatJobType, type JobType } from "@/lib/data";

export default function AdminPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, userType, token, admin, updateAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [admins, setAdmins] = useState<
    Array<{ id: string; email: string; name: string; avatar?: string | null; createdAt: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editCompany, setEditCompany] = useState<AdminCompany | null>(null);
  const [editJob, setEditJob] = useState<AdminJob | null>(null);
  const [editAdmin, setEditAdmin] = useState<any>(null);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createAdminSaving, setCreateAdminSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarFileRef = useRef<File | null>(null);

  const [activeTab, setActiveTab] = useState<"users" | "companies" | "jobs" | "admins">("users");

  const [deleteTarget, setDeleteTarget] = useState<
    { type: "user" | "company" | "job" | "admin"; id: string; name: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setProfileLoadError(null);
    try {
      const [u, c, j] = await Promise.all([
        adminFetchUsers(token),
        adminFetchCompanies(token),
        adminFetchJobs(token),
      ]);
      const a = await (async () => adminFetchAdmins(token))();
      setUsers(u);
      setCompanies(c);
      setJobs(j);
      setAdmins(a);
      try {
        const me = await adminGetMe(token);
        updateAdmin({ name: me.name, avatar: me.avatar });
      } catch {
        setProfileLoadError("No se pudo actualizar el perfil");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [token, updateAdmin]);

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn || userType !== "admin" || !token) {
      router.replace("/login");
      return;
    }
    load();
  }, [isReady, isLoggedIn, userType, token, router, load]);

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "user") {
        await adminDeleteUser(token, deleteTarget.id);
        setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      } else if (deleteTarget.type === "company") {
        await adminDeleteCompany(token, deleteTarget.id);
        setCompanies((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      } else if (deleteTarget.type === "admin") {
        await adminDeleteAdmin(token, deleteTarget.id);
        setAdmins((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      } else {
        await adminDeleteJob(token, deleteTarget.id);
        setJobs((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!token) return;
    e.preventDefault();
    setProfileError(null);
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value?.trim() ?? "";
    const fileInput = form.querySelector('input[name="avatar"]') as HTMLInputElement;
    const file = avatarFileRef.current ?? fileInput?.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setProfileError("La imagen es muy pesada. Máx. 5 MB.");
      return;
    }
    setProfileSaving(true);
    try {
      if (file && file.size > 0) {
        const avatarRes = await adminUploadAvatar(token, file);
        updateAdmin({ avatar: avatarRes.avatar ?? undefined });
      }
      const profileRes = await adminPatchProfile(token, { name: name || undefined });
      updateAdmin({ name: profileRes.name, avatar: profileRes.avatar ?? undefined });
      setProfileDialogOpen(false);
      setAvatarPreview(null);
      avatarFileRef.current = null;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!token) return;
    e.preventDefault();
    setPasswordError(null);
    const form = e.currentTarget;
    const currentPassword = (form.querySelector('[name="current-password"]') as HTMLInputElement)?.value;
    const newPassword = (form.querySelector('[name="new-password"]') as HTMLInputElement)?.value;
    const confirmPassword = (form.querySelector('[name="confirm-password"]') as HTMLInputElement)?.value;
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setPasswordError(newPassword !== confirmPassword ? "Las contraseñas nuevas no coinciden" : "Completá todos los campos");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    setPasswordSaving(true);
    try {
      await adminChangePassword(token, { currentPassword, newPassword });
      setPasswordDialogOpen(false);
      form.reset();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!token || !editUser) return;
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value;
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value;
    const description = (form.querySelector('[name="description"]') as HTMLInputElement)?.value;
    setSaving(true);
    try {
      const updated = await adminUpdateUser(token, editUser.id, {
        name: name ?? editUser.name,
        email: email ?? editUser.email,
        description: description ?? editUser.description,
      });
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!token || !editCompany) return;
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value;
    const description = (form.querySelector('[name="description"]') as HTMLInputElement)?.value;
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value;
    const location = (form.querySelector('[name="location"]') as HTMLInputElement)?.value;
    setSaving(true);
    try {
      const updated = await adminUpdateCompany(token, editCompany.id, {
        name: name ?? editCompany.name,
        description: description ?? editCompany.description,
        email: email ?? editCompany.email,
        location: location ?? editCompany.location,
      });
      setCompanies((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditCompany(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJob = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!token || !editJob) return;
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value;
    const city = (form.querySelector('[name="city"]') as HTMLInputElement)?.value;
    const salary = (form.querySelector('[name="salary"]') as HTMLInputElement)?.value;
    const type = (form.querySelector('[name="type"]') as HTMLInputElement)?.value;
    const description = (form.querySelector('[name="description"]') as HTMLTextAreaElement)?.value;
    const companyId = (form.querySelector('[name="companyId"]') as HTMLSelectElement)?.value;
    setSaving(true);
    try {
      const updated = await adminUpdateJob(token, editJob.id, {
        title: title ?? editJob.title,
        city: city ?? editJob.city,
        salary: salary ?? editJob.salary,
        type: type ?? editJob.type,
        description: description ?? editJob.description,
        companyId: companyId || undefined,
      });
      setJobs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditJob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const form = e.currentTarget;
    const name = (form.querySelector('[name="new-user-name"]') as HTMLInputElement)?.value;
    const email = (form.querySelector('[name="new-user-email"]') as HTMLInputElement)?.value;
    const password = (form.querySelector('[name="new-user-password"]') as HTMLInputElement)?.value;
    const description = (form.querySelector('[name="new-user-description"]') as HTMLInputElement)?.value ?? "";
    if (!name || !email || !password) return;
    setCreateSaving(true);
    try {
      const newUser = await registerUser({ name, email, password, description });
      setUsers((prev) => [...prev, { ...newUser, description } as AdminUser]);
      setCreateUserOpen(false);
      form.reset();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const form = e.currentTarget;
    const name = (form.querySelector('[name="new-company-name"]') as HTMLInputElement)?.value;
    const email = (form.querySelector('[name="new-company-email"]') as HTMLInputElement)?.value;
    const location = (form.querySelector('[name="new-company-location"]') as HTMLInputElement)?.value;
    const password = (form.querySelector('[name="new-company-password"]') as HTMLInputElement)?.value;
    const description = (form.querySelector('[name="new-company-description"]') as HTMLInputElement)?.value ?? "";
    if (!name || !email || !location || !password) return;
    setCreateSaving(true);
    try {
      const newCompany = await registerCompany({ name, email, location, password, description });
      setCompanies((prev) => [...prev, { ...newCompany, jobs: [] }]);
      setCreateCompanyOpen(false);
      form.reset();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear empresa");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const form = e.currentTarget;
    const title = (form.querySelector('[name="new-job-title"]') as HTMLInputElement)?.value;
    const companyId = (form.querySelector('[name="new-job-companyId"]') as HTMLSelectElement)?.value;
    const city = (form.querySelector('[name="new-job-city"]') as HTMLInputElement)?.value;
    const salary = (form.querySelector('[name="new-job-salary"]') as HTMLInputElement)?.value;
    const type = (form.querySelector('[name="new-job-type"]') as HTMLSelectElement)?.value;
    const description = (form.querySelector('[name="new-job-description"]') as HTMLTextAreaElement)?.value ?? "";
    const requirementsRaw = (form.querySelector('[name="new-job-requirements"]') as HTMLTextAreaElement)?.value ?? "";
    const requirements = requirementsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!title || !companyId || !city || !salary || !type) return;
    setCreateSaving(true);
    try {
      const newJob = await createJob({
        title,
        companyId,
        city,
        salary,
        type: type as "full-time" | "part-time" | "contract" | "remote",
        description,
        requirements,
      });
      const companyName = companies.find((c) => c.id === companyId)?.name ?? newJob.company;
      setJobs((prev) => [...prev, { ...newJob, companyId, company: companyName }]);
      setCreateJobOpen(false);
      form.reset();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear vacante");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateAdminError(null);
    const form = e.currentTarget;
    const name = (form.querySelector('[name="new-admin-name"]') as HTMLInputElement)?.value?.trim();
    const email = (form.querySelector('[name="new-admin-email"]') as HTMLInputElement)?.value?.trim();
    const password = (form.querySelector('[name="new-admin-password"]') as HTMLInputElement)?.value;
    const avatarFile = (form.querySelector('input[name="new-admin-avatar"]') as HTMLInputElement)?.files?.[0] ?? null;
    if (!name || !email || !password) return;
    setCreateAdminSaving(true);
    try {
      const created = await adminCreateAdmin(token as string, {
        name,
        email,
        password,
        avatarFile,
      });
      setAdmins((prev) => [...prev, created]);
      setCreateAdminOpen(false);
      form.reset();
    } catch (err) {
      setCreateAdminError(err instanceof Error ? err.message : "Error al crear admin");
    } finally {
      setCreateAdminSaving(false);
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!token || !editAdmin) return;
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="admin-name"]') as HTMLInputElement)?.value?.trim();
    const email = (form.querySelector('[name="admin-email"]') as HTMLInputElement)?.value?.trim();
    const password = (form.querySelector('[name="admin-password"]') as HTMLInputElement)?.value;
    const avatarFile = (form.querySelector('input[name="admin-avatar"]') as HTMLInputElement)?.files?.[0] ?? null;
    setSaving(true);
    try {
      const updated = await adminUpdateAdmin(token, editAdmin.id, {
        name: name ?? editAdmin.name,
        email: email ?? editAdmin.email,
        password: password ? password : undefined,
        avatarFile,
      } as any);
      setAdmins((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditAdmin(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar admin");
    } finally {
      setSaving(false);
    }
  };

  const initials = admin?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "AD";

  if (!isReady || (!isLoggedIn || userType !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Profile card */}
        <Card className="mb-8 overflow-hidden border-2 shadow-sm">
          <div className="bg-primary/5 px-6 py-4 border-b flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Avatar
                key={`avatar-${admin?.avatar ?? "default"}`}
                className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-background shadow-md flex-shrink-0"
              >
                <AvatarImage
                  src={adminAvatarUrl(admin?.avatar)}
                  alt={admin?.name}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground text-sm sm:text-base font-medium break-all text-left max-w-xs">{admin?.email}</p>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h1 className="text-2xl font-bold">{admin?.name ?? "Administrador"}</h1>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setProfileError(null);
                    setProfileDialogOpen(true);
                  }}
                >
                  <UserCog className="h-4 w-4" />
                  Editar perfil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setPasswordError(null);
                    setPasswordDialogOpen(true);
                  }}
                >
                  <KeyRound className="h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </div>
              {profileLoadError && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">No se pudo actualizar el perfil. Se muestran los datos del inicio de sesión.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
          <Card className="rounded-xl border border-border/80 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden text-center">
            <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-5 px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold tracking-tight">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Candidatos registrados</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border/80 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden text-center">
            <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-5 px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empresas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold tracking-tight">{companies.length}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Empresas registradas</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border/80 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden text-center">
            <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-5 px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vacantes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-bold tracking-tight">{jobs.length}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Empleos publicados</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "users" | "companies" | "jobs" | "admins")} className="w-full">
              <CardHeader className="pb-2">
                <TabsList className="grid w-full grid-cols-4 max-w-lg bg-transparent p-0 h-auto gap-3 mx-auto justify-items-center">
                  <TabsTrigger
                    value="users"
                    className={`gap-2 border-0 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === "users"
                        ? "bg-primary/10 text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-primary/20"
                        : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl"
                    }`}
                  >
                    <UserIcon className="h-4 w-4 shrink-0" />
                    Usuarios
                    <Badge variant="secondary" className="ml-1 font-normal">{users.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="companies"
                    className={`gap-2 border-0 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === "companies"
                        ? "bg-primary/10 text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-primary/20"
                        : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl"
                    }`}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                    Empresas
                    <Badge variant="secondary" className="ml-1 font-normal">{companies.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="jobs"
                    className={`gap-2 border-0 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === "jobs"
                        ? "bg-primary/10 text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-primary/20"
                        : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl"
                    }`}
                  >
                    <Briefcase className="h-4 w-4 shrink-0" />
                    Vacantes
                    <Badge variant="secondary" className="ml-1 font-normal">{jobs.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="admins"
                    className={`gap-2 border-0 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === "admins"
                        ? "bg-primary/10 text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-primary/20"
                        : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl"
                    }`}
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    Admins
                    <Badge variant="secondary" className="ml-1 font-normal">{admins.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="users" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => { setCreateError(null); setCreateUserOpen(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Crear usuario
                    </Button>
                  </div>
                  {users.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No hay usuarios.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setEditUser(u)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({ type: "user", id: u.id, name: u.name })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="companies" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => { setCreateError(null); setCreateCompanyOpen(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Crear empresa
                    </Button>
                  </div>
                  {companies.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No hay empresas.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{c.location}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setEditCompany(c)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({ type: "company", id: c.id, name: c.name })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="jobs" className="mt-0">
                  <div className="flex flex-col items-end gap-2 mb-4">
                    {companies.length === 0 && (
                      <p className="text-xs text-muted-foreground">Creá una empresa primero</p>
                    )}
                    <Button
                      onClick={() => { setCreateError(null); setCreateJobOpen(true); }}
                      className="gap-2"
                      disabled={companies.length === 0}
                      title={companies.length === 0 ? "Primero creá al menos una empresa" : undefined}
                    >
                      <Plus className="h-4 w-4" />
                      Crear vacante
                    </Button>
                  </div>
                  {jobs.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No hay vacantes.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Ciudad</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((j) => (
                          <TableRow key={j.id}>
                            <TableCell className="font-medium">{j.title}</TableCell>
                            <TableCell>{j.company}</TableCell>
                            <TableCell>{j.city}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setEditJob(j)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({ type: "job", id: j.id, name: j.title })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="admins" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setCreateError(null);
                        setEditAdmin(null);
                        setCreateAdminOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crear admin
                    </Button>
                  </div>
                  {admins.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No hay admins.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.name}</TableCell>
                            <TableCell>{a.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setEditAdmin(a)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({ type: "admin", id: a.id, name: a.name })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}
      </div>

      {/* Edit profile dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={(open) => { if (!open) { setAvatarPreview(null); avatarFileRef.current = null; } setProfileDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input name="name" defaultValue={admin?.name} required />
            </div>
            <div>
              <Label>Foto de perfil (opcional)</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  {(avatarPreview || adminAvatarUrl(admin?.avatar)) && (
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarPreview ?? adminAvatarUrl(admin?.avatar)} alt="Vista previa" />
                      <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>
                  )}
                  <Input
                    name="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      avatarFileRef.current = file ?? null;
                      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                      setAvatarPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">JPEG, PNG, GIF o WebP. Máx. 5 MB.</p>
              </div>
            </div>
            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProfileDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={profileSaving}>
                {profileSaving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>Contraseña actual</Label>
              <Input name="current-password" type="password" required placeholder="••••••••" />
            </div>
            <div>
              <Label>Nueva contraseña</Label>
              <Input name="new-password" type="password" required placeholder="••••••••" minLength={6} />
            </div>
            <div>
              <Label>Confirmar nueva contraseña</Label>
              <Input name="confirm-password" type="password" required placeholder="••••••••" minLength={6} />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input name="new-user-name" placeholder="Juan Pérez" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="new-user-email" type="email" placeholder="usuario@email.com" required />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input name="new-user-password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Input name="new-user-description" placeholder="Breve descripción del candidato" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createSaving}>{createSaving ? "Creando..." : "Crear usuario"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Company Dialog */}
      <Dialog open={createCompanyOpen} onOpenChange={setCreateCompanyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <Label>Nombre de la empresa</Label>
              <Input name="new-company-name" placeholder="Mi Empresa SA" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="new-company-email" type="email" placeholder="rrhh@empresa.com" required />
            </div>
            <div>
              <Label>Ubicación / Ciudad</Label>
              <Input name="new-company-location" placeholder="Encarnación" required />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input name="new-company-password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Input name="new-company-description" placeholder="Descripción de la empresa" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateCompanyOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createSaving}>{createSaving ? "Creando..." : "Crear empresa"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog open={createJobOpen} onOpenChange={setCreateJobOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear vacante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <Label>Título del puesto</Label>
              <Input name="new-job-title" placeholder="Ej. Desarrollador Frontend" required />
            </div>
            <div>
              <Label>Empresa</Label>
              <select
                name="new-job-companyId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Ciudad</Label>
              <select
                name="new-job-city"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Seleccionar ciudad</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Salario</Label>
              <Input name="new-job-salary" placeholder="Ej. 3.500.000 - 5.000.000 Gs" required />
            </div>
            <div>
              <Label>Tipo de contrato</Label>
              <select
                name="new-job-type"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Seleccionar tipo</option>
                {(["full-time", "part-time", "contract", "remote"] as JobType[]).map((t) => (
                  <option key={t} value={t}>{formatJobType(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea
                name="new-job-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Descripción del puesto..."
                required
              />
            </div>
            <div>
              <Label>Requisitos (uno por línea, opcional)</Label>
              <textarea
                name="new-job-requirements"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Experiencia en React&#10;Inglés intermedio"
              />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateJobOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createSaving}>{createSaving ? "Creando..." : "Crear vacante"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          {editUser && (
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input name="name" defaultValue={editUser.name} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={editUser.email} required />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input name="description" defaultValue={editUser.description} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={!!editCompany} onOpenChange={(open) => !open && setEditCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>
          {editCompany && (
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input name="name" defaultValue={editCompany.name} required />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input name="description" defaultValue={editCompany.description} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={editCompany.email} required />
              </div>
              <div>
                <Label>Ubicación</Label>
                <Input name="location" defaultValue={editCompany.location} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditCompany(null)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <EditJobDialog job={editJob} companies={companies} onClose={() => setEditJob(null)} onSave={handleSaveJob} saving={saving} />

      {/* Create Admin Dialog */}
      <Dialog open={createAdminOpen} onOpenChange={(open) => !open && setCreateAdminOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {createAdminError && <p className="text-sm text-destructive">{createAdminError}</p>}
            <div>
              <Label>Nombre</Label>
              <Input name="new-admin-name" placeholder="Nombre del admin" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="new-admin-email" type="email" placeholder="admin@email.com" required />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input name="new-admin-password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div>
              <Label>Avatar (foto, opcional)</Label>
              <Input name="new-admin-avatar" type="file" accept="image/*" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateAdminOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAdminSaving}>
                {createAdminSaving ? "Creando..." : "Crear admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={(open) => !open && setEditAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar admin</DialogTitle>
          </DialogHeader>
          {editAdmin && (
            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input name="admin-name" defaultValue={editAdmin.name} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="admin-email" type="email" defaultValue={editAdmin.email} required />
              </div>
              <div>
                <Label>Avatar (foto, opcional)</Label>
                <Input name="admin-avatar" type="file" accept="image/*" />
              </div>
              <div>
                <Label>Contraseña nueva (opcional)</Label>
                <Input name="admin-password" type="password" placeholder="••••••••" minLength={6} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditAdmin(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `Se eliminará "${deleteTarget.name}". Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditJobDialog({
  job,
  companies,
  onClose,
  onSave,
  saving,
}: {
  job: AdminJob | null;
  companies: AdminCompany[];
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  if (!job) return null;
  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar vacante</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input name="title" defaultValue={job.title} required />
          </div>
          <div>
            <Label>Empresa</Label>
            <select
              name="companyId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={job.companyId}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Ciudad</Label>
            <select
              name="city"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={job.city}
              required
            >
              <option value="">Seleccionar ciudad</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Salario</Label>
            <Input name="salary" defaultValue={job.salary} />
          </div>
          <div>
            <Label>Tipo</Label>
            <select
              name="type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue={job.type}
              required
            >
              <option value="">Seleccionar tipo</option>
              {(["full-time", "part-time", "contract", "remote"] as JobType[]).map((t) => (
                <option key={t} value={t}>{formatJobType(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Descripción</Label>
            <textarea
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              defaultValue={job.description}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
