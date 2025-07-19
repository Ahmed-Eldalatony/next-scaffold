import { NextRequest } from 'next/server';
// import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// TODO: Use middleware to protect routes instead of redirecting from every page
// const publicPages = [
//   '/',
//   '/login',
//   '/posts',
//   '/create-post',
//   '/credentials-login',
// ];
//
const intlMiddleware = createMiddleware(routing);

// const authMiddleware = withAuth(
//   (req) => intlMiddleware(req),
//   {
//     callbacks: {
//       // Add the authorized callback to check if a token exists
//       authorized: ({ token }) => !!token,
//     },
//     pages: {
//       signIn: '/login'
//     }
//   }
// );

export default function middleware(req: NextRequest) {
  // const publicPathnameRegex = RegExp(
  //   `^(/(${routing.locales.join('|')}))?(${publicPages
  //     .flatMap((p) => (p === '/' ? ['', '/'] : p))
  //     .join('|')})/?$`,
  //   'i'
  // );
  // const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  // if (isPublicPage) {
  return intlMiddleware(req);
  // } else {
  // Cast authMiddleware to any to resolve type issues with the request object
  // return (authMiddleware as any)(req);
  // }
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
}


