// src/components/common/PostsManager.tsx
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { createPost } from '@/app/[locale]/actions/post';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRef } from 'react';
import { toast } from 'sonner'; // Make sure you have sonner installed or use your preferred toast library

// --- Types ---
type Post = {
  id: number; // Prisma ID is number, but API serializes it. We'll handle as number/string as needed.
  title: string;
  content: string | null;
  createdAt: string; // Assuming ISO string from API
};

type PostsResponse = {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
};

// --- API Functions ---
// Fetch paginated posts
async function fetchPosts({ pageParam = 1 }): Promise<PostsResponse> {
  // Use NEXT_PUBLIC_BASE_URL if needed, but relative path often works for same-origin API calls
  const res = await fetch(`/api/get-posts?page=${pageParam}&limit=5`, {
    cache: 'no-store', // Important for dynamic data
  });
  if (!res.ok) {
    // Handle specific error codes if needed
    if (res.status === 400) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Bad Request');
    }
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

// --- Main Component ---
export default function PostsManager() {
  const t = useTranslations('PostsPage');
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // --- Infinite Query for Posts ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      // Return the next page number if it exists, otherwise undefined
      return lastPage.pagination.hasNextPage ? lastPage.pagination.nextPage : undefined;
    },
    initialPageParam: 1, // Initial page parameter for TanStack Query v5
  });

  // Flatten the pages data for easier rendering
  const posts = data?.pages.flatMap(page => page.posts) ?? [];
  const isPending = status === 'pending';
  const isError = status === 'error';

  // --- Mutation for Creating a Post ---
  const { mutate: createPostMutate, isPending: isCreatingPost } = useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onMutate: async (newPostFormData: FormData) => {
      // Cancel any outgoing refetches for the posts query
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value (could be undefined if no data)
      // The type returned by getQueryData for an infinite query is more complex,
      // but for optimistic updates on the first page, we can work with the flattened structure conceptually
      // or directly manipulate the cached pages structure.
      // Let's get the current cached data structure for 'posts'
      const previousData = queryClient.getQueryData<ReturnType<typeof useInfiniteQuery>['data']>(['posts']);

      // Create a temporary post object for optimistic UI
      const tempPost: Post = {
        id: Date.now(), // Temporary ID (simple approach, could use uuid for better uniqueness)
        title: newPostFormData.get('title') as string,
        content: newPostFormData.get('content') as string,
        createdAt: new Date().toISOString(),
      };

      // Optimistically update the cache
      // We need to update the structure that useInfiniteQuery expects: { pages: [...], pageParams: [...] }
      if (previousData && previousData.pages.length > 0) {
        // If data exists, update the first page
        const updatedFirstPage = {
          ...previousData.pages[0],
          posts: [tempPost, ...previousData.pages[0].posts],
          // Note: We don't update pagination counts here as it's an optimistic add
        };

        // Create the new data structure
        const optimisticData = {
          pages: [updatedFirstPage, ...previousData.pages.slice(1)],
          pageParams: previousData.pageParams, // Keep page params consistent
        };

        queryClient.setQueryData(['posts'], optimisticData);
      } else {
        // If no data exists in cache, create a temporary structure for the first page
        // This handles the case where the list is empty and we add the first item
        const initialOptimisticPage: PostsResponse = {
          posts: [tempPost],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 1, // Temporary count
            hasNextPage: false,
            hasPreviousPage: false,
            nextPage: null,
            previousPage: null,
          },
        };

        const optimisticData = {
          pages: [initialOptimisticPage],
          pageParams: [1], // Initial page param
        };

        queryClient.setQueryData(['posts'], optimisticData);
      }

      // Return context with the snapshotted value for potential rollback
      // Return the entire previous data structure
      return { previousData };
    },
    onError: (err, newPost, context) => {
      // Rollback on error using the snapshot from onMutate
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      } else {
        // If there was no previous data, remove the 'posts' query data entirely or reset it
        // This is less common but handles edge cases
        queryClient.removeQueries({ queryKey: ['posts'] });
        // Or, set it back to undefined explicitly:
        // queryClient.setQueryData(['posts'], undefined);
      }
      console.error("Failed to create post:", err);
      toast.error(t('createError'));
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t('createSuccess'));
        formRef.current?.reset();
      } else {
        toast.error(data.message || t('createError'));
      }
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server
      // This will replace the optimistic post with the actual one from the database
      // and correctly update pagination.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createPostMutate(formData);
  };

  // --- Render Loading Skeletons ---
  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Create Post Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/4" />
          </CardContent>
        </Card>

        {/* Posts List Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Render Error ---
  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          {t('loadError')}: {error?.message || t('unknownError')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* --- Create Post Form --- */}
      <Card>
        <CardHeader>
          <CardTitle>{t('createTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="title" placeholder={t('titlePlaceholder')} required />
            <Textarea name="content" placeholder={t('contentPlaceholder')} rows={5} required />
            <Button type="submit" disabled={isCreatingPost} className="self-start">
              {isCreatingPost ? t('creating') : t('createButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Paginated Posts List --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">{t('postsTitle')}</h2>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">{t('noPosts')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className={`transition-opacity duration-300 ${
                    // Simple way to identify optimistic posts (might need refinement)
                    typeof post.id === 'number' && post.id > Date.now() - 10000
                      ? 'opacity-70 bg-gray-50 dark:bg-gray-800 border-primary/20'
                      : ''
                    }`}
                >
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage
                  ? t('loadingPosts')
                  : hasNextPage
                    ? t('loadMore')
                    : t('noMorePosts')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
