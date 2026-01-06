import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function uploadImage(imageFile: File) {
    'use server';
    const blob = await put(imageFile.name, imageFile, {
        access: 'public',
        addRandomSuffix: true,
    });
    revalidatePath('/');
    return blob;
}