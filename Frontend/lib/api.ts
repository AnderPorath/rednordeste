const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ApiJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  city: string;
  salary: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  requirements: string[];
  postedAt: string;
}

export async function fetchJobs(params?: {
  q?: string;
  city?: string;
  type?: string;
}): Promise<ApiJob[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set("search", params.q);
  if (params?.city) searchParams.set("city", params.city);
  if (params?.type) searchParams.set("type", params.type);

  const url = `${API_BASE_URL}/jobs${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error fetching jobs");
  }
  return res.json();
}

export async function fetchJobById(id: string): Promise<ApiJob | null> {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Error fetching job");
  }
  return res.json();
}

export interface CreateJobPayload {
  title: string;
  description: string;
  salary: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  city: string;
  requirements: string[];
  companyId: string;
}

export async function createJob(payload: CreateJobPayload): Promise<ApiJob> {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : err?.error?.message ?? "Error al publicar el empleo";
    throw new Error(msg);
  }
  return res.json();
}

export interface ApiCompany {
  id: string;
  name: string;
  logo?: string;
  description: string;
  email: string;
  location: string;
  jobs?: { id: string }[];
}

export async function fetchCompanyJobs(companyId: string): Promise<ApiJob[]> {
  const res = await fetch(`${API_BASE_URL}/jobs?companyId=${encodeURIComponent(companyId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching jobs");
  return res.json();
}

export interface ApiCompanyMe {
  id: string;
  name: string;
  email: string;
  location: string;
  description: string;
  logo?: string | null;
  jobs?: { id: string }[];
}

export async function updateCompanyMe(
  headers: Record<string, string>,
  data: { name?: string; description?: string; location?: string }
): Promise<ApiCompanyMe> {
  const res = await fetch(`${API_BASE_URL}/companies/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al actualizar empresa";
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadCompanyLogo(
  headers: Record<string, string>,
  file: File
): Promise<ApiCompanyMe> {
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch(`${API_BASE_URL}/companies/me/logo`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al subir la foto";
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteJob(jobId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
  });
  if (res.status === 204) return;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al eliminar el empleo";
    throw new Error(msg);
  }
}

export async function fetchCompanies(params?: {
  city?: string;
}): Promise<ApiCompany[]> {
  const searchParams = new URLSearchParams();
  if (params?.city) searchParams.set("city", params.city);
  const url = `${API_BASE_URL}/companies${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error fetching companies");
  }
  return res.json();
}

export async function fetchCompanyById(id: string): Promise<ApiCompany | null> {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Error fetching company");
  }
  return res.json();
}

export async function fetchUsersList(): Promise<{ id: string }[]> {
  const res = await fetch(`${API_BASE_URL}/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching users");
  return res.json();
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  description?: string;
}): Promise<{ id: string; name: string; email: string }> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      description: data.description ?? "",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Error al crear la cuenta");
  }
  return res.json();
}

export async function registerCompany(data: {
  name: string;
  email: string;
  location: string;
  password: string;
  description?: string;
}): Promise<ApiCompany> {
  const res = await fetch(`${API_BASE_URL}/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      location: data.location,
      password: data.password,
      description: data.description ?? "",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Error al crear la cuenta");
  }
  return res.json();
}

// --- Postulaciones ---

export interface ApiApplication {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  userCity: string;
  cvUrl: string;
  message?: string;
  appliedAt: string;
}

export async function fetchApplications(params?: { userId?: string; jobId?: string }): Promise<ApiApplication[]> {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.set("userId", params.userId);
  if (params?.jobId) searchParams.set("jobId", params.jobId);
  const url = `${API_BASE_URL}/applications${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al cargar postulaciones");
  return res.json();
}

export async function fetchCompanyApplications(headers: Record<string, string>, jobId?: string): Promise<ApiApplication[]> {
  const qs = jobId ? `?jobId=${encodeURIComponent(jobId)}` : "";
  const res = await fetch(`${API_BASE_URL}/applications/me${qs}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al cargar postulaciones";
    throw new Error(msg);
  }
  return res.json();
}

export interface ApiCandidateProfile {
  id: string;
  name: string;
  email: string;
  description: string;
  avatar?: string | null;
  cvUrl?: string | null;
}

export async function fetchCompanyCandidate(
  headers: Record<string, string>,
  userId: string
): Promise<ApiCandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/companies/candidates/${encodeURIComponent(userId)}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al cargar candidato";
    throw new Error(msg);
  }
  return res.json();
}

export async function createApplication(payload: {
  jobId: string;
  userId: string;
  userCity: string;
  cvUrl: string;
  message?: string;
}): Promise<ApiApplication> {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al enviar postulación";
    throw new Error(msg);
  }
  return res.json();
}

export async function createApplicationMe(
  headers: Record<string, string>,
  payload: { jobId: string; userCity: string; message?: string },
  file: File
): Promise<ApiApplication> {
  const form = new FormData();
  form.append("jobId", payload.jobId);
  form.append("userCity", payload.userCity);
  if (payload.message) form.append("message", payload.message);
  form.append("cv", file, file.name);
  const res = await fetch(`${API_BASE_URL}/applications/me`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Error al enviar postulación";
    throw new Error(msg);
  }
  return res.json();
}

// --- Usuario candidato (requieren Authorization: Bearer token) ---

export interface ApiUserMe {
  id: string;
  name: string;
  email: string;
  description: string;
  avatar?: string | null;
  cvUrl?: string | null;
}

export async function fetchMe(
  headers: Record<string, string>
): Promise<ApiUserMe> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { ...headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al cargar perfil");
  }
  return res.json();
}

export async function updateMe(
  headers: Record<string, string>,
  data: { name?: string; email?: string; description?: string }
): Promise<ApiUserMe> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    let msg = "Error al actualizar perfil. Si sigue fallando, cierra sesión e inicia sesión de nuevo.";
    if (res.status === 401) msg = "Sesión expirada. Vuelve a iniciar sesión.";
    else if (err && typeof err === "object") {
      const e = (err as { error?: unknown }).error;
      if (typeof e === "string") msg = e;
      else if (e && typeof e === "object" && typeof (e as { message?: string }).message === "string")
        msg = (e as { message: string }).message;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadMeAvatar(
  headers: Record<string, string>,
  file: File
): Promise<ApiUserMe> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al subir la foto");
  }
  return res.json();
}

export async function uploadMeCv(
  headers: Record<string, string>,
  file: File
): Promise<ApiUserMe> {
  const form = new FormData();
  form.append("cv", file);
  const res = await fetch(`${API_BASE_URL}/users/me/cv`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al subir el CV");
  }
  return res.json();
}

export async function changePassword(
  headers: Record<string, string>,
  data: { currentPassword: string; newPassword: string }
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/users/me/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Error al cambiar la contraseña");
  }
  return res.json();
}

