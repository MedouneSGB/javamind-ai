# Vercel Deployment Guide

This guide walks through deploying JavaMind AI web version on Vercel.

## Prerequisites

1. Vercel account (https://vercel.com)
2. GitHub repository connected to Vercel
3. Environment variables configured in Vercel dashboard

## Deployment Steps

### 1. Push code to GitHub

```bash
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin develop
```

### 2. Create a Vercel Project

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Other" as framework (since we're using Vite with custom config)
4. Build Command: `npm run build:renderer`
5. Output Directory: `dist/renderer`
6. Root Directory: `.`

### 3. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

**AI Provider Keys** (users can enter their own via web UI, these are fallback/optional):
- `VITE_ANTHROPIC_API_KEY` - Anthropic API key (optional)
- `VITE_GEMINI_API_KEY` - Google Gemini API key (optional)
- `VITE_OPENAI_API_KEY` - OpenAI API key (optional)
- `VITE_OLLAMA_URL` - Ollama server URL (defaults to deployed instance)

**Supabase Configuration** (required for auth):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

**Admin Emails** (optional):
- `VITE_ADMIN_EMAILS` - Comma-separated list of admin emails (e.g., `admin@example.com,moderator@example.com`)

### 4. Configure OAuth in Supabase

After Vercel deployment is complete, update your Supabase project settings:

1. Go to your Supabase dashboard → Authentication → Providers
2. For each OAuth provider (Google, GitHub):
   - Add your Vercel deployment URL to Redirect URLs
   - Example: `https://your-vercel-domain.vercel.app/auth/callback`

### 5. Deploy

Click "Deploy" on Vercel. The deployment will:
1. Build: `npm run build:renderer`
2. Output: Generates static files in `dist/renderer/`
3. Deploy: Serves the files on your Vercel domain

## Important Notes

### Web Version vs Desktop App

- **This deployment is for the web version only**
- The Electron desktop app is built and distributed separately
- The web version runs entirely in the browser with server-side static hosting

### API Keys Security

- **Never commit `.env` with real API keys**
- Store sensitive keys in Vercel's encrypted environment variables
- Users can provide their own API keys via the web UI (stored in localStorage)
- Ollama URL has a sensible default (public instance)

### Static SPA Deployment

- The web version is a Single Page Application (SPA)
- All routing is handled client-side by React
- Supabase provides the backend (authentication + database)
- No Node.js runtime required on server

### Features by Authentication

**Unauthenticated:**
- Can use all AI providers (with their own API keys)
- Cannot save projects (no storage)
- No learning progress tracking

**Authenticated:**
- Cloud project sync via Supabase
- Learning progress saved to database
- Access to saved projects and lessons

**Admin:**
- Admin panel at `/admin`
- User management and analytics
- Set via `VITE_ADMIN_EMAILS` env var

## Custom Domain

If you have a custom domain:

1. Vercel dashboard → Settings → Domains
2. Add your domain
3. Configure DNS records as directed by Vercel
4. Update Supabase OAuth redirect URLs with your custom domain

## Build Output

After deployment, your static files will be:
- `index.html` - Entry point
- `assets/*.js` - Bundled JavaScript
- `assets/*.css` - Bundled styles

These are served by Vercel's CDN globally.

## Troubleshooting

### Build fails

1. Check build logs in Vercel dashboard
2. Ensure `npm run build:renderer` works locally
3. Verify environment variables are set
4. Check for TypeScript errors: `npm run build`

### OAuth callback error

1. Verify redirect URL in Supabase matches Vercel domain
2. Check browser console for CORS errors
3. Ensure `VITE_SUPABASE_*` env vars are correct

### localStorage not working

- localStorage is scoped per domain
- Settings from localhost won't transfer to Vercel domain
- Users need to re-enter API keys on Vercel domain

### Ollama connection fails

- Check if `VITE_OLLAMA_URL` is accessible from browser
- CORS may block local Ollama (no-server mode)
- Use public Ollama instance for web version

## Rollback

If deployment has issues:

1. Vercel → Deployments tab
2. Select previous working deployment
3. Click "Promote to Production"

Your previous version becomes live immediately.

## Next Steps

1. Deploy to Vercel
2. Test OAuth flow
3. Configure custom domain (if applicable)
4. Share public URL with users
