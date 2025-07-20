import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

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


export default function middleware(
  request: NextRequest,
  _event: NextFetchEvent
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
  return NextResponse.next()
}
