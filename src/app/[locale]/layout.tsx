import { notFound } from 'next/navigation';
import { QueryProviders } from '@/providers/reactQuery';
import { Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/common/Header';
import "../globals.css"
import { ReactNode } from 'react';
import { routing } from '@/i18n/routing';

import { getUser } from '@/data/user/getUser';
type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  // const user = await getUser().then(res => res.users);



  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      {/* <head> */}
      {/*   <title>next-intl & next-auth</title> */}
      {/* </head> */}
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProviders>
            <Header />
            {children}
          </QueryProviders>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
