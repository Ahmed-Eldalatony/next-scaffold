This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: cloudflare-env.d.ts, pnpm-yaml.json, .git/, .open-next/, migrations/, Notes/, wrangler.jsonc, public/, src/components/ui/, src/app/globals.css, package.json, repomix.config.json
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
messages/
  ar.json
  en.d.json.ts
  en.json
prisma/
  schema.prisma
src/
  app/
    [locale]/
      actions/
        post.ts
      create-post/
        page.tsx
      credentials-login/
        page.tsx
      login/
        page.tsx
      posts/
        page.tsx
      Index.tsx
      layout.tsx
      page.tsx
    api/
      auth/
        [...nextauth]/
          route.ts
    layout.tsx
  components/
    common/
      i8n/
        LocalSwitcher.tsx
      CreatePostForm.tsx
      Header.tsx
      SignIn.tsx
    smart-form.tsx
  hooks/
    useFetch.ts
  i18n/
    navigation.ts
    request.ts
    routing.ts
  lib/
    auth.ts
    prisma.ts
    react-query.ts
    utils.ts
  providers/
    reactQuery.tsx
  types/
    next-auth.d.ts
  middleware.ts
.gitignore
.repomixignore
components.json
eslint.config.mjs
global.ts
next.config.ts
open-next.config.ts
postcss.config.mjs
README.md
tsconfig.json
```

# Files

## File: src/app/[locale]/credentials-login/page.tsx
```typescript
"use client"
import { SmartForm, SmartFormField } from "@/components/smart-form"
import { z } from "zod"

const demoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "moderator"]),
  adminCode: z.string().optional(),
  isActive: z.boolean(),
  bio: z.string().optional(),
})

type DemoFormData = z.infer<typeof demoSchema>


export default function MyForm() {

  const mockMutationFn = async (data: DemoFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Form submitted:', data)
    return { success: true, data }
  }

  return (
    <div className="max-w-md">

      <SmartForm
        schema={demoSchema}
        mutationFn={mockMutationFn}
        defaultValues={{
          isActive: false,
        }}
        onSuccess={(data) => {
          console.log('Success:', data)
        }}
        onError={(error) => {
          console.error('Error:', error)
        }}
      >
        {(form) => (
          <>
            <SmartFormField
              form={form}
              name="name"
              type="text"
              label="Name"
              placeholder="Enter your name"
              description="Your full name"
            />
            <SmartFormField
              form={form}
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
            />
            <SmartFormField
              form={form}
              name="role"
              type="select"
              label="Role"
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
                { value: "moderator", label: "Moderator" }
              ]}
            />
            <SmartFormField
              form={form}
              name="isActive"
              type="checkbox"
              label="Active user"
              description="Check if the user should be active"
            />
            <SmartFormField
              form={form}
              name="bio"
              type="textarea"
              label="Bio"
              placeholder="Tell us about yourself..."
              description="Optional biography"
            />
          </>
        )}
      </SmartForm>
    </div>
  )
}
```

## File: src/components/smart-form.tsx
```typescript
"use client"

import React from 'react'
import { useForm, UseFormReturn, FieldPath, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormFieldOption {
  value: string
  label: string
}

export interface SmartFormProps<T extends FieldValues = FieldValues> {
  schema: z.ZodSchema<T>
  mutationFn: (data: T) => Promise<any>
  queryKey?: string[]
  mode?: 'create' | 'edit'
  defaultValues?: Partial<T>
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  submitText?: string
  className?: string
  children: (form: UseFormReturn<T>) => React.ReactNode
}

export interface SmartFormFieldProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>
  name: FieldPath<T>
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'color'
  label?: string
  placeholder?: string
  description?: string
  options?: FormFieldOption[]
  disabled?: boolean
  className?: string
}

