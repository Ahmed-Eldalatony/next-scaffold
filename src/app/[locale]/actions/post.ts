'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    return {
      success: false,
      message: 'Title and content are required.',
    };
  }

  try {


    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        createdAt: new Date(),
      },
    });
    // Revalidate posts page
    revalidatePath('/get-posts');
    revalidatePath('/create-post');

    return {
      success: true,
      message: 'Post created successfully!',
      post: {
        ...newPost,
        id: String(newPost.id), // Ensure ID is string
      },
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      message: 'Failed to create post.',
    };
  }
}

export async function getPostsAction() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      posts: posts.map(post => ({
        ...post,
        id: String(post.id),
      })),
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      message: 'Failed to fetch posts',
    };
  }
}
