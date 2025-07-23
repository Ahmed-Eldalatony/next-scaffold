'use client';

import Link from 'next/link';
import { Session } from 'next-auth';
import { useLocale, useTranslations } from 'next-intl';
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  session: Session | null;
};

export default function Index() {
  const { data: session, status } = useSession()
  if (status === "loading") return null

  const t = useTranslations('Index');
  const locale = useLocale();

  function onLogoutClick() {
    signOut();
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
      <Card className="w-full max-w-md p-6">
        <CardContent className="space-y-4">
          {session?.user?.name ? (
            <>
              <p className="text-lg">
                {t('loggedIn', { username: session.user.name })}
              </p>
              <Button onClick={onLogoutClick} type="button" className="w-full">
                {t('logout')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg">{t('loggedOut')}</p>
              <Link href='/login'>
                <Button className="w-full">
                  {t('login')}
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
