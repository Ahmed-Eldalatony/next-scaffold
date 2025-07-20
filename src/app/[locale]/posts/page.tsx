import { getTranslations } from "next-intl/server";


export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'PostsPage' });
  return {
    title: t('title'),
  };
}

export default async function PostsPage() {

  const t = await getTranslations('PostsPage');



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