export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SmartForm<T extends FieldValues>({
  schema,
  mutationFn,
  queryKey = [],
  mode = 'create',
  defaultValues,
  onSuccess,
  onError,
  submitText,
  className,
  children
}: SmartFormProps<T>) {
  const queryClient = useQueryClient()

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: (defaultValues || {}) as any
  })

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (queryKey.length > 0) {
        queryClient.invalidateQueries({ queryKey })
      }
      form.reset()
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  })

  const onSubmit = (data: T) => {
    mutation.mutate(data)
  }

  return (
    <Card className={cn("w-full", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6">
            <div className="space-y-6">
              {children(form)}
            </div>

            <div className="flex items-center justify-end pt-6 mt-6 border-t">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="min-w-32"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    {mutation.isSuccess ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : mutation.isError ? (
                      <AlertCircle className="mr-2 h-4 w-4" />
                    ) : null}
                    {submitText || (mode === 'create' ? 'Create' : 'Update')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  )
}

export function SmartFormField<T extends FieldValues>({
  form,
  name,
  type,
  label,
  placeholder,
  description,
  options = [],
  disabled,
  className
}: SmartFormFieldProps<T>) {
  const renderField = (field: any) => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value || ''}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value || ''}
            onChange={(e) => {
              const value = e.target.value
              field.onChange(value === '' ? undefined : Number(value))
            }}
          />
        )

      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            {...field}
            value={field.value || ''}
          />
        )

      case 'select':
        return (
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            <label className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
          </div>
        )

      case 'radio':
        return (
          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              disabled={disabled}
              className="w-12 h-10 p-1 border rounded"
              value={field.value || '#000000'}
              onChange={(e) => field.onChange(e.target.value)}
            />
            <Input
              type="text"
              placeholder="#000000"
              disabled={disabled}
              className="flex-1"
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        )

      default:
        return null
    }
  }

  if (type === 'checkbox') {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className={cn("space-y-2", className)}>
            <FormControl>
              {renderField(field)}
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {renderField(field)}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export function ConditionalField<T extends FieldValues>({
  form,
  when,
  equals,
  children
}: {
  form: UseFormReturn<T>
  when: FieldPath<T>
  equals: any
  children: React.ReactNode
}) {
  const watchedValue = form.watch(when)

  if (watchedValue === equals) {
    return <>{children}</>
  }

  return null
}
```

## File: messages/en.d.json.ts
```typescript
// This file is auto-generated by next-intl, do not edit directly.
// See: https://next-intl.dev/docs/workflows/typescript#messages-arguments

declare const messages: {
  "Index": {
    "title": "Home",
    "loggedIn": "Logged in as {username}",
    "loggedOut": "You are logged out.",
    "login": "Login",
    "logout": "Logout",
    "secret": "Secret page for logged in users"
  },
  "LocaleLayout": {
    "title": "next-intl with Auth.js example",
    "home": "Home",
    "posts": "Posts",
    "createPost": "Create Post"
  },
  "Login": {
    "title": "Login",
    "username": "Username",
    "password": "Password",
    "submit": "Login",
    "error": "{error, select, CredentialsSignin {Invalid username or password} other {Unknown error}}"
  },
  "LocaleSwitcher": {
    "switchLocale": "Switch to {locale, select, ar {Arabic} en {English} other {Unknown}}"
  },
  "Secret": {
    "title": "Secret page",
    "description": "This page is only visible for logged in users."
  },

  "PostsPage":{
    "title":"posts",
    "noPosts":"no posts"
  },
  "CreatePostPage": {
    "title": "Create New Post",
    "titlePlaceholder": "Post Title",
    "contentPlaceholder": "Post Content",
    "createButton": "Create Post",
    "creating": "Creating...",
    "successMessage": "Post created successfully!",
    "failureMessage": "Failed to create post."
  }



};
export default messages;
```

## File: src/app/[locale]/actions/post.ts
```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  try {
    await prisma.post.create({
      data: {
        title,
        content,
      },
    });
    revalidatePath('/posts'); // Revalidate posts page after creation
    return { success: true, message: 'Post created successfully!' };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, message: 'Failed to create post.' };
  }
}
```

## File: src/app/[locale]/create-post/page.tsx
```typescript
import CreatePostForm from '@/components/common/CreatePostForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'CreatePostPage' });
  return {
    title: t('title'),
  };
}

export default function CreatePostPage() {
  return (
    <div className="container mx-auto py-8">
      <CreatePostForm />
    </div>
  );
}
```

## File: src/app/[locale]/login/page.tsx
```typescript
import SignIn from "@/components/common/SignIn";
function page() {
  return (
    <div>
      <SignIn />
    </div>
  )
}

