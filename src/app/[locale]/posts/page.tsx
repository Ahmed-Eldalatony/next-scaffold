// src/app/[locale]/posts/page.tsx
import { getTranslations } from 'next-intl/server';
import PostsManager from '@/components/common/PostsManager'; // Import the new component

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'PostsPage' });
  return {
    title: t('title'),
  };
}

export default async function PostsPage() {
  // const t = await getTranslations('PostsPage'); // If needed for SSR initial data, but RQ handles client-side well.
  // Optionally fetch initial data server-side if needed for SSR, but RQ handles client-side fetching well.
  // const initialData = await getPostsAction(1, 5); // Fetch first page server-side if desired
  // Pass initialData to PostsManager if implemented there

  return (
    <div className="container mx-auto py-8">
      <PostsManager />
    </div>
  );
}
