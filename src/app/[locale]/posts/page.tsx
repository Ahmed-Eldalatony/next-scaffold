import { getTranslations } from 'next-intl/server';
import PostsManager from '@/components/common/PostsManager';

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth()

  if (!session) {
    // If user is not authenticated, redirect to login page
    redirect("/login")
  }


  const t = await getTranslations({ locale, namespace: 'PostsPage' });
  return {
    title: t('title'),
  };
}

export default async function PostsPage() {
  return (
    <div className="container mx-auto py-8">
      <PostsManager />
    </div>
  );
}
