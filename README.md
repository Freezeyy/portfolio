# Portfolio — Strapi CMS + Next.js

A beautiful, CMS-driven personal portfolio. Manage your profile, skills, projects, experience, and education from the Strapi admin panel — no code changes needed.

## Stack

- **CMS:** [Strapi 5](https://strapi.io) (SQLite for local dev)
- **Frontend:** [Next.js 16](https://nextjs.org) + Tailwind CSS + Framer Motion
- **Node:** 20+ required (use `.nvmrc`)

## Branches

| Branch | Description |
|---|---|
| `main` | Classic scroll portfolio |
| `ai-interactive` | Adds `/ai` chat page with RAG over Strapi content (experimental) |

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

### 3. Start the frontend

```bash
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000).

### AI twin (ai-interactive branch only)

Add to `frontend/.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
```

Then visit [http://localhost:3000/ai](http://localhost:3000/ai) or click **Ask my AI twin** on the homepage.

## Managing content

Log into Strapi admin → **Content Manager** to edit Profile, Skills, Projects, Experience, and Education.

## Production

See **[deploy/DEPLOY.md](deploy/DEPLOY.md)** for Netlify + Raspberry Pi setup.

## License

MIT
