// src/components/common/PostsList.tsx
'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Define a type for your post for better type safety
type Post = {
  id: number; // Prisma ID is number
  title: string;
  content: string | null;
  createdAt: string; // Assuming serialized as ISO string
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

// 1. API function to fetch posts (paginated)
async function fetchPosts({ pageParam = 1 }): Promise<PostsResponse> {
  // Use NEXT_PUBLIC_BASE_URL for client-side fetching if needed, or relative path
  const res = await fetch(`/api/get-posts?page=${pageParam}&limit=5`, {
    cache: 'no-store', // Important for dynamic data
  });
  if (!res.ok) {
    // It's good practice to throw an error that can be caught by React Query
    const errorText = await res.text();
    throw new Error(`Failed to fetch posts: ${res.status} ${errorText}`);
  }
  return res.json();
}

export default function PostsList() {
  const t = useTranslations('PostsPage');

  // 2. Infinite Query to fetch posts
  const {
    data, // This will be the combined result, initially undefined
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status, // 'pending', 'success', 'error'
    error,
  } = useInfiniteQuery<PostsResponse, Error>({ // Specify error type
    queryKey: ['posts-infinite'], // Unique key for this query, different from the simple list query
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      // Return the next page number if it exists, otherwise undefined/false
      return lastPage.pagination.hasNextPage ? lastPage.pagination.nextPage : undefined;
    },
    initialPageParam: 1, // Initial page parameter for the first fetch
  });

  // --- Robust handling of data.pages ---
  // Check if data exists and has the pages property before accessing it
  const posts = data?.pages?.flatMap(page => page.posts) ?? [];
  // Alternatively, you could use data?.pages?.reduce(...) if flatMap causes issues

  // Determine loading and error states based on the 'status' provided by RQ
  const isPending = status === 'pending';
  const isError = status === 'error';

  if (isPending) {
    return (
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
    );
  }

  if (isError) {
    // Improved error message display
    console.error("Error loading posts:", error); // Log for debugging
    return <p className="text-red-500 text-center">{t('loadError')}: {error?.message || 'Unknown error'}</p>;
  }

  if (posts.length === 0) {
    return <p className="text-muted-foreground text-center col-span-full">{t('noPosts')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
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
          onClick={() => fetchNextPage()} // fetchNextPage triggers the queryFn with the next pageParam
          disabled={!hasNextPage || isFetchingNextPage}
          variant="outline"
        >
          {isFetchingNextPage ? t('loadingPosts') : hasNextPage ? t('loadMore') : t('noMorePosts')}
        </Button>
      </div>
    </div>
  );
}
