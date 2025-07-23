import { notFound } from 'next/navigation';
import { SessionProviderClient } from '@/providers/sessionProvider';
import { QueryProviders } from '@/providers/reactQuery';

import { Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/common/Header';
import "../globals.css"
import { ReactNode } from 'react';
import { Toaster } from "@/components/ui/sonner"
import { routing } from '@/i18n/routing';

import { auth } from '@/lib/auth';
type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  // const user = await getUser().then(res => res.users);
  const session = await auth()


  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProviders>
            <SessionProviderClient session={session}>
              <Header />
              {children}
              {/**/}
            </SessionProviderClient >
            <Toaster />
          </QueryProviders>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}



