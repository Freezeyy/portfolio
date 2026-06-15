# Portfolio — Strapi CMS + Next.js

A beautiful, CMS-driven personal portfolio. Manage your profile, skills, projects, experience, and education from the Strapi admin panel — no code changes needed.

## Stack

- **CMS:** [Strapi 5](https://strapi.io) (SQLite for local dev)
- **Frontend:** [Next.js 16](https://nextjs.org) + Tailwind CSS + Framer Motion
- **Node:** 20+ required (use `.nvmrc`)

## Quick start

### 1. Use Node 20+

```bash
nvm use
```

### 2. Start Strapi CMS

```bash
npm run dev:cms
```

On first launch, create an admin account at [http://localhost:1337/admin](http://localhost:1337/admin).

The CMS auto-seeds demo content and enables public API permissions on startup.

### 3. Start the frontend (new terminal)

```bash
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000).

## Managing content

Log into Strapi admin → **Content Manager**:

| Content Type | Description |
|---|---|
| **Profile** | Single entry: name, headline, bio, avatar, social links |
| **Skill** | Skills with category & proficiency (0–100) |
| **Project** | Portfolio projects with tech stack, links, featured flag |
| **Experience** | Work history with dates and descriptions |
| **Education** | Degrees and institutions |

Changes publish immediately to the site (60s ISR revalidation).

## Project structure

```
Portfolio/
├── cms/          # Strapi backend
├── frontend/     # Next.js portfolio site
├── package.json  # Root scripts
└── .nvmrc        # Node version
```

## Environment

Copy `frontend/.env.example` to `frontend/.env.local`:

```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## Customization

- **Design tokens:** `frontend/src/app/globals.css` (accent color, background)
- **Fonts:** `frontend/src/app/layout.tsx` (Syne + DM Sans)
- **Content types:** `cms/src/api/*/content-types/*/schema.json`
- **Seed data:** `cms/src/index.ts` (bootstrap function)

## Production

Deploy the **frontend on Netlify** and the **CMS on a Raspberry Pi** with PM2 + Cloudflare Tunnel.

Full step-by-step guide: **[deploy/DEPLOY.md](deploy/DEPLOY.md)**

Quick reference:

| Service | Host | Env var |
|---|---|---|
| Frontend | Netlify | `NEXT_PUBLIC_STRAPI_URL=https://cms.yourdomain.com` |
| CMS | Pi + PM2 + cloudflared | See `cms/.env.production.example` |

## License

MIT