export default page
```

## File: src/app/[locale]/posts/page.tsx
```typescript
import { getTranslations } from "next-intl/server";

import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'PostsPage' });
  return {
    title: t('title'),
  };
}

export default async function PostsPage() {

  const t = await getTranslations('PostsPage');

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('title')}</h1>
      <div>
        {posts.map(post => {
          return (
            <div key={post.id}>
              <div >
                {post.title}
              </div>
              <p>{post.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
```

## File: src/app/[locale]/Index.tsx
```typescript
'use client';

import Link from 'next/link';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  session: Session | null;
};

export default function Index({ session }: Props) {
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
```

## File: src/app/layout.tsx
```typescript
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children;
}
```

## File: src/components/common/i8n/LocalSwitcher.tsx
```typescript
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
```

## File: src/components/common/CreatePostForm.tsx
```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { createPost } from '@/app/[locale]/actions/post';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('CreatePostPage');
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('creating') : t('createButton')}
    </Button>
  );
}

export default function CreatePostForm() {
  const t = useTranslations('CreatePostPage');
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const result = await createPost(formData);
    if (result.success) {
      setMessage(result.message);
      setIsSuccess(true);
      router.push('/posts'); // Redirect to posts page on success
    } else {
      setMessage(result.message);
      setIsSuccess(false);
    }
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      <Input
        type="text"
        name="title"
        placeholder={t('titlePlaceholder')}
        required
      />
      <Textarea
        name="content"
        placeholder={t('contentPlaceholder')}
        rows={5}
        required
      />
      <SubmitButton />
      {message && (
        <p className={isSuccess ? 'text-green-500' : 'text-red-500'}>
          {message}
        </p>
      )}
    </form>
  );
}
```

## File: src/components/common/Header.tsx
```typescript
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
```

## File: src/components/common/SignIn.tsx
```typescript
"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </>
  );
}
```

## File: src/hooks/useFetch.ts
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  skip?: boolean;
}

interface FetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (newOptions?: FetchOptions) => Promise<void>;
}


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
          ...options,
          ...currentOptions,
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
```

## File: src/i18n/navigation.ts
```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

## File: src/lib/react-query.ts
```typescript
// lib/react-query.ts
'use client'
import { QueryClient } from '@tanstack/react-query'
import { isServer } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000 }, // Prevents immediate refetch after hydration
    },
  })
}

let browserClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) {
    return createQueryClient() // New for each SSR request
  }
  if (!browserClient) {
    browserClient = createQueryClient() // Singleton in browser
  }
  return browserClient
}
```

## File: src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: src/providers/reactQuery.tsx
```typescript
'use client'

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query'

import * as React from 'react'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProviders(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryStreamedHydration> */}
      {props.children}
      {/* </ReactQueryStreamedHydration> */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}
```

## File: src/types/next-auth.d.ts
```typescript
import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
  }
}
```

## File: src/middleware.ts
```typescript
import { NextRequest } from 'next/server';
// import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// TODO: Use middleware to protect routes instead of redirecting from every page
// const publicPages = [
//   '/',
//   '/login',
//   '/posts',
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
```

## File: .gitignore
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# OpenNext
/.open-next

# wrangler files
.wrangler
.dev.vars*
.aider*
.env
```

## File: .repomixignore
```
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
#
```

