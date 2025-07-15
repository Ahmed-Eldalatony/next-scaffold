Conventions you have to follow are in this file. 
You have to add what you have done in the form of tasks in the PROGRESS.md file.
Reflect the project's state, how  it's working and it's structure with minimal documnetation in the PROJECT-STRUCTURE.md file.
Next.js Project Conventions
The Project uses Opennext/cloudflare 
This document outlines the conventions for developing Next.js applications, focusing on project structure, styling, data management, API communication, and internationalization, leveraging the App Router.
1. Project Structure (Feature-Based Folder)

The project will adopt a feature-based folder structure, organizing code by domain or feature rather than by type (e.g., all components in one folder, all pages in another). This approach enhances modularity, maintainability, and scalability.

.
├── .env                    # Environment variables (local, not committed)
├── .env.example            # Example environment variables
├── .gitignore
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml          # pnpm lock file
├── tsconfig.json
├── biome.json              # Biome configuration
├── prisma/                 # Prisma ORM configuration and schema
│   ├── schema.prisma
│   └── migrations/
│       └── ...             # Database migration files
├── public/                 # Static assets
│   ├── locales/            # Internationalization translation files
│   │   ├── en/
│   │   │   └── common.json
│   │   └── es/
│   │       └── common.json
│   └── images/
│       └── logo.svg
├── src/
│   ├── app/                # Next.js App Router (root layout, pages, API routes)
│   │   ├── (auth)/         # Route group for authentication-related pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/    # Route group for authenticated dashboard pages
│   │   │   ├── layout.tsx  # Layout specific to dashboard group
│   │   │   ├── page.tsx    # Dashboard index page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── api/            # API routes (e.g., for external services or specific client-side needs)
│   │   │   ├── auth/
│   │   │   │   └── [...all]/
│   │   │   │       └── route.ts # Better Auth API route
│   │   │   ├── users/
│   │   │   │   ├── route.ts  # GET /api/users, POST /api/users
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET /api/users/[id], PUT /api/users/[id], DELETE /api/users/[id]
│   │   ├── layout.tsx      # Root layout for the entire application
│   │   ├── page.tsx        # Root page (e.g., landing page)
│   │   ├── global-error.tsx # Global error boundary for the root layout
│   │   └── not-found.tsx   # Custom 404 page
│   ├── components/         # Reusable UI components (non-feature specific)
│   │   ├── ui/             # Shadcn/UI components (generated/customized)
│   │   │   ├── button.tsx
│   │   │   └── dialog.tsx
│   │   ├── common/         # General purpose components
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── auth/           # Auth-related UI components (e.g., forms)
│   │       └── LoginForm.tsx
│   ├── lib/                # Utility functions, helpers, constants, Prisma client
│   │   ├── utils.ts        # General utilities (e.g., cn for Tailwind, date formatters)
│   │   ├── auth.ts         # Better Auth server-side configuration
│   │   ├── auth-client.ts  # Better Auth client-side instance
│   │   ├── db.ts           # Prisma client instance and database connection setup
│   │   ├── i18n.ts         # i18next configuration for server-side
│   │   └── constants.ts
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   │   └── useFetch.ts
│   ├── types/              # Global or shared TypeScript type definitions and interfaces
│   │   ├── next-auth.d.ts  # If using NextAuth.js (example)
│   │   └── common.d.ts
│   └── styles/             # Global styles (e.g., base Tailwind imports)
│       └── globals.css
├── middleware.ts           # Next.js Middleware for authentication checks

