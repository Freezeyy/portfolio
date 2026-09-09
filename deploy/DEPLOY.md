# Deployment Guide

**Frontend:** Netlify  
**CMS:** Raspberry Pi + PM2 + Cloudflare Tunnel

```
Visitor → Netlify (Next.js)  →  fetches API  →  cms.yourdomain.com (Cloudflare Tunnel → Pi:1337)
You     → cms.yourdomain.com/admin  →  Strapi admin on Pi
```

---

## Prerequisites

- A domain on Cloudflare (free plan is fine)
- A Raspberry Pi on your home network (Node **20+**, arm64 or arm32)
- A [Netlify](https://netlify.com) account
- Your portfolio repo on GitHub (recommended for Netlify)

Replace placeholders throughout:
- `cms.yourdomain.com` — Strapi public URL
- `your-site.netlify.app` — Netlify site URL
- `yourdomain.com` — custom domain if you add one later

---

## Part 1 — Raspberry Pi (Strapi CMS)

### 1.1 Install Node 20+ on the Pi

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
node -v   # should be v20+
```

### 1.2 Clone the repo

```bash
cd ~
git clone https://github.com/YOUR_USER/Portfolio.git
cd Portfolio/cms
npm ci
```

### 1.3 Copy your local data to the Pi

From your **Mac** (where you've been developing), copy the database and uploads:

```bash
# Replace pi@192.168.x.x with your Pi's local IP or hostname
PI=pi@192.168.1.100

rsync -avz cms/.tmp/data.db $PI:~/Portfolio/cms/.tmp/
rsync -avz cms/public/uploads/ $PI:~/Portfolio/cms/public/uploads/
rsync -avz cms/.env $PI:~/Portfolio/cms/.env   # optional if you already configured it
```

If starting fresh on the Pi, copy the example env instead:

```bash
cp .env.production.example .env
nano .env
```

Generate secrets on the Pi:

```bash
for i in 1 2 3 4; do openssl rand -base64 32; echo; done
```
71A2ERiOdLXxoO612IGHnv44gQHuq9ycD5GttiTB5IA=

Yh8FBeb7wwTdZvjETs0QLp/eR4XglB4kF5klXLfvYIc=

qPxSz6z94QRwRX7YzB8W1onMSz/13JrtdfPZJdirtAM=

5XFs35ojqjmxn/2kvstvqeUUxQE4/+zGkOQxmzAfJ1A=

9GMtHKGq/zidApqn4owtYpPV00FBsI85SNXCwxOgQq4=

dl4xXYe2CEoNRjMv7UC3r51kM4YFk1ThIXOkhA0nLPk=

I0dlTjs/CPhYkZHCrnJLGctXdPwQoJ2DoXfSqSr0ToQ=

L3ExQNRbLqZaN4kW3eUY1pzwnPo1qG2QPuzOfeo46qg=

9Ie+G7RPe9Z1WykrILPa/AkQxkkroNIyUxr8q6q0fyE=

Fill in `.env`:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
PUBLIC_URL=https://cms.yourdomain.com
BEHIND_PROXY=true
CORS_ORIGINS=https://your-site.netlify.app,https://yourdomain.com

APP_KEYS=<4 comma-separated keys>
API_TOKEN_SALT=<random>
ADMIN_JWT_SECRET=<random>
TRANSFER_TOKEN_SALT=<random>
JWT_SECRET=<random>
ENCRYPTION_KEY=<random>
```

> **Important:** If you copy a `.env` from your Mac, regenerate all secrets for production and update `PUBLIC_URL`, `BEHIND_PROXY`, and `CORS_ORIGINS`.

### 1.4 Build and test Strapi

```bash
cd ~/Portfolio/cms
npm run build
npm run start
```

Visit `http://PI_LOCAL_IP:1337/admin` from your home network. Stop with `Ctrl+C` when confirmed working.

### 1.5 Install PM2

```bash
sudo npm install -g pm2
cd ~/Portfolio/cms
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command to auto-start on boot
```

Useful commands:

```bash
pm2 status
pm2 logs portfolio-cms
pm2 restart portfolio-cms
```

---

## Part 2 — Cloudflare Tunnel

Exposes Strapi at `https://cms.yourdomain.com` without opening router ports.

### 2.1 Install cloudflared on the Pi

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

> Use `cloudflared-linux-arm.deb` if you have a 32-bit Pi.

### 2.2 Authenticate and create a tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create portfolio-cms
```

Note the tunnel ID printed (e.g. `a1b2c3d4-...`).

### 2.3 Configure the tunnel

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste (edit tunnel ID and hostname):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/pi/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: cms.yourdomain.com
    service: http://127.0.0.1:1337
  - service: http_status:404
```

See `deploy/cloudflared.example.yml` in the repo for reference.

### 2.4 Route DNS

```bash
cloudflared tunnel route dns portfolio-cms cms.yourdomain.com
```

### 2.5 Run as a system service

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

### 2.6 Verify

```bash
curl https://cms.yourdomain.com/api/profile
```

You should get JSON back. Admin panel: `https://cms.yourdomain.com/admin`

---

## Part 3 — Netlify (Frontend)

### 3.1 Push to GitHub

If not already:

```bash
git remote add origin https://github.com/YOUR_USER/Portfolio.git
git push -u origin main
```

> Netlify needs the repo. You can deploy from the `frontend/` folder or the monorepo root — `netlify.toml` sets `base = "frontend"`.

### 3.2 Create Netlify site

1. [Netlify Dashboard](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Select your repo
3. Netlify reads `frontend/netlify.toml` automatically:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Plugin:** `@netlify/plugin-nextjs`

### 3.3 Set environment variables

In **Site settings → Environment variables**, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | `https://cms.yourdomain.com` |

No trailing slash. Redeploy after adding.

### 3.4 Deploy

Trigger a deploy (or push to main). Your site will be at `https://random-name.netlify.app`.

### 3.5 Update Strapi CORS

After you know your Netlify URL, add it to the Pi's `cms/.env`:

```env
CORS_ORIGINS=https://your-site.netlify.app,https://yourdomain.com
```

Then restart Strapi:

```bash
pm2 restart portfolio-cms
```

### 3.6 Custom domain (optional)

In Netlify → **Domain management**, add `yourdomain.com`.  
Add that URL to `CORS_ORIGINS` on the Pi too.

---

## Part 4 — Post-deploy checklist

- [ ] `https://cms.yourdomain.com/api/profile` returns data
- [ ] `https://cms.yourdomain.com/admin` loads and you can log in
- [ ] Netlify site shows your content (not "CMS not connected")
- [ ] Images load (project screenshots, avatar)
- [ ] Resume download works
- [ ] PM2 survives reboot (`sudo reboot`, then check `pm2 status`)
- [ ] Cloudflared survives reboot (`systemctl status cloudflared`)

---

## Updating after changes

### Content changes
Edit in Strapi admin — no redeploy needed. Site refreshes within ~60 seconds (ISR).

### Frontend code changes
```bash
git push   # Netlify auto-rebuilds
```

### CMS code / schema changes
On the Pi:

```bash
cd ~/Portfolio
git pull
cd cms
npm ci
npm run build
pm2 restart portfolio-cms
```

---

## Troubleshooting

### Netlify shows "CMS not connected"
- Check `NEXT_PUBLIC_STRAPI_URL` in Netlify env vars
- Verify `curl https://cms.yourdomain.com/api/profile` works
- Redeploy Netlify after changing env vars

### Images return 400 on Netlify
- `next.config.ts` auto-adds your Strapi hostname from `NEXT_PUBLIC_STRAPI_URL`
- Ensure Strapi `PUBLIC_URL` is set so upload URLs use `https://cms.yourdomain.com/uploads/...`

### CORS errors in browser
- Add your exact Netlify URL to `CORS_ORIGINS` in Pi `.env`
- Include `https://` — no trailing slash
- `pm2 restart portfolio-cms`

### Strapi admin blank or broken behind tunnel
- Confirm `PUBLIC_URL=https://cms.yourdomain.com` and `BEHIND_PROXY=true`
- Rebuild: `npm run build && pm2 restart portfolio-cms`

### PM2 crash loop on Pi
- Check logs: `pm2 logs portfolio-cms`
- Often missing `.env` secrets or Node version too old
- SQLite needs write access: `chmod -R 755 ~/Portfolio/cms/.tmp`

### Out of memory on Pi
- Strapi build is heavy — build locally or increase swap:
  ```bash
  sudo dphys-swapfile swapoff
  sudo nano /etc/dphys-swapfile   # CONF_SWAPSIZE=2048
  sudo dphys-swapfile setup
  sudo dphys-swapfile swapon
  ```

---

## Architecture summary

| Component | Where | URL |
|---|---|---|
| Next.js frontend | Netlify | `https://your-site.netlify.app` |
| Strapi API + admin | Raspberry Pi | `https://cms.yourdomain.com` (via Cloudflare Tunnel) |
| Database | Pi (SQLite) | `cms/.tmp/data.db` |
| Uploads | Pi | `cms/public/uploads/` |
| Process manager | PM2 | `portfolio-cms` |
| Tunnel | cloudflared | Pi → Cloudflare edge |
