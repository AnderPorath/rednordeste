# Base de datos – PostgreSQL

Este proyecto usa **PostgreSQL**. En local necesitás una instancia (Docker, Neon, Supabase, etc.). En producción (Render) usá la base que te asigna Render.

## Pasos

1. Definir `DATABASE_URL` en `.env` (ej. `postgresql://user:password@host:5432/database?sslmode=require`).

2. En la carpeta `Backend`:
   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

3. En producción (Render) agregá la variable `DATABASE_URL` desde el panel de la base de datos.

## Opcional

- Para ver o editar datos: `npm run db:studio`.
- Para crear migraciones en desarrollo: `npx prisma migrate dev --name <nombre>`.
