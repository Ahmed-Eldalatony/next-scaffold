import CreatePostForm from '@/components/common/CreatePostForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'CreatePostPage' });
  return {
    title: t('title'),
  };
}

export default function CreatePostPage() {
  return (
    <div className="container mx-auto py-8">
      <CreatePostForm />
    </div>
  );
}