Key Principles for Structure:

    App Router First: All new pages, layouts, and API routes should be created within the src/app directory using the App Router conventions.

    Route Groups: Use (folder-name) to organize routes without affecting the URL path (e.g., (auth) for authentication pages, (dashboard) for authenticated routes).

    Server Components by Default: Assume components are Server Components unless explicitly marked with 'use client'. Place server-only logic and data fetching directly in Server Components or Server Actions.

    Client Components for Interactivity: Use 'use client' for components requiring interactivity, state, or browser APIs. These should be as lean as possible, receiving data and callbacks from Server Components.

    Separation of Concerns (API Routes/Server Actions):

        API Routes (app/api): Primarily for creating a traditional API layer that can be consumed by client-side code (e.g., from external applications, or if you need specific HTTP methods not covered by Server Actions). This includes the Better Auth handler.

        Server Actions: Preferred for mutating data and handling form submissions directly within Server Components, providing a more integrated and type-safe approach.

    Co-location of Tests: Unit/integration tests (.test.ts or .spec.ts) should be co-located with the files they test (e.g., components/common/Navbar.test.tsx). E2E tests should be in a separate e2e/ directory at the project root.

    Barrel Files (index.ts): Use index.ts files within module directories (e.g., src/components/ui/index.ts) to re-export entities, making imports cleaner.

2. Naming Conventions

    Folders: kebab-case (e.g., user-profiles, auth). Route groups use (kebab-case).

    Files:

        Next.js special files: page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx, route.ts, middleware.ts.

        Components: PascalCase.tsx (e.g., Navbar.tsx, LoginForm.tsx).

        Hooks: useCamelCase.ts (e.g., useAuth.ts).

        Utilities/Libs: camelCase.ts or kebab-case.ts (e.g., utils.ts, db.ts). Be consistent.

        Test files: name.test.ts or name.spec.ts (e.g., Navbar.test.tsx).

    Classes & Interfaces & Types: PascalCase (e.g., User, IUserService).

    Variables & Functions: camelCase (e.g., getUser, userService).

    Constants: UPPER_SNAKE_CASE (e.g., MAX_USERS, API_TIMEOUT).

