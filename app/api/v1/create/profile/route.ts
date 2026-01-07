import { db } from "@/db";
import { user, userPreferences, userProfiles } from "@/db/schema";
import { generateId } from "@/helper/generate-id";
import { uploadImage } from "@/lib/blob-upload";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const formData = await req.formData();

    const display_name = formData.get("display_name") as string | null;
    const biography = formData.get("biography") as string | null;
    const avatarRaw = formData.get("avatar_raw") as File | null;
    const prefered_language = formData.get("prefered_language") as string | null;
    const gender = formData.get("gender") as string | null;
    const birthdayRaw = formData.get("birthday") as string | null;

    if (!display_name || !prefered_language || !gender) {
        return NextResponse.json(
            { message: "Fill all fields required" },
            { status: 400 }
        );
    }

    const allowedGenders = ["male", "female", "other"];

    if (!gender || !allowedGenders.includes(gender)) {
        return NextResponse.json(
            { message: "Invalid gender value" },
            { status: 400 }
        );
    }

    if (avatarRaw && !avatarRaw.type.startsWith("image/")) {
        return NextResponse.json(
            { message: "Avatar must be an image" },
            { status: 400 }
        );
    }

    let avatarUploaded = null;

    if (avatarRaw) {
        try {
            const upload = await uploadImage(avatarRaw);
            avatarUploaded = upload.url;
        } catch (error) {
            console.error("Avatar upload failed:", error);
            return NextResponse.json(
                { message: "Failed to upload avatar" },
                { status: 500 }
            );
        }
    }

    const profileId = generateId();
    const preferenceId = generateId();

    if (birthdayRaw && !/^\d{4}-\d{2}-\d{2}$/.test(birthdayRaw)) {
        return NextResponse.json(
            { message: "Birthday must be YYYY-MM-DD" },
            { status: 400 }
        );
    }

    const birthdayDate = birthdayRaw ? new Date(birthdayRaw) : null;

    // Track what was inserted for rollback
    let profileInserted = false;
    let preferencesInserted = false;
    let userUpdated = false;

    try {
        // Step 1: Insert profile
        await db.insert(userProfiles).values({
            profileId: profileId.toString(),
            userId,
            gender,
            birthday: birthdayDate,
            displayName: display_name,
            biography,
            avatarUrl: avatarUploaded,
        });
        profileInserted = true;

        // Step 2: Insert preferences
        await db.insert(userPreferences).values({
            preferenceId: preferenceId.toString(),
            userId,
            preferedLanguage: prefered_language,
        });
        preferencesInserted = true;

        // Step 3: Update user
        const updateResult = await db
            .update(user)
            .set({
                hasProfile: true,
                image: avatarUploaded
            })
            .where(eq(user.id, userId))
            .returning();

        if (!updateResult || updateResult.length === 0) {
            throw new Error("Failed to update user");
        }
        userUpdated = true;

        return NextResponse.json(
            { message: "Profile created successfully" },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Profile creation error:", error);

        // Rollback: Clean up any inserted data
        try {
            if (preferencesInserted) {
                await db
                    .delete(userPreferences)
                    .where(eq(userPreferences.userId, userId));
                console.log("Rolled back user preferences");
            }

            if (profileInserted) {
                await db
                    .delete(userProfiles)
                    .where(eq(userProfiles.userId, userId));
                console.log("Rolled back user profile");
            }

            // If user was updated but something failed, revert it
            if (userUpdated) {
                await db
                    .update(user)
                    .set({
                        hasProfile: false,
                        image: null
                    })
                    .where(eq(user.id, userId));
                console.log("Rolled back user update");
            }
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
        }

        return NextResponse.json(
            { message: "Failed to create profile. Please try again." },
            { status: 500 }
        );
    }
}