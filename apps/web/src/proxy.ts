import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gardien d'Accès Souverain & Middleware d'Authentification (Next.js)
 * Conforme SOLID & Règle d'Or de Sécurité :
 * - SEUL l'espace de présentation (Page d'accueil '/') et l'authentification ('/login', '/register')
 *   sont accessibles aux visiteurs non connectés.
 * - TOUT AUTRE ESPACE (/dashboard, /feed, /communities, /events, etc.) est STRICTEMENT VERROUILLÉ
 *   et redirige immédiatement l'utilisateur non authentifié vers /login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Fichiers statiques et assets système
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Seules pages publiques autorisées hors session :
  // - '/' : Espace de présentation officielle de la plateforme
  // - '/login' : Connexion citoyenne / gestionnaire
  // - '/register' : Inscription citoyenne
  const isPublicPage =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  const token = request.cookies.get("mc_auth_token")?.value;

  if (!isPublicPage && !token) {
    const loginUrl = new URL("/login", request.url);
    const redirectPath = pathname + (search || "");
    loginUrl.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est déjà connecté et visite /login ou /register, le rediriger vers le dashboard
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepte toutes les requêtes sauf les fichiers statiques Next.js et extensions de médias
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