3. TypeScript Best Practices

    Strict Mode: Enable all strict options in tsconfig.json ("strict": true).

    Explicit Types:

        Always define return types for functions.

        Define types for function parameters.

        Use interfaces or types for object shapes.

    interface vs type:

        Prefer interface for defining object shapes and for public APIs that can be extended (classes can implement interfaces).

        Use type for utility types, union types, intersection types, or aliasing primitive types.

    Avoid any: Use unknown when the type is truly unknown and perform type checking before use. Use specific types whenever possible.

    Readonly: Use readonly for properties that should not be reassigned after initialization and Readonly<T> for immutable types.

    Enums: Use string enums or as const objects for better readability and debuggability over numeric enums.

    // String Enum
    export enum UserRole {
      ADMIN = 'ADMIN',
      USER = 'USER',
    }

    // As const object
    export const HttpStatus = {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
    } as const;
    export type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];

    Modules: Use ES Modules (import/export).

    Path Aliases: Configure path aliases in tsconfig.json for cleaner imports (e.g., @/* pointing to src/*).

    // tsconfig.json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./src/*"]
        }
      }
    }

4. Next.js Best Practices

    Server Components First: Leverage Server Components for data fetching, direct database access (via Prisma), and rendering static or server-side generated content. This reduces client-side JavaScript bundle size and improves performance.

    Client Components for Interactivity: Use 'use client' at the top of files for components that need React Hooks (e.g., useState, useEffect), event listeners, or browser-specific APIs. Pass data from Server Components to Client Components as props.

    Data Fetching:

        Server Components/Server Actions: Use direct Prisma calls or native fetch within Server Components or Server Actions. Next.js automatically caches fetch requests.

        Client Components: For client-side data fetching (e.g., dynamic updates, user-triggered fetches), use React Query with useQuery and useMutation to call Next.js API routes or external APIs.

    Error Handling:

        error.tsx: Use error.tsx files within route segments to define UI boundaries for unexpected errors in a segment and its children.

        not-found.tsx: Use not-found.tsx to handle notFound() calls or unknown routes.

        global-error.tsx: Catches errors in root layout.tsx and template.tsx.

    Layouts and Templates:

        layout.tsx: Shared UI that wraps child segments. Remains interactive across navigation.

        template.tsx: Similar to layouts but creates a new instance for each route segment, useful for specific effects like entry/exit animations.

    Middleware (middleware.ts): Use middleware.ts at the root of your project (or within src/) for authentication, redirecting, or modifying response headers before a request is completed.

    Environment Variables: Use process.env.NEXT_PUBLIC_VAR_NAME for client-side accessible variables and process.env.VAR_NAME for server-only variables. Load them via .env files.

5. Styling (Tailwind CSS & Shadcn/UI)

    Tailwind CSS:

        Use Tailwind for all styling. Configure tailwind.config.ts for custom themes, colors, and plugins.

        Utilize utility classes directly in JSX.

        Use @apply sparingly, primarily for abstracting complex, repeated utility patterns into custom CSS classes.

    Shadcn/UI:

        Shadcn/UI components are built on Tailwind CSS and Radix UI.

        Install components using the npx shadcn-ui@latest add <component-name> command. This copies the component code directly into src/components/ui, allowing full customization.

        Customize components by modifying their code in src/components/ui or extending their styles via Tailwind.

    cn Utility: Use the cn utility (from lib/utils.ts) for conditionally combining Tailwind classes.

    // src/lib/utils.ts (example)
    import { type ClassValue, clsx } from "clsx"
    import { twMerge } from "tailwind-merge"

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }

    // Usage in a component
    // <div className={cn('text-red-500', isActive && 'font-bold')}>...</div>

6. Data Management (SQLite & Prisma ORM)

    Prisma ORM: Use Prisma as the ORM for interacting with the SQLite database.

    Schema Definition: Define your database schema in prisma/schema.prisma.

    // prisma/schema.prisma
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "sqlite"
      url      = env("DATABASE_URL")
    }

    model User {
      id        String    @id @default(uuid())
      email     String    @unique
      name      String?
      password  String
      createdAt DateTime  @default(now())
      updatedAt DateTime  @updatedAt
    }

    Prisma Client: Instantiate the Prisma Client in src/lib/db.ts and export it for reuse.

    // src/lib/db.ts
    import { PrismaClient } from '@prisma/client';

    let prisma: PrismaClient;

    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient();
    } else {
      // Ensure the PrismaClient is not re-instantiated in development
      // to prevent too many connections
      if (!(global as any).prisma) {
        (global as any).prisma = new PrismaClient();
      }
      prisma = (global as any).prisma;
    }

    export default prisma;

    Usage: Use the Prisma Client directly in Server Components, Server Actions, and API Routes.

    // Example in a Server Component or Server Action
    import prisma from '@/lib/db';

    async function getUsers() {
      const users = await prisma.user.findMany();
      return users;
    }

    Migrations: Manage database schema changes using Prisma Migrations (npx prisma migrate dev).


7. API Communication (Fetch API as a Hook)

For client-side data fetching and mutations, we will leverage the native Fetch API wrapped in a custom React Hook, useFetch. This provides a consistent and reusable pattern for interacting with your Next.js API routes or external services.

src/hooks/useFetch.ts

This custom hook will manage the loading, error, and data states of your fetch requests. It can also handle various HTTP methods and request options.
TypeScript

// src/hooks/useFetch.ts
'use client'; // This hook is intended for Client Components

import { useState, useEffect, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  // Add any custom options if needed, e.g., a flag for immediate execution
  skip?: boolean; // If true, the fetch will not run on mount
}

interface FetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (newOptions?: FetchOptions) => Promise<void>; // Function to re-run the fetch
}

/**
 * A custom React hook for making API requests using the Fetch API.
 * Manages loading, error, and data states.
 *
 * @template T The expected type of the data returned from the API.
 * @param {string} url The URL to fetch from.
 * @param {FetchOptions} [options] Optional Fetch API options (method, headers, body, etc.).
 * @returns {FetchResult<T>} An object containing data, isLoading, error, and a refetch function.
 */
export function useFetch<T = any>(
  url: string,
  options?: FetchOptions
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (currentOptions?: FetchOptions) => {
      if (currentOptions?.skip) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...options, // Base options
          ...currentOptions, // Overriding options from refetch
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
            ...currentOptions?.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency on fetchData ensures it only runs when its dependencies change

  const refetch = useCallback(async (newOptions?: FetchOptions) => {
    await fetchData(newOptions);
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}

Usage Examples in Client Components

Fetching Data (GET Requests)

TypeScript

// src/components/common/UserList.tsx
'use client';

import { useFetch } from '@/hooks/useFetch';
import React from 'react';

interface User {
  id: string;
  name: string;
}

export default function UserList() {
  const { data: users, isLoading, error, refetch } = useFetch<User[]>('/api/users');

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <button onClick={() => refetch()} className="bg-gray-200 px-3 py-1 rounded mb-4">
        Refetch Users
      </button>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

Mutating Data (POST, PUT, DELETE Requests)

For mutations, you can also use useFetch, but you'll typically trigger the fetchData function manually. A separate useMutation type hook can be created if more complex mutation-specific state management (e.g., optimistic updates) is required, but for basic operations, useFetch can be adapted.

Let's create a more specific useMutation hook that leverages useFetch internally, for better clarity and API.

src/hooks/useMutation.ts

TypeScript

// src/hooks/useMutation.ts
'use client';

import { useState, useCallback } from 'react';

interface MutationOptions<TData, TVariables> extends RequestInit {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables, options?: RequestInit) => Promise<TData | undefined>;
  isLoading: boolean;
  error: Error | null;
  data: TData | null;
}

/**
 * A custom React hook for performing API mutations (POST, PUT, DELETE) using the Fetch API.
 * Manages loading, error, and data states for a single mutation.
 *
 * @template TData The expected type of the data returned from the mutation.
 * @template TVariables The type of the variables/payload sent with the mutation.
 * @param {string} url The URL to send the mutation to.
 * @param {string} method The HTTP method (e.g., 'POST', 'PUT', 'DELETE').
 * @param {MutationOptions<TData, TVariables>} [options] Optional Fetch API options and callbacks.
 * @returns {MutationResult<TData, TVariables>} An object containing mutate function, isLoading, error, and data.
 */
export function useMutation<TData = any, TVariables = any>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  options?: MutationOptions<TData, TVariables>
): MutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables, overrideOptions?: RequestInit) => {
      setIsLoading(true);
      setError(null);
      setData(null); // Clear previous data on new mutation attempt

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
            ...overrideOptions?.headers,
          },
          body: JSON.stringify(variables),
          ...options,
          ...overrideOptions,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result: TData = await response.json();
        setData(result);
        options?.onSuccess?.(result, variables);
        return result;
      } catch (err: any) {
        setError(err);
        options?.onError?.(err, variables);
        throw err; // Re-throw to allow caller to handle
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, options]
  );

  return { mutate, isLoading, error, data };
}

