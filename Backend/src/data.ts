/**
 * Capa de datos: PostgreSQL vía Prisma (DATABASE_URL).
 */

import { prisma } from "./db";

function requirementsToArray(r: unknown): string[] {
  if (Array.isArray(r)) return r as string[];
  if (typeof r === "string") try { return JSON.parse(r) as string[]; } catch { return []; }
  return [];
}

// --- Tipos de respuesta (misma forma que la API) ---
export type JobResponse = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  city: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: string;
};

export type CompanyResponse = {
  id: string;
  name: string;
  logo?: string;
  description: string;
  email: string;
  location: string;
  jobs: { id: string }[];
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  description: string;
  cvUrl?: string | null;
};

export type ApplicationResponse = {
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
};

function jobToResponse(j: { id: string; title: string; city: string; salary: string; type: string; description: string; requirements: unknown; postedAt: Date; company: { name: string; logo?: string | null } }): JobResponse {
  return {
    id: j.id,
    title: j.title,
    company: j.company.name,
    companyLogo: j.company.logo ?? undefined,
    city: j.city,
    salary: j.salary,
    type: j.type,
    description: j.description,
    requirements: requirementsToArray(j.requirements),
    postedAt: j.postedAt.toISOString(),
  };
}

// --- Jobs ---
export async function getJobsList(filters: { search?: string; city?: string; type?: string; companyId?: string }): Promise<JobResponse[]> {
  const where: {
    city?: string;
    type?: string;
    companyId?: string;
    OR?: { title?: { contains: string }; description?: { contains: string }; company?: { name: { contains: string } } }[];
  } = {};
  if (filters.city) where.city = filters.city;
  if (filters.type) where.type = filters.type;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.search) {
    const s = filters.search.toLowerCase();
    where.OR = [
      { title: { contains: s } },
      { description: { contains: s } },
      { company: { name: { contains: s } } },
    ];
  }
  const list = await prisma.job.findMany({
    where,
    include: { company: true },
    orderBy: { postedAt: "desc" },
  });
  return list.map(jobToResponse);
}

export type JobResponseWithCompanyId = JobResponse & { companyId: string };

export async function getJobsListForAdmin(filters: {
  search?: string;
  city?: string;
  type?: string;
}): Promise<JobResponseWithCompanyId[]> {
  const where: { city?: string; type?: string; OR?: { title?: { contains: string }; description?: { contains: string }; company?: { name: { contains: string } } }[] } = {};
  if (filters.city) where.city = filters.city;
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    const s = filters.search.toLowerCase();
    where.OR = [
      { title: { contains: s } },
      { description: { contains: s } },
      { company: { name: { contains: s } } },
    ];
  }
  const list = await prisma.job.findMany({
    where,
    include: { company: { select: { id: true, name: true } } },
    orderBy: { postedAt: "desc" },
  });
  return list.map((j) => ({
    ...jobToResponse({ ...j, company: { name: j.company.name } }),
    companyId: j.companyId,
  }));
}

export async function getJobById(id: string): Promise<JobResponse | null> {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });
  return job ? jobToResponse(job) : null;
}

export async function createJob(data: {
  title: string;
  description: string;
  salary: string;
  type: string;
  city: string;
  requirements: string[];
  companyId: string;
}): Promise<JobResponse> {
  const job = await prisma.job.create({
    data: {
      id: String(Date.now()),
      title: data.title,
      companyId: data.companyId,
      city: data.city,
      salary: data.salary,
      type: data.type,
      description: data.description,
      requirements: data.requirements as unknown as Parameters<typeof prisma.job.create>[0]["data"]["requirements"],
    },
    include: { company: true },
  });
  return jobToResponse(job);
}

export async function updateJob(
  id: string,
  data: Partial<{
    title: string;
    companyId: string;
    city: string;
    salary: string;
    type: string;
    description: string;
    requirements: string[];
  }>
): Promise<JobResponse | null> {
  if (data.companyId !== undefined) {
    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) return null;
  }
  try {
    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.companyId && { companyId: data.companyId }),
        ...(data.city && { city: data.city }),
        ...(data.salary && { salary: data.salary }),
        ...(data.type && { type: data.type }),
        ...(data.description && { description: data.description }),
        ...(data.requirements && { requirements: data.requirements as unknown as Parameters<typeof prisma.job.update>[0]["data"]["requirements"] }),
      },
      include: { company: true },
    });
    return jobToResponse(job);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return null;
    throw e;
  }
}

export async function deleteJob(id: string): Promise<boolean> {
  try {
    await prisma.job.delete({ where: { id } });
    return true;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return false;
    throw e;
  }
}

// --- Companies ---
export async function getCompaniesList(city?: string): Promise<CompanyResponse[]> {
  const list = await prisma.company.findMany({
    where: city ? { location: city } : undefined,
    include: { jobs: { select: { id: true } } },
  });
  return list.map((c) => ({
    id: c.id,
    name: c.name,
    logo: c.logo ?? undefined,
    description: c.description,
    email: c.email,
    location: c.location,
    jobs: c.jobs,
  }));
}

