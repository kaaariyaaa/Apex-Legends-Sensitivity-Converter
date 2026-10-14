/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}
