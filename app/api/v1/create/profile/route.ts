import { db } from "@/db";
import { userPreferences, userProfiles } from "@/db/schema";
import { generateId } from "@/helper/generate-id";
import { NextResponse } from "next/server";

interface Body {
    display_name: string;
    biography: string | null;
    avatar_url: string | null;
    prefered_language: string;
};

export async function POST(req: Request) {
    const body: Body = await req.json();
    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!body) {
        return NextResponse.json(
            { message: "Fill all fields required" },
            { status: 400 }
        );
    }

    const profileId = generateId();
    const preferenceId = generateId();

    await db.insert(userProfiles).values({
        profileId: profileId.toString(),
        userId,
        displayName: body.display_name,
        biography: body.biography,
        avatarUrl: body.avatar_url,
    });

    await db.insert(userPreferences).values({
        preferenceId: preferenceId.toString(),
        userId,
        preferedLanguage: body.prefered_language,
    });

    return NextResponse.json(
        { message: "Profile created successfully" },
        { status: 201 }
    );
}