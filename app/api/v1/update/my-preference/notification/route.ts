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
        newCommentNotification?: boolean;
        newFollowNotification?: boolean;
        newLikeNotification?: boolean;
        newDislikeNotification?: boolean;
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

    if (typeof body.newCommentNotification === "boolean") {
        updateData.newCommentNotification = body.newCommentNotification;
    }

    if (typeof body.newFollowNotification === "boolean") {
        updateData.newFollowNotification = body.newFollowNotification;
    }

    if (typeof body.newLikeNotification === "boolean") {
        updateData.newLikeNotification = body.newLikeNotification;
    }

    if (typeof body.newDislikeNotification === "boolean") {
        updateData.newDislikeNotification = body.newDislikeNotification;
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
        { message: "Notification settings updated successfully" },
        { status: 200 }
    );
}
