
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import type { Session } from "next-auth";

export function SessionProviderClient({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
