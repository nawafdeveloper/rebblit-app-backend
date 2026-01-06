import { db } from "@/db";
import { posts, thumbnails, userProfiles, videos } from "@/db/schema";
import { generateId } from "@/helper/generate-id";
import { uploadImage } from "@/lib/blob-upload";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const userId = req.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();

        const profileResult = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));

        if (!profileResult || profileResult.length === 0) {
            return NextResponse.json(
                { message: "User profile not found" },
                { status: 404 }
            );
        }

        const thumbFile = formData.get('thumbFile') as File;
        const videoFile = formData.get('videoFile') as File;

        if (!thumbFile || !(thumbFile instanceof File)) {
            return NextResponse.json(
                { message: "Thumbnail file is required" },
                { status: 400 }
            );
        }

        if (!videoFile || !(videoFile instanceof File)) {
            return NextResponse.json(
                { message: "Video file is required" },
                { status: 400 }
            );
        }

        const requiredFields = [
            'thumbW', 'thumbH', 'lengthInMilliSeconds', 'memeType',
            'videoCodecType', 'videoFormat', 'videoH', 'videoW',
            'videoBitRate', 'videoRatio', 'videoSize', 'videoTitle',
            'videoFps', 'caption', 'visibility'
        ];

        for (const field of requiredFields) {
            const value = formData.get(field);
            if (!value || typeof value !== 'string' || value.trim() === '') {
                return NextResponse.json(
                    { message: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        const numericFields = ['thumbW', 'thumbH', 'lengthInMilliSeconds', 'videoH', 'videoW', 'videoBitRate', 'videoSize', 'videoFps'];
        for (const field of numericFields) {
            const value = formData.get(field) as string;
            if (isNaN(Number(value))) {
                return NextResponse.json(
                    { message: `${field} must be a valid number` },
                    { status: 400 }
                );
            }
        }

        const visibility = formData.get("visibility") as string;
        const validVisibilities = ["public", "friends", "private", "unlisted"];
        if (!validVisibilities.includes(visibility)) {
            return NextResponse.json(
                { message: "Invalid visibility value" },
                { status: 400 }
            );
        }

        const thumbnailId = generateId();
        const videoId = generateId();
        const postId = generateId();

        const thumb = await uploadImage(thumbFile);
        const video = await uploadImage(videoFile);

        const status = 'published';
        const publishedAt = new Date();

        const data = {
            thumbnailId,
            thumbUri: thumb.url,
            videoId,
            postId,
            videoUri: video.url,
            thumbW: formData.get("thumbW") as string,
            thumbH: formData.get("thumbH") as string,
            lengthInMilliSeconds: formData.get("lengthInMilliSeconds") as string,
            memeType: formData.get("memeType") as string,
            videoCodecType: formData.get("videoCodecType") as string,
            videoFormat: formData.get("videoFormat") as string,
            videoH: formData.get("videoH") as string,
            videoW: formData.get("videoW") as string,
            videoBitRate: formData.get("videoBitRate") as string,
            videoRatio: formData.get("videoRatio") as string,
            videoSize: formData.get("videoSize") as string,
            videoTitle: formData.get("videoTitle") as string,
            videoFps: formData.get("videoFps") as string,
            caption: formData.get("caption") as string,
            status,
            visibility,
            publishedAt
        };

        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status value" },
                { status: 400 }
            );
        }

        const profileId = profileResult[0].profileId;

        await db.insert(thumbnails).values({
            thumbId: data.thumbnailId,
            thumbUri: data.thumbUri,
            thumbW: parseInt(data.thumbW),
            thumbH: parseInt(data.thumbH),
        });

        await db.insert(videos).values({
            videoId: data.videoId,
            lengthInMilliSeconds: parseInt(data.lengthInMilliSeconds),
            userId,
            postId: data.postId,
            thumbnailId: data.thumbnailId,
            memeType: data.memeType,
            videoUri: data.videoUri,
            videoCodecType: data.videoCodecType,
            videoFormat: data.videoFormat,
            videoH: parseInt(data.videoH),
            videoW: parseInt(data.videoW),
            videoBitRate: parseInt(data.videoBitRate),
            videoRatio: data.videoRatio,
            videoSize: parseInt(data.videoSize),
            videoTitle: data.videoTitle,
            videoFps: parseInt(data.videoFps),
        });

        const postData = await db.insert(posts).values({
            postId: data.postId,
            userId,
            profileId,
            videoId: data.videoId,
            caption: data.caption,
            status: data.status as 'draft' | 'published' | 'archived',
            visibility: data.visibility as 'public' | 'private' | 'unlisted' | 'friends',
            publishedAt: data.publishedAt,
        }).returning();

        return NextResponse.json(
            { message: "Post created successfully", data: postData[0] },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}