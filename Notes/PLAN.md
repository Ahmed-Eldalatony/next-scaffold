# Tech Stack
Nextjs (open Next)
tailwind 
shadcnui
sqlite
prisma orm
React query
Open Telemetary
i18next react-i18next i18next-browser-language detector 
react scan
api route vs server actions




Here’s a small “data-layer” you can drop into your Next.js 15 project that gives you:

* **A shared low-level `fetcher()`** with

  * automatic JSON (de)serialization
  * built-in console-logging of request + response
  * optional in-memory caching with TTL
* **`fetchServer`** – an async, cache-aware function you can call from **Server Components**
* **`useClientFetch`** – a React hook you can use in **Client Components** (handles loading, error, cache-busting, re-fetch)
* **`useMutation`** – a React hook for **Server Actions** or client-side “mutations” (POST/PUT/DELETE), with loading + error

Drop this in e.g. `lib/fetcher.ts` (or `.js`), then import where you need it.

```ts
// lib/fetcher.ts
import { cache } from 'react';
import type { RequestInit } from 'next/dist/compiled/@edge-runtime/primitives/fetch';

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
interface FetchOptions extends RequestInit {
  /** seconds to cache in-memory (client+server) */
  cacheTTL?: number;
}

interface ClientFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  /** call to re-fetch (busts cache) */
  refetch: () => void;
}

interface MutationResult<T, B> {
  mutate: (body: B, opts?: Omit<FetchOptions, 'body' | 'method'>) => Promise<T>;
  loading: boolean;
  error: Error | null;
}

//
// ─── IN-MEMORY CACHE ─────────────────────────────────────────────────────────────
//
type CacheEntry = { expiry: number; data: any };
const cacheMap = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const e = cacheMap.get(key);
  if (!e) return null;
  if (Date.now() > e.expiry) {
    cacheMap.delete(key);
    return null;
  }
  return e.data;
}
function setCached(key: string, data: any, ttlSec: number) {
  cacheMap.set(key, { expiry: Date.now() + ttlSec * 1_000, data });
}

//
// ─── LOW-LEVEL FETCHER ────────────────────────────────────────────────────────────
//
async function fetcher<T = any>(
  url: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { cacheTTL, ...init } = opts;
  const key = url + JSON.stringify(init);

  // try cache
  if (cacheTTL && cacheTTL > 0) {
    const cached = getCached(key);
    if (cached !== null) {
      console.log(`[fetch][cache]  ${init.method || 'GET'} ${url}`);
      return cached;
    }
  }

  console.log(`[fetch][req]    ${init.method || 'GET'} ${url}`, init);
  const res = await fetch(url, {
    ...init,
    // Next.js-style cache control on the server:
    // @ts-ignore
    next: init.cacheTTL ? { revalidate: init.cacheTTL } : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    body:
      init.body && typeof init.body !== 'string'
        ? JSON.stringify(init.body)
        : init.body,
  });
  let payload: any = null;

  try {
    payload = await res.json();
  } catch {
    // no JSON
    payload = await res.text();
  }

  if (!res.ok) {
    const err = new Error(
      `[fetch][error] ${res.status} ${res.statusText}: ` +
        (payload && payload.message ? payload.message : String(payload))
    );
    console.error(err);
    throw err;
  }

  console.log(`[fetch][resp]   ${url}`, payload);

  if (cacheTTL && cacheTTL > 0) {
    setCached(key, payload, cacheTTL);
  }
  return payload;
}

//
// ─── SERVER-SIDE HELPER ──────────────────────────────────────────────────────────
//
/** Use inside Server Components or Server Actions */
export const fetchServer = cache(fetcher) as <T>(
  url: string,
  opts?: FetchOptions
) => Promise<T>;

//
// ─── CLIENT-SIDE HOOK ────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react';

export function useClientFetch<T = any>(
  url: string,
  opts: FetchOptions = {}
): ClientFetchResult<T> {
  const key = url + JSON.stringify(opts);
  const [data, setData] = useState<T | null>(() => {
    if (opts.cacheTTL) {
      return getCached(key);
    }
    return null;
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(!data);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetcher<T>(url, opts);
      setData(d);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    // bust in-memory cache then re-load
    if (opts.cacheTTL) {
      cacheMap.delete(key);
    }
    load();
  }, [key, load]);

  return { data, error, loading, refetch };
}

//
// ─── MUTATION HOOK ───────────────────────────────────────────────────────────────
export function useMutation<T = any, B = any>(): MutationResult<T, B> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      body: B,
      opts: Omit<FetchOptions, 'body' | 'method'> & { method?: string } = {}
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetcher<T>(opts.url!, {
          ...opts,
          method: opts.method || 'POST',
          body,
        });
        return data;
      } catch (e: any) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}
```

---

## 📝 API in a Nutshell

### Shared `fetcher<T>(url, opts)`

* **opts.cacheTTL?** — in-memory cache for *n* seconds (client & server)
* auto-JSON body/stringify
* logs `console.log` for request, response, and cache hits
* throws on non-2xx

### Server Components & Actions

```ts
import { fetchServer } from '@/lib/fetcher';

// in an async Server Component:
export default async function Page() {
  const posts = await fetchServer<Post[]>('/api/posts', { cacheTTL: 60 });
  return <PostsList items={posts} />;
}
```

### Client Components

```tsx
import { useClientFetch } from '@/lib/fetcher';

export default function Feed() {
  const { data, error, loading, refetch } =
    useClientFetch<Post[]>('/api/posts', { cacheTTL: 30 });

  if (loading)   return <p>Loading…</p>;
  if (error)     return <p>Error: {error.message}</p>;
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data!.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </>
  );
}
```

### Mutations / Server-Action-style calls

```tsx
import { useMutation } from '@/lib/fetcher';

export default function NewPostForm() {
  const { mutate, loading, error } = useMutation<Post, { title: string }>();

  async function onSubmit(e) {
    e.preventDefault();
    const title = e.currentTarget.title.value;
    try {
      await mutate(
        '/api/posts',
        { title },
        { method: 'POST' }
      );
      // e.g. re-validate server cache tags, or client refetch…
    } catch {}
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="title" />
      <button disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}
```

---

### Why this pattern?

1. **Separation of concerns**

   * Server Data → `fetchServer` (no React hooks)
   * Client Data → `useClientFetch` (hooks, stateful, React-friendly)
   * Mutations    → `useMutation` (isolated POST/PUT/DELETE)

2. **Built-in caching**

   * Avoids unnecessary fetches on both client & server
   * TTL controls freshness

3. **Logging & error-handling**

   * All calls log `req`, `resp`, and `[cache]` hits
   * Errors bubble out as real `Error` instances

4. **Serialization**

   * Automatic JSON stringify/parse
   * You can layer on custom (de)serializers by wrapping `fetcher` if needed

Feel free to extend—for example, add HTTP headers or auth-tokens via a shared wrapper around `fetcher`, or integrate Next.js’s new “cache tags” by passing `{ next: { tags: [...] } }` in your opts. This gives you a unified, consistent data-fetching strategy across your entire app.
