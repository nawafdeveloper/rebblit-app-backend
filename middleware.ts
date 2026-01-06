import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json(
            { message: "Unauthorized access" },
            { status: 401 }
        );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", session.user.id);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ["/api/v1/:path*"],
};