Now, let's update the AddUserForm to use useMutation.
TypeScript

// src/components/common/AddUserForm.tsx
'use client';

import React, { useState } from 'react';
import { useMutation } from '@/hooks/useMutation'; // Import the new useMutation hook
import { useFetch } from '@/hooks/useFetch'; // Also use useFetch if needed for refreshing data

interface User {
  id: string;
  name: string;
}

export default function AddUserForm() {
  const [userName, setUserName] = useState('');
  const { refetch: refetchUsers } = useFetch<User[]>('/api/users', { skip: true }); // Use refetch from useFetch to refresh user list

  const { mutate, isLoading, error } = useMutation<User, { name: string }>(
    '/api/users',
    'POST',
    {
      onSuccess: () => {
        refetchUsers(); // Invalidate/refetch users list after successful creation
        setUserName('');
      },
      onError: (err) => {
        console.error('Failed to create user:', err);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    try {
      await mutate({ name: userName });
    } catch (err) {
      // Error handled by onError callback in useMutation, but can also be caught here
      console.error("Submission error caught in component:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="New user name"
        className="border rounded px-2 py-1"
      />
      <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 py-1 rounded">
        {isLoading ? 'Adding...' : 'Add User'}
      </button>
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </form>
  );
}

Server-Side Data Fetching with Fetch API:

For initial data loading on the server, you will continue to use native fetch directly in Server Components, as Next.js automatically caches fetch requests for you. There's no "hydration" step needed like with client-side state management libraries, as Server Components render on the server.
TypeScript

// src/app/users/page.tsx (Server Component)
import UserList from '@/components/common/UserList'; // Your client component
import { Fragment } from 'react';

async function getUsersServer() {
  // Directly use native fetch in Server Components. Next.js handles caching.
  // Use a full URL for external APIs or when calling your own API routes from the server.
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
    next: { tags: ['users'] }, // Optional: Tag data for revalidation
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users on server');
  }
  return res.json();
}

export default async function UsersPage() {
  const initialUsers = await getUsersServer();

  return (
    <Fragment>
      {/* Pass initial data as props to the Client Component */}
      <UserList initialUsers={initialUsers} />
    </Fragment>
  );
}

// And then update your UserList client component to accept initial data:
// src/components/common/UserList.tsx
'use client';

import { useFetch } from '@/hooks/useFetch';
import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
}

interface UserListProps {
  initialUsers: User[];
}

export default function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Use useFetch for subsequent client-side fetches (e.g., manual refetch)
  const { data: fetchedUsers, isLoading, error, refetch } = useFetch<User[]>('/api/users', { skip: true });

  useEffect(() => {
    // If the data from refetching is available, update the state
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);


  if (isLoading) return <p>Loading users...</p>; // This state would only be active after a client-side refetch
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <button onClick={() => refetch()} className="bg-gray-200 px-3 py-1 rounded mb-4">
        Refetch Users
      </button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

8. Authentication (Better Auth)

Better Auth is integrated for robust authentication.

    Better Auth Configuration (src/lib/auth.ts):
    This file configures the Better Auth instance, including plugins for Next.js integration.

    // src/lib/auth.ts
    import { betterAuth } from "better-auth";
    import { nextCookies } from "better-auth/next-js";
    // You would typically configure a user adapter here to connect to your database (e.g., Prisma)
    // import { PrismaAdapter } from "@better-auth/prisma-adapter";
    // import prisma from "@/lib/db";

    export const auth = betterAuth({
        // ... your Better Auth configuration (e.g., providers, userAdapter)
        // userAdapter: PrismaAdapter(prisma), // Example with Prisma Adapter
        plugins: [nextCookies()] // Make sure this is the last plugin in the array
    });

    Better Auth Client (src/lib/auth-client.ts):
    This client instance is used in client-side components for authentication actions.

    // src/lib/auth-client.ts
    import { createAuthClient } from "better-auth/react";

    export const authClient = createAuthClient({
        // You can pass client configuration here, e.g., baseURL if different from current origin
    });

    API Route (src/app/api/auth/[...all]/route.ts):
    This route handles all authentication requests from Better Auth.

    // src/app/api/auth/[...all]/route.ts
    import { auth } from "@/lib/auth";
    import { toNextJsHandler } from "better-auth/next-js";

    export const { GET, POST } = toNextJsHandler(auth.handler);

    RSC and Server Actions for Session Management:
    You can directly access the session from Server Components or Server Actions.

    // Example: Getting Session on a Server Action
    // src/app/actions.ts (or co-located with a Server Component)
    "use server";
    import { auth } from "@/lib/auth";
    import { headers } from "next/headers";

    export const someAuthenticatedAction = async () => {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        // Use session data here
        console.log("Server Action Session:", session);
        return session;
    };

    // Example: Getting Session on a Server Component
    // src/app/dashboard/page.tsx (or any Server Component)
    import { auth } from "@/lib/auth";
    import { headers } from "next/headers";
    import { redirect } from "next/navigation";

    export default async function DashboardPage() {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            redirect("/login"); // Redirect to login if not authenticated
        }

        return (
            <div>
                <h1 className="text-3xl font-bold">Welcome {session.user.name}!</h1>
                <p>You are authenticated.</p>
            </div>
        );
    }

    Note: When calling functions that set cookies (like signInEmail or signUpEmail) in a Server Action, the nextCookies plugin in src/lib/auth.ts automatically handles setting cookies using Next.js's cookies helper.

    Middleware (middleware.ts):
    The middleware is used for optimistic redirection based on session cookie presence. For full session validation, perform checks within pages/routes.

    // middleware.ts
    import { NextRequest, NextResponse } from "next/server";
    import { getSessionCookie } from "better-auth/cookies"; // Or getCookieCache for full session object

    export async function middleware(request: NextRequest) {
        // Option 1: Check for session cookie existence (recommended for performance in middleware)
        const sessionCookie = getSessionCookie(request);

        // THIS IS NOT SECURE FOR AUTHORIZATION!
        // This is primarily for optimistic redirection.
        // Full authentication/authorization checks should happen in page/route components.
        if (!sessionCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Option 2: Get full session object from cookie cache (more robust, but might be slower)
        // const session = await getCookieCache(request);
        // if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
        //     return NextResponse.redirect(new URL("/login", request.url));
        // }

        return NextResponse.next();
    }

    export const config = {
        matcher: ["/dashboard/:path*", "/api/auth/:path*"], // Apply middleware to dashboard and auth API routes
    };

9. Internationalization (i18next, react-i18next, i18next-browser-language detector)

    Setup:

        Install i18next, react-i18next, i18next-browser-language detector.

        Create translation files in public/locales/{lang}/{namespace}.json.

        // public/locales/en/common.json
        {
          "welcome": "Welcome to our app!",
          "greeting": "Hello, {{name}}!"
        }

    i18next Configuration (src/lib/i18n.ts):

        Configure i18next for both server-side (for Server Components/API Routes) and client-side (for Client Components).

        Use i18next-browser-language detector for client-side language detection.

    // src/lib/i18n.ts
    import i18n from 'i18next';
    import { initReactI18next } from 'react-i18next';
    import LanguageDetector from 'i18next-browser-languagedetector';

    // For client-side i18n
    const resources = {
      en: {
        common: require('../../public/locales/en/common.json'),
      },
      es: {
        common: require('../../public/locales/es/common.json'),
      },
    };

    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
          escapeValue: false, // React already escapes by default
        },
        resources,
        ns: ['common'], // Default namespace
        defaultNS: 'common',
        detection: {
          order: ['cookie', 'localStorage', 'navigator'],
          caches: ['cookie'],
        },
      });

    export default i18n;

    // For server-side i18n (simplified example, consider a more robust solution for production)
    import { createInstance } from 'i18next';
    import { initReactI18next as initReactI18nextServer } from 'react-i18next/initReactI18next';
    import resourcesToBackend from 'i18next-resources-to-backend';

    export async function initTranslations(locale: string, ns: string[]) {
      const i18nInstance = createInstance();

      await i18nInstance
        .use(initReactI18nextServer)
        .use(resourcesToBackend((language: string, namespace: string) => import(`../../public/locales/${language}/${namespace}.json`)))
        .init({
          lng: locale,
          ns,
          fallbackLng: 'en',
          preload: typeof window === 'undefined' ? ['en', 'es'] : [], // Preload on server
        });

      return {
        i18n: i18nInstance,
        resources: i18nInstance.services.resourceStore.data,
        t: i18nInstance.t,
      };
    }

    Usage in Client Components:

    // Example Client Component
    'use client';

    import { useTranslation } from 'react-i18next';
    import '@/lib/i18n'; // Import i18n config

    export default function WelcomeMessage() {
      const { t } = useTranslation('common'); // Specify namespace

      return (
        <h1 className="text-3xl font-bold">
          {t('welcome')}
        </h1>
      );
    }

    Usage in Server Components:

    // Example Server Component
    import { initTranslations } from '@/lib/i18n';

    interface Props {
      locale: string;
    }

    export default async function ServerWelcome({ locale }: Props) {
      const { t } = await initTranslations(locale, ['common']);

      return (
        <h1 className="text-3xl font-bold">
          {t('greeting', { name: 'User' })}
        </h1>
      );
    }

