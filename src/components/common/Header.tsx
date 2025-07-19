"use client"
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./i8n/LocalSwitcher";
import Link from "next/link";
import LinkedIn from "next-auth/providers/linkedin";

// import { getTranslations, setRequestLocale } from 'next-intl/server';
function Header() {

  const t = useTranslations("LocaleLayout");


  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
        <nav className="flex  gap-4">
          <Link href="/">
            {t('home')}
          </Link>
          <Link href="/posts">
            {t('posts')}
          </Link>
          <Link href="/create-post">
            {t('createPost')}
          </Link>
        </nav>
        <LocaleSwitcher />
      </header>
    </div>
  )
}

export default Header
