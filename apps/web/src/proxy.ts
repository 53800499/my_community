import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy d'Authentification Souverain & Contextuel (Edge Runtime - Next.js 16)
 * Conforme SOLID :
 * - Intercepte et protège toutes les routes sensibles (/dashboard, /dashboard/*)
 * - Redirige les utilisateurs non authentifiés vers la page de connexion avec URL de retour
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Vérification des routes protégées (Dashboard et Fil citoyen)
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/feed");

  if (isProtected) {
    const token = request.cookies.get("mc_auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      const redirectPath = pathname + search;
      loginUrl.searchParams.set("redirect", redirectPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/feed/:path*",
    "/feed",
  ],
};
