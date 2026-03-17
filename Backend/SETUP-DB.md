# Base de datos – sin instalar nada

Este proyecto usa **SQLite**: un archivo en tu carpeta. No hace falta instalar PostgreSQL ni crear cuentas en la nube.

## Pasos

1. En la carpeta `Backend`:
   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

2. Listo. La base de datos es el archivo `Backend/prisma/red_nordeste.db`. Los empleos, empresas y usuarios de ejemplo ya están cargados.

En la consola verás: **Data: SQLite (archivo local, sin instalar PostgreSQL)**.

## Opcional

- Para ver o editar datos: `npm run db:studio` (abre Prisma Studio en el navegador).
- Para cambiar la ruta del archivo: en `.env` definí `DATABASE_URL="file:./prisma/otro_nombre.db"` y volvé a ejecutar `npx prisma migrate deploy` y `npm run db:seed`.
