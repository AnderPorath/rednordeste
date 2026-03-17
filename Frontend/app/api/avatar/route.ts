import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Proxy para la foto de perfil del admin: evita problemas de CORS/origen
 * al cargar la imagen desde el mismo origen que el frontend.
 * Uso: GET /api/avatar?path=/uploads/avatars/avatar-123.jpg
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith("/uploads/")) {
    return NextResponse.json({ error: "path inválido" }, { status: 400 });
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        "content-type": contentType,
        "cache-control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("[api/avatar]", e);
    return new NextResponse(null, { status: 502 });
  }
}