10. Testing (Vitest & Playwright)

    Configuration: vitest.config.ts at the root for unit/integration tests, and Playwright configuration for E2E tests.

    File Naming: *.test.ts or *.spec.ts for unit/integration tests. *.e2e.spec.ts for E2E tests.

    Unit Tests (Vitest):

        Test individual functions, components (using @testing-library/react), or modules in isolation.

        Mock dependencies using vi.mock().

        Co-locate unit tests with the code they test (e.g., components/common/Navbar.tsx and components/common/Navbar.test.tsx).

    Integration Tests (Vitest):

        Test interactions between multiple components or between a component and an API route (mocking the database).

    End-to-End (E2E) Tests (Playwright):

        Located in a top-level e2e/ directory.

        Test the application through its public UI, simulating user interactions.

        Run against a running instance of the Next.js application, often with a dedicated test database.

    Assertions: Use Vitest's built-in expect API and Playwright's expect for E2E.

    Coverage: Aim for high test coverage. Configure coverage reporting in vitest.config.ts.

// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // For React component testing
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom', // For React components
    setupFiles: './vitest.setup.ts', // Global setup file for mocks/polyfills
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: 'v8',
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'src/app/**', // Exclude Next.js specific files from unit test coverage if tested via E2E
        'src/lib/db.ts', // Database client setup
        'src/lib/i18n.ts', // i18n setup
        '**/*.d.ts',
        '**/*.mock.ts',
      ],
    },
  },
});

