/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_DATA_API_KEY: string;
  readonly VITE_PUBLIC_DATA_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
