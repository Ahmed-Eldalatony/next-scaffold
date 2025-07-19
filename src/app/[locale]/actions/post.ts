'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  try {
    await prisma.post.create({
      data: {
        title,
        content,
      },
    });
    revalidatePath('/posts'); // Revalidate posts page after creation
    return { success: true, message: 'Post created successfully!' };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, message: 'Failed to create post.' };
  }
}
