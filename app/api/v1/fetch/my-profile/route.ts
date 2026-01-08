import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const profile = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));

        if (profile.length === 0) {
            return NextResponse.json(
                { message: 'Your profile has not been founded' },
                { status: 404 }
            )
        };

        return NextResponse.json(
            { data: profile[0] },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to get user profile." },
            { status: 500 }
        );
    }
}