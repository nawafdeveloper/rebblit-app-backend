import { db } from "@/db";
import { userPreferences } from "@/db/schema";
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
        const preferences = await db
            .select()
            .from(userPreferences)
            .where(eq(userPreferences.userId, userId));

        if (preferences.length === 0) {
            return NextResponse.json(
                { message: 'Your preferences are not founded' },
                { status: 404 }
            )
        };

        return NextResponse.json(
            { data: preferences },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to get user preferences." },
            { status: 500 }
        );
    }
}