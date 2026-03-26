# CodeCrafters

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in your Supabase project values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET` if you use a custom bucket name
3. Run `npm install`.
4. Run `npm run dev`.

The admin panel at `/admin` depends on Supabase auth. If those env vars are missing, the route will open but sign-in will fail.

## Vercel setup

Add the same environment variables in your Vercel project settings before deploying:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`

After updating Vercel env vars, redeploy the project so the client build picks them up.
