/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAP_DEFAULT_LAT: string;
  readonly VITE_MAP_DEFAULT_LNG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
