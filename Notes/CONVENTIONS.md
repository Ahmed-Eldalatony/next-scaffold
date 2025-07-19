This document outlines the conventions for developing Next.js applications, focusing on project structure, styling, data management, API communication, and internationalization, leveraging the App Router.

---

## Next.js Project Conventions

This Next.js project uses Opennext/Cloudflare and follows specific conventions for structure, styling, data management, API communication, and internationalization, primarily leveraging the App Router. Updates and project status are documented in `PROGRESS.md` and `PROJECT-STRUCTURE.md` respectively.

### 1. Key Principles for Structure

* **App Router First**: New pages, layouts, and API routes reside in `src/app`.
* **Route Groups**: Use `(folder-name)` for organization without affecting URLs (e.g., `(auth)`, `(dashboard)`).
* **Server Components by Default**: Components are Server Components unless explicitly marked `'use client'`. Server-only logic and data fetching go here.
* **Client Components for Interactivity**: Marked `'use client'`, they handle interactivity, state, and browser APIs, receiving data from Server Components.
* **Separation of Concerns**:
    * **API Routes (`app/api`)**: For traditional API layers, consumable by client-side code or external apps, including authentication handlers.
    * **Server Actions**: Preferred for data mutations and form submissions directly within Server Components, offering type safety.
* **Co-location of Tests**: Unit/integration tests (`.test.ts`, `.spec.ts`) are alongside tested files. E2E tests are in `e2e/`.
* **Barrel Files (`index.ts`)**: Used within module directories for cleaner imports.

---

### 2. Naming Conventions

* **Folders**: `kebab-case` (e.g., `user-profiles`, `auth`). Route groups use `(kebab-case)`.
* **Files**:
    * Next.js special files: `page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`, etc.
    * Components: `PascalCase.tsx` (e.g., `Navbar.tsx`).
    * Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`).
    * Utilities/Libs: `camelCase.ts` or `kebab-case.ts`.
    * Test files: `name.test.ts` or `name.spec.ts`.
* **Classes & Interfaces & Types**: `PascalCase`.
* **Variables & Functions**: `camelCase`.
* **Constants**: `UPPER_SNAKE_CASE`.

---

### 3. TypeScript Best Practices

* **Strict Mode**: Enabled via `"strict": true` in `tsconfig.json`.
* **Explicit Types**: Always define return types for functions, parameter types, and use interfaces/types for object shapes.
* **`interface` vs `type`**: Prefer `interface` for object shapes and public APIs that can be extended. Use `type` for utility, union, intersection types, or primitive aliases.
* **Avoid `any`**: Use `unknown` with type checking.
* **`Readonly`**: For properties not reassigned post-initialization; `Readonly<T>` for immutable types.
* **Enums**: Prefer string enums or `as const` objects for readability.
* **Modules**: Use ES Modules (`import`/`export`).
* **Path Aliases**: Configure in `tsconfig.json` (e.g., `@/*` pointing to `src/*`).

---

### 4. Next.js Best Practices

* **Server Components First**: For data fetching, direct DB access (Prisma), and server-side rendering to reduce client-side JS.
* **Client Components for Interactivity**: Use `'use client'` for React Hooks, event listeners, or browser APIs.
* **Data Fetching**:
    * **Server Components/Actions**: Direct Prisma calls or native `fetch` (Next.js handles caching).
    * **Client Components**: Use custom `useFetch` and `useMutation` hooks for API interaction.
* **Error Handling**:
    * `error.tsx`: UI boundaries for unexpected errors in segments.
    * `not-found.tsx`: For `notFound()` calls or unknown routes.
    * `global-error.tsx`: Catches errors in root layout/template.
* **Layouts and Templates**:
    * `layout.tsx`: Shared UI, interactive across navigation.
    * `template.tsx`: New instance per route segment, useful for animations.
* **Middleware (`middleware.ts`)**: At project root for authentication, redirects, or header modification.
* **Environment Variables**: `process.env.NEXT_PUBLIC_VAR_NAME` for client-side, `process.env.VAR_NAME` for server-only, loaded via `.env`.

---

### 5. Styling (Tailwind CSS & Shadcn/UI)

* **Tailwind CSS**: Used for all styling with utility classes directly in JSX. `tailwind.config.ts` for customization. Use `@apply` sparingly.
* **Shadcn/UI**: Components built on Tailwind CSS and Radix UI. Installed by copying code into `src/components/ui` for full customization.
* **`cn` Utility**: From `lib/utils.ts` for conditionally combining Tailwind classes.

---

### 6. Data Management (SQLite & Prisma ORM)

* **Prisma ORM**: Used for SQLite database interaction.
* **Schema Definition**: In `prisma/schema.prisma`.
* **Prisma Client**: Instantiated in `src/lib/db.ts` and exported for reuse.
* **Usage**: Directly in Server Components, Server Actions, and API Routes.
* **Migrations**: Managed via `npx prisma migrate dev`.

---

### 7. API Communication (Custom Fetch Hooks)

* **`useFetch` Hook (`src/hooks/useFetch.ts`)**: For client-side GET requests, managing loading, error, and data states, with a `refetch` function.
* **`useMutation` Hook (`src/hooks/useMutation.ts`)**: For client-side POST, PUT, DELETE, PATCH requests, managing mutation states and callbacks.
* **Server-Side Fetching**: Native `fetch` directly in Server Components for initial data loading (Next.js caches these requests).

---

### 8. Authentication

* Next-auth v4 is used for authentication.

---

### 9. Internationalization

* i18next, react-i18next, and i18next-browser-language detector are used.

---

### 10. Testing (Vitest & Playwright)

* **Configuration**: `vitest.config.ts` for unit/integration tests; Playwright for E2E.
* **File Naming**: `*.test.ts`/`*.spec.ts` for unit/integration; `*.e2e.spec.ts` for E2E.
* **Unit Tests (Vitest)**: Test isolated functions/components (with `@testing-library/react`), co-located with code.
* **Integration Tests (Vitest)**: Test interactions between components or component-API (mocking DB).
* **End-to-End (E2E) Tests (Playwright)**: In `e2e/` directory; test via UI against running app.
* **Assertions**: Vitest's `expect` and Playwright's `expect`.
* **Coverage**: Aim for high test coverage, configured in `vitest.config.ts`.

---

### 11. Linting and Formatting

* Biome is used for linting and formatting.

---

### 12. API Design (Next.js API Routes & Server Actions)

* **Next.js API Routes (`app/api/route.ts`)**: Follow standard HTTP methods, handle validation, return consistent JSON responses. Business logic separated into `lib/` or service functions.
* **Server Actions**: Defined in `'use server'` files within an "actions" folder, preferred for form submissions and data mutations.
* **Consistent Responses**: Use a consistent JSON structure (e.g., `success`, `message`, `data`).

---

### 13. Logging

* Log important events, errors, and requests via a custom logger. Avoid sensitive information.

---

### 14. Comments and Documentation

* **`README.md`**: Comprehensive setup, overview, and API documentation.
* **Code Comments**: For complex logic, non-obvious code, and function/component purpose.

---

### 15. Package Manager

* **pnpm**: Used for package installation and management.

---

This framework provides a robust and consistent approach to building performant and maintainable Next.js applications. What specific area are you working on right now that I can help with?
