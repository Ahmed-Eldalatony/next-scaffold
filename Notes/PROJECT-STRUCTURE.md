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
│   │   └── useFetch.ts
│   ├── types/              # Global or shared TypeScript type definitions and interfaces
│   └── styles/             # Global styles (e.g., base Tailwind imports)
│       └── globals.css
├── middleware.ts           # Next.js Middleware for authentication checks
