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
        autoPlayVideo?: boolean;
        autoMuteVideo?: boolean;
        enableHdr?: boolean;
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

    if (typeof body.autoPlayVideo === "boolean") {
        updateData.autoPlayVideo = body.autoPlayVideo;
    }

    if (typeof body.autoMuteVideo === "boolean") {
        updateData.autoMuteVideo = body.autoMuteVideo;
    }

    if (typeof body.enableHdr === "boolean") {
        updateData.enableHdr = body.enableHdr;
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
        { message: "Preferences updated successfully" },
        { status: 200 }
    );
}
