# WebWorks Sanity Template

A modern, full-stack monorepo template built with Next.js App Router, Sanity CMS, Shadcn UI, and TurboRepo. Created by WebWorks for rapid client deployments.

## Features

### Monorepo Structure

- **Apps**: web (Next.js frontend) and studio (Sanity Studio)
- **Shared packages**: UI components, TypeScript config, environment utilities, logger
- **Turborepo** for build orchestration and caching

### Frontend (Web)

- Next.js App Router with TypeScript
- Shadcn UI components with Tailwind CSS
- Server Components and Server Actions
- SEO optimization with metadata
- Blog system with rich text editor
- Table of contents generation
- Responsive layouts

### Content Management (Studio)

- Sanity Studio v5
- Custom document types (Blog, FAQ, Pages, Careers, Glossary)
- Visual editing integration
- Structured content with schemas
- Live preview capabilities
- Asset management

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm (v10.28.0 or later)
- A Sanity account

### 1. Clone the Template

```shell
git clone <your-repo-url> my-client-project
cd my-client-project
```

### 2. Install Dependencies

```shell
pnpm install
```

### 3. Create Environment Files

Create the `.env` file first so you have somewhere to paste credentials:

```shell
cp .env.example .env
```

### 4. Create a New Sanity Project

> **Important**: Each client needs their own Sanity project. The CMS content is stored in Sanity's cloud, not in this git repo.

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Click **"Create new project"**
3. Name your project (e.g., "Client Name Website")
4. Select **"Create empty project"** (or use a starter if preferred)
5. Create a dataset named `production`
6. Copy the **Project ID** and paste it into `.env`

### 5. Generate API Tokens

From your Sanity project dashboard, go to **API** → **Tokens** and create:

| Token Name        | Permissions                | Paste Into                                 |
| ----------------- | -------------------------- | ------------------------------------------ |
| `App Write Token` | Editor                     | `.env` → `SANITY_API_WRITE_TOKEN`          |
| `Live Preview`    | Viewer                     | `.env` → `SANITY_API_READ_TOKEN`           |
| `Deploy Token`    | Deploy Studio (Token only) | GitHub Secrets (for CI/CD)                 |

### 6. Complete Environment Configuration

**`.env`**:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-29

SANITY_API_READ_TOKEN=your-live-preview-token
SANITY_API_WRITE_TOKEN=your-app-write-token

# Optional: Google Tag Manager
NEXT_PUBLIC_GTM_ID=
```

### 7. Configure Client-Specific Values

Search for `TODO:` comments in the codebase to find all client-specific values that need configuration:

| File                                                         | What to Configure                                 |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `components/sections/schedule-consultation.tsx` | Contact phone, email, address                     |
| `components/career-card.tsx`                    | Careers/HR email                                  |
| `app/thank-you/page.tsx`                        | Intake/contact email                              |
| `lib/seo.ts`                                    | Site title, description, keywords, Twitter handle |
| `app/layout.tsx`                                | Form tracking domain (for gclid forwarding)       |

### 8. Run Development Servers

```shell
pnpm run dev
```

- Next.js app: [http://localhost:3000](http://localhost:3000)
- Sanity Studio: [http://localhost:3333](http://localhost:3333)

### 9. Import Seed Data (Optional)

To start with sample content:

```shell
cd studio
npx sanity dataset import ./seed-data.tar.gz production --replace
```

## Deployment

### Deploy Sanity Studio

The template includes a GitHub Actions workflow (`.github/workflows/deploy-sanity.yml`) that automatically deploys your Sanity Studio on push.

Configure these GitHub repository secrets:

| Secret                              | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `SANITY_DEPLOY_TOKEN`               | Deploy Token (Deploy Studio permissions)                           |
| `NEXT_PUBLIC_BASE_URL`              | Deployed web app origin, e.g. `https://example.com`                 |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`     | Your Sanity project ID                                             |
| `NEXT_PUBLIC_SANITY_DATASET`        | Dataset name (usually `production`)                                |
| `NEXT_PUBLIC_SANITY_API_VERSION`    | Sanity API version                                                 |

Or deploy manually:

```shell
cd studio
npx sanity deploy
```

### Deploy Next.js to Vercel

1. Create a new Vercel project connected to your GitHub repo
2. Set the **Root Directory** to the repository root
3. Configure environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
├── app/                     # Next.js App Router
├── components/              # Website components
├── hooks/                   # React hooks
├── lib/                     # Website utilities
├── studio/                  # Sanity Studio
├── utils/
│   ├── env/                 # Environment variables (t3-oss/env)
│   ├── sanity/              # Sanity client, queries, and generated types
│   ├── ui/                  # Shadcn UI components
│   ├── logger/              # Logging utility
│   └── typescript-config/   # Preserved TS config references
└── .github/workflows/       # CI/CD workflows
```

## New Client Setup Checklist

When setting up for a new client:

- [ ] Create new Sanity project at [sanity.io/manage](https://www.sanity.io/manage)
- [ ] Configure all `.env` files with new project credentials
- [ ] Update contact information in `schedule-consultation.tsx`
- [ ] Update careers email in `career-card.tsx`
- [ ] Update intake email in `thank-you/page.tsx`
- [ ] Update SEO config in `seo.ts` (title, description, keywords)
- [ ] Configure form tracking domain in `layout.tsx` (if using external forms)
- [ ] Set `NEXT_PUBLIC_GTM_ID` in `.env` (if using Google Tag Manager)
- [ ] Configure Sanity Settings document (logo, site title, description, social links)
- [ ] Set up GitHub repository secrets for CI/CD
- [ ] Deploy Studio to Sanity
- [ ] Deploy web app to Vercel

## Schema Types

The template includes these Sanity document types:

**Singletons (one per site):**

- `homePage` - Main landing page
- `navbar` - Navigation configuration
- `footer` - Footer content
- `settings` - Global site settings (logo, title, social links)
- `blogIndex` - Blog listing page
- `glossaryIndex` - Glossary listing page
- `careersIndex` - Careers listing page

**Regular Documents:**

- `blog` - Blog posts with rich text, SEO, authors
- `page` - Generic pages with page builder
- `faq` - FAQ entries
- `author` - Blog authors
- `glossary` - Glossary terms
- `career` - Job listings
- `redirect` - URL redirects

## License

Private - WebWorks Agency
