import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'PostsPage' });
  return {
    title: t('title'),
  };
}

interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-posts`, {
    cache: 'no-store', // This ensures data is fetched on every request
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await res.json();
  return data.posts;
}

function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
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

async function PostsContent() {
  const posts = await fetchPosts();
  const t = await getTranslations('PostsPage');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground">{t('noPosts')}</p>
      ) : (
        posts.map((post) => (
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
        ))
      )}
    </div>
  );
}

export default async function PostsPage() {
  const t = await getTranslations('PostsPage');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('title')}</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsContent />
      </Suspense>
    </div>
  );
}
