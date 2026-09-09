# Portfolio — AI Interactive + Strapi CMS

An AI-powered portfolio where visitors **ask questions** instead of scrolling. Answers are generated with **RAG** (Retrieval Augmented Generation) over your Strapi CMS content.

## Stack

- **CMS:** [Strapi 5](https://strapi.io) — you manage content as usual
- **Frontend:** [Next.js 16](https://nextjs.org) + Tailwind + Framer Motion
- **AI:** OpenAI (`gpt-4o-mini` + `text-embedding-3-small`) with RAG over Strapi data
- **Node:** 20+ required (use `.nvmrc`)

## How it works

```
Visitor asks a question
    → Next.js /api/chat
    → Fetch all content from Strapi
    → Embed question + content chunks
    → Retrieve top 6 relevant chunks (cosine similarity)
    → GPT answers using only that context
    → Stream response to chat UI
```

The classic scrollable portfolio is still available at `/classic`.

## Quick start

### 1. Use Node 20+

```bash
nvm use
```

### 2. Environment

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start Strapi CMS

```bash
npm run dev:cms
```

### 4. Start the frontend

```bash
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) — chat with the AI portfolio.

## Managing content

Same as before — edit in Strapi admin. The AI automatically picks up changes within ~60 seconds (Strapi cache) and uses fresh content on each chat request.

## Deployment

See **[deploy/DEPLOY.md](deploy/DEPLOY.md)** for Netlify + Raspberry Pi setup.

Additional Netlify env var:

| Key | Value |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (server-side secret) |

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
