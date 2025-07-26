"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import googleIcon from "../../../public/google-logo.svg"
import { useTranslations } from 'next-intl';

import Image from "next/image";
export default function SignIn() {

  const t = useTranslations("Login");
  return (
    <>
      <Button variant="outline" className="flex  items-center gap-3" onClick={() => signIn("google")}>
        <Image src={googleIcon} alt="Google" width={20} height={20} />
        {t('signInWithGoogle')}
      </Button>
    </>
  );
}

