import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

const corHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const isProtectedRoute = createRouteMatcher([
  // FIXME:
  "/app",
  "/app(.*)",
  "/app/(.*)", // Protect all app routes
  "!/", // Exclude landing page
  "!/login", // Exclude login page
]);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return NextResponse.json(
      {},
      {
        headers: corHeaders,
      }
    );
  }

  // Handle authentication
  const clerkMiddlwareRunner = clerkMiddleware(async (auth) => {
    // Protect private routes
    const { redirectToSignIn, userId } = await auth();
    if (!userId && isProtectedRoute(request)) {
      return redirectToSignIn();
    }
  });

  return clerkMiddlwareRunner(request, event);
}
