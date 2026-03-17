"use strict";
/**
 * Capa de datos: PostgreSQL vía Prisma (DATABASE_URL).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobsList = getJobsList;
exports.getJobsListForAdmin = getJobsListForAdmin;
exports.getJobById = getJobById;
exports.createJob = createJob;
exports.updateJob = updateJob;
exports.deleteJob = deleteJob;
exports.getCompaniesList = getCompaniesList;
exports.getCompanyById = getCompanyById;
exports.createCompany = createCompany;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
exports.getUsersList = getUsersList;
exports.getUserById = getUserById;
exports.getCandidateForCompany = getCandidateForCompany;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateUserPassword = updateUserPassword;
exports.deleteUser = deleteUser;
exports.getApplicationsList = getApplicationsList;
exports.createApplication = createApplication;
exports.getApplicationsForCompany = getApplicationsForCompany;
const db_1 = require("./db");
function requirementsToArray(r) {
    if (Array.isArray(r))
        return r;
    if (typeof r === "string")
        try {
            return JSON.parse(r);
        }
        catch {
            return [];
        }
    return [];
}
function jobToResponse(j) {
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
async function getJobsList(filters) {
    const where = {};
    if (filters.city)
        where.city = filters.city;
    if (filters.type)
        where.type = filters.type;
    if (filters.companyId)
        where.companyId = filters.companyId;
    if (filters.search) {
        const s = filters.search.toLowerCase();
        where.OR = [
            { title: { contains: s } },
            { description: { contains: s } },
            { company: { name: { contains: s } } },
        ];
    }
    const list = await db_1.prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: { postedAt: "desc" },
    });
    return list.map(jobToResponse);
}
async function getJobsListForAdmin(filters) {
    const where = {};
    if (filters.city)
        where.city = filters.city;
    if (filters.type)
        where.type = filters.type;
    if (filters.search) {
        const s = filters.search.toLowerCase();
        where.OR = [
            { title: { contains: s } },
            { description: { contains: s } },
            { company: { name: { contains: s } } },
        ];
    }
    const list = await db_1.prisma.job.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        orderBy: { postedAt: "desc" },
    });
    return list.map((j) => ({
        ...jobToResponse({ ...j, company: { name: j.company.name } }),
        companyId: j.companyId,
    }));
}
async function getJobById(id) {
    const job = await db_1.prisma.job.findUnique({
        where: { id },
        include: { company: true },
    });
    return job ? jobToResponse(job) : null;
}
async function createJob(data) {
    const job = await db_1.prisma.job.create({
        data: {
            id: String(Date.now()),
            title: data.title,
            companyId: data.companyId,
            city: data.city,
            salary: data.salary,
            type: data.type,
            description: data.description,
            requirements: data.requirements,
        },
        include: { company: true },
    });
    return jobToResponse(job);
}
async function updateJob(id, data) {
    if (data.companyId !== undefined) {
        const company = await db_1.prisma.company.findUnique({ where: { id: data.companyId } });
        if (!company)
            return null;
    }
    try {
        const job = await db_1.prisma.job.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.companyId && { companyId: data.companyId }),
                ...(data.city && { city: data.city }),
                ...(data.salary && { salary: data.salary }),
                ...(data.type && { type: data.type }),
                ...(data.description && { description: data.description }),
                ...(data.requirements && { requirements: data.requirements }),
            },
            include: { company: true },
        });
        return jobToResponse(job);
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return null;
        throw e;
    }
}
async function deleteJob(id) {
    try {
        await db_1.prisma.job.delete({ where: { id } });
        return true;
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return false;
        throw e;
    }
}
// --- Companies ---
async function getCompaniesList(city) {
    const list = await db_1.prisma.company.findMany({
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
async function getCompanyById(id) {
    const company = await db_1.prisma.company.findUnique({
        where: { id },
        include: { jobs: { select: { id: true } } },
    });
    if (!company)
        return null;
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
async function createCompany(data) {
    const c = await db_1.prisma.company.create({
        data: { id: "company-" + Date.now(), ...data },
    });
    return { ...c, logo: c.logo ?? undefined, jobs: [] };
}
async function updateCompany(id, data) {
    try {
        const c = await db_1.prisma.company.update({
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
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return null;
        throw e;
    }
}
async function deleteCompany(id) {
    try {
        await db_1.prisma.company.delete({ where: { id } });
        return true;
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return false;
        throw e;
    }
}
// --- Users ---
async function getUsersList() {
    return db_1.prisma.user.findMany();
}
async function getUserById(id) {
    return db_1.prisma.user.findUnique({ where: { id } });
}
/**
 * Devuelve el perfil de un candidato para una empresa, pero SOLO si
 * ese candidato se postuló a un empleo de esa empresa.
 */
async function getCandidateForCompany(filters) {
    const canAccess = await db_1.prisma.application.findFirst({
        where: { userId: filters.userId, job: { companyId: filters.companyId } },
        select: { id: true },
    });
    if (!canAccess)
        return null;
    return db_1.prisma.user.findUnique({ where: { id: filters.userId } });
}
async function createUser(data) {
    return db_1.prisma.user.create({
        data: { id: "user-" + Date.now(), ...data },
    });
}
async function updateUser(id, data) {
    try {
        return await db_1.prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.avatar !== undefined && { avatar: data.avatar }),
                ...(data.cvUrl !== undefined && { cvUrl: data.cvUrl }),
            },
        });
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return null;
        throw e;
    }
}
async function updateUserPassword(id, passwordHash) {
    try {
        await db_1.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
        return true;
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return false;
        throw e;
    }
}
async function deleteUser(id) {
    try {
        await db_1.prisma.user.delete({ where: { id } });
        return true;
    }
    catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "P2025")
            return false;
        throw e;
    }
}
// --- Applications ---
async function getApplicationsList(filters) {
    const where = {};
    if (filters.jobId)
        where.jobId = filters.jobId;
    if (filters.userId)
        where.userId = filters.userId;
    const list = await db_1.prisma.application.findMany({
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
async function createApplication(data) {
    const a = await db_1.prisma.application.create({
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
async function getApplicationsForCompany(filters) {
    const where = { job: { companyId: filters.companyId } };
    if (filters.jobId)
        where.jobId = filters.jobId;
    const list = await db_1.prisma.application.findMany({
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
