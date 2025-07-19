import { getTranslations } from "next-intl/server";

import { prisma } from '@/lib/prisma';

export default async function PostsPage() {

  const t = await getTranslations('PostsPage');

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('title')}</h1>
      <div>
        {posts.map(post => {
          return (
            <div key={post.id}>
              <div >
                {post.title}
              </div>
              <p>{post.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
