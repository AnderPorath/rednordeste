const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  description: string;
  avatar?: string | null;
  cvUrl?: string | null;
}

export interface AdminCompany {
  id: string;
  name: string;
  description: string;
  email: string;
  location: string;
  logo?: string | null;
  jobs: { id: string }[];
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  companyId: string;
  city: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export async function adminGetMe(token: string): Promise<AdminProfile> {
  const res = await fetch(`${API_BASE_URL}/admin/me`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al cargar perfil");
  return res.json();
}

export async function adminUpdateProfile(
  token: string,
  formData: FormData
): Promise<{ id: string; email: string; name: string; avatar?: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/me`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al actualizar perfil");
  }
  return res.json();
}

/** Sube solo la foto de perfil (POST multipart). */
export async function adminUploadAvatar(
  token: string,
  file: File
): Promise<{ id: string; email: string; name: string; avatar?: string }> {
  const formData = new FormData();
  formData.append("avatar", file, file.name);
  const res = await fetch(`${API_BASE_URL}/admin/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al subir la imagen");
  }
  return res.json();
}

/** Actualiza solo el nombre (PATCH JSON). */
export async function adminPatchProfile(
  token: string,
  data: { name?: string }
): Promise<{ id: string; email: string; name: string; avatar?: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/me`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al actualizar perfil");
  }
  return res.json();
}

/**
 * URL para mostrar la foto de perfil del admin.
 * Usa el proxy /api/avatar para cargar desde el mismo origen y evitar problemas de CORS.
 */
export function adminAvatarUrl(avatar: string | undefined): string | undefined {
  if (!avatar) return undefined;
  if (avatar.startsWith("http")) return avatar;
  const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `/api/avatar?path=${encodeURIComponent(path)}`;
}

export async function adminChangePassword(
  token: string,
  data: { currentPassword: string; newPassword: string }
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/me/change-password`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al cambiar contraseña");
  }
}

export async function adminFetchUsers(token: string): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json();
}

export async function adminUpdateUser(
  token: string,
  id: string,
  data: Partial<{ name: string; email: string; description: string; avatar?: string | null; cvUrl?: string | null }>
): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al actualizar usuario");
  }
  return res.json();
}

export async function adminDeleteUser(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al eliminar usuario");
  }
}

export async function adminFetchCompanies(token: string): Promise<AdminCompany[]> {
  const res = await fetch(`${API_BASE_URL}/admin/companies`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al cargar empresas");
  return res.json();
}

export async function adminUpdateCompany(
  token: string,
  id: string,
  data: Partial<{ name: string; description: string; email: string; location: string; logo?: string | null }>
): Promise<AdminCompany> {
  const res = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al actualizar empresa");
  }
  return res.json();
}

export async function adminDeleteCompany(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al eliminar empresa");
  }
}

export async function adminFetchJobs(token: string): Promise<AdminJob[]> {
  const res = await fetch(`${API_BASE_URL}/admin/jobs`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al cargar vacantes");
  return res.json();
}

export async function adminUpdateJob(
  token: string,
  id: string,
  data: Partial<{
    title: string;
    city: string;
    salary: string;
    type: string;
    description: string;
    requirements: string[];
    companyId: string;
  }>
): Promise<AdminJob> {
  const res = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al actualizar vacante");
  }
  return res.json();
}

export async function adminDeleteJob(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al eliminar vacante");
  }
}

// --- Admins CRUD (otros admins) ---
export interface AdminOtherAdmin {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: string;
}

export async function adminFetchAdmins(token: string): Promise<AdminOtherAdmin[]> {
  const res = await fetch(`${API_BASE_URL}/admin/admins`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al cargar admins");
  return res.json();
}

export async function adminCreateAdmin(
  token: string,
  data: { name: string; email: string; password: string; avatarFile?: File | null }
): Promise<AdminOtherAdmin> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("email", data.email);
  form.append("password", data.password);
  if (data.avatarFile) form.append("avatar", data.avatarFile, data.avatarFile.name);

  const res = await fetch(`${API_BASE_URL}/admin/admins`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al crear admin");
  }
  return res.json();
}

export async function adminUpdateAdmin(
  token: string,
  id: string,
  data: { name?: string; email?: string; password?: string; avatarFile?: File | null }
): Promise<AdminOtherAdmin> {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.email !== undefined) form.append("email", data.email);
  if (data.password !== undefined) form.append("password", data.password);
  if (data.avatarFile) form.append("avatar", data.avatarFile, data.avatarFile.name);

  const res = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al actualizar admin");
  }
  return res.json();
}

export async function adminDeleteAdmin(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al eliminar admin");
  }
}
