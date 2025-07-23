// /app/[locale]/posts/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createPost } from '@/app/[locale]/actions/post'; // Your existing server action
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

// Define a type for your post for better type safety
type Post = {
  id: string; // Assuming posts have an ID
  title: string;
  content: string;
};

// 1. API function to fetch posts
async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-posts`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await res.json();
  return data.posts;
}

export default function PostsPage() {
  const t = useTranslations('PostsPage');
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // 2. Query to fetch all posts
  const { data: posts, isLoading, isError, error } = useQuery<Post[]>({
    queryKey: ['posts'], // Unique key for this query
    queryFn: getPosts,   // Function to fetch the data
  });

  // 3. Mutation for creating a post with optimistic updates
  const { mutate, isPending: isCreatingPost } = useMutation({
    mutationFn: (formData: FormData) => createPost(formData), // Use your server action

    // 4. Optimistic Update Logic
    onMutate: async (newPostFormData: FormData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      // Optimistically update to the new value
      queryClient.setQueryData<Post[]>(['posts'], (oldPosts = []) => [
        // Create a temporary post object for the UI
        {
          id: `temp-${Date.now()}`, // Temporary unique ID
          title: newPostFormData.get('title') as string,
          content: newPostFormData.get('content') as string,
        },
        ...oldPosts,
      ]);

      // Return a context object with the snapshotted value
      return { previousPosts };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      // You can also add a toast notification here to inform the user
      console.error("Failed to create post:", err);
    },

    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      formRef.current?.reset(); // Reset the form after submission
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* --- Create Post Form --- */}
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12 p-4 border rounded-lg">
        <h2 className="text-2xl font-bold">{t('createTitle')}</h2>
        <Input name="title" placeholder={t('titlePlaceholder')} required />
        <Textarea name="content" placeholder={t('contentPlaceholder')} rows={5} required />
        <Button type="submit" disabled={isCreatingPost}>
          {isCreatingPost ? t('creating') : t('createButton')}
        </Button>
      </form>

      {/* --- Posts List --- */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold border-b pb-2">{t('postsTitle')}</h2>
        {isLoading && <p>Loading posts...</p>}
        {isError && <p className="text-red-500">Error: {error.message}</p>}
        {posts?.map((post) => (
          <div key={post.id} className={`p-4 border rounded-lg ${post.id.toString().startsWith('temp-') ? 'opacity-50' : ''}`}>
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-700">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
