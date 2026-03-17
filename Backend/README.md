# Backend – Red Nordeste

API Express + TypeScript. **Base de datos SQLite (archivo local). No hace falta instalar PostgreSQL.**

## Arrancar (sin instalar nada)

1. En la carpeta `Backend`:

   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

2. La API queda en `http://localhost:4000`. La base de datos es el archivo `prisma/red_nordeste.db` (empleos, empresas y usuarios de ejemplo ya cargados).

En consola verás: **Data: SQLite (archivo local, sin instalar PostgreSQL)**.

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Servidor en desarrollo |
| `npm run build` | Genera Prisma Client y compila TypeScript |
| `npm run start` | Servidor en producción |
| `npx prisma migrate deploy` | Aplica migraciones a la BD |
| `npm run db:seed` | Carga datos iniciales (empleos, empresas, usuarios, postulaciones) |
| `npm run db:studio` | Abre Prisma Studio para ver/editar la BD |
| `npx prisma migrate dev --name <nombre>` | Crea una nueva migración (desarrollo) |

## Estructura de la base de datos

- **Company**: empresas (id, name, logo, description, email, location)
- **Job**: empleos (id, title, companyId, city, salary, type, description, requirements, postedAt)
- **User**: candidatos (id, name, email, avatar, description, cvUrl)
- **Application**: postulaciones (id, jobId, userId, userCity, cvUrl, message, appliedAt)

---

## Deploy en producción (Render + dominio)

Para **dominio en MaxDominios**, **DNS en Cloudflare**, **front en Vercel** y **back en Render**:

1. **Render (backend)**  
   - Web Service conectado al repo (carpeta `Backend` si es monorepo).  
   - Variables de entorno: `NODE_ENV=production`, `DATABASE_URL` (si usas Postgres; Render puede crear la BD), `CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com`.  
   - Custom domain: `api.tudominio.com` → en Cloudflare un CNAME `api` apuntando a la URL que te da Render (ej. `tu-app.onrender.com`).

2. **Vercel (frontend)**  
   - Proyecto desde el repo (carpeta `Frontend`).  
   - Variable de entorno: `NEXT_PUBLIC_API_URL=https://api.tudominio.com`.  
   - Domains: `tudominio.com` y `www.tudominio.com`; en Cloudflare configuras lo que Vercel indique (CNAME a `cname.vercel-dns.com` o similar).

3. **Cloudflare**  
   - Nameservers del dominio (en MaxDominios) apuntan a Cloudflare.  
   - Registros: `www` y raíz hacia Vercel; `api` (CNAME) hacia la URL del servicio en Render.

Con eso el front en tu dominio llama al back en `api.tudominio.com` y CORS permite ese origen.