## File: components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## File: eslint.config.mjs
```
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

## File: global.ts
```typescript
import { routing } from '@/i18n/routing';
import messages from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
```

## File: open-next.config.ts
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Uncomment to enable R2 cache,
  // It should be imported as:
  // `import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";`
  // See https://opennext.js.org/cloudflare/caching for more details
  // incrementalCache: r2IncrementalCache,
});
```

## File: postcss.config.mjs
```
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": [
        "./cloudflare-env.d.ts",
        "node"
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "src/app/i8n/i8next.js", "middleware.ts", "src/lib/i18n.ts"],
  "exclude": ["node_modules"]
}
```

## File: messages/ar.json
```json
{
  "Index": {
    "title": "الصفحة الرئيسية",
    "loggedIn": "تم تسجيل الدخول باسم {username}",
    "loggedOut": "لقد تم تسجيل خروجك.",
    "login": "تسجيل الدخول",
    "logout": "تسجيل الخروج",
    "secret": "صفحة سرية للمستخدمين المسجلين"
  },
  "LocaleLayout": {
    "title": "مثال next-intl مع Auth.js",
    "home": "الرئيسية",
    "posts": "المنشورات",
    "createPost": "إنشاء منشور"
  },
  "Login": {
    "title": "تسجيل الدخول",
    "username": "اسم المستخدم",
    "password": "كلمة المرور",
    "submit": "تسجيل الدخول",
    "error": "{error, select, CredentialsSignin {اسم مستخدم أو كلمة مرور غير صالحة} other {خطأ غير معروف}}"
  },
  "LocaleSwitcher": {
    "switchLocale": "التبديل إلى {locale, select, ar {العربية} en {الإنجليزية} other {غير معروف}}"
  },
  "Secret": {
    "title": "صفحة سرية",
    "description": "هذه الصفحة مرئية فقط للمستخدمين المسجلين."
  },
  "CreatePostPage": {
    "title": "إنشاء منشور جديد",
    "titlePlaceholder": "عنوان المنشور",
    "contentPlaceholder": "محتوى المنشور",
    "createButton": "إنشاء منشور",
    "creating": "جارٍ الإنشاء...",
    "successMessage": "تم إنشاء المنشور بنجاح!",
    "failureMessage": "فشل في إنشاء المنشور."
  }
}
```

## File: messages/en.json
```json
{
  "Index": {
    "title": "Home",
    "loggedIn": "Logged in as {username}",
    "loggedOut": "You are logged out.",
    "login": "Login",
    "logout": "Logout",
    "secret": "Secret page for logged in users"
  },
  "LocaleLayout": {
    "title": "next-intl with Auth.js example",
    "home": "Home",
    "posts": "Posts",
    "createPost": "Create Post"
  },
  "Login": {
    "title": "Login",
    "username": "Username",
    "password": "Password",
    "submit": "Login",
    "error": "{error, select, CredentialsSignin {Invalid username or password} other {Unknown error}}"
  },
  "LocaleSwitcher": {
    "switchLocale": "Switch to {locale, select, ar {Arabic} en {English} other {Unknown}}"
  },
  "Secret": {
    "title": "Secret page",
    "description": "This page is only visible for logged in users."
  },

  "PostsPage":{
    "title":"posts",
    "noPosts":"no posts"
  },
  "CreatePostPage": {
    "title": "Create New Post",
    "titlePlaceholder": "Post Title",
    "contentPlaceholder": "Post Content",
    "createButton": "Create Post",
    "creating": "Creating...",
    "successMessage": "Post created successfully!",
    "failureMessage": "Failed to create post."
  }



}
```

## File: prisma/schema.prisma
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
}

model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  account       Account[]
  Authenticator Authenticator[]
  sessions      Session[]
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

model Authenticator {
  credentialID         String  @unique
  userId               String
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?
  User                 User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, credentialID])
}
```

## File: src/app/[locale]/layout.tsx
```typescript
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
```

## File: src/app/[locale]/page.tsx
```typescript
import { getServerSession } from 'next-auth';
import auth from '@/lib/auth';
import Index from './Index';

export default async function IndexPage() {
  const session = await getServerSession(auth);
  return <Index session={session} />;
}
```

## File: src/app/api/auth/[...nextauth]/route.ts
```typescript
import NextAuth from "next-auth";
import { auth } from "@/lib/auth"; // your providers

const handler = NextAuth(auth);

export { handler as GET, handler as POST };
```

## File: src/i18n/request.ts
```typescript
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  console.log('requested', requested);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  console.log('locale', locale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
}
);
```

## File: src/i18n/routing.ts
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',

});
```

## File: src/lib/auth.ts
```typescript
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter"

export const auth: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  // session: {
  //   strategy: 'jwt',
  // },
  // jwt: {
  //   secret: process.env.NEXTAUTH_SECRET,
  // },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/`;
    },
  },
};

export default auth;
```

## File: src/lib/prisma.ts
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

## File: next.config.ts
```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json'
  }
});

const nextConfig: NextConfig = {
  // ...your Next.js config
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during builds
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);

// Added by Cloudflare for local dev:
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
```

## File: README.md
```markdown

```