export async function getCompanyById(id: string): Promise<CompanyResponse | null> {
  const company = await prisma.company.findUnique({
    where: { id },
    include: { jobs: { select: { id: true } } },
  });
  if (!company) return null;
  return {
    id: company.id,
    name: company.name,
    logo: company.logo ?? undefined,
    description: company.description,
    email: company.email,
    location: company.location,
    jobs: company.jobs,
  };
}

export async function createCompany(data: {
  name: string;
  description: string;
  email: string;
  location: string;
  logo?: string;
  passwordHash?: string;
}): Promise<CompanyResponse> {
  const c = await prisma.company.create({
    data: { id: "company-" + Date.now(), ...data },
  });
  return { ...c, logo: c.logo ?? undefined, jobs: [] };
}

export async function updateCompany(
  id: string,
  data: Partial<{ name: string; description: string; email: string; location: string; logo?: string }>
): Promise<CompanyResponse | null> {
  try {
    const c = await prisma.company.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.logo !== undefined && { logo: data.logo }),
      },
      include: { jobs: { select: { id: true } } },
    });
    return { ...c, logo: c.logo ?? undefined, jobs: c.jobs };
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return null;
    throw e;
  }
}

export async function deleteCompany(id: string): Promise<boolean> {
  try {
    await prisma.company.delete({ where: { id } });
    return true;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return false;
    throw e;
  }
}

// --- Users ---
export async function getUsersList(): Promise<UserResponse[]> {
  return prisma.user.findMany();
}

export async function getUserById(id: string): Promise<UserResponse | null> {
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Devuelve el perfil de un candidato para una empresa, pero SOLO si
 * ese candidato se postuló a un empleo de esa empresa.
 */
export async function getCandidateForCompany(filters: {
  companyId: string;
  userId: string;
}): Promise<UserResponse | null> {
  const canAccess = await prisma.application.findFirst({
    where: { userId: filters.userId, job: { companyId: filters.companyId } },
    select: { id: true },
  });
  if (!canAccess) return null;
  return prisma.user.findUnique({ where: { id: filters.userId } });
}

export async function createUser(data: {
  name: string;
  email: string;
  description: string;
  avatar?: string;
  cvUrl?: string;
  passwordHash?: string;
}): Promise<UserResponse> {
  return prisma.user.create({
    data: { id: "user-" + Date.now(), ...data },
  });
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string; description: string; avatar?: string; cvUrl?: string }>
): Promise<UserResponse | null> {
  try {
    return await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.cvUrl !== undefined && { cvUrl: data.cvUrl }),
      },
    });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return null;
    throw e;
  }
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return true;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return false;
    throw e;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") return false;
    throw e;
  }
}

// --- Applications ---
export async function getApplicationsList(filters: { jobId?: string; userId?: string }): Promise<ApplicationResponse[]> {
  const where: { jobId?: string; userId?: string } = {};
  if (filters.jobId) where.jobId = filters.jobId;
  if (filters.userId) where.userId = filters.userId;
  const list = await prisma.application.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { user: { select: { name: true, email: true, avatar: true } } },
    orderBy: { appliedAt: "desc" },
  });
  return list.map((a) => ({
    id: a.id,
    jobId: a.jobId,
    userId: a.userId,
    userName: a.user.name,
    userEmail: a.user.email,
    userAvatar: a.user.avatar ?? null,
    userCity: a.userCity,
    cvUrl: a.cvUrl,
    message: a.message ?? undefined,
    appliedAt: a.appliedAt.toISOString(),
  }));
}

export async function createApplication(data: {
  jobId: string;
  userId: string;
  userCity: string;
  cvUrl: string;
  message?: string;
}): Promise<ApplicationResponse> {
  const a = await prisma.application.create({
    data: { id: "app-" + Date.now(), ...data },
    include: { user: { select: { name: true, email: true, avatar: true } } },
  });
  return {
    id: a.id,
    jobId: a.jobId,
    userId: a.userId,
    userName: a.user.name,
    userEmail: a.user.email,
    userAvatar: a.user.avatar ?? null,
    userCity: a.userCity,
    cvUrl: a.cvUrl,
    message: a.message ?? undefined,
    appliedAt: a.appliedAt.toISOString(),
  };
}

export async function getApplicationsForCompany(filters: { companyId: string; jobId?: string }): Promise<ApplicationResponse[]> {
  const where: any = { job: { companyId: filters.companyId } };
  if (filters.jobId) where.jobId = filters.jobId;
  const list = await prisma.application.findMany({
    where,
    include: { user: { select: { name: true, email: true, avatar: true } } },
    orderBy: { appliedAt: "desc" },
  });
  return list.map((a) => ({
    id: a.id,
    jobId: a.jobId,
    userId: a.userId,
    userName: a.user.name,
    userEmail: a.user.email,
    userAvatar: a.user.avatar ?? null,
    userCity: a.userCity,
    cvUrl: a.cvUrl,
    message: a.message ?? undefined,
    appliedAt: a.appliedAt.toISOString(),
  }));
}