11. Linting and Formatting (Biome)


12. API Design (Next.js API Routes & Server Actions)

    Next.js API Routes (app/api/route.ts):

        Follow standard HTTP methods (GET, POST, PUT, DELETE, PATCH).

        Handle request validation (e.g., using Zod or a similar library).

        Return consistent JSON responses, including status codes and clear messages.

        Separate business logic into lib/ or dedicated service functions called by the route.ts handlers.

    Server Actions:

        Define Server Actions siperetaly  in files marked with 'use server' in a "actions" folder.

        Prefer Server Actions for form submissions and data mutations.

        Handle validation and error reporting directly within the action or by calling utility functions.

    Consistent Responses: Use a consistent structure for API responses (e.g., success: boolean, message: string, data: T | null).

    // Example API Route response
    import { NextResponse } from 'next/server';
    import prisma from '@/lib/db'; // Import prisma client

    export async function GET() {
      try {
        const users = await prisma.user.findMany(); // Example Prisma call
        return NextResponse.json({ success: true, message: 'Users retrieved', data: users }, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Failed to retrieve users', data: null }, { status: 500 });
      }
    }

13. Logging

    Log important events, errors, and incoming requests (e.g., via a custom logger utility).

    Avoid logging sensitive information.

14. Comments and Documentation

    README.md: Maintain a comprehensive README.md with setup instructions, project overview, and API documentation links (if any).

    Code Comments: Add comments for complex logic, non-obvious code, and function/component purpose.

15. Package Manager

    pnpm: Use pnpm for package installation and management.

