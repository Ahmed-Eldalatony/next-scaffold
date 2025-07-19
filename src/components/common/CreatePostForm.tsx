'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { createPost } from '@/app/[locale]/actions/post';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('CreatePostPage');
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('creating') : t('createButton')}
    </Button>
  );
}

export default function CreatePostForm() {
  const t = useTranslations('CreatePostPage');
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const result = await createPost(formData);
    if (result.success) {
      setMessage(result.message);
      setIsSuccess(true);
      router.push('/posts'); // Redirect to posts page on success
    } else {
      setMessage(result.message);
      setIsSuccess(false);
    }
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      <Input
        type="text"
        name="title"
        placeholder={t('titlePlaceholder')}
        required
      />
      <Textarea
        name="content"
        placeholder={t('contentPlaceholder')}
        rows={5}
        required
      />
      <SubmitButton />
      {message && (
        <p className={isSuccess ? 'text-green-500' : 'text-red-500'}>
          {message}
        </p>
      )}
    </form>
  );
}
