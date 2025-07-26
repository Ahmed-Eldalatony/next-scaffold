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
import { toast } from 'sonner';

type Post = {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
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

async function fetchPosts({ pageParam = 1 }): Promise<PostsResponse> {
  // Use NEXT_PUBLIC_BASE_URL if needed, but relative path often works for same-origin API calls
  const res = await fetch(`/api/get-posts?page=${pageParam}&limit=5`);
  if (!res.ok) {
    if (res.status === 400) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Bad Request');
    }
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default function PostsManager() {
  const t = useTranslations('PostsPage');
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

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
      return lastPage.pagination.hasNextPage ? lastPage.pagination.nextPage : undefined;
    },
    initialPageParam: 1,
  });
  const posts = data?.pages.flatMap(page => page.posts) ?? [];
  const isPending = status === 'pending';
  const isError = status === 'error';

  const { mutate: createPostMutate, isPending: isCreatingPost } = useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onMutate: async (newPostFormData: FormData) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousData = queryClient.getQueryData<ReturnType<typeof useInfiniteQuery>['data']>(['posts']);

      const tempPost: Post = {
        id: Date.now(),
        title: newPostFormData.get('title') as string,
        content: newPostFormData.get('content') as string,
        createdAt: new Date().toISOString(),
      };

      if (previousData && previousData.pages.length > 0) {
        const updatedFirstPage = {
          ...previousData.pages[0],
          posts: [tempPost, ...previousData.pages[0].posts],
        };

        const optimisticData = {
          pages: [updatedFirstPage, ...previousData.pages.slice(1)],
          pageParams: previousData.pageParams, // Keep page params consistent
        };

        queryClient.setQueryData(['posts'], optimisticData);
      } else {
        const initialOptimisticPage: PostsResponse = {
          posts: [tempPost],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            nextPage: null,
            previousPage: null,
          },
        };

        const optimisticData = {
          pages: [initialOptimisticPage],
          pageParams: [1],
        };

        queryClient.setQueryData(['posts'], optimisticData);
      }
      return { previousData };
    },
    onError: (err, newPost, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['posts'], context.previousData);
      } else {
        queryClient.removeQueries({ queryKey: ['posts'] });
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
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createPostMutate(formData);
  };

  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-8">
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">{t('title')}</h2>

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
