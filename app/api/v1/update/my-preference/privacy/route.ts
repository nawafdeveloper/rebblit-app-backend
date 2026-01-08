import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    let body: {
        accountPrivacy?: "private" | "public";
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const updateData: Partial<typeof userPreferences.$inferInsert> = {};

    if (body.accountPrivacy === "private" || body.accountPrivacy === "public") {
        updateData.accountPrivacy = body.accountPrivacy;
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
            { message: "No valid fields provided" },
            { status: 400 }
        );
    }

    await db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.userId, userId));

    return NextResponse.json(
        { message: "Account privacy updated successfully" },
        { status: 200 }
    );
}
