import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/login";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // If user is logged in and trying to access login page, redirect to admin
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If user is not logged in and trying to access admin routes, redirect to login
  if (!user && isAdminRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and accessing root, redirect to admin
  if (user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If user is not logged in and accessing root, redirect to login
  if (!user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}
