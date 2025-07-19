'use client';

import { useTranslations } from 'next-intl';

export default function Secret() {
  const t = useTranslations('Secret');

  return (
    <p>{t('description')}</p>
  );
}
