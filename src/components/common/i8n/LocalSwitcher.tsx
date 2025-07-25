import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const pathname = usePathname();

  return (
    <Link href={pathname} locale={otherLocale}>
      {t('switchLocale', { locale: otherLocale })}
    </Link>
  );
}
